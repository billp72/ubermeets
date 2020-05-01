
import React, {Component} from 'react'
import { Provider } from 'react-redux'

import { configureStore } from '../Components/ChatContainer'

import ChatApp from './ChatScreen'

const store = configureStore()

class Chat extends Component {
  constructor(props){
     super(props);
  }
   render(){
     const { params: {chatkey, image, name} } = this.props.navigation.state;
      return (
         <Provider store={store}>
            <ChatApp navigation={this.props.navigation} chatkey={chatkey} image={image} name={name} />
         </Provider>
      )
   }
  
} 

export default Chat