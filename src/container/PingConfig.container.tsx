import {PingCardComponent, Row, TempoButton} from 'component';
import {idExtractor, useDynamic} from 'lib';
import {observer} from 'mobx-react-lite';
import {PingTest} from 'model';
import React, {useState} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useStore} from 'Root.store';
import {tw} from 'tailwind';

function EmptyPingTests() {
  return (
    <View style={tw(`items-center justify-center flex-1 p-10`)}>
      <Text style={tw(`text-center text-gray-400`)}>No ping tests</Text>
    </View>
  );
}

export let PingConfigContainer = observer(() => {
  let root = useStore();
  let dynamic = useDynamic();
  let [pingTest, setSelectedPing] = useState<PingTest | null>(null);

  function renderPingItem({item}: ListRenderItemInfo<PingTest>) {
    return (
      <TouchableOpacity onPress={() => setSelectedPing(item)}>
        <View
          style={tw(
            `rounded p-2 ${
              pingTest === item ? `bg-blue-400 bg-opacity-50` : ``
            }`,
          )}>
          <Text>{item.name || 'No name'}</Text>
          <Text
            style={tw(`text-xs ${dynamic(`text-gray-300`, `text-gray-500`)}`)}>
            {item.url || 'No url'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <Row style={tw(`flex-1 ${dynamic(`bg-gray-700`, `bg-white`)}`)}>
      <View style={tw(`w-96 p-4`)}>
        <FlatList
          style={tw(
            `flex-1 ${dynamic(`bg-gray-800`, `bg-gray-100`)} rounded-lg`,
          )}
          contentContainerStyle={tw(`flex-grow p-2`)}
          data={root.node.pingTests.slice()}
          renderItem={renderPingItem}
          keyExtractor={idExtractor}
          ListEmptyComponent={EmptyPingTests}
        />

        <TempoButton
          title="New health check"
          onPress={() => {
            let test = root.node.addPingTest();
            setSelectedPing(test);
          }}
          primary
          style={tw(`mt-4`)}
        />
      </View>
      <View style={tw(`flex-1 p-4 h-full`)}>
        {!pingTest && (
          <View style={tw(`flex-1 justify-center items-center`)}>
            <Text style={tw(`text-gray-400`)}>Select a ping test</Text>
          </View>
        )}
        {!!pingTest && <PingCardComponent pingTest={pingTest} />}
      </View>
    </Row>
  );
});
