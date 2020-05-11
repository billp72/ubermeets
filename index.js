/**
 * @format
 */
import {AppRegistry} from 'react-native';
import AppContainer  from './Navigation/Navigation';
import messaging from '@react-native-firebase/messaging';
import {name as appName} from './app.json';
const emitter = require('tiny-emitter/instance');
// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    emitter.emit('message', remoteMessage);
});

messaging().onMessage(async remoteMessage => {
    emitter.emit('message', remoteMessage);
});

AppRegistry.registerComponent(appName, () => AppContainer);
