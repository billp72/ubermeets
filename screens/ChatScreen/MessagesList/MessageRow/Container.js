import React, { Component } from 'react'
import PropTypes from 'prop-types'
import auth from '@react-native-firebase/auth';
import MessageRow from './Component'

class MessageRowContainer extends Component {

  render() {
    const isCurrentUser = this.props.message.hasOwnProperty("user") 
    ? auth().currentUser.uid == this.props.message.user.id : true;
    return (
      <MessageRow
        message={this.props.message}
        isCurrentUser={isCurrentUser}/>
    );
  }
}

MessageRowContainer.propTypes = {
  message: PropTypes.object.isRequired,
}

export default MessageRowContainer