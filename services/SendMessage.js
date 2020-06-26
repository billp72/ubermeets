//messaging
import React from 'react';
import firestore from '@react-native-firebase/firestore';

export function SendMessage (message, chatkey, currentUser, index) {
    const FIREBASE_REF_MEET = firestore().collection('connects');
    FIREBASE_REF_MEET.doc(currentUser.uid).get().then((snapShot) => {
        const data = snapShot.data();
         data.data.map((d) => {
            if(d.chatkey === chatkey){
                d.message = message;
                d.index = `${index}`;
                d.myid = currentUser.uid;
                d.displayName = currentUser.displayName;
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
export function SendMessageMeet (name, deviceID, userImage){
    const d = {
        myid:'0',
        index:'0',
        message: 'Someone wants to meet you',
        displayName: name,
        deviceID: deviceID,
        image: userImage
    }
    fetch('https://uber-meets.herokuapp.com/message', {
        method: 'post',
        body: JSON.stringify(d)
     }).then(function(response) {
        return response.json();
  }) 
}

export function flagContent(user){
    fetch('https://uber-meets.herokuapp.com/flag', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}