import React from 'react';
import { View, StatusBar, Platform } from 'react-native';
const emitter = require('tiny-emitter/instance');
// here, we add the spacing for iOS
// and pass the rest of the props to React Native's StatusBar

class Statusbar extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            bgColor:'#32CD32'
        }
    }

    componentDidMount(){
       emitter.on('status', this.getMessages, this);
        
    }

    getMessages = (status) => {
        let s = status.status == 'yes' ? '#32CD32' : '#ff0000'
        this.setState({
            bgColor: s
        })
    }

   render(){
    const height = (Platform.OS === 'ios') ? 20 : 0
    return (
        <View style={{height}}>
            <StatusBar backgroundColor={this.state.bgColor} { ...this.props } />
        </View>
    );
   }
    
}

export default Statusbar;