import * as types from './ActionTypes';
import firestore, {firebase} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {SendMessage} from '../../../services/SendMessage';
const FIREBASE_REF_MESSAGES = firestore().collection('chat');

const FIREBASE_REF_MESSAGES_LIMIT = 20

export const sendMessage = (message, chatkey) => {
  return (dispatch) => {
    dispatch(chatMessageLoading())

    let currentUser = auth().currentUser
    SendMessage(message, chatkey, currentUser)
    let createdAt = new Date().getTime()
    let chatMessage = {
      text: message,
      createdAt: createdAt,
      user: {
        id: currentUser.uid,
        name: currentUser.displayName
      }
    }
  
    const docref = FIREBASE_REF_MESSAGES.doc(chatkey)
     firebase.firestore().runTransaction(transaction => {                    
        return transaction.get(docref).then((doc) => {
          if(!doc.data() || doc.data() && !doc.data().hasOwnProperty('chats')){
              transaction.set(docref, {'chats': [chatMessage]})
          }else{
              const da = doc.data().chats;
              da.push(chatMessage);
              transaction.update(docref, {'chats': da})
          }
        });
      }).then(() => {
          dispatch(chatMessageSuccess())
      }).catch((err) => {
          dispatch(chatMessageError(err.message))
      });
    }
}

export const updateMessage = (text) => {
  return (dispatch) => {
    dispatch(chatUpdateMessage(text))
  }
}

export const loadMessages = (chatkey) => { 
  return (dispatch) => {
    FIREBASE_REF_MESSAGES.doc(chatkey).onSnapshot((snapshot) => { 
        const chats = !!snapshot.data() && snapshot.data().hasOwnProperty('chats') ? snapshot.data().chats : []        
        dispatch(loadMessagesSuccess(chats))  
      }, errorObject => {
        dispatch(loadMessagesError(errorObject.message))
      })
   }
}

const chatMessageLoading = () => ({
  type: types.CHAT_MESSAGE_LOADING
})

const chatMessageSuccess = () => ({
  type: types.CHAT_MESSAGE_SUCCESS
})

const chatMessageError = error => ({
  type: types.CHAT_MESSAGE_ERROR,
  error
})

const chatUpdateMessage = text => ({
  type: types.CHAT_MESSAGE_UPDATE,
  text
})

const loadMessagesSuccess = messages => ({
  type: types.CHAT_LOAD_MESSAGES_SUCCESS,
  messages
})

const loadMessagesError = error => ({
  type: types.CHAT_LOAD_MESSAGES_ERROR,
  error
})