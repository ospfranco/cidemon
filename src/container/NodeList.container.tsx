import {Assets, StackNavigationProp} from '@react-navigation/stack';
import {
  EmptyNodesComponent,
  NodeDetail,
  NodeRow,
  Row,
  Spacer,
  TempoButton,
} from 'component';
import {cidemonNative, idExtractor, useDarkTheme, useDynamic} from 'lib';
import {observer} from 'mobx-react-lite';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  ListRenderItemInfo,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useStore} from 'Root.store';
import {IRootStackParams} from 'Route';
import {tw} from 'tailwind';
import {getColor} from 'tailwind-rn';
import {Images} from 'Assets';

interface IProps {
  navigation: StackNavigationProp<IRootStackParams, 'Home'>;
}

export let NodeListContainer = observer(({navigation}: IProps) => {
  let root = useStore();
  let darkTheme = useDarkTheme();
  let dynamic = useDynamic();
  let [selectedNodeId, setSelectedNodeId] = useState<string | null>();

  let iconStyle = [
    tw(`${darkTheme ? `text-white` : ``} text-base`),
    {lineHeight: 16},
  ];

  let goToAddTokenScreen = () => {
    navigation.navigate(`AddToken`);
  };

  const shareLink = (x: number, y: number) =>
    cidemonNative.showShareMenu(
      x,
      y,
      'Hey! Check out CI Demon, I use it to keep an eye on my builds: https://apps.apple.com/de/app/ci-demon/id1560355863?mt=12',
    );

  const renderNodeItem = ({item}: ListRenderItemInfo<INode>) => {
    let isSelected = selectedNodeId === item.id;
    return (
      <NodeRow
        node={item}
        onPress={() => {
          if (isSelected) {
            root.node.openNode(item.url);
          } else {
            setSelectedNodeId(item.id);
          }
        }}
        selected={isSelected}
      />
    );
  };

  return (
    <SafeAreaView style={tw(`flex-1`)}>
      {/* Content */}
      <Row style={tw(`flex-1 w-full ${dynamic(`bg-gray-800`, `bg-white`)} `)}>
        {/* Node List */}
        <View style={tw(`w-2/3`)}>
          <Row
            vertical="center"
            style={tw(`px-4 py-3 ${dynamic(`bg-gray-400`, `bg-white`)}`)}>
            {root.node.fetching ? (
              <TempoButton onPress={root.node.fetchNodes} primary>
                <ActivityIndicator size={16} color="white" />
              </TempoButton>
            ) : (
              <TempoButton onPress={root.node.fetchNodes} primary>
                <Icon
                  name="refresh"
                  style={iconStyle}
                  color={getColor('gray-100')}
                />
              </TempoButton>
            )}

            <View style={tw('w-2')} />
            <TempoButton onPress={root.node.toggleFilterHardSwitch}>
              <Row
                vertical="center"
                style={tw(
                  `px-2 ${
                    !!root.node.complexRegexes.length ? `` : `opacity-50`
                  }`,
                )}>
                <Text
                  style={tw(
                    `${dynamic(
                      `text-gray-300`,
                      `text-gray-600`,
                    )} font-bold mr-1`,
                  )}>
                  Filters:
                </Text>

                <Text style={tw(dynamic(`text-gray-300`, `text-gray-600`))}>
                  {root.node.filterHardOffSwitch ||
                  !root.node.complexRegexes.length
                    ? `Off`
                    : `On`}
                </Text>
              </Row>
            </TempoButton>
            <View style={tw('w-2')} />

            <TempoButton onPress={root.node.toggleSorting}>
              <Row vertical="center" style={tw(`px-2`)}>
                <Text
                  style={tw(
                    `${dynamic(
                      `text-gray-300`,
                      `text-gray-600`,
                    )} font-bold mr-1`,
                  )}>
                  Sort by:
                </Text>
                <Text style={tw(darkTheme ? `text-gray-300` : `text-gray-600`)}>
                  {root.node.sortingKey}
                </Text>
              </Row>
            </TempoButton>

            <Spacer />
            <TempoButton onPress={() => navigation.navigate(`Configuration`)}>
              <Icon name="settings" style={iconStyle} />
            </TempoButton>
          </Row>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={root.node.sortedFilteredNodes}
            renderItem={renderNodeItem}
            keyExtractor={idExtractor}
            contentContainerStyle={tw(`flex-grow`)}
            ListEmptyComponent={
              <EmptyNodesComponent onAddToken={goToAddTokenScreen} />
            }
          />
        </View>

        {/* Right hand detail */}
        <NodeDetail
          node={root.node.sortedFilteredNodes.find(
            (n) => n.id === selectedNodeId,
          )}
        />
      </Row>

      {/* Welcome */}
      {!root.node.welcomeShown && (
        <View
          style={tw(
            'absolute top-0 left-0 right-0 bottom-0 bg-white items-center justify-center',
          )}>
          <Text style={tw('text-2xl')}>Hi! I'm Oscar!</Text>
          <Image
            source={Images.profile}
            style={tw('rounded-full h-32 w-32 my-4')}
          />
          <Text style={tw('py-2')}>
            First of all thank you for trying out CI Demon!
          </Text>
          <Text style={tw('py-2')}>
            It's the result of many months and a lot of hard work and I'm giving
            it away for free.
          </Text>
          <Text style={tw('py-2')}>
            All I ask is that you follow me on Twitter and share it with your
            friends!
          </Text>
          <Text style={tw('pt-10')}>Thanks a lot!</Text>

          <View style={tw('h-12')} />
          <TempoButton
            primary
            title="Sure thing buddy!"
            onPress={() => {
              Linking.openURL('https://twitter.com/ospfranco');
              root.node.dismissWelcome();
            }}></TempoButton>
        </View>
      )}
    </SafeAreaView>
  );
});
