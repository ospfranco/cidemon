import {Images} from 'Assets';
import {TINT_MAPPING, useDarkTheme, useDynamic} from 'lib';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useStore} from 'Root.store';
import tw from 'tailwind-rn';
import {Row} from './Row.component';
import {TempoButton} from './TempoButton.component';

let captureBranchRegex = /(.*)(\[.*\])(.*)/;
let rowStyle = tw(`py-1`);
let statusIndicator = {
  width: 10,
  height: 10,
  borderRadius: 5,
  marginRight: 10,
  marginVertical: 7,
};

export function NodeDetail({node}: {node?: INode}) {
  let icon = Images[`${node?.source.toLowerCase()}`];
  let tintColor = TINT_MAPPING[node?.status ?? `pending`];
  let [tokens, setTokens] = useState<null | string[]>(null);
  let root = useStore();
  let isDarkTheme = useDarkTheme();
  let dynamic = useDynamic();

  let labelStyle = tw(
    `w-1/3 text-right mr-2 ${dynamic(`text-gray-400`, `text-gray-500`)}`,
  );
  let borderColor = dynamic(`border-gray-600`, `border-gray-200`);

  useEffect(() => {
    if (node) {
      if (node.source === `Ping`) {
        setTokens(null);
      } else {
        const newTokens = captureBranchRegex.exec(node.label);
        if (newTokens && newTokens.length > 1) {
          setTokens(newTokens);
        }
      }
    }
  }, [node]);

  function open() {
    if (node) {
      Linking.openURL(node.url);
    }
  }

  async function triggerRebuild() {
    try {
      await root.node.triggerRebuild(node!);
    } catch (e) {
      Alert.alert(`Could not trigger rebuild`);
    }
  }

  if (!node) {
    return (
      <View
        style={tw(
          `h-full flex-1 justify-center items-center border-l ${borderColor}`,
        )}>
        <Text style={tw(`text-gray-500 italic p-2 text-center p-4`)}>
          {root.node.repoOpeningsCount % 2 === 0
            ? `Double click an item to quick open it`
            : `Don't forget to recommend CI Demon to your colleagues 🙂`}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[tw(` border-l ${borderColor} h-full w-1/3 bg-opacity-50`)]}
      contentContainerStyle={tw(`p-2`)}>
      {!!node && (
        <>
          <Row
            vertical="center"
            style={tw(`px-3 py-4 border-b ${borderColor}`)}>
            {!!icon && (
              <Image
                source={icon}
                style={[tw(`h-7 w-7`), {tintColor}]}
                resizeMode="contain"
              />
            )}
            {node.source === `Ping` && (
              <Icon name="signal-variant" size={32} color={tintColor} />
            )}
            <View style={tw(`px-4`)}>
              {!tokens && (
                <Text style={tw(`font-semibold text-xl`)}>{node.label}</Text>
              )}
              {!!tokens && (
                <>
                  <Text style={tw(dynamic(`text-gray-400`, `text-gray-500`))}>
                    {tokens[1]}
                  </Text>
                  <Text style={tw(`font-semibold text-lg`)}>
                    {tokens[2].slice(1, tokens[2].length - 1)}
                  </Text>
                </>
              )}
            </View>
          </Row>
          {!!node.subItems?.length && (
            <View style={tw(`pl-5 py-3 border-b ${borderColor}`)}>
              <Text
                style={tw(
                  `mb-2 text-base ${dynamic(`text-gray-400`, `text-gray-500`)}`,
                )}>
                Sub-items
              </Text>
              {node.subItems.map((subItem: ISubNode, index: number) => (
                <TempoButton
                  onPress={() => {
                    if (subItem.url) {
                      Linking.openURL(subItem.url);
                    }
                  }}
                  key={`${node.id}-sub-${index}`}
                  style={tw(`items-start p-0`)}>
                  <Row vertical="center">
                    <View
                      style={[
                        statusIndicator,
                        {backgroundColor: TINT_MAPPING[subItem.status]},
                      ]}
                    />
                    <Text style={tw(dynamic(`text-white`, `text-gray-700`))}>
                      {subItem.label}
                      {!!subItem.extraLabel && (
                        <Text
                          style={tw(
                            `text-xs ${dynamic(`text-white`, `text-gray-700`)}`,
                          )}>
                          {' '}
                          ({subItem.extraLabel})
                        </Text>
                      )}
                    </Text>
                  </Row>
                </TempoButton>
              ))}
            </View>
          )}
          <View style={tw(`py-4 border-b ${borderColor}`)}>
            <Text
              style={tw(
                `mb-2 pl-6 text-base ${dynamic(
                  `text-gray-400`,
                  `text-gray-500`,
                )}`,
              )}>
              Information
            </Text>
            <Row style={rowStyle}>
              <Text style={labelStyle}>Status</Text>
              <Text style={tw(`flex-1 capitalize`)}>{node.status}</Text>
            </Row>
            <Row style={rowStyle}>
              <Text style={labelStyle}>Source</Text>
              <Text style={tw(`flex-1`)}>{node.source ?? `Unknown`}</Text>
            </Row>
            {node.source !== `Ping` && (
              <Row style={rowStyle}>
                <Text style={labelStyle}>Job id</Text>
                <Text style={tw(`flex-1`)}>{node.jobId ?? `Unknown`}</Text>
              </Row>
            )}
            <Pressable onPress={open}>
              <Row style={rowStyle}>
                <Text style={labelStyle}>Build URL</Text>
                <Text style={tw(`flex-1 text-blue-500`)}>{node.url}</Text>
              </Row>
            </Pressable>
            <Row style={rowStyle}>
              <Text style={labelStyle}>Date</Text>
              <Text style={tw(`flex-1`)}>
                {node.date ? new Date(node.date!).toLocaleString() : `Unknown`}
              </Text>
            </Row>
            {node.source !== `Ping` && (
              <Row style={rowStyle}>
                <Text style={labelStyle}>Version Control</Text>
                <Text style={tw(`flex-1`)}>{node.vcs}</Text>
              </Row>
            )}
          </View>

          {!!node.buildUrl && (
            <TempoButton
              title="Rebuild"
              onPress={triggerRebuild}
              style={tw(`mx-4 items-center mt-4`)}
            />
          )}

          <TempoButton
            title="Open"
            onPress={open}
            primary
            style={tw(`mx-4 mt-4`)}
          />
        </>
      )}
    </ScrollView>
  );
}
