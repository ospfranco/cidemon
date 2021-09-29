import {useDynamic} from 'lib';
import React from 'react';
import {View} from 'react-native';
import tw from 'tailwind-rn';

interface IProps {
  width?: number | string;
  alignSelf?:
    | `auto`
    | `flex-start`
    | `flex-end`
    | `center`
    | `stretch`
    | `baseline`
    | undefined;
  style?: any;
}

export const Divider = ({width = `100%`, alignSelf, style}: IProps) => {
  const dynamic = useDynamic();
  return (
    <View
      style={[
        {height: 1, width, alignSelf},
        tw(dynamic(`bg-gray-700`, `bg-gray-300`)),
        style,
      ]}
    />
  );
};
