import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NodeListContainer,
  AddTokenContainer,
  IgnoreConfigContainer,
  GithubActionsConfigContainer,
  GeneralConfigContainer,
  PingConfigContainer,
} from "container";
import { Image } from "react-native";
import { Images } from "Assets";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useDarkTheme } from "lib";
import tw from "tailwind-rn";

export type IRootStackParams = {
  Home: undefined;
  Configuration: undefined;
  AddToken: undefined;
  PollingIntervalConfig: undefined;
};
let RootStack = createStackNavigator<IRootStackParams>();
let ConfigurationStack = createBottomTabNavigator();

const ConfigurationRoutes = () => {
  let isDarkMode = useDarkTheme();

  return (
    <ConfigurationStack.Navigator
      tabBarOptions={{
        // inactiveBackgroundColor: isDarkMode ? global.colors.gray900 : `white`,
        // activeBackgroundColor: isDarkMode ? global.colors.gray1000 : `white`,
        style: tw(`border-0 ${isDarkMode ? `bg-gray-800` : `bg-gray-100`}`),
      }}>
      <ConfigurationStack.Screen
        name="GeneralConfig"
        component={GeneralConfigContainer}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <Icon name="wrench" size={20} color={color} />
          ),
          title: `General`,
        }}
      />
      <ConfigurationStack.Screen
        name="IgnoreConfig"
        component={IgnoreConfigContainer}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <Icon name="eye" size={20} color={color} />
          ),
          title: `Filters`,
        }}
      />
      <ConfigurationStack.Screen
        name="PingConfig"
        component={PingConfigContainer}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <Icon name="heart-pulse" size={20} color={color} />
          ),
          title: `Health checks`,
        }}
      />
      <ConfigurationStack.Screen
        name="GithubActions"
        component={GithubActionsConfigContainer}
        options={{
          tabBarIcon: ({ color }: { color: string }) => (
            <Image
              source={Images.github_bar}
              style={{
                tintColor: color,
                height: global.metrics.imgSmall,
                width: global.metrics.imgSmall,
              }}
            />
          ),
          title: `Github Actions`,
        }}
      />
    </ConfigurationStack.Navigator>
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
          cardStyle: {
            backgroundColor: `transparent`,
          },
        }}
      />
      <RootStack.Screen name="Configuration" component={ConfigurationRoutes} />
      <RootStack.Screen name="AddToken" component={AddTokenContainer} options={{title: `New Token`,}}/>
    </RootStack.Navigator>
  );
};
