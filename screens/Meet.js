'use strict'
import React, { Component } from 'react'
import {
    Text, StyleSheet, View, Image
} from 'react-native';
import Buttons from '../Components/Buttons';
import Footer from '../Components/Footer';
import { userServices } from '../services/UserServices';
import { dateToAge } from '../services/Helpers';

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
                    resizeMode='cover'
                />
                <View style={styles.info}>
                    <Text style={{fontSize:22,fontWeight:"bold"}}>{params.name}</Text>
                    <Text style={{fontSize:18,fontWeight:"bold", color:"gray"}}>age: {dateToAge(params.birthday)}</Text>
                </View>
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

export default Meet;