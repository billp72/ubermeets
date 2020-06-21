/**
 * @format
 */
import Icon from 'react-native-vector-icons/MaterialIcons'
import {AppRegistry} from 'react-native';
import AppContainer  from './Navigation/Navigation';
import messaging from '@react-native-firebase/messaging';
import {name as appName} from './app.json';
const emitter = require('tiny-emitter/instance');
const Sound = require('react-native-sound');

Icon.loadFont();
Sound.setCategory('Playback');

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    emitter.emit('message', remoteMessage);
});

messaging().onMessage(async remoteMessage => {
    emitter.emit('message', remoteMessage);
    const when = new Sound('when.mp3', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('failed to load the sound', error);
          return;
        }
        // loaded successfully
        //console.log('duration in seconds: ' + when.getDuration() + 'number of channels: ' + when.getNumberOfChannels());
        // Play the sound with an onEnd callback
        when.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      });

});

AppRegistry.registerComponent(appName, () => AppContainer);
