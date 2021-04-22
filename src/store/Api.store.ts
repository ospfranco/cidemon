import { IRootStore } from "Root.store";
import axios from "axios";
import {
  mapAppcenterTuplesToNodes,
  mapBitriseTuplesToNode,
  mapCircleCIProjects,
  mapGithubPrToNode,
  mapGithubBranchToNode,
  mapGitlabTupleToNodes,
  mapTravisTuplesToNodes,
} from "lib";
import {
  AppcenterRepoDto,
  TravisReposDto,
  BitrisePaginated,
  BitriseRepoDto,
  BitriseBranchDto,
  GitlabProjectDto,
  GitlabPipelineDto,
  CircleciRepoDto,
} from "model";
import Github from "github-api";
import allSettled from "promise.allsettled";

interface AjaxCallParams {
  auth?: string;
  method: `GET` | `POST` | `DELETE` | `PUT`;
  url: string;
  body?: any;
  headers?: any;
}

interface IFetchOptions {
  showBuildNumber: boolean;
}

export let createApiStore = (root: IRootStore) => {
  let ajaxCall = async ({
    url,
    auth,
    method,
    body,
    headers = {},
  }: AjaxCallParams) => {
    let res = await axios({
      url,
      method,
      headers: {
        Authorization: auth,
        "Content-Type": `application/json`,
        ...headers,
      },
      data: body ? JSON.stringify(body) : undefined,
    });

    return res.data;
  };

  let get = (props: {
    url: string;
    auth?: string;
    headers?: Record<string, string>;
  }) => ajaxCall({ method: `GET`, ...props });

  let post = (props: {
    url: string;
    auth?: string;
    body?: any;
    headers?: Record<string, string>;
  }) => ajaxCall({ method: `POST`, ...props });

  // let put = (props: {
  //   url: string
  //   auth?: string
  //   headers?: Record<string, string>
  // }) => ajaxCall({method: `PUT`, ...props})

  let store = {
    //               _   _
    //     /\       | | (_)
    //    /  \   ___| |_ _  ___  _ __  ___
    //   / /\ \ / __| __| |/ _ \| '_ \/ __|
    //  / ____ \ (__| |_| | (_) | | | \__ \
    // /_/    \_\___|\__|_|\___/|_| |_|___/
    fetchCircleciNodes: async (
      token: string,
      options: IFetchOptions,
    ): Promise<INode[]> => {
      try {
        let repos: CircleciRepoDto[] = await get({
          url: `https://circleci.com/api/v1.1/projects?circle-token=${token}`,
        });
        return mapCircleCIProjects(repos, token, options);
      } catch (e) {
        root.ui.addToast({
          text: "Could not fetch CircleCI builds",
          type: "error",
        });
        return [];
      }
    },

    fetchAppcenterNodes: async (
      key: string,
      options: IFetchOptions,
    ): Promise<INode[]> => {
      try {
        let repos: AppcenterRepoDto[] = await get({
          url: `https://api.appcenter.ms/v0.1/apps`,
          headers: {
            "X-API-Token": key,
          },
        });

        let branchPromises = repos.map((r) =>
          get({
            url: `https://api.appcenter.ms/v0.1/apps/${r.owner.name}/${r.name}/branches`,
            headers: {
              "X-API-Token": key,
            },
          }),
        );

        let resolvedBranches = await allSettled(branchPromises);

        let nodes = resolvedBranches
          .map((branchesResult, ii) => {
            if (branchesResult.status === "fulfilled") {
              return mapAppcenterTuplesToNodes(
                repos[ii],
                branchesResult.value,
                key,
                options,
              );
            } else {
              return [];
            }
          })
          .flat();

        return nodes;
      } catch (e) {
        root.ui.addToast({
          text: "Could not fetch App Center builds",
          type: "error",
        });
        return [];
      }
    },

    fetchTravisciNodes: async (
      key: string,
      options: IFetchOptions,
    ): Promise<INode[]> => {
      try {
        let reposDto: TravisReposDto = await get({
          url: `https://api.travis-ci.com/repos`,
          headers: {
            Accept: `application/vnd.travis-ci.2.1+json`,
            Authorization: `token ${key}`,
            "User-Agent": `Tempomat/2.0.0`,
          },
        });

        let branchPromises = reposDto.repos.map((r) =>
          get({
            url: `https://api.travis-ci.com/repos/${r.slug}/branches`,
            headers: {
              Accept: `application/vnd.travis-ci.2.1+json`,
              Authorization: `token ${key}`,
              "User-Agent": `Tempomat/2.0.0`,
            },
          }),
        );

        let resolvedBranches = await allSettled(branchPromises);

        return resolvedBranches
          .map((branchesRes, ii) => {
            if (branchesRes.status === "fulfilled") {
              return mapTravisTuplesToNodes(
                reposDto.repos[ii],
                branchesRes.value,
                key,
                options,
              );
            } else {
              return [];
            }
          })
          .flat();
      } catch (e) {
        root.ui.addToast({
          text: "Could not fetch CircleCI Nodes",
          type: "error",
        });
        return [];
      }
    },

    fetchBitriseNodes: async (
      key: string,
      options: IFetchOptions,
    ): Promise<INode[]> => {
      try {
        let apps: BitrisePaginated<BitriseRepoDto> = await get({
          url: `https://api.bitrise.io/v0.1/apps`,
          headers: {
            Authorization: key,
          },
        });

        let aWeekAgo = new Date();
        aWeekAgo.setDate(aWeekAgo.getDate() - 7);

        let buildsPromises = apps.data.map((app) =>
          get({
            url: `https://api.bitrise.io/v0.1/apps/${app.slug}/builds`,
            headers: {
              Authorization: key,
            },
          }),
        );

        let builds = await Promise.all(buildsPromises);

        let nodes = builds
          .map((bSet, idx) => {
            let visitedBranches = new Set();

            let finalBuilds = bSet.data.filter((b: any) => {
              if (visitedBranches.has(b.triggered_workflow)) {
                return false;
              } else {
                visitedBranches.add(b.triggered_workflow);
                return true;
              }
            });

            return mapBitriseTuplesToNode(
              apps.data[idx],
              finalBuilds,
              key,
              options,
            );
          })
          .flat();

        return nodes;
      } catch (e) {
        root.ui.addToast({
          text: "Could not fetch Bitrise Nodes",
          type: "error",
        });
        return [];
      }
    },

    fetchBitriseRepoBranches: async (
      repo: BitriseRepoDto,
      branchNames: string[],
      key: string,
      options: IFetchOptions,
    ): Promise<INode[]> => {
      try {
        let branchesPromises = branchNames.map((name) => {
          let encodedName = name.replace(`#`, `%23`).replace(`&`, `%26`);

          return get({
            url: `https://api.bitrise.io/v0.1/apps/${repo.slug}/builds?branch=${encodedName}&limit=1`,
            headers: {
              Authorization: key,
            },
          });
        });

        let resolvedBranches: Array<
          BitrisePaginated<BitriseBranchDto>
        > = await Promise.all(branchesPromises);

        return resolvedBranches
          .map((b) => mapBitriseTuplesToNode(repo, b.data, key, options))
          .flat();
      } catch (e) {
        root.ui.addToast({
          text: `Error fetching builds for Bitrise branches: ${e}`,
          type: "error",
        });

        return [];
      }
    },

    fetchGithubNodes: async ({ key, slug, fetchPrs, fetchBranches }: { key: string, slug: string, fetchPrs: boolean, fetchBranches: boolean }): Promise<INode[]> => {
      try {
        const githubApi = new Github({
          token: key,
        });

        const [username, reponame] = slug.split(`/`);

        const repo = githubApi.getRepo(username, reponame);

        let nodes: INode[] = []

        if (fetchPrs) {
          const pullRequestsRes = await repo.listPullRequests();

          const pullRequests: any[] = pullRequestsRes.data;

          const checkPromises = pullRequests.map((pr: any) =>
            get({
              url: `https://api.github.com/repos/${slug}/commits/${pr.head.sha}/check-runs`,
              headers: {
                Accept: `application/vnd.github.v3+json`,
                Authorization: `token ${key}`,
              },
            }),
          );

          const statusesMatrix = await allSettled(checkPromises);

          const prNodes = pullRequests.map((pr: any, index: number) => {
            let statusRes = statusesMatrix[index];

            let checks =
              statusRes.status === "fulfilled"
                ? statusRes.value.check_runs ?? []
                : [];

            return mapGithubPrToNode(slug, pr, checks, key);
          });

          nodes.push(...prNodes)
        }

        if (fetchBranches) {
          const branches = await get({
            url: `https://api.github.com/repos/${slug}/branches?per_page=100`,
            headers: {
              Accept: `application/vnd.github.v3+json`,
              Authorization: `token ${key}`,
            },
          })

          const checkPromises = branches.map((branch: any) =>
            get({
              url: `https://api.github.com/repos/${slug}/commits/${branch.commit.sha}/check-runs`,
              headers: {
                Accept: `application/vnd.github.v3+json`,
                Authorization: `token ${key}`,
              },
            })
          )

          const statusesMatrix = await allSettled(checkPromises);

          const branchNodes = branches.map((branch: any, index: number) => {
            let statusRes = statusesMatrix[index];

            let checks =
              statusRes.status === "fulfilled"
                ? statusRes.value.check_runs ?? []
                : [];

            // return []

            return mapGithubBranchToNode(slug, branch, checks, key);
          });

          nodes.push(...branchNodes)
        }


        return nodes;

      } catch (e) {
        console.warn(`Github error`, e);
        root.ui.addToast({
          text: `Could not fetch info for Github repo: ${slug}`,
          type: "error",
        });
        return [];
      }
    },

    triggerCircleciRebuild: (node: INode) => {
      if (!node.buildUrl) {
        throw new Error(`Could not rebuild node without a known build url`);
      }

      return post({
        url: node.buildUrl,
        headers: {
          "Content-Type": `application/json`,
        },
      });
    },

    triggerAppcenterRebuild: async (node: INode) => {
      if (!node.buildUrl) {
        throw new Error(`Cannot retrigger build without build url`);
      }

      return post({
        url: node.buildUrl,
        headers: {
          "Content-Type": `application/json`,
          "X-API-Token": node.key!,
        },
      });
    },

    triggerTravisciRebuild: async (_: INode) => {
      return Promise.reject(
        new Error(
          `There is currently no way to manually trigger a job on travisCI`,
        ),
      );
    },

    triggerBitriseRebuild: async (node: INode) => {
      if (!node.buildUrl) {
        throw new Error(`Cannot retrigger build without build url`);
      }

      return post({
        url: node.buildUrl,
        headers: {
          "Content-Type": `application/json`,
          Authorization: node.key!,
        },
        body: {
          hook_info: {
            type: `bitrise`,
          },
          build_params: {
            branch: node.extra,
          },
        },
      });
    },

    fetchGitlabNodes: async (
      key: string,
      options: IFetchOptions,
    ): Promise<INode[]> => {
      let nodes: INode[] = [];

      try {
        let shouldFetchProjects = true;
        let projects: GitlabProjectDto[] = [];
        let idAfter: string | null = null;

        while (shouldFetchProjects) {
          let url = `https://gitlab.com/api/v4/projects?visibility=private&pagination=keyset&simple=true&per_page=100&order_by=id&sort=asc`;
          if (!!idAfter) {
            url += `&id_after=${idAfter}`;
          }

          let projectBatch = await get({
            url,
            headers: {
              Authorization: `Bearer ${key}`,
            },
          });

          if (projectBatch.length === 0) {
            shouldFetchProjects = false;
          } else {
            projects.push(...projectBatch);
            idAfter = projectBatch[projectBatch.length - 1].id;
          }
        }

        let pipelines: Promise<GitlabPipelineDto[]>[] = projects.map((p) =>
          get({
            url: `https://gitlab.com/api/v4/projects/${p.id}/pipelines?per_page=100`,
            headers: {
              Authorization: `Bearer ${key}`,
            },
          }),
        );

        let resolvedPipelines: PromiseSettledResult<
          GitlabPipelineDto[]
        >[] = await allSettled(pipelines);

        nodes = resolvedPipelines
          .map((projectPipelines, ii) => {
            if (projectPipelines.status === "fulfilled") {
              return mapGitlabTupleToNodes(
                projects[ii],
                projectPipelines.value,
                key,
                options,
              );
            } else {
              return [];
            }
          })
          .flat();
      } catch (e) {
        root.ui.addToast({
          text: `Could not fetch GitLab repos:\n${e.toString()}`,
          type: `error`,
        });
      }

      return nodes;
    },
  };

  return store;
};

export type IApiStore = ReturnType<typeof createApiStore>;
