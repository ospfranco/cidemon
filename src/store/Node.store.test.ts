import {createNodeStore, SortingKey} from './Node.store';
import {cidemonNative} from 'lib';
import {createApiStore} from './Api.store';
import {IRootStore} from 'Root.store';
import {when} from 'mobx';

jest.mock('../lib/CIDemonNative');
jest.mock('./Api.store');

let ROOT_MOCK: IRootStore = {} as any;

ROOT_MOCK.api = createApiStore(ROOT_MOCK);

describe(`NodeStore`, () => {
  let nodeStore: Awaited<ReturnType<typeof createNodeStore>>;

  beforeEach(async () => {
    nodeStore = await createNodeStore(ROOT_MOCK as any);
    // jest.useFakeTimers();
  });

  // afterEach(async () => {
  //   jest.clearAllTimers();
  // });

  it(`Correctly instantiated and hydrated`, () => {
    expect(nodeStore).not.toBeNull();
    // Store hydrates and persists its state
    expect(cidemonNative.securelyRetrieve).toBeCalled();
    expect(cidemonNative.securelyStore).toBeCalled();
    // It applies its startAtLogin value
    expect(cidemonNative.applyAutoLauncher).toBeCalled();
  });

  it(`can add token (and trigger fetch)`, () => {
    nodeStore.fetchNodes = jest.fn();

    let name = `CircleCISampleKey`;
    let token = `123456789`;
    nodeStore.addToken(`CircleCI`, name, token);

    expect(nodeStore.tokens.length).toBe(1);
    expect(nodeStore.tokens[0].source).toEqual(`CircleCI`);
    expect(nodeStore.tokens[0].name).toEqual(name);
    expect(nodeStore.tokens[0].key).toEqual(token);

    // After token has been added fetch nodes is called
    expect(nodeStore.fetchNodes).toHaveBeenCalled();
  });

  it(`toggles sorting in the correct order`, () => {
    expect(nodeStore.sortingKey).toEqual(SortingKey.status);

    nodeStore.toggleSorting();

    expect(nodeStore.sortingKey).toEqual(SortingKey.name);

    nodeStore.toggleSorting();

    expect(nodeStore.sortingKey).toEqual(SortingKey.date);

    nodeStore.toggleSorting();

    expect(nodeStore.sortingKey).toEqual(SortingKey.status);
  });

  it(`can remove token by name`, () => {
    let name = `CircleCISampleKey`;
    let token = `123456789`;
    nodeStore.addToken(`CircleCI`, name, token);

    expect(nodeStore.tokens.length).toBe(1);
    expect(nodeStore.tokens[0].source).toEqual(`CircleCI`);
    expect(nodeStore.tokens[0].name).toEqual(name);
    expect(nodeStore.tokens[0].key).toEqual(token);

    nodeStore.removeTokenByName(name);

    expect(nodeStore.tokens.length).toBe(0);
  });

  it(`can add a ignore regex`, () => {
    // should pretty much ignore everything under the sun
    let testRegex = `.*[A-Za-z]`;
    let regexAdded = nodeStore.addIgnoredRegex(testRegex, false);
    expect(regexAdded).toBeTruthy();
    expect(nodeStore.complexRegexes.length).toEqual(1);
    expect(nodeStore.complexRegexes[0]).toEqual({
      id: nodeStore.complexRegexes[0].id,
      regex: testRegex,
      inverted: false,
    });
  });

  // TODO: add a test to actually see if nodes are being ignored
  // based on the added regex

  it(`can remove regex pattern`, () => {
    let testRegex = `.*[A-Za-z]`;
    let regexAdded = nodeStore.addIgnoredRegex(testRegex, false);

    expect(regexAdded).toBeTruthy();
    expect(nodeStore.complexRegexes.length).toEqual(1);
    expect(nodeStore.complexRegexes[0]).toEqual({
      id: nodeStore.complexRegexes[0].id,
      regex: testRegex,
      inverted: false,
    });

    nodeStore.removeIgnoredRegex(testRegex);

    expect(nodeStore.complexRegexes.length).toEqual(0);
  });

  it(`does not add a INVALID regex`, () => {
    let invalidRegex = `*`;
    let regexAdded = nodeStore.addIgnoredRegex(invalidRegex, false);
    expect(regexAdded).toBeFalsy();
  });

  it(`fetch CircleCI nodes`, async (done) => {
    let name = `CircleCISampleKey`;
    let token = `123456789`;

    let fakeNode: INode = {
      id: 'some random node id',
      url: 'random url',
      date: 'latest date',
      source: `CircleCI`,
      label: `fake label`,
      status: `passed`,
    };

    (ROOT_MOCK.api.fetchCircleciNodes as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve([fakeNode]),
    );

    nodeStore.addToken(`CircleCI`, name, token);

    expect(ROOT_MOCK.api.fetchCircleciNodes).toHaveBeenCalledWith(token, {
      showBuildNumber: false,
    });

    when(
      () => nodeStore.fetching === false,
      () => {
        expect(nodeStore.nodes.length).toBe(1);
        expect(nodeStore.nodes[0]).toEqual(fakeNode);
        done();
      },
    );
  });

  it(`fetch AppCenter nodes`, async (done) => {
    let name = `AppStore Token`;
    let token = `123456789`;

    let fakeNode: INode = {
      id: 'some random node id',
      url: 'random url',
      date: 'latest date',
      source: `AppCenter`,
      label: `fake label`,
      status: `passed`,
    };

    (ROOT_MOCK.api
      .fetchAppcenterNodes as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve([fakeNode]),
    );

    nodeStore.addToken(`AppCenter`, name, token);

    expect(ROOT_MOCK.api.fetchAppcenterNodes).toHaveBeenCalledWith(token, {
      showBuildNumber: false,
    });

    when(
      () => nodeStore.fetching === false,
      () => {
        expect(nodeStore.nodes.length).toBe(1);
        expect(nodeStore.nodes[0]).toEqual(fakeNode);
        done();
      },
    );
  });

  it(`fetch TravisCI nodes`, async (done) => {
    let name = `Travis key`;
    let token = `123456789`;

    let fakeNode: INode = {
      id: 'some random node id',
      url: 'random url',
      date: 'latest date',
      source: `CircleCI`,
      label: `fake label`,
      status: `passed`,
    };

    (ROOT_MOCK.api.fetchTravisciNodes as jest.Mock).mockImplementationOnce(
      () => {
        return Promise.resolve([fakeNode]);
      },
    );

    nodeStore.addToken(`TravisCI`, name, token);

    expect(ROOT_MOCK.api.fetchTravisciNodes).toHaveBeenCalledWith(token, {
      showBuildNumber: false,
    });

    when(
      () => nodeStore.fetching === false,
      () => {
        expect(nodeStore.nodes.length).toBe(1);
        expect(nodeStore.nodes[0]).toEqual(fakeNode);
        done();
      },
    );
  });

  it(`fetch Bitrise nodes`, async (done) => {
    let name = `bitrise key`;
    let token = `123456789`;

    let fakeNode: INode = {
      id: 'some random node id',
      url: 'random url',
      date: 'latest date',
      source: `CircleCI`,
      label: `fake label`,
      status: `passed`,
    };

    (ROOT_MOCK.api.fetchBitriseNodes as jest.Mock).mockImplementationOnce(
      () => {
        return Promise.resolve([fakeNode]);
      },
    );

    nodeStore.addToken(`Bitrise`, name, token);

    expect(ROOT_MOCK.api.fetchBitriseNodes).toHaveBeenCalledWith(token, {
      showBuildNumber: false,
    });

    when(
      () => nodeStore.fetching === false,
      () => {
        expect(nodeStore.nodes.length).toBe(1);
        expect(nodeStore.nodes[0]).toEqual(fakeNode);
        done();
      },
    );
  });

  it(`fetch Gitlab nodes`, async (done) => {
    let name = `Gitlab key`;
    let token = `123456789`;

    let fakeNode: INode = {
      id: 'some random node id',
      url: 'random url',
      date: 'latest date',
      source: `CircleCI`,
      label: `fake label`,
      status: `passed`,
    };

    (ROOT_MOCK.api.fetchGitlabNodes as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve([fakeNode]);
    });

    nodeStore.addToken(`Gitlab`, name, token);

    expect(ROOT_MOCK.api.fetchGitlabNodes).toHaveBeenCalledWith(token, {
      showBuildNumber: false,
    });

    when(
      () => nodeStore.fetching === false,
      () => {
        expect(nodeStore.nodes.length).toBe(1);
        expect(nodeStore.nodes[0]).toEqual(fakeNode);
        done();
      },
    );
  });
});
