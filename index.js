import {AppRegistry} from 'react-native';
import {App} from './src/App';
import {name as appName} from './app.json';
// import {NativeModules} from 'react-native';

// NativeModules.DevSettings.setIsSecondaryClickToShowDevMenuEnabled(true);

AppRegistry.registerComponent(appName, () => App);
