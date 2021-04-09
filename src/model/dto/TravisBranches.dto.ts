export interface TravisBranchesDto {
  branches: BranchDto[];
  commits: CommitDto[];
}

interface BranchDto {
  id: number;
  commit_id: number;
  state: string;
  started_at: string;
}

interface CommitDto {
  id: number;
  branch: string;
  message: string;
  author_name: string;
  author_email: string;
}
