//messaging
import React from 'react';
import firestore from '@react-native-firebase/firestore';

export function SendMessage (message, chatkey, currentUser) {
    const FIREBASE_REF_MEET = firestore().collection('meets');
    FIREBASE_REF_MEET.doc(currentUser.uid).get().then((snapShot) => {
        const data = snapShot.data();
         data.data.map((d) => {
            if(d.chatkey === chatkey){
                console.log(d)
            }
        })
    })
}