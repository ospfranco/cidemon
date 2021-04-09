export interface AppcenterBranchDto {
  branch: BranchInfoDto
  lastBuild: BuildInfoDto
  configured: boolean
}

interface BranchInfoDto {
  name: string
}

interface BuildInfoDto {
  id: number
  buildNumber: string
  sourceVersion: string
  status: string // "inProgress"
  result: string // "succeeded" / "failed" / among many others
}
