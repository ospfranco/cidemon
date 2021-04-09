import {useState} from "react"
import {useColorScheme} from "react-native"

export function useDarkTheme() {
  let theme = useColorScheme()

  return theme === `dark`
}

export function useDynamic() {
  let theme = useColorScheme()

  return (darkThemeValue: string, lightThemeValue: string) => theme === 'dark' ? darkThemeValue : lightThemeValue
}

export function useBoolean(initialState: boolean = false): [boolean, () => void, () => void] {
  let [v, setV] = useState(initialState)
  let setTrue = () => {
    setV(true)
  }
  let setFalse = () => {
    setV(false)
  }
  return [v, setTrue, setFalse]
}
