import React, { useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  ViewStyle,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { observer } from "mobx-react-lite";
import { PingTest } from "model";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useStore } from "Root.store";
import { Row } from "./Row.component";
import { Spacer } from "./Spacer.component";
import { TempoButton } from "./TempoButton.component";
import tw from "tailwind-rn";
import { useDynamic } from "lib";
import { Divider } from "./Divider.component";

interface IProps {
  pingTest: PingTest;
  style?: ViewStyle;
}

export const PingCardComponent = observer<IProps>(({ pingTest, style }) => {
  let root = useStore();
  let dynamic = useDynamic();
  let [status, setStatus] = useState<boolean | undefined>(undefined);
  
  // Refs
  let urlField = useRef<TextInput>(null)
  let statusField = useRef<TextInput>(null)
  let bodyField = useRef<TextInput>(null)

  let inputStyle = tw(`${dynamic(`bg-gray-900`, `bg-gray-100`)} flex-1 p-2`);
  let labelStyle = tw(`w-24 text-right mr-2`)

  async function runTest() {
    let testResult = await pingTest.run();
    setStatus(testResult);
  }

  return (
    <ScrollView
      style={[tw(`${dynamic(`bg-gray-800`, `bg-white`)} rounded-lg`), style]}
      contentContainerStyle={tw(`p-4`)}>
      <Text style={tw(`font-bold mb-4`)}>Outgoing Request</Text>
      <Row vertical="center" style={styles.item}>
        <Text style={labelStyle}>Name</Text>
        <TextInput
          style={inputStyle}
          value={pingTest.name}
          onChangeText={pingTest.setName}
          placeholder="My site health check"
          onSubmitEditing={() => urlField.current?.focus()}
          autoFocus
        />
      </Row>

      <Row vertical="center" style={styles.item}>
        <Text style={labelStyle}>Url</Text>
        <TextInput
          style={inputStyle}
          value={pingTest.url}
          onChangeText={pingTest.setUrl}
          placeholder="https://yoursite.com/api/ping"
          ref={urlField}
          onSubmitEditing={() => statusField.current?.focus()}
        />
      </Row>

      <Row vertical="center" style={styles.item}>
        <Text style={labelStyle}>Method</Text>
        <Picker
          selectedValue={pingTest.method}
          style={styles.picker}
          onValueChange={pingTest.setMethod as any}
        >
          <Picker.Item label="POST" value="POST" />
          <Picker.Item label="GET" value="GET" />
          <Picker.Item label="DELETE" value="DELETE" />
          <Picker.Item label="PUT" value="PUT" />
        </Picker>
      </Row>

      <Divider style={tw(`my-4`)} />

      <Text style={tw(`font-bold mb-4`)}>Expected Response</Text>

      <Row style={styles.item} vertical="center">
        <Text style={labelStyle}>Status</Text>
        <TextInput
          style={inputStyle}
          value={pingTest.expectedStatus?.toString()}
          onChangeText={(v) => {
            let integer = parseInt(v.length ? v : `0`, 10);
            if(!isNaN(integer)) {
              pingTest.setExpectedStatus(integer);
            }
          }}
          placeholder="200"
          ref={statusField}
          keyboardType="numeric"
          onSubmitEditing={() => bodyField.current?.focus()}
        />
      </Row>

      <Row style={styles.item} vertical="center">
        <Text style={labelStyle}>Body</Text>
        <TextInput
          style={[inputStyle, tw(`h-32`)]}
          value={pingTest.expectedResponse ?? ``}
          onChangeText={pingTest.setExpectedResponse}
          placeholder={`{"ok": "true"}`}
          ref={bodyField}
        />
      </Row>

      <Divider style={tw(`my-4`)} />

      <Row vertical="center" style={tw(`mt-4`)}>
        <Spacer />
        <TempoButton onPress={() => root.node.removePingTest(pingTest)} style={tw(`mr-6`)}>
          <Icon name="delete" size={20} style={tw(`text-red-500`)} />
        </TempoButton>
        {status && (
          <Icon name="check-circle" size={20} color={global.colors.green500} />
        )}
        {status === false && (
          <Icon name="close-box" size={20} color={global.colors.red500} />
        )}
        <TempoButton
          title="Test"
          onPress={runTest}
          primary
          style={tw(`w-32`)}
        />
      </Row>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  item: {
    marginVertical: global.metrics.ps,
  },
  input: {
    flex: 1,
    borderRadius: 10,
    padding: global.metrics.ps,
    // @ts-ignore
    backgroundColor: {
      dynamic: {
        light: global.colors.gray050,
        dark: global.colors.gray1000,
      },
    },
  },
  rightItems: {
    padding: global.metrics.pm,
    alignItems: `center`,
  },
  picker: { height: 24, width: 100 },
  leftContainer: {
    flex: 1,
  },
});
