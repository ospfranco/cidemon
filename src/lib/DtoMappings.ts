import {DateTime} from 'luxon';
import {
  CircleciRepoDto,
  AppcenterRepoDto,
  AppcenterBranchDto,
  TravisRepoDto,
  TravisBranchesDto,
  BitriseBranchDto,
  BitriseRepoDto,
  BitriseStatus,
  GithubWorkflowDto,
  GithubWorkflowRunInfo,
  GitlabProjectDto,
  GitlabPipelineDto,
  IGithubCheck,
} from 'model';

interface IParsingOptions {
  showBuildNumber: boolean;
}

export function mapCircleCIProjects(
  repos: CircleciRepoDto[],
  key: string,
  options: IParsingOptions,
): INode[] {
  let nodes: INode[] = [];

  for (let i = 0; i < repos.length; i++) {
    let repo = repos[i];
    let branches = Object.entries(repo.branches);
    for (let j = 0; j < branches.length; j++) {
      let [name, info] = branches[j];

      let status: Status = `running`;
      let isRunning = !!info.running_builds?.length;
      let latestDate;

      let jobId: string = `-`;

      if (info.last_success && info.last_non_success) {
        if (info.last_success.pushed_at > info.last_non_success.pushed_at) {
          status = `passed`;
          latestDate = info.last_success.pushed_at;
          jobId = info.last_success.build_num.toString();
        } else {
          status = `failed`;
          latestDate = info.last_non_success.pushed_at;
          jobId = info.last_non_success.build_num.toString();
        }
      } else if (info.last_success) {
        status = `passed`;
        latestDate = info.last_success.pushed_at;
        jobId = info.last_success.build_num.toString();
      } else if (info.last_non_success) {
        status = `failed`;
        latestDate = info.last_non_success.pushed_at;
        jobId = info.last_non_success.build_num.toString();
      }

      if (isRunning) {
        status = `running`;
        latestDate = info.running_builds![0].pushed_at;
      }

      let vcsLong = repo.vcs_url.includes(`github`) ? `github` : `bitbucket`;
      let vcsShort = repo.vcs_url.includes(`github`) ? `gh` : `bb`;
      let unscapedName = unescape(name);

      if (!options.showBuildNumber) {
        jobId = ``;
      }

      let node: INode = {
        id: `${`CircleCI`}-${repo.username}-${repo.reponame}-${name}`,
        url: `https://circleci.com/${vcsShort}/${repo.username}/${repo.reponame}/tree/${name}`,
        date: latestDate,
        source: `CircleCI`,
        label: `${repo.username}/${repo.reponame} [${unscapedName}] #${jobId}`,
        status: status,
        key: key,
        buildUrl: `https://circleci.com/api/v1.1/project/${vcsLong}/${repo.username}/${repo.reponame}/tree/${name}?circle-token=${key}`,
        slug: `${repo.username}/${repo.reponame}`,
      };

      nodes.push(node);
    }
  }

  return nodes;
}

export function mapAppcenterTuplesToNodes(
  repo: AppcenterRepoDto,
  branches: AppcenterBranchDto[],
  key: string,
  options: IParsingOptions,
): INode[] {
  return branches.map((branch) => {
    let status: Status = `pending`;

    if (branch.lastBuild?.status === `inProgress`) {
      status = `running`;
    }

    if (branch.lastBuild?.result === `succeeded`) {
      status = `passed`;
    }

    if (branch.lastBuild?.result === `failed`) {
      status = `failed`;
    }

    let jobId = ``;
    if (options.showBuildNumber && branch.lastBuild) {
      jobId = ` #${branch.lastBuild.buildNumber}`;
    }

    let urlFriendlyBranchName = branch.branch.name.replace(`/`, `%2F`);

    let node: INode = {
      id: `${`AppCenter`}-${repo.owner.name}-${repo.name}-${
        branch.branch.name
      }`,
      url: `https://appcenter.ms/users/${repo.owner.name}/apps/${repo.name}/build/branches/${urlFriendlyBranchName}`,
      label: `${repo.owner.name}/${repo.name} [${branch.branch.name}]${jobId}`,
      source: `AppCenter`,
      status: status,
      key: key,
      buildUrl: `https://api.appcenter.ms/v0.1/apps/${repo.owner.name}/${repo.name}/branches/${urlFriendlyBranchName}/builds`,
      slug: `${repo.owner.name}/${repo.name}`,
    };
    return node;
  });
}

