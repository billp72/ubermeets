/**
 * @format
 */
import {AppRegistry} from 'react-native';
import AppContainer  from './Navigation/Navigation';
import messaging from '@react-native-firebase/messaging';
import {name as appName} from './app.json';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    //console.log('background!', remoteMessage);
});

messaging().onMessage(async remoteMessage => {
    Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
});

AppRegistry.registerComponent(appName, () => AppContainer);
