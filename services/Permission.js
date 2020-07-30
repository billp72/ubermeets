//ios request message permission
import messaging, {firebase} from '@react-native-firebase/messaging';

export const requestUserPermission = async () => {
  const authorizationStatus = await messaging().requestPermission({provisional: true,});
    return new Promise( async (resolve, reject) => {
      if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED 
         || authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {
          const fcmToken = await firebase.messaging().getToken();
          if(fcmToken){
            resolve(fcmToken);
          } 
      } else {
        resolve(false);
      }
  })
}