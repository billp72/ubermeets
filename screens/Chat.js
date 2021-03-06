
import React, {Component} from 'react'
import { Provider } from 'react-redux'

import { configureStore } from '../Components/ChatContainer'

import ChatApp from './ChatScreen'
const emitter = require('tiny-emitter/instance');

const store = configureStore()

class Chat extends Component {
  constructor(props){
     super(props);
  }

   render(){
      
     const { params: {chatkey, image, name, orientation, birthday, index} } = this.props.navigation.state;

      return (
         <Provider store={store}>
            <ChatApp navigation={this.props.navigation} chatkey={chatkey} image={image} 
            name={name} orientation={orientation} birthday={birthday} index={index} />
         </Provider>
      )
   }
  
} 

export default Chat