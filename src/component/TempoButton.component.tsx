import {useBoolean} from 'lib';
import React, {useState} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
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
  const _onPress = () => {
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

  // style={[styles.primaryButton, applyMargin && styles.margin, style]}>

  if (primary) {
    return (
      <TouchableOpacity
        onPress={_onPress}
        onLayout={(e) => setCoordinate(e.nativeEvent.layout)}
        // @ts-ignore
        enableFocusRing={false}
        onMouseEnter={onHover}
        onMouseLeave={offHover}
        style={[
          tw(
            `${
              hovered ? `bg-blue-400` : `bg-blue-500`
            } px-3 py-2 items-center rounded border border-blue-500`,
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
        tw(
          `${
            hovered ? `bg-gray-300` : `bg-transparent`
          } px-3 py-2 items-center bg-opacity-25 border rounded border-gray-300`,
        ),
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
});
