import { IRootStore } from "Root.store";

export let createApiStore = (_: IRootStore) => {
  let store = {
    fetchCircleciNodes: jest.fn(),

    fetchAppcenterNodes: jest.fn(),

    fetchTravisciNodes: jest.fn(),

    fetchBitriseNodes: jest.fn(),

    fetchBitriseRepoBranches: jest.fn(),

    fetchGithubNodes: jest.fn(),

    triggerCircleciRebuild: jest.fn(),

    triggerAppcenterRebuild: jest.fn(),

    triggerTravisciRebuild: jest.fn(),

    triggerBitriseRebuild: jest.fn(),

    fetchGitlabNodes: jest.fn(),
  };

  return store;
};
