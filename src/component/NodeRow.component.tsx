import React, {useEffect, useState} from 'react';
import {Text, Image, StyleSheet, View, TouchableOpacity} from 'react-native';
import {Row} from './Row.component';
import {Images} from 'Assets';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {observer} from 'mobx-react-lite';
import {useBoolean, TINT_MAPPING, useDynamic} from 'lib';
import tw from 'tailwind-rn';
import {useStore} from 'Root.store';

let captureBranchRegex = /(.*)(\[.*\])(.*)/;

interface IProps {
  node: INode;
  onPress: () => void;
  style?: any;
  selected?: boolean;
}

export const NodeRow = observer(({node, onPress, style, selected}: IProps) => {
  let root = useStore();
  let doubleRow = root.node.doubleRowItems;
  let [hovered, onHover, offHover] = useBoolean();
  let [tokens, setTokens] = useState<null | string[]>(null);
  let dynamic = useDynamic();

  useEffect(() => {
    const newTokens = captureBranchRegex.exec(node.label);
    if (newTokens && newTokens.length > 1) {
      setTokens(newTokens);
    }
  }, [node.label]);

  let icon = Images[`${node.source.toLowerCase()}`];

  let tintColor = TINT_MAPPING[node.status];

  let textColor = dynamic(`text-gray-300`, `text-gray-800`);
  let subTextColor = dynamic(`text-gray-400`, `text-gray-600`);
  if (selected) {
    textColor = `text-white`;
    subTextColor = `text-gray-200`;
  }

  let text;

  if (!tokens) {
    text = <Text style={tw(`text-sm ${textColor}`)}>{node.label}</Text>;
  } else {
    if (doubleRow) {
      text = (
        <View>
          <Text style={tw(`text-xs ${subTextColor}`)}>
            {tokens[1]} {tokens[3] ? `- ${tokens[3]}` : ``}
          </Text>
          <Text style={tw(textColor)}>
            {tokens[2].substring(1, tokens[2].length - 1)}
          </Text>
        </View>
      );
    } else {
      text = (
        <Text style={tw(`text-sm ${textColor}`)}>
          {tokens[1]}
          <Text style={tw(`text-sm ${textColor} font-semibold`)}>
            {tokens[2]}
          </Text>
          {tokens[3]}
        </Text>
      );
    }
  }

  return (
    <TouchableOpacity
      // @ts-ignore
      enableFocusRing={false}
      onMouseEnter={onHover}
      onMouseLeave={offHover}
      onPress={onPress}>
      <View
        style={[
          tw(
            `py-1 ${hovered ? `bg-blue-200 bg-opacity-50` : ``} ${
              selected ? `bg-blue-500` : ``
            } rounded`,
          ),
          style,
        ]}>
        <Row vertical="center">
          {!!icon && (
            <Image source={icon} style={[styles.imageIcon, {tintColor}]} />
          )}
          {node.source === `Ping` && (
            <Icon name="signal-variant" color={tintColor} style={styles.icon} />
          )}
          {text}
        </Row>

        {/* Sub nodes */}
        {node.status === `failed` && node.subItems && (
          <View style={tw(`pl-8 pt-1`)}>
            {node.subItems.map((subItem: ISubNode, index: number) => (
              <Row key={`${node.id}-sub-${index}`} vertical="center">
                <View
                  style={[
                    styles.statusIndicator,
                    {backgroundColor: TINT_MAPPING[subItem.status]},
                  ]}
                />
                <Text style={tw(`text-sm ${subTextColor}`)}>
                  {subItem.label}
                  {!!subItem.extraLabel && (
                    <Text style={tw(`text-xs ${subTextColor}`)}>
                      {' '}
                      ({subItem.extraLabel})
                    </Text>
                  )}
                </Text>
              </Row>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  imageIcon: {
    height: global.metrics.imgSmall,
    width: global.metrics.imgSmall,
    resizeMode: `contain`,
    marginLeft: global.metrics.ps,
    marginRight: global.metrics.pm,
  },
  icon: {
    marginLeft: global.metrics.ps,
    marginRight: global.metrics.pm,
    fontSize: global.metrics.tl,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
});
