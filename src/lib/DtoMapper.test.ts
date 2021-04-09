import {mapCircleCIProjects} from "./DtoMappings"

describe(`DTO Mapper behaves correctly`, () => {
  it(`Handles CircleCI workflows correctly`, () => {
    const circleCIResWithFailedJob = [
      {
        branches: {
          "bet-fix-blob-error-state": {
            latest_workflows: {
              commit_validation: {
                status: `failed`,
                created_at: `2020-10-14T15:36:34.176Z`,
                id: `113c951a-f60c-4579-8dd8-d3ee988e4ecc`,
              },
            },
            pusher_logins: [`bhuang14`],
            running_builds: [],
            recent_builds: [
              {
                outcome: `success`,
                status: `success`,
                build_num: 460348,
                vcs_revision: `d7081bf668886ec52f2c5de70dcfa329e7fefa73`,
                pushed_at: `2020-10-14T15:36:33.000Z`,
                is_workflow_job: true,
                is_2_0_job: true,
                added_at: `2020-10-14T15:41:32.083Z`,
              },
              {
                outcome: `failed`,
                status: `failed`,
                build_num: 460347,
                vcs_revision: `d7081bf668886ec52f2c5de70dcfa329e7fefa73`,
                pushed_at: `2020-10-14T15:36:33.000Z`,
                is_workflow_job: true,
                is_2_0_job: true,
                added_at: `2020-10-14T15:47:20.003Z`,
              },
              {
                outcome: `success`,
                status: `success`,
                build_num: 460346,
                vcs_revision: `d7081bf668886ec52f2c5de70dcfa329e7fefa73`,
                pushed_at: `2020-10-14T15:36:33.000Z`,
                is_workflow_job: true,
                is_2_0_job: true,
                added_at: `2020-10-14T15:52:43.128Z`,
              },
              {
                outcome: `success`,
                status: `success`,
                build_num: 460345,
                vcs_revision: `d7081bf668886ec52f2c5de70dcfa329e7fefa73`,
                pushed_at: `2020-10-14T15:36:33.000Z`,
                is_workflow_job: true,
                is_2_0_job: true,
                added_at: `2020-10-14T15:41:40.057Z`,
              },
              {
                outcome: `success`,
                status: `success`,
                build_num: 460344,
                vcs_revision: `d7081bf668886ec52f2c5de70dcfa329e7fefa73`,
                pushed_at: `2020-10-14T15:36:33.000Z`,
                is_workflow_job: true,
                is_2_0_job: true,
                added_at: `2020-10-14T15:38:18.937Z`,
              },
            ],
            last_success: {
              outcome: `success`,
              status: `success`,
              build_num: 460348,
              vcs_revision: `d7081bf668886ec52f2c5de70dcfa329e7fefa73`,
              pushed_at: `2020-10-14T15:36:33.000Z`,
              is_workflow_job: true,
              is_2_0_job: true,
              added_at: `2020-10-14T15:41:32.083Z`,
            },
            last_non_success: {
              outcome: `failed`,
              status: `failed`,
              build_num: 460347,
              vcs_revision: `d7081bf668886ec52f2c5de70dcfa329e7fefa73`,
              pushed_at: `2020-10-14T15:36:33.000Z`,
              is_workflow_job: true,
              is_2_0_job: true,
              added_at: `2020-10-14T15:47:20.003Z`,
            },
            latest_completed_workflows: {
              commit_validation: {
                status: `failed`,
                created_at: `2020-10-14T15:36:34.176Z`,
                id: `113c951a-f60c-4579-8dd8-d3ee988e4ecc`,
              },
            },
            is_using_workflows: true,
          },
        },
        oss: false,
        reponame: `experimental`,
        parallel: 11,
        username: `kr-project`,
        has_usable_key: false,
        vcs_type: `github`,
        language: null,
        vcs_url: `https://github.com/kr-project/experimental`,
        following: true,
        default_branch: `master`,
      },
    ]

    const mappedNodes = mapCircleCIProjects(circleCIResWithFailedJob, `blah`, {
      showBuildNumber: true,
    })

    expect(mappedNodes[0].status).toBe(`failed`)
  })
})
