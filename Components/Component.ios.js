//tracking status
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
const emitter = require('tiny-emitter/instance');
/*
  
*/

// here, we add the spacing for iOS
// and pass the rest of the props to React Native's StatusBar

class TrackingIos extends React.Component {
   
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

    return (
        
           <View style={[styles.acivity, {backgroundColor:this.state.bgColor}]} />
        
    );
   }
    
}

const styles = StyleSheet.create({
      acivity:{
        position: 'absolute',
        zIndex:1000,
        borderWidth: 1,
        top: 10,
        left: 20,
        width: 20,
        height: 20,
        borderRadius: 20 / 2
      }
})

export default TrackingIos;