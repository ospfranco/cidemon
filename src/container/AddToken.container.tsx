import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Row, Spacer, Divider, TempoButton} from 'component';
import {observer} from 'mobx-react-lite';
import {useStore} from 'Root.store';
import {IRootStackParams} from 'Route';
import {tw} from 'tailwind';
import {useDarkTheme, useDynamic} from 'lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface IProps {
  navigation: StackNavigationProp<IRootStackParams, 'AddToken'>;
}

const sources: Source[] = [
  `AppCenter`,
  `Bitrise`,
  `CircleCI`,
  `Gitlab`,
  `TravisCI`,
];

export const AddTokenContainer = observer(({navigation}: IProps) => {
  let root = useStore();
  let [source, setSource] = useState<Source>(`CircleCI`);
  let [name, setName] = useState(``);
  let [key, setKey] = useState(``);
  let secondField = useRef<TextInput>();
  let dynamic = useDynamic();
  let isDark = useDarkTheme();

  let inputFieldStyle = tw(`p-3 ${dynamic(`bg-gray-900`, `bg-gray-100`)}`);

  function addToken() {
    if (!name) {
      root.ui.addToast({
        text: 'Please add a name',
        type: 'error',
      });
      return;
    }

    if (!key) {
      root.ui.addToast({
        text: 'Please add a key',
        type: 'error',
      });
      return;
    }

    root.node.addToken(source, name, key);
    navigation.goBack();
  }

  return (
    <View style={tw(`flex-1 bg-transparent`)}>
      <View style={tw(`w-full px-6`)}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={tw(`mt-6 font-bold text-2xl`)}>← Add Token</Text>
        </TouchableOpacity>
        <Text style={tw(`py-3 text-xs font-light`)}>TOKEN NAME</Text>
        <TextInput
          placeholder="John Appleseed's token"
          //@ts-ignore
          placeholderTextColor={{
            dynamic: {
              dark: global.colors.gray400,
              light: global.colors.gray500,
            },
          }}
          style={tw(
            {
              'bg-white': !isDark,
              'bg-gray-900': isDark,
            },
            `w-full px-3 py-2 bg-opacity-70 rounded-lg`,
          )}
          value={name}
          onChangeText={setName}
          returnKeyType="next"
          onSubmitEditing={() => secondField.current?.focus()}
          blurOnSubmit={false}
        />

        <Text style={tw(`py-3 text-xs font-light`)}>CI PROVIDER</Text>

        <View
          style={tw(
            {
              'bg-white': !isDark,
              'bg-gray-900': isDark,
            },
            'rounded-lg bg-opacity-70',
          )}>
          {sources.map((item, ii) => {
            return (
              <View key={item}>
                <TouchableOpacity onPress={() => setSource(item)}>
                  <View
                    style={[tw(`p-3 ${item === source ? `bg-blue-500` : ``}`)]}>
                    <Row vertical="center">
                      <Text
                        style={tw(`${item === source ? `text-white` : ``}`)}>
                        {item}
                      </Text>
                      <Spacer />
                      {item === source && (
                        <Icon name="check" color="white" size={18} />
                      )}
                    </Row>
                  </View>
                </TouchableOpacity>
                {ii !== sources.length - 1 && <Divider />}
              </View>
            );
          })}
        </View>

        <Text style={tw(`py-3 text-xs font-light`)}>KEY</Text>
        {/* @ts-ignore */}
        <TextInput
          style={tw(
            {
              'bg-white': !isDark,
              'bg-gray-900': isDark,
            },
            `w-full px-3 py-2 bg-opacity-70 rounded-lg h-32`,
          )}
          placeholderTextColor={{
            dynamic: {
              dark: global.colors.gray400,
              light: global.colors.gray500,
            },
          }}
          placeholder="xxxxxxxxxxx-xxxxxxxxxxxxxxxxx-xxxxxxxxxxxx"
          value={key}
          onChangeText={setKey}
          // @ts-ignore
          ref={secondField}
          returnKeyType="done"
          onSubmitEditing={addToken}
        />

        <TempoButton
          title="Done"
          onPress={addToken}
          primary
          style={tw(`m-3 self-center w-64`)}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  macOSSwitch: {
    height: 15,
    width: 15,
  },
});
