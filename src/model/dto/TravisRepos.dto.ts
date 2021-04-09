export interface TravisReposDto {
  repos: TravisRepoDto[];
}

export interface TravisRepoDto {
  id: number;
  slug: string;
}
