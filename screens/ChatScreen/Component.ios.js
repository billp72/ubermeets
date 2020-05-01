import React, { Component } from 'react'
import { KeyboardAvoidingView } from 'react-native'

import MessagesList from './MessagesList'
import MessageForm from './MessageForm'
import Footer from '../../Components/Footer';
import ChatImage from '../../Components/ChatImage';
import styles from './Styles'

class ChatScreenComponent extends Component (props) {

  gotoProfile = params => {
    params.navigation.navigate('FBProfile', params);
  }
  
  render(){
      return (
        <React.Fragment>
          <KeyboardAvoidingView
            style={styles.container}
            behavior='padding'
            keyboardVerticalOffset={64}>

            <MessagesList chatkey={props.chatkey} />
            <MessageForm chatkey={props.chatkey} />
          </KeyboardAvoidingView>
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
        </React.Fragment>
      )
   }
}
export default ChatScreenComponent