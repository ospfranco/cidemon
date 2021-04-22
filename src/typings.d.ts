/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

declare module "github-api";
declare module "base-64";
declare module "promise.allsettled" {
  function allSettled(
    promises: Promise<T>[],
  ): Array<
    { status: "fulfilled"; value: T } | { status: "rejected"; reason: any }
  >;
  export = allSettled;
}

type Awaited<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

interface IMetrics {
  pxs: number;
  ps: number;
  pm: number;
  pxm: number;
  pl: number;
  ts: number;
  tm: number;
  tl: number;
  imgSmall: number;
  imgMedium: number;
  imgLarge: number;
}

declare var global: {
  metrics: IMetrics;
  colors: any;
  isMacOS: boolean;
  os: "ios" | "macos" | "android" | "web" | "windows";
};

declare module "*.png";
declare module "*.jpg";
declare interface IIgnoreRegex {
  id: string;
  regex: string;
  inverted: boolean;
}

declare type Source =
  | `CircleCI`
  | `AppCenter`
  | `TravisCI`
  | `Bitrise`
  | `Github`
  | `Gitlab`
  | `Ping`;

declare type Status = `pending` | `passed` | `running` | `failed`;

declare type VCS = `github` | `bitbucket` | `gitlab` | `unknown`;

declare interface IToken {
  source: Source;
  name: string;
  key: string;
}

declare interface ISubNode {
  label: string;
  extraLabel?: string | null;
  status: Status;
  url?: string;
}

declare interface INode {
  id: string;
  source: Source;
  url: string;
  label: string;
  status: Status;
  vcs?: VCS;
  key?: string;
  buildUrl?: string;
  date?: string;
  jobId?: string;
  // used for some extra field needed to make requests to the api
  extra?: string;
  subItems?: ISubNode[];
  // added fields for small nice things
  sha?: string;
  isPr?: boolean;
}

declare interface IToast {
  text: string;
  type: `success` | `error` | `neutral`;
}

declare interface IPingTestDto {
  id?: string;
  name?: string;
  url?: string;
  method?: `GET` | `POST` | `PUT`;
  expectedStatus?: number | null;
  expectedResponse?: string | null;
}
