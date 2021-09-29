import React from 'react';
import {
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  Linking,
  Switch,
} from 'react-native';
import {observer} from 'mobx-react-lite';
import {useStore} from 'Root.store';
import {Divider, Row, Spacer, TempoButton} from 'component';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDarkTheme, useDynamic} from 'lib';
import {tw} from 'tailwind';

let placeHolderStyle: any = {
  dynamic: {
    dark: global.colors.gray200,
    light: global.colors.gray500,
  },
};

function openGithubGuide() {
  Linking.openURL(
    `https://ospfranco.github.io/post/2021/05/08/how-to-add-a-github-token-to-ci-demon/`,
  );
}

export const GithubActionsConfigContainer = observer(({navigation}: any) => {
  let root = useStore();
  let dynamic = useDynamic();
  const isDark = useDarkTheme();

  let inputFieldStyle = tw(`p-3 ${dynamic(`bg-gray-900`, `bg-gray-100`)}`);
  let settingsRowStyle = tw('');

  return (
    <ScrollView style={tw(`flex-1`)} contentContainerStyle={tw(`items-center`)}>
      <View style={tw(`w-full px-6`)}>
        <TouchableOpacity onPress={() => navigation.popToTop()}>
          <Text style={tw(`mt-6 font-bold text-2xl`)}>← Github</Text>
        </TouchableOpacity>

        <Text style={tw(`py-3`)}>
          {`In order to connect with github, first you need to generate an access token and then subscribe to each repository individually (sorry! API limitations).`}
        </Text>

        <Text style={tw('text-cyan-500')} onPress={openGithubGuide}>
          How do I create an Access Token?
        </Text>

        {/* <TempoButton
          title=
          onPress={openGithubGuide}
        /> */}

        <Text style={tw(`py-3 text-xs font-light`)}>ACCESS TOKEN</Text>
        <TextInput
          placeholder="Your Github Personal Key goes here"
          style={tw(
            {
              'bg-white': !isDark,
              'bg-gray-900': isDark,
            },
            `px-3 py-2 bg-opacity-70 rounded-lg`,
          )}
          value={root.node.githubKey}
          onChangeText={root.node.setGithubKey}
          placeholderTextColor={placeHolderStyle}
          secureTextEntry
        />

        <Text style={tw(`py-3 text-xs font-light`)}>ITEMS TO FETCH</Text>
        <View
          style={tw(
            {
              'bg-white': !isDark,
              'bg-gray-900': isDark,
            },
            'rounded-lg bg-opacity-70',
          )}>
          <TouchableOpacity onPress={root.node.toggleGithubFetchPrs}>
            <View style={settingsRowStyle}>
              <Row style={tw('py-3 px-4')} vertical="center">
                <Text>Fetch pull requests</Text>
                <Spacer />
                <Switch
                  value={root.node.githubFetchPrs}
                  style={tw('h-4 w-4')}
                />
              </Row>
            </View>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={root.node.toggleGithubFetchBranches}>
            <View style={settingsRowStyle}>
              <Row style={tw('py-3 px-4')} vertical="center">
                <Text>Fetch branches</Text>
                <Spacer />
                <Switch
                  value={root.node.githubFetchBranches}
                  style={tw('h-4 w-4')}
                />
              </Row>
            </View>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity onPress={root.node.toggleGithubFetchWorkflows}>
            <View style={settingsRowStyle}>
              <Row style={tw('py-3 px-4')} vertical="center">
                <Text>Fetch workflows</Text>
                <Spacer />
                <Switch
                  value={root.node.githubFetchWorkflows}
                  style={tw('h-4 w-4')}
                />
              </Row>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={tw(`py-3 text-xs font-light`)}>OBSERVED REPOSITORIES</Text>

        {root.node.githubRepos.map((r, ii) => {
          return (
            <Row key={`github-repo-${ii}`} vertical="center" style={tw(`mb-3`)}>
              <TextInput
                placeholder={`[user name]/[repository name]`}
                style={tw(
                  {
                    'bg-white': !isDark,
                    'bg-gray-900': isDark,
                  },
                  `px-3 py-2 bg-opacity-70 rounded-lg flex-1`,
                )}
                placeholderTextColor={placeHolderStyle}
                value={r}
                onChangeText={(t) => root.node.setGithubRepoAtIndex(t, ii)}
              />

              <TouchableOpacity onPress={() => root.node.deleteGithubRepo(ii)}>
                <View
                  style={tw(
                    `${dynamic(`bg-gray-800`, `bg-gray-100`)} p-2 rounded ml-2`,
                  )}>
                  <Icon name="delete" color={`red`} size={20} />
                </View>
              </TouchableOpacity>
            </Row>
          );
        })}

        <Row>
          <TempoButton
            primary
            title="Add slot"
            onPress={root.node.addEmptyGithubRepo}
            style={tw('flex-1')}
          />
          <View style={tw('w-11 h-4')} />
        </Row>
      </View>
    </ScrollView>
  );
});

// @ts-ignore
GithubActionsConfigContainer.navigationOptions = () => ({
  title: `Github Actions`,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // @ts-ignore
    backgroundColor: {
      dynamic: {
        light: global.colors.gray010,
        dark: global.colors.gray800,
      },
    },
  },
  contentContainer: {},
  listContainer: {
    flex: 1,
    // @ts-ignore
    backgroundColor: {
      dynamic: {
        light: global.colors.gray010,
        dark: global.colors.gray900,
      },
    },
  },
  row: {
    padding: global.metrics.pl,
    //@ts-ignore
    backgroundColor: {
      dynamic: {
        light: `white`,
        dark: `#1E1E1E`,
      },
    },
  },
  repositoryField: {
    width: `90%`,
    height: 20,
    borderWidth: 0,
    padding: 0,
    // @ts-ignore
    color: {
      dynamic: {
        light: `black`,
        dark: `white`,
      },
    },
  },
});
