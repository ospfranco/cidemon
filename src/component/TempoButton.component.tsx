import {useBoolean, useDarkTheme} from 'lib';
import React, {useState} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';
import {tw} from 'tailwind';

interface IProps {
  onPress?: () => void;
  title?: string;
  primary?: boolean;
  secondary?: boolean;
  style?: any;
  children?: any;
  applyMargin?: boolean;
  onPressWithPosition?: (x: number, y: number) => void;
}

export const TempoButton = ({
  onPress,
  title,
  primary,
  secondary,
  style,
  children,
  applyMargin,
  onPressWithPosition,
}: IProps) => {
  const [hovered, onHover, offHover] = useBoolean();
  const [coordinate, setCoordinate] = useState<any>();
  const isDark = useDarkTheme();
  const _onPress = (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPress?.();
    onPressWithPosition?.(
      coordinate.x + coordinate.width,
      coordinate.y + coordinate.height,
    );
  };

  if (secondary) {
    return (
      <TouchableOpacity
        onPress={_onPress}
        onLayout={(e) => setCoordinate(e.nativeEvent.layout)}
        // @ts-ignore
        enableFocusRing={false}
        style={[styles.secondaryButton, applyMargin && styles.margin, style]}>
        {!!title && <Text style={{color: `white`}}>{title}</Text>}
        {children}
      </TouchableOpacity>
    );
  }

  if (primary) {
    return (
      <TouchableOpacity
        onPressIn={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onPress={_onPress}
        onPressOut={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onLayout={(e) => setCoordinate(e.nativeEvent.layout)}
        // @ts-ignore
        enableFocusRing={false}
        onMouseEnter={onHover}
        onMouseLeave={offHover}
        style={[
          tw(
            `${
              hovered
                ? `bg-blue-400 border-blue-500`
                : `bg-blue-500 border-blue-600`
            } px-3 py-2 items-center rounded `,
          ),
          style,
        ]}>
        {!!title && <Text style={{color: `white`}}>{title}</Text>}
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={_onPress}
      onLayout={(e) => setCoordinate(e.nativeEvent.layout)}
      // @ts-ignore
      enableFocusRing={false}
      onMouseEnter={onHover}
      onMouseLeave={offHover}
      style={[
        tw('px-2 py-2 items-center bg-opacity-25 rounded', {
          'bg-gray-300': !isDark && hovered,
          'bg-gray-700': isDark && hovered,
        }),
        style,
      ]}>
      {!!title && <Text style={styles.flatButton}>{title}</Text>}
      {children}
    </TouchableOpacity>
  );
};

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
  },
  margin: {
    margin: global.metrics.pl,
  },
});
