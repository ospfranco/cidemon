import React, {useState, useRef, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {StackNavigationProp} from '@react-navigation/stack';
import {Row, Spacer, Divider, TempoButton} from 'component';
import {observer} from 'mobx-react-lite';
import {useStore} from 'Root.store';
import {IRootStackParams} from 'Route';
import {tw} from 'tailwind';
import {useDarkTheme, useDynamic, REGEX_VALID_URL} from 'lib';
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
  let [baseURL, setBaseURL] = useState(`https://gitlab.com`);
  let [visibility, setVisibility] = useState<GitlabVisibility>(`private`);
  let secondField = useRef<TextInput>();
  let thirdField = useRef<TextInput>();
  let dynamic = useDynamic();
  let isDark = useDarkTheme();

  let isGitlab = useMemo(() => {
    if(source === 'Gitlab'){
      return true;
    }
    return false;
  }, [source]);

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

    if (isGitlab) {
      if(!(baseURL && REGEX_VALID_URL.test(baseURL))){
        root.ui.addToast({
          text: 'Please add a valid base URL',
          type: 'error',
        });
        return;
      }

      root.node.addToken(source, name, key, baseURL, visibility);
    } else {
      root.node.addToken(source, name, key);
    }

    navigation.goBack();
  }

  return (
    <ScrollView style={tw(`flex-1 bg-transparent`)}>
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
          onSubmitEditing={() => isGitlab ? secondField.current?.focus() : thirdField.current?.focus()}
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
        {isGitlab ? (
          <>
            <Text style={tw(`py-3 text-xs font-light`)}>HOST DOMAIN</Text>

            <Text style={tw(`pb-3 text-xs`)}>
            {`You can replace https://gitlab.com below with your own instance domain if you are using a self-managed Gitlab instance.`}
            </Text>

            <TextInput
              style={tw(
                {
                  'bg-white': !isDark,
                  'bg-gray-900': isDark,
                },
                `w-full px-3 py-2 bg-opacity-70 rounded-lg`,
              )}
              placeholder="https://gitlab.com"
              value={baseURL}
              onChangeText={setBaseURL}
              //@ts-ignore
              ref={secondField}
              returnKeyType="next"
              onSubmitEditing={() => thirdField.current?.focus()}
            />

            <Text style={tw(`py-3 text-xs font-light`)}>VISIBILITY</Text>
            <View
              style={tw(
                {
                  'bg-white': !isDark,
                  'bg-gray-900': isDark,
                },
                'rounded-lg bg-opacity-70',
              )}>
              <View>
                <Row style={tw(`px-4 py-2`)} vertical="center">
                  <Text>Project visibility of repositories to observe</Text>
                  <Spacer />
                  <Picker
                    selectedValue={visibility}
                    style={tw(`h-6 w-48 p-0`)}
                    onValueChange={setVisibility}>
                    <Picker.Item label="Private" value="private" />
                    <Picker.Item label="Internal" value="internal" />
                    <Picker.Item label="Public" value="public" />
                    <Picker.Item label="All" value={null} />
                  </Picker>
                </Row>
              </View>
            </View>
          </>
        ) : null}
        <Text style={tw(`py-3 text-xs font-light`)}>KEY</Text>
        {/* @ts-ignore */}
        <TextInput
          style={tw(
            {
              'bg-white': !isDark,
              'bg-gray-900': isDark,
            },
            `px-3 py-2 bg-opacity-70 rounded-lg`,
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
          ref={thirdField}
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
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  macOSSwitch: {
    height: 15,
    width: 15,
  },
});
