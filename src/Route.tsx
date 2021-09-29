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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome5';
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
            'border-gray-200': !isDarkMode,
            'border-gray-700': isDarkMode,
          },
          'bg-opacity-40',
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
          tabBarIcon: ({focused}) => (
            <Icon
              name="eye"
              size={20}
              color={focused ? cw('sky-500') : undefined}
            />
          ),
          title: ``,
        }}
      />
      {/* <ConfigurationTabStack.Screen
        name="PingConfig"
        component={PingConfigContainer}
        options={{
          tabBarIcon: ({focused}) => (
            <Icon
              name="heart-pulse"
              size={20}
              color={focused ? cw('sky-500') : undefined}
            />
          ),
          title: ``,
        }}
      /> */}
      <ConfigurationTabStack.Screen
        name="GithubActions"
        component={GithubActionsConfigContainer}
        options={{
          tabBarIcon: ({color, focused}) => (
            <FontAwesomeIcon
              name="github"
              size={20}
              color={focused ? cw('sky-500') : undefined}
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
