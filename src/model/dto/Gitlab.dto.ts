export interface GitlabProjectDto {
  id: string
  name: string
  web_url: string
}

export interface GitlabPipelineDto {
  id: string
  ref: string
  status: string
  created_at: string
  web_url: string
}
