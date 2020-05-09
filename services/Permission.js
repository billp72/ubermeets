//ios request message permission
import messaging, {firebase} from '@react-native-firebase/messaging';

export const requestUserPermission = async () => {
  const authorizationStatus = await messaging().requestPermission({provisional: true,});
    return new Promise( async (resolve, reject) => {
      if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
          const fcmToken = await firebase.messaging().getToken();
          if(fcmToken){
            resolve(fcmToken);
          } 
      } else if (authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
        console.log('User has provisional notification permissions.');
      } else {
        console.log('User has notification permissions disabled');
      }
  })
}