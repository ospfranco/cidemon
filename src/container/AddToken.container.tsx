import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Row, Spacer, Divider, TempoButton } from "component";
import { observer } from "mobx-react-lite";
import { useStore } from "Root.store";
import { IRootStackParams } from "Route";
import tw from "tailwind-rn";
import { useDynamic } from "lib";

interface IProps {
  navigation: StackNavigationProp<IRootStackParams, "AddToken">;
}

const sources: Source[] = [
  `AppCenter`,
  `Bitrise`,
  `CircleCI`,
  `Gitlab`,
  `TravisCI`,
];

export const AddTokenContainer = observer(({ navigation }: IProps) => {
  let root = useStore();
  let [source, setSource] = useState<Source>(`CircleCI`);
  let [name, setName] = useState(``);
  let [key, setKey] = useState(``);
  let secondField = useRef<TextInput>();
  let dynamic = useDynamic();

  let inputFieldStyle = tw(`p-3 ${dynamic(`bg-gray-900`, `bg-gray-100`)}`);

  function addToken() {
    if(!name) {
      root.ui.addToast({
        text: "Please add a name",
        type: "error"
      })
      return
    }
    
    if(!key) {
      root.ui.addToast({
        text: "Please add a key",
        type: "error"
      })
      return
    }

    root.node.addToken(source, name, key);
    navigation.goBack();
  }

  return (
    <ScrollView 
      style={tw(`flex-1 ${dynamic(`bg-gray-700`, `bg-white`)}`)}
      contentContainerStyle={tw(`items-center`)}
    >
      <View style={tw(`w-96`)}>

        <Text style={tw(`py-3 font-bold`)}>Name</Text>
        <TextInput
          style={inputFieldStyle}
          placeholder="John Appleseed's token"
          //@ts-ignore
          placeholderTextColor={{
            dynamic: {
              dark: global.colors.gray400,
              light: global.colors.gray500,
            },
          }}
          value={name}
          onChangeText={setName}
          returnKeyType="next"
          onSubmitEditing={() => secondField.current?.focus()}
          blurOnSubmit={false}
        />

        <Text style={tw(`p-3 font-bold`)}>CI Provider</Text>

        {sources.map((item, ii) => {
          return (
            <View key={item}>
              <TouchableOpacity onPress={() => setSource(item)}>
                <View
                  style={[
                    inputFieldStyle,
                    tw(`p-3 rounded-lg ${item === source ? `bg-blue-500` : ``}`),
                  ]}>
                  <Row vertical="center">
                    <Text style={tw(`${item === source ? `text-white` : ``}`)}>{item}</Text>
                    <Spacer />
                    <Switch
                      value={item === source}
                      style={global.isMacOS ? styles.macOSSwitch : undefined}
                    />
                  </Row>
                </View>
              </TouchableOpacity>
              {ii !== sources.length - 1 && <Divider />}
            </View>
          );
        })}

        <Text style={tw(`p-3 font-bold`)}>Key or token</Text>

        {/* @ts-ignore */}
        <TextInput
          style={[inputFieldStyle, tw(`h-32`)]}
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
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  macOSSwitch: {
    height: 15,
    width: 15,
  },
});
