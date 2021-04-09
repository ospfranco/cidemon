import { useBoolean } from "lib"
import React from "react"
import {TouchableOpacity, Text, StyleSheet} from "react-native"
import tw from 'tailwind-rn'

interface IProps {
  onPress: () => void
  title?: string
  primary?: boolean
  secondary?: boolean
  style?: any
  children?: any
  applyMargin?: boolean
}

export const TempoButton = ({
  onPress,
  title,
  primary,
  secondary,
  style,
  children,
  applyMargin,
}: IProps) => {
  const [hovered, onHover, offHover] = useBoolean()
  if (secondary) {
    return (
      <TouchableOpacity
        onPress={onPress}
        // @ts-ignore
        enableFocusRing={false}
        style={[styles.secondaryButton, applyMargin && styles.margin, style]}>
        {!!title && <Text style={{color: `white`}}>{title}</Text>}
        {children}
      </TouchableOpacity>
    )
  }

  // style={[styles.primaryButton, applyMargin && styles.margin, style]}>

  if (primary) {
    return (
      <TouchableOpacity
        onPress={onPress}
        // @ts-ignore
        enableFocusRing={false}
        onMouseEnter={onHover}
        onMouseLeave={offHover}
        style={[
          tw(`${hovered? `bg-blue-400` : `bg-blue-500`} p-3 items-center rounded-lg`), 
          style
        ]}
      >
        {!!title && <Text style={{color: `white`}}>{title}</Text>}
        {children}
      </TouchableOpacity>
    )
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      // @ts-ignore
      enableFocusRing={false}
      onMouseEnter={onHover}
      onMouseLeave={offHover}
      style={[tw(`${hovered? `bg-blue-300` : `bg-transparent`} p-3 items-center rounded-lg bg-opacity-25`), style]}
    >
      {!!title && <Text style={styles.flatButton}>{title}</Text>}
      {children}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  flatButton: {
    color: global.colors.blue500,
    fontSize: 14,
  },
  secondaryButton: {
    paddingHorizontal: global.metrics.pl,
    paddingVertical: global.metrics.ps,
    //@ts-ignore
    backgroundColor: {
      dynamic: {
        dark: `#6E6F6F`,
        light: `#DDD`,
      },
    },
    alignItems: `center`,
    borderRadius: 7,
    //@ts-ignore
    borderColor: {
      dynamic: {
        dark: `#333`,
        light: `#CCC`,
      },
    },
    borderWidth: 1,
  },
  margin: {
    margin: global.metrics.pl,
  },
})
