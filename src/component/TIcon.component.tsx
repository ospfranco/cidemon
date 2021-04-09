import React from "react"
import {View} from "react-native"
import {useBoolean} from "lib"
import {IconProps} from "react-native-vector-icons/Icon"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import tw from "tailwind-rn"

interface IProps extends IconProps {
  disableHover?: boolean
}

export const TIcon = ({style, disableHover, ...props}: IProps) => {
  const [hovered, onHover, offHover] = useBoolean()

  if (!disableHover) {
    let color = hovered ? `text-blue-500` : `text-gray-600`
    style = [tw(`${color} text-base`), style]
  }

  return (
    <View
      //@ts-ignore
      onMouseEnter={onHover}
      onMouseLeave={offHover}>
      <Icon {...props} style={style} />
    </View>
  )
}
