import firestore, {firebase} from '@react-native-firebase/firestore';
import {SendMessageMeet} from './SendMessage';
class UserServices {
    
    async checkUser(location_user_id, userId) {
        const document = firestore().collection('meets_remove').doc(userId);
     
        return new Promise((resolve, reject) => {
            if(location_user_id != userId){
                document.get().then((Response) => {
                    if(Response.exists){
                        if(Response.data()[location_user_id]){
                                resolve(true)
                        }else{
                                resolve(false)
                            }
                    }else{
                            resolve(false);
                    }
                })
            }else{
                resolve(true)
            }
        })
    }

    removeUserAfterMeetSent = async (userId, location_user_id) => {
         const document = await firestore().collection('meets_remove').doc(userId).get();
         document.ref.set({
                [`${location_user_id}`]: true
         },{merge:true})
    }

    removeUsersFromMap = async (userId, location_user_id) => {
        const document1 = await firestore().collection('meets_remove').doc(userId).get();
        const document2 = await firestore().collection('meets_remove').doc(location_user_id).get();
        document1.ref.set({
            [`${location_user_id}`]: true
        },{merge:true})

        document2.ref.set({
            [`${userId}`]: true
        },{merge:true})
        
    }
 
    createMeet = (params) => {
        
        return new Promise( async (resolve, reject) => {
            const document = await firestore().collection('meets').doc(params.id).get();//them
            const add = await firestore().collection('meets').doc(params.from.token).get();//you     
            const chatKey = params.id + params.from.token; 
            if(document && document.exists && 
                document.data().hasOwnProperty(params.from.token)){//check if connection made
                params.chatkey = chatKey;
                const documentreference1 = firestore().collection('connects').doc(params.id);
                const targetPerson = {
                    'chatkey': chatKey, 
                    'image':params.from.image,
                    'name':params.from.name,
                    'orientation':params.from.orientation,
                    'coordinates':params.from.coordinates,
                    'fromCoordinates':params.coordinates,
                    'id': params.from.token,
                    'deviceID': params.from.deviceID,
                    'birthday': params.from.birthday
                }
                
                firebase.firestore().runTransaction(transaction => {  
                    return transaction.get(documentreference1).then((doc) => {
                        if(doc.exists && doc.data().hasOwnProperty('data')){
                            const d = doc.data().data;
                            d.push(targetPerson);
                            transaction.update(documentreference1, {'data': d})   
                        }else{
                            transaction.set(documentreference1,{'data': [targetPerson]})
                        }
                    })
                }).then(() => {
                    const documentreference2 = firestore().collection('connects').doc(params.from.token); 
                    const user = {
                        'chatkey':chatKey,
                        'image': params.image, 
                        'name':params.name,
                        'orientation':params.orientation, 
                        'coordinates':params.coordinates,
                        'fromCoordinates':params.from.coordinates,
                        'id':params.id,
                        'deviceID':params.deviceID,
                        'birthday':params.birthday
                    }

                    firebase.firestore().runTransaction(transaction => {
                        return transaction.get(documentreference2).then((doc) => {
                            if(doc.exists && doc.data().hasOwnProperty('data')){
                                const da = doc.data().data;
                                da.push(user);
                                transaction.update(documentreference2, {'data': da})
                            }else{
                                transaction.set(documentreference2, {'data': [user]})
                            }
                        });

                        }).then(() => {
                        resolve(params);
                    }).catch((err) => {
                        console.log(err)
                    });

                }).catch((err) => {
                    console.log(err)
                });
            }else{
                add.ref.set({
                    [`${params.id}`]: true 
                },{merge:true});

                resolve(false)
            }

            SendMessageMeet(params.from.name, params.deviceID, params.from.image);

        }).catch((error) => {
            console.log(error)
        })
    }
}

export const userServices = new UserServices(); 