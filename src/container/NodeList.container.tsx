import { StackNavigationProp } from '@react-navigation/stack';
import {
  EmptyNodesComponent,

  NodeDetail,
  NodeRow,
  Row,
  Spacer,
  TempoButton
} from 'component';
import { cidemonNative, idExtractor, useDarkTheme, useDynamic } from 'lib';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,

  ListRenderItemInfo,

  SafeAreaView,
  Text,
  TextInput,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useStore } from 'Root.store';
import { IRootStackParams } from 'Route';
import tw from 'tailwind-rn';

interface IProps {
  navigation: StackNavigationProp<IRootStackParams, 'Home'>;
}

export let NodeListContainer = observer(({navigation}: IProps) => {
  let root = useStore();
  let darkTheme = useDarkTheme();
  let dynamic = useDynamic();
  let [selectedNodeId, setSelectedNodeId] = useState<string | null>();

  let iconStyle = tw(`${darkTheme ? `text-white` : ``} text-base mr-1`);

  let goToAddTokenScreen = () => {
    navigation.navigate(`AddToken`);
  }

  const shareLink = (x: number, y: number) => cidemonNative.showShareMenu(x, y, 'Hey! Check out CI Demon, I use it to keep an eye on my builds: https://apps.apple.com/de/app/ci-demon/id1560355863?mt=12')

  function renderNodeItem({item}: ListRenderItemInfo<INode>) {
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
  }

  return (
    <SafeAreaView style={tw(`flex-1`)}>
      {/* Header */}
      <Row
        vertical="center"
        style={tw(`${dynamic(`bg-gray-900`, `bg-gray-100`)} px-3 py-1`)}>
        <TextInput
          value={root.node.searchQuery}
          onChangeText={root.node.setSearchQuery}
          placeholder="Search..."
          style={tw(
            `ml-1 mr-4 p-2 ${dynamic(`bg-gray-700`, `bg-white`)} rounded w-96`,
          )}
          autoFocus
          multiline
          placeholderTextColor={global.colors.gray300}
        />

        <TempoButton onPress={root.node.toggleFilterHardSwitch}>
          <Row
            vertical="center"
            style={tw(
              `px-2 ${!!root.node.complexRegexes.length ? `` : `opacity-50`}`,
            )}>
            <Icon name="filter" style={iconStyle} />
            <Text style={tw(dynamic(`text-gray-300`, `text-gray-600`))}>
              {root.node.filterHardOffSwitch || !root.node.complexRegexes.length
                ? `Off`
                : `On`}
            </Text>
          </Row>
        </TempoButton>

        <TempoButton onPress={root.node.toggleSorting}>
          <Row vertical="center" style={tw(`px-2`)}>
            <Icon name="sort-descending" style={iconStyle} />
            <Text style={tw(darkTheme ? `text-gray-300` : `text-gray-600`)}>
              {root.node.sortingKey}
            </Text>
          </Row>
        </TempoButton>

        <TempoButton onPress={() => navigation.navigate(`Configuration`)}>
          <Icon name="settings" style={iconStyle} />
        </TempoButton>

        {root.node.fetching ? (
          <View style={tw(`ml-4`)}>
            <ActivityIndicator />
          </View>
        ) : (
          <TempoButton onPress={root.node.fetchNodes}>
            <Icon name="refresh" style={iconStyle} />
          </TempoButton>
        )}
        <Spacer />
        <TempoButton onPressWithPosition={shareLink}>
          <Icon name="account-multiple-plus" style={iconStyle} />
        </TempoButton>
        {/* <TempoButton onPress={showUpdates}>
          <Icon name="gift" style={iconStyle} />
        </TempoButton> */}
      </Row>

      {/* Content */}
      <Row style={tw(`flex-1 w-full ${dynamic(`bg-gray-800`, `bg-white`)} `)}>
        {/* Node List */}
        <View style={tw(`w-2/3`)}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={root.node.sortedFilteredNodes}
            renderItem={renderNodeItem}
            keyExtractor={idExtractor}
            contentContainerStyle={tw(`p-2 flex-grow`)}
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

      {/* <GiftModal visible={updatesVisible} onRequestClose={hideUpdates} /> */}
    </SafeAreaView>
  );
});
