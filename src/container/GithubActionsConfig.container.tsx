import React from "react";
import {
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  View,
  Linking,
} from "react-native";
import { observer } from "mobx-react-lite";
import { useStore } from "Root.store";
import { Row, TempoButton } from "component";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useDynamic } from "lib";
import tw from "tailwind-rn";

let placeHolderStyle: any = {
  dynamic: {
    dark: global.colors.gray200,
    light: global.colors.gray500,
  },
};

function openGithubGuide() {
  Linking.openURL(`https://tempomat.dev/githubTokenGuide/`);
}

export const GithubActionsConfigContainer = observer(() => {
  let root = useStore();
  let dynamic = useDynamic();

  let inputFieldStyle = tw(`p-3 ${dynamic(`bg-gray-900`, `bg-gray-100`)}`);

  return (
    <ScrollView
      style={tw(`flex-1 ${dynamic(`bg-gray-700`, `bg-white`)}`)}
      contentContainerStyle={tw(`items-center`)}>
      <View style={tw(`w-96 py-4`)}>
        <Text style={tw(`font-semibold py-3`)}>Github Personal Key</Text>

        <TextInput
          placeholder="Your Github Personal Key goes here"
          style={inputFieldStyle}
          value={root.node.githubKey}
          onChangeText={root.node.setGithubKey}
          placeholderTextColor={placeHolderStyle}
        />

        <Text style={tw(`font-semibold py-3`)}>Subscribed repositories</Text>

        {root.node.githubRepos.map((r, ii) => {
          return (
            <Row key={`github-repo-${ii}`} vertical="center" style={tw(`mb-3`)}>
              <TextInput
                placeholder={`[user name]/[repository name]`}
                style={[inputFieldStyle, tw(`flex-1`)]}
                placeholderTextColor={placeHolderStyle}
                value={r}
                onChangeText={(t) => root.node.setGithubRepoAtIndex(t, ii)}
              />

              <TouchableOpacity
                onPress={() => root.node.deleteGithubRepo(ii)}>
                <View style={tw(
                  `${dynamic(`bg-gray-800`, `bg-gray-100`)} p-2 rounded ml-2`,
                )}>
                  <Icon name="delete" color={`red`} size={20} />
                </View>
              </TouchableOpacity>
            </Row>
          );
        })}

        <TempoButton
          primary
          title="Add slot"
          onPress={root.node.addEmptyGithubRepo}
        />
        <Text
          style={tw(`py-3`)}>
          Due to the Github API limitations you have to specify each repository you want receive notifications.

          Add a slot and add the username and repository.
        </Text>
        <View style={{ alignItems: `center` }}>
          <TempoButton
            title="How do I create a Github Personal Key"
            onPress={openGithubGuide}
          />
        </View>
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
