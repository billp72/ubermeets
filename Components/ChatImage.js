//chat image
'use strict'
import React, {Component} from 'react'
import {
    Image, TouchableHighlight
} from 'react-native'

class ChatImage extends Component {
    
    render() {
        const {
            image,
            func
        } = this.props;

        return (
          <TouchableHighlight activeOpacity={0.4} underlayColor="#F5F5F5" onPress={func}>
             <Image 
                source={{uri:image}}
                style={{width: 50, height: 50, borderRadius: 50/ 2}}
             />
          </TouchableHighlight>
        )
    }
}


export default ChatImage;
