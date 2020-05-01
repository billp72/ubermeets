'use strict'
import React, { Component } from 'react'
import {
    Text, StyleSheet, View, Image, Button
} from 'react-native';
import Buttons from '../Components/Buttons';
import Footer from '../Components/Footer';
import { userServices } from '../services/UserServices';

class Meet extends Component {
    constructor(props){
        super(props);
        this.state = {}
    }

    static navigationOptions = {
        swipeEnabled: false,
        initialRouteName: 'Meet',
    };

    meet = (params) => {
        const _this = this;
        if(params.id && params.from.token){
            userServices.createMeet(params).then(response => {
                userServices.removeUserAfterMeetSent(params.from.token, params.id);//user on map, your id
                if(!!response){
                    _this.props.navigation.navigate('Chat', response);
                }else{
                   _this.props.navigation.navigate('Map');
                }
            }).catch((error) => {
                console.log(error)
            });
        }  
    }

    noMeet = (params) => {
        userServices.removeUsersFromMap(params.from.token, params.id);
        this.props.navigation.navigate('Map');
    }

    render() {
        const { params } = this.props.navigation.state;
        return (
          <React.Fragment>
            <View style={styles.container}>
                <Image 
                    source={{uri:params.image}}
                    style={styles.image}
                />
                <Text style={{fontSize:20}}>{params.name}</Text>
                <Text>{params.orientation}</Text>
                <Text>{params.gender}</Text>
            </View>
            <Footer
                leftComponent={{ icon: 'home', color: '#fff', 
                'onPress': () => this.props.navigation.navigate('Map'), size:36}}
                centerComponent={<Buttons 
                    btn1='YES MEET'
                    btn2='NO MEET' 
                    btn1Func={this.meet.bind(null, params)}
                    btn2Func={this.noMeet.bind(null, params)}
                 />}
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

export default Meet;