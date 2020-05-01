import React, { Component } from 'react'

import ChatScreen from './Component'

class ChatScreenContainer extends Component {
  constructor(props){super(props);}
  render() {
    return (
      <ChatScreen navigation={this.props.navigation} 
        chatkey={this.props.chatkey} 
        image={this.props.image} 
        name={this.props.name} />
    )
  }
}

export default ChatScreenContainer