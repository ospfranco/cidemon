import Axios from "axios"
import {makeAutoObservable} from "mobx"
import {v4 as uuidv4} from "uuid"

export type PingTest = ReturnType<typeof createPingTest>

export function createPingTest({
  id = uuidv4(),
  name = ``,
  url = ``,
  method = `GET`,
  expectedStatus = null,
  expectedResponse = null,
}: IPingTestDto) {
  let pingTest = makeAutoObservable({
    // properties
    id,
    name,
    url,
    method,
    expectedStatus,
    expectedResponse,

    // actions
    setName: (name: string) => {
      pingTest.name = name
    },

    setMethod: (method: `GET` | `POST` | `PUT`) => {
      pingTest.method = method
    },

    setUrl: (url: string) => {
      pingTest.url = url
    },

    setExpectedStatus: (status: number) => {
      pingTest.expectedStatus = status
    },

    setExpectedResponse: (response: string) => {
      pingTest.expectedResponse = response
    },

    run: async (): Promise<boolean> => {
      let result = true

      if (!pingTest.url) {
        return false
      }

      try {
        let res = await Axios({
          url: pingTest.url,
          method: pingTest.method,
        })

        if (pingTest.expectedStatus && res.status !== pingTest.expectedStatus) {
          result = false
        }

        if (
          pingTest.expectedResponse &&
          JSON.stringify(res.data) !== pingTest.expectedResponse
        ) {
          result = false
        }

        if (!pingTest.expectedResponse && !pingTest.expectedStatus) {
          result = res.status >= 200 && res.status < 300
        }

        return result
      } catch (e) {
        console.warn(`error running ping`, e)
        return false
      }
    },
  })

  return pingTest
}
