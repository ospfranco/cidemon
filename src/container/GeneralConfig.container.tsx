import React from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
  Linking,
} from 'react-native';
import {observer} from 'mobx-react-lite';
import {useStore} from 'Root.store';
import {Row, Spacer, Divider, TempoButton} from 'component';
import {Images} from 'Assets';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome5';
import FoIcon from 'react-native-vector-icons/FontAwesome';
import {StackNavigationProp} from '@react-navigation/stack';
import {cidemonNative, useDynamic} from 'lib';
import {tw} from 'tailwind';
import {IRootStackParams} from 'Route';
import {Picker} from '@react-native-picker/picker';

interface IProps {
  navigation: StackNavigationProp<IRootStackParams, 'Configuration'>;
}

export let GeneralConfigContainer = observer(({navigation}: IProps) => {
  let root = useStore();
  let {tokens} = root.node;
  let dynamic = useDynamic();

  let settingsRowStyle = tw(`${dynamic(`bg-gray-800`, `bg-gray-100`)}`);

  return (
    <ScrollView
      style={tw(`flex-1 ${dynamic(`bg-gray-900`, `bg-white`)}`)}
      contentContainerStyle={tw(`items-center`)}>
      <View style={tw(`w-96`)}>
        <Text style={tw(`py-3 mt-2 font-bold`)}>Tokens</Text>

        {!tokens.length && (
          <View style={styles.noTokensView}>
            <Text style={{color: global.colors.gray400}}>
              No tokens have been saved
            </Text>
          </View>
        )}

        <View>
          <Divider />
          {tokens.map((t, idx) => {
            return (
              <Row
                style={tw(`pb-1 pl-4`)}
                key={`token-${idx}`}
                vertical="center">
                <Image
                  source={Images[`${t.source.toLowerCase()}`]}
                  // @ts-ignore
                  style={{
                    height: global.metrics.imgSmall,
                    width: global.metrics.imgSmall,
                    resizeMode: `contain`,
                    marginRight: global.metrics.pm,
                    tintColor: {
                      dynamic: {
                        light: `#37474F`,
                        dark: `white`,
                      },
                    },
                  }}
                />
                <Text>{t.name}</Text>
                <Spacer />
                <View
                  style={tw(
                    `${dynamic(`bg-gray-800`, `bg-gray-100`)} p-2 rounded`,
                  )}>
                  <Icon
                    name="delete"
                    size={20}
                    onPress={() => root.node.removeTokenByName(t.name)}
                  />
                </View>
              </Row>
            );
          })}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate(`AddToken`)}>
          <View style={settingsRowStyle}>
            <Row style={styles.settingsRowInternal} vertical="center">
              <Text>Create new token</Text>
              <Spacer />
              <FoIcon
                name="chevron-right"
                size={14}
                color={global.colors.gray200}
              />
            </Row>
          </View>
        </TouchableOpacity>

        <Text style={tw(`py-3 mt-2 font-bold`)}>General</Text>

        {global.isMacOS && (
          <View style={settingsRowStyle}>
            <Row style={tw(`px-4 py-2`)} vertical="center">
              <Text>Polling Interval</Text>
              <Spacer />
              <Text style={tw(`text-gray-500`)}>minutes</Text>
              <Picker
                selectedValue={root.node.fetchInterval}
                style={tw(`h-6 w-12 p-0`)}
                onValueChange={(v) => root.node.setFetchInterval(v as any)}>
                <Picker.Item label="1" value={1} />
                <Picker.Item label="2" value={2} />
                <Picker.Item label="3" value={3} />
                <Picker.Item label="5" value={5} />
              </Picker>
            </Row>
            <Divider />
          </View>
        )}

        <View style={settingsRowStyle}>
          <Row style={styles.settingsRowInternal} vertical="center">
            <Text>
              <Text style={tw(`text-red-500`)}>Failing</Text> builds
              notifications
            </Text>
            <Spacer />
            <Switch
              value={root.node.notificationsEnabled}
              onValueChange={root.node.setNotificationsEnabled}
              style={styles.switch}
            />
          </Row>
          {global.isMacOS && <Divider />}
        </View>

        <View style={settingsRowStyle}>
          <Row style={styles.settingsRowInternal} vertical="center">
            <Text>
              <Text style={tw(`text-green-500`)}>Passing</Text> builds
              notifications
            </Text>
            <Spacer />
            <Switch
              value={root.node.passingNotificationsEnabled}
              onValueChange={root.node.setPassingNotificationsEnabled}
              style={styles.switch}
            />
          </Row>
          {global.isMacOS && <Divider />}
        </View>

        <View style={settingsRowStyle}>
          <Row style={styles.settingsRowInternal} vertical="center">
            <Text>Show build numbers</Text>
            <Spacer />
            <Switch
              value={root.node.showBuildNumber}
              onValueChange={root.node.toggleShowBuildNumber}
              style={styles.switch}
            />
          </Row>
          {global.isMacOS && <Divider />}
        </View>

        <View style={settingsRowStyle}>
          <Row style={styles.settingsRowInternal} vertical="center">
            <Text>Two row item names</Text>
            <Spacer />
            <Switch
              value={root.node.doubleRowItems}
              onValueChange={root.node.toggleDoubleRowItems}
              style={styles.switch}
            />
          </Row>
          {global.isMacOS && <Divider />}
        </View>

        <View style={settingsRowStyle}>
          <Row style={styles.settingsRowInternal} vertical="center">
            <Text>Simple status bar icon</Text>
            <Spacer />
            <Switch
              value={root.node.useSimpleIcon}
              onValueChange={root.node.toggleUseSimpleIcon}
              style={styles.switch}
            />
          </Row>
          <Divider />
        </View>

        <View style={settingsRowStyle}>
          <Row style={styles.settingsRowInternal} vertical="center">
            <Text>Launch on login</Text>
            <Spacer />
            <Switch
              value={root.node.startAtLogin}
              onValueChange={root.node.setStartAtLogin}
              style={styles.switch}
            />
          </Row>
        </View>
        <Divider />
        <TouchableOpacity onPress={root.node.openIssueRepo}>
          <View style={settingsRowStyle}>
            <Row style={styles.settingsRowInternal} vertical="center">
              <Text>Report an issue</Text>
              <Spacer />
              <FoIcon
                name="chevron-right"
                size={14}
                color={global.colors.gray200}
              />
            </Row>
          </View>
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity onPress={root.node.closeApp}>
          <View style={settingsRowStyle}>
            <Row style={styles.settingsRowInternal} vertical="center">
              <Text>Quit</Text>
              <Spacer />
              <FoIcon
                name="chevron-right"
                size={14}
                color={global.colors.gray200}
              />
            </Row>
          </View>
        </TouchableOpacity>

        {__DEV__ && (
          <View style={tw(`p-4 rounded-lg border border-red-500 mb-8`)}>
            <Text style={tw(`font-bold`)}>DEBUG BUILD COMMANDS</Text>
            <TempoButton
              title="Notification"
              onPress={() => {
                cidemonNative.sendNotification(`Test`, `Payload`, `URL`);
              }}
            />
            <TempoButton
              title="Success toast"
              onPress={() => {
                root.ui.addToast({
                  text: `test notification`,
                  type: 'success',
                });
              }}
            />
            <TempoButton
              title="Fail toast"
              onPress={() => {
                root.ui.addToast({
                  text: `test fail`,
                  type: 'error',
                });
              }}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  noTokensView: {
    padding: global.metrics.pl,
    alignItems: `center`,
  },
  buttonContainer: {
    justifyContent: `space-around`,
    paddingVertical: 40,
  },
  switch: {
    height: 15,
    width: 15,
  },
  settingsRowInternal: {
    paddingVertical: global.metrics.pxm,
    paddingHorizontal: global.metrics.pl,
  },
});
