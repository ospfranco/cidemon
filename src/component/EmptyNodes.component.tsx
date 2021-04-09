import React from "react"
import {View, Text, StyleSheet, Image, ActivityIndicator} from "react-native"
import {TempoButton} from "./TempoButton.component"
import {Images} from "Assets"
import {observer} from "mobx-react-lite"
import {useStore} from "Root.store"

interface IProps {
  onAddToken: () => void
}

export const EmptyNodesComponent = observer(({onAddToken}: IProps) => {
  const root = useStore()
  const {fetching} = root.node

  return (
    <View style={styles.container}>
      {!fetching && !!root.node.tokens.length && 
          <Text>Something might have gone wrong :(</Text>
      }
      
      {!root.node.tokens.length && (
        <Image
          source={Images.tempomat}
          style={styles.image}
          resizeMode="contain"
        />
      )}

      {fetching && <ActivityIndicator />}
      {fetching && <Text>Fetching</Text>}
      {!root.node.tokens.length && <Text>Start by adding a API token</Text>}
      {!root.node.tokens.length && (
        <TempoButton title="Add Token" onPress={onAddToken} />
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    height: `100%`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  image: {
    height: 50,
    width: 50,
  },
  title: {fontWeight: `bold`, paddingVertical: 10},
})
