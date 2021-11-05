import {cidemonNative} from 'lib';
import {
  autorun,
  configure,
  makeAutoObservable,
  observable,
  runInAction,
  toJS,
} from 'mobx';
import {Linking} from 'react-native';
import {IRootStore} from 'Root.store';

configure({
  useProxies: `never`,
});

export enum SortingKey {
  date = `Date`,
  status = `Status`,
  name = `Name`,
}

export function debounce<T extends (...args: any[]) => any>(
  ms: number,
  callback: T,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timer: NodeJS.Timeout | undefined;

  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    return new Promise<ReturnType<T>>((resolve) => {
      timer = setTimeout(() => {
        const returnValue = callback(...args) as ReturnType<T>;
        resolve(returnValue);
      }, ms);
    });
  };
}

export async function createNodeStore(root: IRootStore) {
  let intervalHandle: NodeJS.Timeout | undefined;

  let startTimer = () => {
    if (intervalHandle) {
      clearInterval(intervalHandle);
    }

    intervalHandle = setInterval(() => {
      store.fetchNodes();
    }, store.fetchInterval * 60000);
  };

  let persist = async () => {
    let JSStore = toJS(store);

    cidemonNative.securelyStore(
      `tempomatState`,
      JSON.stringify({
        tokens: JSStore.tokens,
        githubRepos: JSStore.githubRepos,
        sortingKey: JSStore.sortingKey,
        githubKey: JSStore.githubKey,
        notificationsEnabled: JSStore.notificationsEnabled,
        startAtLogin: JSStore.startAtLogin,
        interval: JSStore.fetchInterval,
        complexRegexes: JSStore.complexRegexes,
        passingNotificationsEnabled: JSStore.passingNotificationsEnabled,
        repoOpeningsCount: JSStore.repoOpeningsCount,
        showBuildNumber: JSStore.showBuildNumber,
        githubFetchPrs: JSStore.githubFetchPrs,
        githubFetchBranches: JSStore.githubFetchBranches,
        githubFetchWorkflows: JSStore.githubFetchWorkflows,
        useSimpleIcon: JSStore.useSimpleIcon,
        welcomeShown: JSStore.welcomeShown,
      }),
    );
  };

  let hydrate = async () => {
    // Fetches the app state from the native keychain, is stored encrypted
    // but once in memory you can just access it normally
    let retrievedJSON = await cidemonNative.securelyRetrieve(`tempomatState`);

    if (retrievedJSON) {
      let parsedStore = JSON.parse(retrievedJSON);
      runInAction(() => {
        store.tokens = parsedStore.tokens;
        store.sortingKey = parsedStore.sortingKey;
        store.githubRepos = parsedStore.githubRepos;
        store.githubKey = parsedStore.githubKey;
        store.notificationsEnabled = parsedStore.notificationsEnabled;
        store.startAtLogin = parsedStore.startAtLogin;
        store.fetchInterval = parsedStore.fetchInterval || 1;
        store.complexRegexes = parsedStore.complexRegexes ?? [];
        store.passingNotificationsEnabled =
          store.passingNotificationsEnabled ?? false;
        store.repoOpeningsCount = parsedStore.repoOpeningsCount ?? 0;
        store.showBuildNumber = parsedStore.showBuildNumber ?? false;
        store.githubFetchPrs = parsedStore.githubFetchPrs ?? true;
        store.githubFetchBranches = parsedStore.githubFetchBranches ?? true;
        store.useSimpleIcon = parsedStore.useSimpleIcon ?? true;
        store.githubFetchWorkflows = parsedStore.githubFetchWorkflows ?? false;
        store.welcomeShown = parsedStore.welcomeShown ?? false;
      });
    }
  };

  let store = makeAutoObservable(
    {
      //    ____  _                              _     _
      //   / __ \| |                            | |   | |
      //  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
      //  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
      //  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
      //   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/
      nodes: [] as INode[],
      tokens: [] as IToken[],
      sortingKey: SortingKey.status,
      fetching: false,
      complexRegexes: [] as IIgnoreRegex[],
      githubRepos: [``] as string[],
      githubKey: `` as string,
      githubFetchPrs: true,
      githubFetchBranches: true,
      githubFetchWorkflows: false,
      notificationsEnabled: false,
      startAtLogin: false,
      fetchInterval: 1,
      passingNotificationsEnabled: false,
      filterHardOffSwitch: false,
      repoOpeningsCount: 0,
      showBuildNumber: false,
      useSimpleIcon: true,
      welcomeShown: false,

      //    _____                            _           _
      //   / ____|                          | |         | |
      //  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
      //  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
      //  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
      //   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
      //                        | |
      //                        |_|
      get sortedFilteredNodes(): INode[] {
        const invertedRegexes: RegExp[] = [];
        const normalRegexes: RegExp[] = [];

        if (!store.filterHardOffSwitch) {
          store.complexRegexes.forEach((regexObj) => {
            const regex = RegExp(regexObj.regex);
            if (regexObj.inverted) {
              invertedRegexes.push(regex);
            } else {
              normalRegexes.push(regex);
            }
          });
        }

        let finalNodes = store.nodes
          .slice()
          .sort((n1, n2) => {
            switch (store.sortingKey) {
              case SortingKey.date:
                if (!n1.date) {
                  return 1;
                }

                if (!n2.date) {
                  return -1;
                }

                return n1.date < n2.date ? 1 : -1;

              case SortingKey.name:
                return n1.label < n2.label ? -1 : 1;

              case SortingKey.status:
                if (n1.status === `running`) {
                  return -1;
                }
                if (n2.status === `running`) {
                  return 1;
                }

                if (n1.status === `failed`) {
                  return -1;
                }
                if (n2.status === `failed`) {
                  return 1;
                }

                if (n1.status === `passed`) {
                  return -1;
                }

                if (n2.status === `passed`) {
                  return 1;
                }

                return 1;

              default:
                return 1;
            }
          })
          .filter((n) => {
            if (invertedRegexes.some((regex) => regex.test(n.label))) {
              return true;
            }

            if (normalRegexes.some((regex) => regex.test(n.label))) {
              return false;
            }

            if (invertedRegexes.length) {
              return false;
            } else {
              return true;
            }
          });

        // once a new set of valid nodes has been calculated
        // update the native icon on the menubar
        let failed = 0;
        let running = 0;
        let passed = 0;
        for (let i = 0; i < finalNodes.length; i++) {
          let status = finalNodes[i].status;
          switch (status) {
            case `passed`:
              passed++;
              break;
            case `failed`:
              failed++;
              break;
            case `running`:
              running++;
              break;
            default:
              break;
          }
        }

        cidemonNative.setStatusButtonText(
          failed,
          running,
          passed,
          store.useSimpleIcon,
        );

        return finalNodes;
      },

      //               _   _
      //     /\       | | (_)
      //    /  \   ___| |_ _  ___  _ __  ___
      //   / /\ \ / __| __| |/ _ \| '_ \/ __|
      //  / ____ \ (__| |_| | (_) | | | \__ \
      // /_/    \_\___|\__|_|\___/|_| |_|___/

      fetchNodes: async () => {
        if (store.fetching) {
          return;
        }

        store.fetching = true;

        const fetchOptions = {
          showBuildNumber: store.showBuildNumber,
        };

        let promises = store.tokens.map((t) => {
          switch (t.source) {
            case `CircleCI`:
              return root.api.fetchCircleciNodes(t.key, fetchOptions);

            case `AppCenter`:
              return root.api.fetchAppcenterNodes(t.key, fetchOptions);

            case `TravisCI`:
              return root.api.fetchTravisciNodes(t.key, fetchOptions);

            case `Bitrise`:
              return root.api.fetchBitriseNodes(t.key, fetchOptions);

            case `Gitlab`:
              return root.api.fetchGitlabNodes(t.baseURL!, t.visibility!, t.key, fetchOptions);

            default:
              break;
          }
        });

        if (store.githubKey !== ``) {
          promises = promises.concat(
            store.githubRepos
              .filter((v) => v !== ``)
              .map((slug) =>
                root.api.fetchGithubNodes({
                  key: store.githubKey,
                  slug,
                  fetchPrs: store.githubFetchPrs,
                  fetchBranches: store.githubFetchBranches,
                  fetchWorkflows: store.githubFetchWorkflows,
                }),
              ),
          );
        }

        let responses = await Promise.all(promises);
        // @ts-ignore
        // TS complains here, and is right, promise.all might return undefined values
        // however filter n => n does remove any falsy values in the array
        responses = responses.flat().filter((n) => n);

        let previousNodes = store.nodes.reduce((acc, node) => {
          acc[node.id] = node;
          return acc;
        }, {} as any);

        runInAction(() => {
          store.nodes = responses as any;

          if (store.notificationsEnabled || store.passingNotificationsEnabled) {
            store.nodes.forEach((node) => {
              const hasFailed =
                node.status === `failed` &&
                previousNodes[node.id]?.status !== `failed`;

              const hasPassed =
                node.status === `passed` &&
                previousNodes[node.id]?.status !== `passed`;

              if (hasFailed && store.notificationsEnabled) {
                cidemonNative.sendNotification(
                  `🛑 Build Failed`,
                  `${node.label} has failed!`,
                  node.url,
                );
              }

              if (hasPassed && store.passingNotificationsEnabled) {
                cidemonNative.sendNotification(
                  `✅ Build Passed`,
                  `${node.label} has passed!`,
                  node.url,
                );
              }
            });
          }

          store.fetching = false;
        });
      },

      triggerRebuild: async (node: INode) => {
        try {
          let promise: Promise<any> | null = null;
          switch (node.source) {
            case `CircleCI`:
              promise = root.api.triggerCircleciRebuild(node);
              break;

            case `AppCenter`:
              promise = root.api.triggerAppcenterRebuild(node);
              break;

            case `TravisCI`:
              promise = root.api.triggerTravisciRebuild(node);
              break;

            case `Bitrise`:
              promise = root.api.triggerBitriseRebuild(node);
              break;

            default:
              break;
          }

          if (promise) {
            await promise;

            root.ui.addToast({
              text: 'Build has been triggered',
              type: 'success',
            });
          }
        } catch (e) {
          root.ui.addToast({
            text: 'Could not trigger rebuild :(',
            type: 'error',
          });
        }
      },

      addToken: (source: Source, name: string, key: string, baseURL?: string, visibility?: GitlabVisibility ) => {
        let token: IToken = {
          source,
          name,
          ...(source === 'Gitlab' ? { baseURL, visibility } : {}),
          key,
        };

        store.tokens.push(token);
        store.fetchNodes();
      },

      toggleSorting: () => {
        switch (store.sortingKey) {
          case SortingKey.date:
            store.sortingKey = SortingKey.status;
            break;
          case SortingKey.status:
            store.sortingKey = SortingKey.name;
            break;
          case SortingKey.name:
            store.sortingKey = SortingKey.date;
            break;
          default:
            throw new Error(`Invalid Sorting Key was inserted`);
        }
      },
      removeTokenByName: (name: string) => {
        let idx = store.tokens.findIndex((t) => t.name === name);

        if (idx >= 0) {
          store.tokens.splice(idx, 1);
          store.fetchNodes();
        }
      },
      addIgnoredRegex: (pattern: string, inverted: boolean) => {
        let isValid = true;
        let exists = store.complexRegexes.find((t) => t.regex === pattern);

        if (exists) {
          return false;
        }

        try {
          // eslint-disable-next-line no-new
          new RegExp(pattern);
        } catch (e) {
          isValid = false;
        }

        if (!isValid) {
          return false;
        }

        let id = Math.random().toString(36).substring(2);

        store.complexRegexes.push({id, regex: pattern, inverted});
        return true;
      },

      updateIgnoredRegex: (id: string, pattern: string, inverted: boolean) => {
        let isValid = true;

        try {
          // eslint-disable-next-line no-new
          new RegExp(pattern);
        } catch (e) {
          isValid = false;
        }

        if (!isValid) {
          return false;
        }

        let index = store.complexRegexes.findIndex((obj) => obj.id === id);

        if (index >= 0) {
          store.complexRegexes[index] = {
            id,
            regex: pattern,
            inverted,
          };
        }
      },

      removeIgnoredRegex: (pattern: string) => {
        let idx = store.complexRegexes.findIndex((t) => t.regex === pattern);

        if (idx >= 0) {
          let newRegexes = store.complexRegexes.slice();
          newRegexes.splice(idx, 1);
          store.complexRegexes = newRegexes;
        }
      },

      addEmptyGithubRepo: () => {
        store.githubRepos.push(``);
      },

      deleteGithubRepo: (ii: number) => {
        let newRepos = store.githubRepos.slice();
        newRepos.splice(ii, 1);
        store.githubRepos = newRepos;
      },

      sendGithubKeyToast: debounce(2000, () => {
        root.ui.clearToasts();
        root.ui.addToast({type: 'success', text: 'Github key saved'});
      }),

      setGithubKey: (str: string) => {
        store.githubKey = str;
        store.sendGithubKeyToast();
      },

      setNotificationsEnabled: (notificationsEnabled: boolean) => {
        store.notificationsEnabled = notificationsEnabled;
      },

      setPassingNotificationsEnabled: (v: boolean) => {
        store.passingNotificationsEnabled = v;
      },

      setStartAtLogin: (startAtLogin: boolean) => {
        store.startAtLogin = startAtLogin;
      },

      closeApp: () => {
        cidemonNative.closeApp();
      },

      setFetchInterval: (interval: number) => {
        if (interval < 1) {
          return;
        }

        store.fetchInterval = interval;
      },

      sendGithubRepoToast: debounce(2000, () => {
        root.ui.clearToasts();
        root.ui.addToast({type: 'success', text: 'Github slug saved'});
      }),
      setGithubRepoAtIndex: (t: string, ii: number) => {
        store.githubRepos[ii] = t;
        store.sendGithubRepoToast();
      },

      toggleFilterHardSwitch: () => {
        if (store.complexRegexes.length) {
          store.filterHardOffSwitch = !store.filterHardOffSwitch;
        }
      },

      openNode: (url: string) => {
        Linking.openURL(url);

        store.repoOpeningsCount++;

        if (store.repoOpeningsCount === 3) {
          cidemonNative.requestReview();
        }
      },

      toggleShowBuildNumber: () => {
        store.showBuildNumber = !store.showBuildNumber;
        store.fetchNodes();
      },

      openIssueRepo: () => {
        Linking.openURL(
          'https://github.com/ospfranco/cidemon/issues/new/choose',
        );
      },

      toggleGithubFetchPrs: () => {
        store.githubFetchPrs = !store.githubFetchPrs;
        root.ui.clearToasts();
        root.ui.addToast({
          type: `success`,
          text: `Fetching github pull requests: ${
            store.githubFetchPrs ? 'ON' : 'OFF'
          }`,
        });
      },

      toggleGithubFetchBranches: () => {
        store.githubFetchBranches = !store.githubFetchBranches;

        root.ui.clearToasts();
        root.ui.addToast({
          type: `success`,
          text: `Fetching github branches: ${
            store.githubFetchBranches ? 'ON' : 'OFF'
          }`,
        });
      },

      toggleGithubFetchWorkflows: () => {
        store.githubFetchWorkflows = !store.githubFetchWorkflows;
        root.ui.clearToasts();
        root.ui.addToast({
          type: `success`,
          text: `Fetching github workflows: ${
            store.githubFetchWorkflows ? 'ON' : 'OFF'
          }`,
        });
      },

      toggleUseSimpleIcon: () => {
        store.useSimpleIcon = !store.useSimpleIcon;

        store.fetchNodes();
      },

      dismissWelcome: () => {
        store.welcomeShown = true;
      },
    },
    {
      // @ts-ignore
      nodes: observable.shallow,
    },
  );

  // Hydrate after creation
  await hydrate().then(() => {
    // create auto persist routine
    autorun(persist);
    // apply auto launch (user configured) setting
    autorun(() => cidemonNative.applyAutoLauncher(store.startAtLogin));
    // start polling timer
    autorun(startTimer);
    // do the initial fetch of data
    store.fetchNodes();
  });

  return store;
}
