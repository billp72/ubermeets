import React, { Component } from 'react'

import ChatScreen from './Component'

class ChatScreenContainer extends Component {
 
  render() {
    return (
      <ChatScreen navigation={this.props.navigation} 
        chatkey={this.props.chatkey} 
        image={this.props.image} 
        name={this.props.name}
        orientation={this.props.orientation}
        birthday={this.props.birthday}
        index={this.props.index} />
    )
  }
}

export default ChatScreenContainer