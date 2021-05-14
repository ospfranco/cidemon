import { makeAutoObservable, runInAction } from 'mobx';
import { IRootStore } from 'Root.store';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export let createUIStore = (root: IRootStore) => {
  let store = makeAutoObservable({
    toasts: [] as IToast[],
    addToast: (toast: IToast) => {
      store.toasts.push(toast);

      setTimeout(() => {
        runInAction(() => {
          store.toasts.pop();
        });
      }, 6000);
    },
    clearToasts: () => {
      store.toasts = []
    }
    // checkForUpdates: () => {
    //   cidemonNative.checkForUpdates();
    // },
  });

  return store;
};
