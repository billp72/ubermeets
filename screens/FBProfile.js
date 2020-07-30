'use strict'
import React, { Component } from 'react'
import {
    Text, StyleSheet, View, Image, Button
} from 'react-native';
import Footer from '../Components/Footer';
import { dateToAge, validURL } from '../services/Helpers';
import TrackingIos from '../Components/Component';

class FBProfile extends Component {
    constructor(props){
        super(props);
        this.state = {}
    }

    static navigationOptions = {
        swipeEnabled: false,
        initialRouteName: 'FB Profile',
    };

    render() {
        const { params } = this.props.navigation.state;
        return (
          <React.Fragment>
            <TrackingIos />
            <View style={styles.container}>
                <Image 
                    source={{uri:params.image}}
                    style={styles.image}
                    resizeMode='cover'
                />
                <View style={styles.info}>
                    <Text style={{fontSize:22,fontWeight:"bold"}}>{params.name}</Text> 
                    <Text style={{fontSize:18,fontWeight:"bold", color:"gray"}}>age: {dateToAge(params.birthday)}</Text>
                </View>
            </View>
            <Footer
                centerComponent={{ icon: 'home', color: '#fff', 
                'onPress': () => this.props.navigation.navigate('Chat', params), size:36}}
                containerStyle={{
                    backgroundColor: '#3D6DCC',
                    justifyContent: 'center',
                  }}   
            />
          </React.Fragment>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    image: {
        position:"absolute",
        top: 0,
        width:'100%',
        height:'80%'
    },
    info: {
        display:"flex",
        width:"90%",
        flexDirection: "column",
        justifyContent:"space-between",
        position:"absolute",
        bottom:100,
    },
});

export default FBProfile;