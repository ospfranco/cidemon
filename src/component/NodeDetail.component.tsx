import {Images} from 'Assets';
import {cidemonNative, TINT_MAPPING, useDarkTheme, useDynamic} from 'lib';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
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
  let [coor, setCoor] = useState<null | {x: number; y: number}>(null);
  let root = useStore();
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
          Double click an item to open it in the browser.
        </Text>
      </View>
    );
  }

  const shareLink = (x: number, y: number) => {
    cidemonNative.showShareMenu(
      x + (coor?.x ?? 0),
      y,
      `Hey, this build:

${node.url}

has ${node.status}, can you take a look? Thanks!

Shared via CI Demon.
`,
    );
  };

  return (
    <ScrollView
      onLayout={(e) => {
        setCoor(e.nativeEvent.layout);
      }}
      style={[tw(` border-l ${borderColor} h-full w-1/3 bg-opacity-50`)]}
      contentContainerStyle={tw(`p-2`)}>
      {!!node && (
        <>
          <View style={tw(`border-b ${borderColor}`)}>
            <Row vertical="center" style={tw(`px-3 py-4`)}>
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
            {!!node.username && (
              <Row style={tw('px-3 mb-2')} vertical="center">
                <Image
                  source={{uri: node.userAvatarUrl}}
                  style={tw(`h-9 w-9 rounded-full`)}
                />
                <Text style={tw('ml-2')}>{node.username}</Text>
              </Row>
            )}
          </View>
          {!!node.subItems?.length && (
            <View style={tw(`pl-5 py-3 border-b ${borderColor}`)}>
              <Text
                style={tw(
                  `mb-2 text-base ${dynamic(`text-gray-400`, `text-gray-500`)}`,
                )}>
                Sub-items
              </Text>
              {node.subItems.map((subItem: ISubNode, index: number) => (
                <TouchableOpacity
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
                </TouchableOpacity>
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
            {node.source !== `Ping` && !!node.jobId && (
              <Row style={rowStyle}>
                <Text style={labelStyle}>Job id</Text>
                <Text style={tw(`flex-1`)}>{node.jobId}</Text>
              </Row>
            )}
            <Pressable onPress={open}>
              <Row style={rowStyle}>
                <Text style={labelStyle}>Build URL</Text>
                <Text style={tw(`flex-1 text-blue-500`)}>{node.url}</Text>
              </Row>
            </Pressable>
            {!!node.date && (
              <Row style={rowStyle}>
                <Text style={labelStyle}>Start Date</Text>
                <Text style={tw(`flex-1`)}>
                  {new Date(node.date!).toLocaleString()}
                </Text>
              </Row>
            )}
            {node.sha && (
              <Row style={rowStyle}>
                <Text style={labelStyle}>Commit SHA</Text>
                <Text style={tw(`flex-1`)} selectable>
                  {node.sha}
                </Text>
              </Row>
            )}
            {node.source !== `Ping` && (
              <Row style={rowStyle}>
                <Text style={labelStyle}>VCS</Text>
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
            title="Share"
            onPressWithPosition={shareLink}
            style={tw(`mx-4 mt-4`)}
          />

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
