import {StackNavigationProp} from '@react-navigation/stack';
import {Images} from 'Assets';
import {
  EmptyNodesComponent,
  NodeRow,
  Row,
  Spacer,
  TempoButton,
} from 'component';
import {idExtractor, useDarkTheme, useDynamic} from 'lib';
import {observer} from 'mobx-react-lite';
import React from 'react';
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

interface IProps {
  navigation: StackNavigationProp<IRootStackParams, 'Home'>;
}

export let NodeListContainer = observer(({navigation}: IProps) => {
  let root = useStore();
  let isDark = useDarkTheme();
  let dynamic = useDynamic();

  let iconStyle = [
    tw(`${isDark ? `text-white` : ``} text-base`),
    {lineHeight: 16},
  ];

  let goToAddTokenScreen = () => {
    navigation.navigate(`AddToken`);
  };

  const renderNodeItem = ({item}: ListRenderItemInfo<INode>) => {
    return (
      <NodeRow
        node={item}
        onPress={() => {
          root.node.openNode(item.url);
        }}
      />
    );
  };

  return (
    <SafeAreaView style={tw(`flex-1`)}>
      {/* Content */}

      {/* Node List */}
      <View style={tw(`flex-1`)}>
        <Row
          vertical="center"
          style={tw(`px-4 py-2 border-b`, {
            'border-gray-600': isDark,
            'border-gray-200': !isDark,
          })}>
          <TempoButton onPress={() => navigation.navigate(`Configuration`)}>
            <Icon name="settings" style={iconStyle} />
          </TempoButton>
          <View style={tw('w-2')} />
          <TempoButton onPress={root.node.toggleFilterHardSwitch}>
            <Row
              vertical="center"
              style={tw(
                `${!!root.node.complexRegexes.length ? `` : `opacity-50`}`,
              )}>
              <Text
                style={tw(
                  `${dynamic(`text-gray-300`, `text-gray-600`)} font-bold mr-1`,
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
            <Row vertical="center">
              <Text
                style={tw(
                  `${dynamic(`text-gray-300`, `text-gray-600`)} font-bold mr-1`,
                )}>
                Sort by:
              </Text>
              <Text style={tw(isDark ? `text-gray-300` : `text-gray-600`)}>
                {root.node.sortingKey}
              </Text>
            </Row>
          </TempoButton>

          <Spacer />
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
        </Row>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={root.node.sortedFilteredNodes}
          renderItem={renderNodeItem}
          keyExtractor={idExtractor}
          contentContainerStyle={tw(`flex-grow py-2`)}
          ListEmptyComponent={
            <EmptyNodesComponent onAddToken={goToAddTokenScreen} />
          }
        />
      </View>

      {/* Welcome */}
      {!root.node.welcomeShown && (
        <View
          style={tw(
            'absolute top-0 left-0 right-0 bottom-0 justify-center p-6',
            {
              'bg-white': !isDark,
              'bg-gray-900': isDark,
            },
          )}>
          <Image
            source={Images.tempomat}
            style={tw('rounded-full h-20 w-20 mr-4')}
          />

          <View>
            <Text style={tw('py-4 text-3xl font-thin')}>
              Welcome to CI Demon.
            </Text>

            <Text style={tw('py-2 text-left font-light')}>
              Start by generating an access token on your CI, then save it the
              settings. Afterwards, your repositories and CI Jobs will be
              automatically polled.
            </Text>

            <Text style={tw('py-2 text-left font-light')}>
              <Text style={tw('font-semibold')}>Reviewing the app</Text> helps
              me create more tools, same for following me on Twitter.
            </Text>
            <Text style={tw('pt-2 text-xl font-light')}>Thanks a lot!</Text>
          </View>

          <View style={tw('h-12')} />
          <TempoButton
            primary
            title="Continue"
            onPress={() => {
              Linking.openURL('https://twitter.com/ospfranco');
              root.node.dismissWelcome();
            }}></TempoButton>
        </View>
      )}
    </SafeAreaView>
  );
});
