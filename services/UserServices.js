import firestore, {firebase} from '@react-native-firebase/firestore';

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
              
         if(document && document.exists){
            document.ref.update({
                [`${location_user_id}`]: true
            })
         }
         else{
            document.ref.set({
                [`${location_user_id}`]: true
            })
        }
    }

    removeUsersFromMap = async (userId, location_user_id) => {
        const document1 = await firestore().collection('meets_remove').doc(userId).get();
        const document2 = await firestore().collection('meets_remove').doc(location_user_id).get();

        if(document1 && document1.exists){
            document1.ref.update({
                [`${location_user_id}`]: true
            })
        }
        else{
            document1.ref.set({
                [`${location_user_id}`]: true
            })
        }

        if(document2 && document2.exists){
            document1.ref.update({
                [`${userId}`]: true
            })
        }
        else{
            document2.ref.set({
                [`${userId}`]: true
            })
        }
    }
 
    createMeet = async (params) => {
        const document = await firestore().collection('meets').doc(params.id).get();//person cliked in the map
        return new Promise( async (resolve, reject) => {
            if(document && document.exists){ 
                const chatKey = params.id + params.from.token; //person you, or someone, clicked in the map does exist

                if(document.data().hasOwnProperty(params.from.token)){//has this person linked you yet?
                    params.chatkey = chatKey;
                    const documentreference1 = firestore().collection('meets').doc(params.id);

                    const targetPerson = {//add or push target person onto your document
                        'chatkey': chatKey, 
                        'image':params.from.image,
                        'name':params.from.name,
                        'coordinates':params.from.coordinates,
                        'fromCoordinates':params.coordinates,
                        'id': params.from.token
                    }
                    
                    firebase.firestore().runTransaction(transaction => {
                            
                            return transaction.get(documentreference1).then((doc) => {
                                if(!doc.data() || doc.data() && !doc.data().hasOwnProperty('data')){
                                    transaction.set(documentreference1,{'data': [targetPerson]})
                                }else{
                                    const d = doc.data().data;
                                    d.push(targetPerson);
                                    transaction.update(documentreference1, {'data': d})
                                }
                            })
                    }).then(() => {//then add or push yourself onto the target persons document
                            
                                const documentreference2 = firestore().collection('meets').doc(params.from.token); 
                                
                                const user = {
                                    'chatkey':chatKey,
                                    'image': params.image, 
                                    'name':params.name, 
                                    'coordinates':params.coordinates,
                                    'fromCoordinates':params.from.coordinates,
                                    'id':params.id
                                }

                                firebase.firestore().runTransaction(transaction => {
                                
                                    return transaction.get(documentreference2).then((doc) => {
                                        if(!doc.data() || doc.data() && !doc.data().hasOwnProperty('data')){
                                            transaction.set(documentreference2, {'data': [user]})
                                        }else{
                                            const da = doc.data().data;
                                            da.push(user);
                                            transaction.update(documentreference2, {'data': da})
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
                    //console.log("document but no prop")
                    const add = await firestore().collection('meets').doc(params.id).get();
                    add.ref.update({
                        [`${params.from.token}`]: false //the person of desire has a document but you haven't been linked yet (create link)
                    });

                    resolve(false)
                }
            }else{
                //console.log('add document')
                const add = await firestore().collection('meets').doc(params.from.token).get();
                add.ref.set({
                    [`${params.id}`]: false //person you're wishing to meet has no document and no link (create document and link)
                },{merge:true});

                resolve(false)
            }
        }).catch((error) => {
            console.log(error)
        })
    }
}

export const userServices = new UserServices(); 