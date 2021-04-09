import {mapPingTest, cidemonNative} from 'lib';
import {
  autorun,
  configure,
  makeAutoObservable,
  observable,
  runInAction,
  toJS,
} from 'mobx';
import {createPingTest, PingTest} from 'model';
import {Alert, Linking, NativeModules} from 'react-native';
import {IRootStore} from 'Root.store';
import Fuse from 'fuse.js';

configure({
  useProxies: `never`,
});

export enum SortingKey {
  date = `Date`,
  status = `Status`,
  name = `Name`,
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
        pingTests: JSStore.pingTests,
        doubleRowItems: JSStore.doubleRowItems,
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
        store.pingTests = parsedStore.pingTests?.map(createPingTest) ?? [];
        store.doubleRowItems = parsedStore.doubleRowItems ?? false;
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
      notificationsEnabled: false,
      startAtLogin: false,
      fetchInterval: 1,
      passingNotificationsEnabled: false,
      filterHardOffSwitch: false,
      repoOpeningsCount: 0,
      searchQuery: ``,
      showBuildNumber: false,
      pingTests: [] as PingTest[],
      doubleRowItems: false,

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

        if (this.searchQuery) {
          const fuse = new Fuse(finalNodes, {
            keys: [`label`],
            threshold: 0.3,
          });

          finalNodes = fuse
            .search(this.searchQuery)
            .map((fuseResult) => fuseResult.item);
        }

        // once a new set of valid nodes has been calculated
        // update the native icon on the menubar
        if (NativeModules.TempomatNative) {
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

          NativeModules.TempomatNative.setStatusButtonText(
            failed,
            running,
            passed,
          );
        }
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
              return root.api.fetchGitlabNodes(t.key, fetchOptions);

            default:
              break;
          }
        });

        if (store.githubKey !== ``) {
          promises = promises.concat(
            store.githubRepos
              .filter((v) => v !== ``)
              .map((slug) => root.api.fetchGithubNodes(store.githubKey, slug)),
          );
        }

        let responses = await Promise.all(promises);
        // @ts-ignore
        // TS complains here, and is right, promise.all might return undefined values
        // however filter n => n does remove any falsy values in the array
        responses = responses.flat().filter((n) => n);

        try {
          // Do ping checks
          let pingChecks = await Promise.all(
            store.pingTests.map((test) => test.run()),
          );

          let pingNodes = pingChecks.map((pingResult, idx) =>
            mapPingTest(pingResult, store.pingTests[idx]),
          );

          responses = responses.concat(pingNodes);
        } catch (e) {
          console.warn(`error pinging`);
        }

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

      addToken: (source: Source, name: string, key: string) => {
        let token: IToken = {
          source,
          name,
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

      setGithubKey: (str: string) => {
        store.githubKey = str;
      },

      setNotificationsEnabled: (notificationsEnabled: boolean) => {
        if (global.isMacOS) {
          store.notificationsEnabled = notificationsEnabled;
        } else {
          Alert.alert(
            `Hold on!`,
            `Push notifications will be available on mobile devices in the near future, if you want to be notified when the feature is available, just send us an E-Mail`,
            [
              {
                text: `Close`,
                onPress: () => null,
              },
              {
                text: `I want notifications!`,
                onPress: () =>
                  Linking.openURL(
                    `mailto:ospfranco@protonmail.com?subject=Tempomat%Push%20Notifications%20Request`,
                  ),
              },
            ],
          );
        }
      },

      setPassingNotificationsEnabled: (v: boolean) => {
        if (global.isMacOS) {
          store.passingNotificationsEnabled = v;
        }
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

      setGithubRepoAtIndex: (t: string, ii: number) => {
        store.githubRepos[ii] = t;
      },

      toggleFilterHardSwitch: () => {
        if (store.complexRegexes.length) {
          store.filterHardOffSwitch = !store.filterHardOffSwitch;
        }
      },

      toggleDoubleRowItems: () => {
        store.doubleRowItems = !store.doubleRowItems;
      },

      openNode: (url: string) => {
        Linking.openURL(url);

        store.repoOpeningsCount++;

        if (store.repoOpeningsCount === 3) {
          cidemonNative.requestReview();
        }
      },

      setSearchQuery: (q: string) => {
        store.searchQuery = q;
      },

      toggleShowBuildNumber: () => {
        store.showBuildNumber = !store.showBuildNumber;
        store.fetchNodes();
      },

      addPingTest: () => {
        let pingTest = createPingTest({});
        store.pingTests.push(pingTest);
        return pingTest;
      },

      removePingTest: (pingTest: PingTest) => {
        store.pingTests = store.pingTests.filter((test) => test !== pingTest);
      },
    },
    {
      nodes: observable.shallow,
    },
  );

  // after store is created
  // Hydrate previous state
  await hydrate().then(() => {
    // create auto persist routine
    autorun(persist);
    // apply auto launch (user configured) setting
    // autorun(() => cidemonNative.applyAutoLauncher(store.startAtLogin));
    // start polling timer
    autorun(startTimer);
    // do the initial fetch of data
    store.fetchNodes();
  });

  return store;
}
