import {Images} from 'Assets';
import {TINT_MAPPING, useBoolean, useDarkTheme, useDynamic} from 'lib';
import {observer} from 'mobx-react-lite';
import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {tw} from 'tailwind';
import {Row} from './Row.component';

let captureBranchRegex = /(.*)(\[.*\])(.*)/;

interface IProps {
  node: INode;
  onPress: () => void;
  style?: any;
  selected?: boolean;
}

export const NodeRow = observer(({node, onPress, style, selected}: IProps) => {
  const [hovered, onHover, offHover] = useBoolean();
  const [tokens, setTokens] = useState<null | string[]>(null);
  const dynamic = useDynamic();
  const isDark = useDarkTheme();

  useEffect(() => {
    const newTokens = captureBranchRegex.exec(node.label);
    if (newTokens && newTokens.length > 1) {
      setTokens(newTokens);
    }
  }, [node.label]);

  let icon = Images[`${node.source.toLowerCase()}`];

  let tintColor = TINT_MAPPING[node.status];

  let textColor = dynamic(`text-gray-100`, `text-gray-800`);
  let hoverColor = dynamic(`bg-gray-700`, `bg-blue-100`);

  let text;

  if (tokens) {
    text = (
      <Text style={tw(`${textColor} text-sm`)}>
        {tokens[2].substring(1, tokens[2].length - 1)}
      </Text>
    );
  } else {
    text = <Text style={tw(`text-sm ${textColor}`)}>{node.label}</Text>;
  }

  return (
    <TouchableOpacity
      // @ts-ignore
      enableFocusRing={false}
      onMouseEnter={onHover}
      onMouseLeave={offHover}
      onPress={onPress}>
      <View style={tw('px-1 ')}>
        <View
          style={[
            tw('py-2 px-3 rounded', {
              [`${hoverColor} bg-opacity-40`]: hovered,
              'bg-sky-50': !isDark && selected,
              'bg-sky-900': isDark && selected,
            }),
            style,
          ]}>
          <Row vertical="center">
            {!!icon && (
              <View style={tw('mr-3')}>
                <Image source={icon} style={[styles.imageIcon, {tintColor}]} />
              </View>
            )}

            <View style={tw('flex-1')}>{text}</View>

            {node.isAction && (
              <View>
                <Text style={tw('text-xs font-light uppercase')}>ACTION</Text>
              </View>
            )}

            {node.isPr && (
              <>
                <Text style={tw('text-xs font-light')}>PR</Text>
                <View style={tw('w-2')} />
              </>
            )}

            {node.isBranch && (
              <Icon name="source-branch" style={tw('text-sm')} />
            )}

            {!!node.userAvatarUrl && (
              <Image
                source={{uri: node.userAvatarUrl}}
                style={tw('h-6 w-6 rounded-full')}
              />
            )}
          </Row>

          {/* Sub nodes */}
          {node.status === `failed` && node.subItems && (
            <View style={tw(`pl-2`)}>
              {node.subItems.map((subItem: ISubNode, index: number, items) => (
                <Row key={`${node.id}-sub-${index}`} vertical="center">
                  <View style={tw('items-center mr-8')}>
                    <View
                      style={[
                        tw('h-2'),
                        {
                          width: 1,
                          backgroundColor: TINT_MAPPING[subItem.status],
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.statusIndicator,
                        {backgroundColor: TINT_MAPPING[subItem.status]},
                      ]}
                    />

                    <View
                      style={[
                        {
                          width: 1,
                          backgroundColor: TINT_MAPPING[subItem.status],
                        },
                        tw('h-2', {
                          'bg-transparent': index === items.length - 1,
                        }),
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      tw(`text-xs`, {
                        'text-gray-400': subItem.status !== 'failed',
                      }),
                    ]}>
                    {subItem.label}
                    {!!subItem.extraLabel && (
                      <Text> · {subItem.extraLabel}</Text>
                    )}
                  </Text>
                </Row>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  imageIcon: {
    height: 24,
    width: 24,
    resizeMode: `contain`,
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
  },
});
