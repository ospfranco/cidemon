import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import {Divider, Row, Spacer, TempoButton} from 'component';
import {useStore} from 'Root.store';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {observer} from 'mobx-react-lite';
import {tw} from 'tailwind';
import {useDarkTheme, useDynamic} from 'lib';
import {StackNavigationProp} from '@react-navigation/stack';
import {IRootStackParams} from 'Route';

let placeHolderStyle: any = {
  dynamic: {
    dark: global.colors.gray400,
    light: global.colors.gray500,
  },
};

interface IProps {
  navigation: StackNavigationProp<IRootStackParams, 'Configuration'>;
}

export const IgnoreConfigContainer = observer(({navigation}: IProps) => {
  let root = useStore();
  let [regex, setRegex] = useState(``);
  let [inverted, setInverted] = useState(false);
  let [id, setId] = useState<string | null>(null);
  let [error, setError] = useState(false);
  const isDark = useDarkTheme();
  const dynamic = useDynamic();

  function commit() {
    if (id) {
      setId(null);
      setRegex(``);
      setInverted(false);

      let tempRegex = regex.trim();

      root.node.updateIgnoredRegex(id, tempRegex, inverted);
    } else {
      let tempRegex = regex.trim();
      if (tempRegex !== ``) {
        let inserted = root.node.addIgnoredRegex(tempRegex, inverted);
        if (!inserted) {
          setError(true);
        } else {
          setRegex(``);
        }
      }
    }
  }

  return (
    <View style={tw(`flex-1 items-center`)}>
      <View style={tw(`w-full px-6 flex-1`)}>
        <TouchableOpacity onPress={() => navigation.popToTop()}>
          <Text style={tw(`mt-6 font-bold text-2xl`)}>← Filters</Text>
        </TouchableOpacity>

        <Text style={tw(`py-3 text-xs font-light`)}>IGNORED REGEXES</Text>
        <FlatList
          data={root.node.complexRegexes}
          renderItem={(info) => (
            <View>
              <Row
                style={{
                  padding: global.metrics.pl,
                }}
                vertical="center">
                <Text>{info.item.regex}</Text>
                <Spacer />
                {info.item.inverted && (
                  <Text style={{fontStyle: `italic`}}>Inverted </Text>
                )}

                <Icon
                  name="pencil"
                  size={18}
                  style={styles.editIcon as any}
                  onPress={() => {
                    setId(info.item.id);
                    setRegex(info.item.regex);
                    setInverted(info.item.inverted);
                  }}
                />

                <Icon
                  name="delete"
                  size={18}
                  color="red"
                  onPress={() => root.node.removeIgnoredRegex(info.item.regex)}
                />
              </Row>
              <Divider alignSelf="flex-end" />
            </View>
          )}
          keyExtractor={(t) => t.regex}
          contentContainerStyle={tw(`flex-grow`)}
          ListEmptyComponent={
            <View style={tw(`flex-1 justify-center`)}>
              <Text style={tw(`self-center text-gray-500`)}>
                No ignored patterns
              </Text>
            </View>
          }
          style={tw(
            {
              'bg-white': !isDark,
              'bg-gray-900': isDark,
            },
            'rounded-lg bg-opacity-70 mb-3',
          )}
        />

        <Text style={tw(`py-3 text-xs font-light`)}>NEW REGEX</Text>

        <Row style={tw('pb-4')}>
          <View>
            <TextInput
              style={tw(
                {
                  'bg-white': !isDark,
                  'bg-gray-900': isDark,
                },
                `w-96 px-3 py-2 bg-opacity-70 rounded-lg`,
              )}
              placeholder="Regex..."
              value={regex}
              onChangeText={setRegex}
              placeholderTextColor={placeHolderStyle}
            />
            {error && <Text style={{color: `red`}}>Not a valid regex</Text>}
            <Row vertical="center">
              <Text style={tw(`ml-1`)}>Inverted </Text>
              <Text style={tw(`px-1 text-gray-400`)}>
                (Show matching branches)
              </Text>
              <Switch
                value={inverted}
                onValueChange={() => setInverted(!inverted)}
                style={tw(`w-6`)}
              />
            </Row>
          </View>
          <TempoButton
            title={id ? `Save` : `Add`}
            onPress={commit}
            primary
            style={tw(`w-24 ml-4`)}
          />
          {!!id && (
            <TempoButton
              title={`Cancel`}
              onPress={() => {
                setId(null);
                setRegex(``);
                setInverted(false);
              }}
            />
          )}
        </Row>
      </View>
    </View>
  );
});

// @ts-ignore
IgnoreConfigContainer.navigationOptions = () => ({
  title: `Ignore`,
});

let styles = StyleSheet.create({
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
  row: {
    flexDirection: `row`,
    alignItems: `center`,
    paddingHorizontal: global.metrics.pl,
    //@ts-ignore
    backgroundColor: {
      dynamic: {
        light: `white`,
        dark: global.colors.gray900,
      },
    },
  },
  list: {
    flex: 1,
    //@ts-ignore
    backgroundColor: {
      dynamic: {
        light: global.colors.gray010,
        dark: global.colors.gray900,
      },
    },
  },
  input: {
    paddingVertical: global.metrics.pm,
    // @ts-ignore
    color: {
      dynamic: {
        light: `black`,
        dark: `white`,
      },
    },
  },
  editIcon: {
    // @ts-ignore
    color: {
      dynamic: {
        light: global.colors.blue500,
        dark: `white`,
      },
    },
    paddingRight: 10,
  },
  emptyContainer: {justifyContent: `center`, height: 200},
  flex1: {
    flex: 1,
  },
  header: {
    paddingTop: global.metrics.pl * 2,
    padding: global.metrics.pl,
    fontWeight: `500`,
  },
});
