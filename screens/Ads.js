'use strict'
import React, { Component } from 'react'
import {
    Text, StyleSheet, View, Image, Linking
} from 'react-native';
import Buttons from '../Components/Buttons';
import Footer from '../Components/Footer';
import { userServices } from '../services/UserServices';


class Ads extends Component {
    constructor(props){
        super(props);
        this.state = {}
    }

    static navigationOptions = {
        swipeEnabled: false,
        initialRouteName: 'Ads',
    };

    open = (params) => {
        Linking.openURL(params.url)
        .catch((err) => console.error('An error occurred', err));
    }

    close = (params) => {
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
                    <Text style={{fontSize:18,fontWeight:"bold", color:"gray"}}>{params.ad}</Text>
                </View>
            </View>
            
            <Footer
                leftComponent={{ text: 'HOME', style: { color: '#fff' }, 
                'onPress': () => this.props.navigation.navigate('Map'), size:36}}
                centerComponent={<Buttons 
                    btn1='OPEN'
                    btn2='CLOSE' 
                    btn1Func={this.open.bind(null, params)}
                    btn2Func={this.close.bind(null, params)}
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

export default Ads;