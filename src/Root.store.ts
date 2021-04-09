import { createContext, useContext } from "react";
import { createApiStore, createNodeStore, createUIStore } from "store";

export interface IRootStore {
  api: ReturnType<typeof createApiStore>;
  ui: ReturnType<typeof createUIStore>;
  node: ReturnType<typeof createNodeStore>;
}

export let createRootStore = async (): Promise<IRootStore> => {
  let store: any = {};
  store.ui = createUIStore(store);
  store.api = createApiStore(store);
  store.node = await createNodeStore(store);

  return store;
};

// Placeholder value for the context, is replaced as soon as store is re-hydrated on renderer.tsx
export let StoreContext = createContext<IRootStore>(null as any);
export let StoreProvider = StoreContext.Provider;
export let useStore = () => useContext(StoreContext);
