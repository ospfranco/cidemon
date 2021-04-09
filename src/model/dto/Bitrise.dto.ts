export interface BitrisePaginated<T> {
  data: T[]
}

export interface BitriseRepoDto {
  slug: string
  title: string
  repo_owner: string
  provider: string
  branch: string
}

export interface BitriseBranchDto {
  status: BitriseStatus
  build_number: number
  commit_message?: string
  slug: string
  branch: string
  finished_at?: string
}

export enum BitriseStatus {
  notFinished = 0,
  successful = 1,
  failed = 2,
  abortedWithFailure = 3,
  abortedWithSuccess = 4,
}