export function mapTravisTuplesToNodes(
  repo: TravisRepoDto,
  branches: TravisBranchesDto,
  key: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: IParsingOptions,
): INode[] {
  return branches.branches.map((branch) => {
    let commit = branches.commits.find((c) => c.id === branch.commit_id)!;

    let status: Status = `pending`;
    if (branch.state === `errored`) {
      status = `failed`;
    }

    if (branch.state === `started`) {
      status = `running`;
    }

    if (branch.state === `passed`) {
      status = `passed`;
    }

    let node: INode = {
      id: `${`TravisCI`}-${repo.slug}-${commit.branch}`,
      url: `https://travis-ci.com/github/${repo.slug}`,
      label: `${repo.slug} [${commit.branch}]`,
      source: `TravisCI`,
      status: status,
      key: key,
      date: branch.started_at,
      slug: repo.slug,
    };

    return node;
  });
}

export function mapBitriseTuplesToNode(
  repo: BitriseRepoDto,
  branches: BitriseBranchDto[],
  key: string,
  options: IParsingOptions,
): INode[] {
  return branches.map((branch) => {
    let status: Status = `pending`;

    switch (branch.status) {
      case BitriseStatus.successful:
        status = `passed`;
        break;
      case BitriseStatus.abortedWithFailure:
        status = `failed`;
        break;
      case BitriseStatus.abortedWithSuccess:
        status = `passed`;
        break;
      case BitriseStatus.notFinished:
        status = `running`;
        break;
      case BitriseStatus.failed:
        status = `failed`;
        break;
      default:
        status = `pending`;
        break;
    }

    let jobId = ``;
    if (options.showBuildNumber) {
      jobId = ` #${branch.build_number}`;
    }

    let mainName = branch.branch;

    if (!mainName || mainName.length === 0) {
      mainName = branch.commit_message ?? 'Unknown Branch';
    }

    if (branch.triggered_workflow) {
      mainName += `- ${branch.triggered_workflow}`;
    }

    let node: INode = {
      id: `${`Bitrise`}-${repo.title}-${branch.branch}-${branch.build_number}`,
      url: `https://app.bitrise.io/build/${branch.slug}`,
      label: `${repo.repo_owner}/${repo.title} [${mainName}]${jobId}`,
      source: `Bitrise`,
      status,
      key,
      // @TODO do not only use finished_at, for running builds use created_at
      date: branch.finished_at,
      buildUrl: `https://api.bitrise.io/v0.1/apps/${repo.slug}/builds`,
      // Storing the API provided repository "title" to be used in further calls to the api
      extra: repo.title,
      vcs: 'unknown',
      jobId: branch.build_number?.toString(),
      slug: `${repo.repo_owner}/${repo.title}`,
    };

    return node;
  });
}

export function mapGithubActionTupleToNode(
  slug: string,
  workflowDto: GithubWorkflowDto,
  latestRun: GithubWorkflowRunInfo,
  key: string,
  options: IParsingOptions,
): INode {
  let status: Status = `pending`;

  switch (latestRun.conclusion) {
    case `success`:
      status = `passed`;
      break;

    case `failure`:
      status = `failed`;
      break;

    case `in_progress`:
      status = `running`;
      break;

    default:
      break;
  }

  let pathComponent = `workflow%3A${workflowDto.name}`;

  let runNumber = ``;
  if (options.showBuildNumber) {
    runNumber = ` #${latestRun.run_number}`;
  }

  let node: INode = {
    id: `${`Github`}-${slug}-${workflowDto.name}`,
    url: `https://github.com/${slug}/actions?query=${pathComponent}`,
    label: `${slug} [${workflowDto.name}]${runNumber}`,
    date: latestRun.created_at,
    status: status,
    jobId: `${latestRun.run_number}`,
    source: `Github`,
    vcs: `github`,
    key: key,
    slug,
  };

  return node;
}

export function mapGitlabTupleToNodes(
  project: GitlabProjectDto,
  pipelines: GitlabPipelineDto[],
  key: string,
  options: IParsingOptions,
): INode[] {
  // A single ref can have multiple entries on the pipeline, which makes the output confusing
  // filter the repeated entries, just take the first one that appears
  return pipelines
    .reduce(
      (acc: GitlabPipelineDto[], a: GitlabPipelineDto): GitlabPipelineDto[] => {
        if (acc.findIndex((b) => b.ref === a.ref) === -1) {
          acc.push(a);
        }

        return acc;
      },
      [] as any,
    )
    .map((pipeline) => {
      let status: Status = `pending`;

      switch (pipeline.status) {
        case `failed`:
          status = `failed`;
          break;
        case `running`:
          status = `running`;
          break;
        case `success`:
          status = `passed`;
          break;
        case `canceled`: // not a typo, gitlab is wrong
          status = `pending`;
          break;
        default:
          status = `pending`;
          break;
      }

      let pipelineId = ``;
      if (options.showBuildNumber) {
        pipelineId = ` #${pipeline.id}`;
      }

      let node: INode = {
        id: `${`Gitlab`}-${project.name}-${pipeline.id}`,
        url: pipeline.web_url,
        label: `${project.name} [${pipeline.ref}] ${pipelineId}`,
        date: pipeline.created_at,
        status: status,
        jobId: pipeline.id,
        source: `Gitlab`,
        vcs: `gitlab`,
        key: key,
        slug: project.name,
      };

      return node;
    });
}

