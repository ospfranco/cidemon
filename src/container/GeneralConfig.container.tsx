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
import pkg from '../../package.json';
import tw from 'tailwind-rn';
import {IRootStackParams} from 'Route';
import {Picker} from '@react-native-picker/picker';
import {Link} from '@react-navigation/native';

interface IProps {
  navigation: StackNavigationProp<IRootStackParams, 'Configuration'>;
}

export let GeneralConfigContainer = observer(({navigation}: IProps) => {
  let root = useStore();
  let {tokens} = root.node;
  let dynamic = useDynamic();

  let settingsRowStyle = tw(
    `rounded-lg ${dynamic(`bg-gray-800`, `bg-gray-100`)}`,
  );

  function openTwitter() {
    Linking.openURL(`https://twitter.com/tempomat_app`);
  }

  function openMail() {
    Linking.openURL(
      `mailto:ospfranco@protonmail.com?subject=CI Demon%20Support%20Request`,
    );
  }

  return (
    <ScrollView
      style={tw(`flex-1 ${dynamic(`bg-gray-700`, `bg-white`)}`)}
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
              <Picker
                selectedValue={root.node.fetchInterval}
                style={tw(`h-6 w-14 p-0`)}
                onValueChange={(v) => root.node.setFetchInterval(v as any)}>
                <Picker.Item label="1" value={1} />
                <Picker.Item label="2" value={2} />
                <Picker.Item label="3" value={3} />
                <Picker.Item label="5" value={5} />
              </Picker>
              <Text style={tw(`text-gray-500`)}>Mins.</Text>
            </Row>
            <Divider />
          </View>
        )}

        <View style={settingsRowStyle}>
          <Row style={styles.settingsRowInternal} vertical="center">
            <Text>
              Notify on <Text style={tw(`text-red-500`)}>failing</Text> builds
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
              Notify on <Text style={tw(`text-green-500`)}>passing</Text> builds
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
            <Text>Show items in two rows</Text>
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

        <Row vertical="center" horizontal="center" style={tw(`mt-8`)}>
          {/* <Image source={Images.profile} style={tw(`h-20 w-20 rounded-full`)} /> */}
          <View style={tw(`ml-3 items-center`)}>
            <Text>
              Created by <Text style={tw(`font-bold`)}>Oscar Franco</Text>
            </Text>
            <Row style={tw(`mt-2`)}>
              <TempoButton
                onPress={() =>
                  Linking.openURL(`https://twitter.com/ospfranco`)
                }>
                <FontAwesomeIcon
                  name="twitter"
                  size={30}
                  style={tw(`text-blue-400`)}
                />
              </TempoButton>
              <TempoButton
                onPress={() => Linking.openURL(`https://github.com/ospfranco`)}>
                <FontAwesomeIcon name="github" size={30} />
              </TempoButton>
              <TempoButton
                onPress={() => Linking.openURL(`https://ospfranco.github.io`)}>
                <FontAwesomeIcon
                  name="paper-plane"
                  size={30}
                  style={tw(`text-blue-400`)}
                />
              </TempoButton>
            </Row>
            <Text>If you have any trouble whatsoever just contact me!</Text>
          </View>
        </Row>

        {/* <Row vertical="center" horizontal="center" style={tw(`mt-8`)}>
          <Image source={Images.tempomat} style={tw(`h-20 w-20`)} />
          <View style={tw(`ml-3`)}>
            <Text>
              Follow Tempomat
            </Text>
            <Row style={tw(`mt-2`)}>
              <TempoButton
                onPress={() =>
                  Linking.openURL(`https://twitter.com/tempomat_app`)
                }>
                <FontAwesomeIcon
                  name="twitter"
                  size={30}
                  style={tw(`text-blue-400`)}
                />
              </TempoButton>
              <TempoButton
                onPress={() => Linking.openURL(`https://github.com/ospfranco/tempomat`)}>
                <FontAwesomeIcon name="github" size={30} />
              </TempoButton>
              <TempoButton
                onPress={() => Linking.openURL(`https://tempomat.dev`)}>
                <FontAwesomeIcon
                  name="window-maximize"
                  size={30}
                  style={tw(`text-green-400`)}
                />
              </TempoButton>
            </Row>
          </View>
        </Row> */}

        <Text style={tw(`self-center p-4 font-bold`)}>v{pkg.version}</Text>

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
