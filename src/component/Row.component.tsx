import React, {memo} from "react"
import {View} from "react-native"

interface IProps {
  style?: any // StyleProp<View> is breaking here with paddingHorizontal... for some reason
  horizontal?:
    | `flex-end`
    | `flex-start`
    | `center`
    | `space-around`
    | `space-between`
  wrap?: boolean
  vertical?: `center` | `flex-start` | `flex-end` | `space-between`
  children?: any
}

export const Row = memo(
  ({
    style = {},
    horizontal = `flex-start`,
    vertical = `flex-start`,
    wrap,
    children,
  }: IProps) => {
    let innerStyle = {
      display: `flex`,
      flexDirection: `row`,
      justifyContent: horizontal,
      alignItems: vertical,
      flexWrap: wrap ? `wrap` : `nowrap`,
    }

    return <View style={[style, innerStyle]}>{children}</View>
  },
)
