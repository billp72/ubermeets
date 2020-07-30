//tracking status
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

class TrackingIos extends React.Component {

   render(){

    return (  
        <View style={styles.acivity} />
    );
   }
    
}

const styles = StyleSheet.create({
      acivity:{
        display:'none'
      }
})

export default TrackingIos;