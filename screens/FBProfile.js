'use strict'
import React, { Component } from 'react'
import {
    Text, StyleSheet, View, Image, Button
} from 'react-native';
import Buttons from '../Components/Buttons';
import Footer from '../Components/Footer';
import { userServices } from '../services/UserServices';

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
            <View style={styles.container}>
                <Image 
                    source={{uri:params.image}}
                    style={styles.image}
                />
                <Text style={{fontSize:25}}>{params.name}</Text>
            </View>
            <Footer
                leftComponent={{ icon: 'home', color: '#fff', 
                'onPress': () => this.props.navigation.navigate('Chat', params), size:36}}
                 containerStyle={{
                    backgroundColor: '#3D6DCC',
                    justifyContent: 'center',
                    bottom:0,
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
        width:'70%',
        height:'70%'
    }
});

export default FBProfile;