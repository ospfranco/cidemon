export interface CircleciRepoDto {
  vcs_url: string
  username: string
  reponame: string
  branches: Record<string, BranchDto>
}

interface BranchDto {
  recent_builds?: BuildInfoDto[]
  running_builds?: BuildInfoDto[]
  last_non_success?: BuildInfoDto
  last_success: BuildInfoDto
  latest_completed_workflows: Record<string, WorkflowDto>
  is_using_workflows: boolean
}

interface BuildInfoDto {
  pushed_at: string
  vcs_revision: string
  build_num: number
  outcome: string
}

interface WorkflowDto {
  status: string
  created_at: string
  id: string
}
