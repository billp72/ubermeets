import React, { Component } from 'react'
import { View } from 'react-native'

import MessagesList from './MessagesList'
import MessageForm from './MessageForm'
import Footer from '../../Components/Footer';
import ChatImage from '../../Components/ChatImage';
import styles from './Styles'

class ChatScreenComponent extends Component { 
  gotoProfile = params => {
    params.navigation.navigate('FBProfile', params);
  }

  render() {
    return (
      <View style={styles.container}>
        <MessagesList chatkey={this.props.chatkey} />
        <MessageForm chatkey={this.props.chatkey} index={this.props.index} />
        <Footer leftComponent={{ icon: 'home', color: '#fff', 
                'onPress': () => this.props.navigation.navigate('Matches'), size:36}}
                rightComponent={<ChatImage 
                  image={this.props.image}
                  func={this.gotoProfile.bind(null, this.props)}
                />}
                containerStyle={{
                      backgroundColor: '#3D6DCC',
                      justifyContent: 'center',
                  }}     
        />
  </View>)
  }
}
export default ChatScreenComponent