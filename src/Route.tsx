import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  NodeListContainer,
  AddTokenContainer,
  IgnoreConfigContainer,
  GithubActionsConfigContainer,
  GeneralConfigContainer,
  PingConfigContainer,
} from 'container';
import {Image} from 'react-native';
import {Images} from 'Assets';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDarkTheme} from 'lib';
import {tw, cw} from 'tailwind';

export type IRootStackParams = {
  Home: undefined;
  Configuration: undefined;
  AddToken: undefined;
  PollingIntervalConfig: undefined;
};

let RootStack = createStackNavigator<IRootStackParams>();
let ConfigurationTabStack = createBottomTabNavigator();

const ConfigurationRoutes = () => {
  let isDarkMode = useDarkTheme();

  return (
    <ConfigurationTabStack.Navigator
      sceneContainerStyle={{backgroundColor: 'transparent'}}
      screenOptions={{
        headerShown: false,
        tabBarStyle: tw(
          {
            'bg-white': !isDarkMode,
            'bg-gray-800': isDarkMode,
          },
          'bg-opacity-40 border-0',
        ),
      }}>
      <ConfigurationTabStack.Screen
        name="GeneralConfig"
        component={GeneralConfigContainer}
        options={{
          tabBarIcon: ({focused}) => (
            <Icon
              name="settings"
              size={20}
              color={focused ? cw('sky-500') : undefined}
            />
          ),
          title: ``,
        }}
      />
      <ConfigurationTabStack.Screen
        name="IgnoreConfig"
        component={IgnoreConfigContainer}
        options={{
          tabBarIcon: ({color}: {color: string}) => (
            <Icon name="eye" size={20} color={color} />
          ),
          title: ``,
        }}
      />
      <ConfigurationTabStack.Screen
        name="PingConfig"
        component={PingConfigContainer}
        options={{
          tabBarIcon: ({color}: {color: string}) => (
            <Icon name="heart-pulse" size={20} color={color} />
          ),
          title: ``,
        }}
      />
      <ConfigurationTabStack.Screen
        name="GithubActions"
        component={GithubActionsConfigContainer}
        options={{
          tabBarIcon: ({color}: {color: string}) => (
            <Image
              source={Images.github_bar}
              style={{
                tintColor: color,
                height: global.metrics.imgSmall,
                width: global.metrics.imgSmall,
              }}
            />
          ),
          title: ``,
        }}
      />
    </ConfigurationTabStack.Navigator>
  );
};

export const Routes = () => {
  let isDarkMode = useDarkTheme();
  return (
    <RootStack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTintColor: isDarkMode ? `white` : `black`,
        headerStyle: [
          tw(`border-0 ${isDarkMode ? `bg-gray-800` : `bg-gray-100`}`),
        ],
      }}>
      <RootStack.Screen
        name="Home"
        component={NodeListContainer}
        options={{
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name="Configuration"
        component={ConfigurationRoutes}
        options={{
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name="AddToken"
        component={AddTokenContainer}
        options={{
          title: `Add Token`,
        }}
      />
    </RootStack.Navigator>
  );
};
