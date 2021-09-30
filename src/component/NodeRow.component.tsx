import {Images} from 'Assets';
import {
  cidemonNative,
  TINT_MAPPING,
  useBoolean,
  useDarkTheme,
  useDynamic,
} from 'lib';
import {observer} from 'mobx-react-lite';
import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useStore} from 'Root.store';
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
  let subTextColor = dynamic(`text-coolGray-400`, `text-gray-500`);
  let hoverColor = dynamic(`bg-gray-700`, `bg-coolGray-200`);

  let text;

  if (tokens) {
    text = (
      <View>
        <Text style={tw(`${textColor}`)}>
          {tokens[2].substring(1, tokens[2].length - 1)}
        </Text>
        <Text style={tw(`text-xs ${subTextColor}`)}>
          {tokens[1]} {tokens[3] ? `- ${tokens[3]}` : ``}
        </Text>
      </View>
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
      <View
        style={[
          tw('py-1 pl-4', {
            [`${hoverColor} bg-opacity-40`]: hovered,
            'bg-sky-50': !isDark && selected,
            'bg-sky-900': isDark && selected,
          }),
          style,
        ]}>
        <Row vertical="center">
          {!!icon && (
            <View style={tw('mr-2')}>
              <Image source={icon} style={[styles.imageIcon, {tintColor}]} />
            </View>
          )}

          {node.source === `Ping` && (
            <View style={tw('mr-2')}>
              <Icon
                name="signal-variant"
                color={tintColor}
                style={styles.icon}
              />
            </View>
          )}

          {node.isAction && (
            <View style={tw('mr-2')}>
              <Icon name="source-branch" style={styles.nodeIcon} />
            </View>
          )}

          <View style={tw('flex-1')}>{text}</View>

          {node.isPr && (
            <>
              <Text style={tw('text-xs font-light ')}>PR</Text>
              <View style={tw('w-2')} />
            </>
          )}

          {!!node.userAvatarUrl && (
            <Image
              source={{uri: node.userAvatarUrl}}
              style={tw('h-6 w-6 rounded-full mr-2')}
            />
          )}
        </Row>

        {/* Sub nodes */}
        {node.status === `failed` && node.subItems && (
          <View style={tw(`pl-3`)}>
            {node.subItems.map((subItem: ISubNode, index: number, items) => (
              <Row key={`${node.id}-sub-${index}`} vertical="center">
                <View style={tw('items-center mr-5')}>
                  <View
                    style={[
                      tw('h-2'),
                      {width: 1, backgroundColor: TINT_MAPPING[subItem.status]},
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
                      tw('h-2', {'bg-transparent': index === items.length - 1}),
                    ]}
                  />
                </View>

                <Text
                  style={[
                    tw(`text-xs`, {
                      'font-bold': subItem.status === 'failed',
                    }),
                  ]}>
                  {subItem.label}
                  {!!subItem.extraLabel && <Text> · {subItem.extraLabel}</Text>}
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
    height: 32,
    width: 32,
    resizeMode: `contain`,
  },
  icon: {
    marginLeft: global.metrics.ps,
    marginRight: global.metrics.pm,
    fontSize: global.metrics.tl,
  },
  nodeIcon: {
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
