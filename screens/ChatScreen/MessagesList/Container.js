import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { loadMessages } from '../../../Components/ChatContainer/Chat/Actions'
import { getChatItems } from '../../../Components/ChatContainer/Chat/Selectors'

import MessageListComponent from './Component'

class MessagesListContainer extends Component {

  componentDidMount() {
    this.props.loadMessages(this.props.chatkey)
  }
  
  render() {
    const data = getChatItems(this.props.messages).reverse()
    return (
      <MessageListComponent
        data={data} />
    )
  }
}

const mapStateToProps = state => ({
  messages: state.chat.messages,
  error: state.chat.loadMessagesError
})

const mapDispatchToProps = {
  loadMessages
}

MessagesListContainer.propTypes = {
  messages: PropTypes.any,
  error: PropTypes.string,
  loadMessages: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(MessagesListContainer)