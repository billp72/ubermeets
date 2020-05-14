//messaging
import React from 'react';
import firestore from '@react-native-firebase/firestore';

export function SendMessage (message, chatkey, currentUser, index) {
    const FIREBASE_REF_MEET = firestore().collection('meets');
    FIREBASE_REF_MEET.doc(currentUser.uid).get().then((snapShot) => {
        const data = snapShot.data();
         data.data.map((d) => {
            if(d.chatkey === chatkey){
                d.message = message;
                d.index = `${index}`;
                fetch('https://uber-meets.herokuapp.com/message', {
                    method: 'post',
                    body: JSON.stringify(d)
                }).then(function(response) {
                    return response.json();
                })  
            }
        })
    })
}
