import React from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'
import relativeDate from 'relative-date'

import styles from './Styles'
//import translations from '../../../../../i18n'

const MESSAGE_TEXT_MARGIN = 50

const MessageRowComponent = props => {
  const isCurrentUser = props.isCurrentUser
  const alignItems = isCurrentUser ? 'flex-end' : 'flex-start'
  const margin = isCurrentUser ? 
  {marginLeft: MESSAGE_TEXT_MARGIN, backgroundColor: '#1E90FF'} : 
  {marginRight: MESSAGE_TEXT_MARGIN, backgroundColor: '#dcdcdc'}
  const username = isCurrentUser ? 'you' : props.message.user.name
  const date = relativeDate(new Date(props.message.createdAt))
  return (
    <View
      style={[styles.container, {alignItems: alignItems}]}>
      <View
        style={[styles.bubbleView, {alignItems: alignItems}, margin]}>
        <Text
          style={styles.userText} >
          {date + ' - ' + username}
        </Text>
        <Text
          style={styles.messageText}>
          {props.message.text}
        </Text>
      </View>
    </View>
  )
}

MessageRowComponent.propTypes = {
  isCurrentUser: PropTypes.bool.isRequired,
  message: PropTypes.shape({
    createdAt: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  })
}

export default MessageRowComponent