import {StackNavigationProp} from '@react-navigation/stack';
import {Images} from 'Assets';
import {
  EmptyNodesComponent,
  NodeRow,
  Row,
  Spacer,
  TempoButton,
} from 'component';
import {idExtractor, useDarkTheme} from 'lib';
import {observer} from 'mobx-react-lite';
import React from 'react';
import {
  Image,
  Linking,
  ListRenderItemInfo,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useStore} from 'Root.store';
import {IRootStackParams} from 'Route';
import {tw} from 'tailwind';

interface IProps {
  navigation: StackNavigationProp<IRootStackParams, 'Home'>;
}

export let NodeListContainer = observer(({navigation}: IProps) => {
  let root = useStore();
  let isDark = useDarkTheme();

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

  const sectionsObj = root.node.sortedFilteredNodes.reduce(
    (acc: any, node: INode) => {
      if (node.slug) {
        if (acc[node.slug]) {
          acc[node.slug].push(node);
        } else {
          acc[node.slug] = [node];
        }
      } else {
        if (acc['No repository']) {
          acc['No repository'].push(node);
        } else {
          acc['No repository'] = [node];
        }
      }

      return acc;
    },
    {},
  );

  const sections: Array<{title: string; data: INode[]}> = Object.entries(
    sectionsObj,
  ).map(([slug, data]) => ({
    title: slug,
    data,
  })) as any;

  return (
    <View style={tw(`flex-1`)}>
      <View style={tw(`flex-1`)}>
        <Row
          vertical="center"
          style={tw(`px-4 py-2 border-b`, {
            'border-gray-700': isDark,
            'border-gray-400': !isDark,
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
              <Text style={tw(`font-bold mr-1`)}>Filters:</Text>

              <Text>
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
              <Text style={tw(`font-bold mr-1`)}>Sort by:</Text>
              <Text>{root.node.sortingKey}</Text>
            </Row>
          </TempoButton>

          <Spacer />

          <TouchableOpacity
            onPress={root.node.fetchNodes}
            disabled={root.node.fetching}>
            <Icon
              name="refresh"
              style={tw('text-blue-600 text-lg pr-3', {
                'text-gray-500': root.node.fetching,
              })}
            />
          </TouchableOpacity>
        </Row>
        <SectionList
          showsVerticalScrollIndicator={false}
          // showsHorizontalScrollIndicator={false}
          // persistentScrollbar={false}
          sections={sections}
          renderItem={renderNodeItem}
          keyExtractor={idExtractor}
          // automaticallyAdjustContentInsets={false}
          contentContainerStyle={tw(`flex-grow pb-4`)}
          renderSectionHeader={({section: {title}}) => (
            <Text
              style={tw(
                {
                  'bg-gray-900': isDark,
                  'bg-gray-200': !isDark,
                },
                'px-3 py-2 bg-opacity-30 font-semibold',
              )}>
              {title}
            </Text>
          )}
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
            source={Images.logo}
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
    </View>
  );
});
