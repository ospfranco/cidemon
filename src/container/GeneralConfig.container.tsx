import {Picker} from '@react-native-picker/picker';
import {StackNavigationProp} from '@react-navigation/stack';
import {Images} from 'Assets';
import {Divider, Row, Spacer} from 'component';
import {useDarkTheme, useDynamic} from 'lib';
import {observer} from 'mobx-react-lite';
import React from 'react';
import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Linking,
} from 'react-native';
import FoIcon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useStore} from 'Root.store';
import {IRootStackParams} from 'Route';
import {tw} from 'tailwind';
// @ts-ignore
import {version} from '../../package.json';

interface IProps {
  navigation: StackNavigationProp<IRootStackParams, 'Configuration'>;
}

export let GeneralConfigContainer = observer(({navigation}: IProps) => {
  let root = useStore();
  let {tokens} = root.node;
  let dynamic = useDynamic();
  const isDark = useDarkTheme();

  let settingsRowStyle = tw(``);

  return (
    <ScrollView style={tw(`flex-1`)} showsVerticalScrollIndicator={false}>
      <View style={tw(`w-full pl-6 pr-3`)}>
        <TouchableOpacity onPress={() => navigation.popToTop()}>
          <Text style={tw(`mt-6 font-bold text-2xl`)}>← Settings</Text>
        </TouchableOpacity>

        <Text style={tw(`py-3 text-xs font-light`)}>TOKENS</Text>

        <View
          style={tw(
            {
              'bg-white': !isDark,
              'bg-gray-900': isDark,
            },
            'rounded-lg bg-opacity-70',
          )}>
          {!tokens.length && (
            <View style={tw('items-center py-2')}>
              <Text style={tw(`text-sm font-light`)}>No saved tokens</Text>
            </View>
          )}

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

          <TouchableOpacity onPress={() => navigation.navigate(`AddToken`)}>
            <View style={settingsRowStyle}>
              <Row style={styles.settingsRowInternal} vertical="center">
                <Text>Add Token</Text>
                <Spacer />
                <FoIcon name="chevron-right" size={14} />
              </Row>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={tw(`py-3 text-xs font-light`)}>GENERAL</Text>

        <View
          style={tw(
            {
              'bg-white': !isDark,
              'bg-gray-900': isDark,
            },
            'rounded-lg bg-opacity-70',
          )}>
          <View style={settingsRowStyle}>
            <Row style={tw(`px-4 py-2`)} vertical="center">
              <Text>Polling Interval</Text>
              <Text style={tw(`text-gray-500 text-xs ml-1`)}>(minutes)</Text>
              <Spacer />
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
          </View>

          <Divider />

          <View style={settingsRowStyle}>
            <Row style={styles.settingsRowInternal} vertical="center">
              <Text>Failing builds notifications</Text>
              <Spacer />
              <Switch
                value={root.node.notificationsEnabled}
                onValueChange={root.node.setNotificationsEnabled}
                style={styles.switch}
              />
            </Row>
          </View>

          <Divider />

          <View style={settingsRowStyle}>
            <Row style={styles.settingsRowInternal} vertical="center">
              <Text>Passing builds notifications</Text>
              <Spacer />
              <Switch
                value={root.node.passingNotificationsEnabled}
                onValueChange={root.node.setPassingNotificationsEnabled}
                style={styles.switch}
              />
            </Row>
          </View>
          <Divider />
          <View style={settingsRowStyle}>
            <Row style={styles.settingsRowInternal} vertical="center">
              <Text>Show build number</Text>
              <Spacer />
              <Switch
                value={root.node.showBuildNumber}
                onValueChange={root.node.toggleShowBuildNumber}
                style={styles.switch}
              />
            </Row>
          </View>

          <Divider />
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
          </View>
          <Divider />
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
        </View>

        {/* <View style={settingsRowStyle}>
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
        </View> */}

        {/* {__DEV__ && (
          <View style={tw(`p-4 rounded-lg bg-white mb-8`)}>
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
        )} */}
        <Row style={tw('py-10')} vertical="center">
          <Image source={Images.logo} style={tw('h-16 w-16')} />
          <View style={tw('pl-4')}>
            <Text style={tw('font-thin text-3xl pt-2')}>CI Demon</Text>
            <Text style={tw('font-thin text-sm')}>v{version}</Text>
            <Row>
              <Text
                style={tw('text-sky-500 font-light')}
                onPress={() => {
                  Linking.openURL(`https://ospfranco.com/`);
                }}>
                Oscar Franco
              </Text>
              <Text style={tw('px-2')}>·</Text>
              <Text
                style={tw('text-sky-500 font-light')}
                onPress={() => {
                  Linking.openURL(
                    `https://apps.apple.com/de/app/ci-demon/id1560355863?l=en&mt=12`,
                  );
                }}>
                Share
              </Text>
            </Row>
          </View>
        </Row>
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
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
