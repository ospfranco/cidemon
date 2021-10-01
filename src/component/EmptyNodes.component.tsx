import React from 'react';
import {View, Text, StyleSheet, Image, ActivityIndicator} from 'react-native';
import {TempoButton} from './TempoButton.component';
import {Images} from 'Assets';
import {observer} from 'mobx-react-lite';
import {useStore} from 'Root.store';
import {tw} from 'tailwind';

interface IProps {
  onAddToken: () => void;
}

export const EmptyNodesComponent = observer(({onAddToken}: IProps) => {
  const root = useStore();
  const {fetching} = root.node;

  return (
    <View style={styles.container}>
      {!fetching && !!root.node.tokens.length && (
        <Text>Something might have gone wrong :(</Text>
      )}

      {!root.node.tokens.length && (
        <Image
          source={Images.logo}
          style={tw('h-16 w-16')}
          resizeMode="contain"
        />
      )}

      {fetching && <Text>Fetching</Text>}

      {!root.node.tokens.length && (
        <TempoButton
          primary
          title="Add a Token"
          onPress={onAddToken}
          style={tw('my-4')}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: `100%`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  title: {fontWeight: `bold`, paddingVertical: 10},
});