export function mapGithubPrToNode(
  slug: string,
  pr: any,
  statuses: IGithubCheck[],
  key: string,
): INode {
  let status: Status = `pending`;
  let subItems: ISubNode[] = [];

  if (statuses.length) {
    status = `passed`;

    statuses.forEach(
      ({name, conclusion, started_at, completed_at, details_url}) => {
        let lStartedAt = DateTime.fromISO(started_at);

        let subItem: ISubNode = {
          label: name,
          status: `pending`,
          url: details_url,
        };

        if (!conclusion) {
          if (status !== `failed`) {
            status = `running`;
          }

          let extraLabel = lStartedAt.toRelative({unit: 'minutes'});
          subItem.extraLabel = extraLabel;
        } else {
          let lCompletedAt = DateTime.fromISO(completed_at!);
          let extraLabel = `${Math.round(
            lCompletedAt.diff(lStartedAt, 'minutes').minutes,
          )}m`;
          subItem.extraLabel = extraLabel;

          if (conclusion === `failure` || conclusion === `timed_out`) {
            status = `failed`;
            subItem.status = `failed`;
          } else if (conclusion === `success`) {
            subItem.status = `passed`;
          } else if (conclusion === `neutral`) {
            subItem.status = `pending`;
          }
        }

        subItems.push(subItem);
      },
    );
  }

  let node: INode = {
    id: pr.id,
    url: pr.html_url,
    label: `${slug} [${pr.title}]`,
    date: pr.updated_at,
    status: status,
    jobId: pr.id,
    source: `Github`,
    vcs: `github`,
    key: key,
    subItems: subItems,
    sha: pr.head.sha,
    isPr: true,
    username: pr.user.login,
    userAvatarUrl: pr.user.avatar_url,
    slug,
  };

  return node;
}

export function mapGithubBranchToNode(
  slug: string,
  branch: any,
  statuses: IGithubCheck[],
  key: string,
): INode {
  let status: Status = `pending`;
  let subItems: ISubNode[] = [];

  if (statuses.length) {
    status = `passed`;

    statuses.forEach(
      ({name, conclusion, started_at, completed_at, details_url}) => {
        let lStartedAt = DateTime.fromISO(started_at);

        let subItem: ISubNode = {
          label: name,
          status: `pending`,
          url: details_url,
        };

        if (!conclusion) {
          if (status !== `failed`) {
            status = `running`;
          }

          let extraLabel = lStartedAt.toRelative({unit: 'minutes'});
          subItem.extraLabel = extraLabel;
        } else {
          let lCompletedAt = DateTime.fromISO(completed_at!);
          let extraLabel = `${Math.round(
            lCompletedAt.diff(lStartedAt, 'minutes').minutes,
          )}m`;
          subItem.extraLabel = extraLabel;

          if (conclusion === `failure` || conclusion === `timed_out`) {
            status = `failed`;
            subItem.status = `failed`;
          } else if (conclusion === `success`) {
            subItem.status = `passed`;
          } else if (conclusion === `neutral`) {
            subItem.status = `pending`;
          }
        }

        subItems.push(subItem);
      },
    );
  }

  let node: INode = {
    id: branch.commit.sha,
    url: `https://github.com/${slug}/commit/${branch.commit.sha}`,
    label: `${slug} [${branch.name}]`,
    // date: pr.updated_at,
    status: status,
    // jobId: pr.id,
    source: `Github`,
    vcs: `github`,
    key: key,
    subItems: subItems,
    sha: branch.commit.sha,
    slug,
    isBranch: true,
  };

  return node;
}

export function mapGithubActionRunToNode(
  slug: string,
  run: any,
  key: string,
): INode {
  let status: Status = `pending`;

  if (run.conclusion === `failure` || run.conclusion === `timed_out`) {
    status = `failed`;
  } else if (run.conclusion === `success`) {
    status = `passed`;
  } else if (run.conclusion === `neutral`) {
    status = `pending`;
  }

  let node: INode = {
    id: run.id,
    url: `https://github.com/${slug}/actions/runs/${run.id}`,
    label: `${slug} [${run.name}]`,
    date: run.updated_at,
    status: status,
    source: `Github`,
    vcs: `github`,
    key: key,
    sha: run.head_sha,
    isAction: true,
    slug,
  };

  return node;
}
