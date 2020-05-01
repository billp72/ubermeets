'use-strict'
import React, { Component } from 'react'
import {
    Text, StyleSheet, View, Image
} from 'react-native'
import { facebookService } from '../services/FacebookService';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    imageStyle: {
        width: 200,
        height: 300,
        resizeMode: 'contain',
    },
    testSize: {
        fontSize: 30,
        fontWeight: "bold"
    }
});

class Profile extends Component {
    
    constructor(props){
        super(props)
        this.collection = firestore().collection('location');
        this.state = {
            owner: null,
            picture: null
        }
    }

    componentDidMount(){
       facebookService.fetchProfile().then(
            async response => {
                this.setState({
                    owner: response.name,
                    picture: response.picture.data.url
                })
            }
        )
        .catch(error => {
                console.log(error + ' here')
        })         
    }

    static navigationOptions = {
        swipeEnabled: false
    };
    
    render() {
        return (
          <React.Fragment>
            <View style={styles.container}>
                <Text style={styles.testSize}>{this.state.owner}</Text>
                {this.state.picture ? (
                    <Image
                        source={{ uri: this.state.picture }}
                        style={styles.imageStyle}
                    />
                ) : null} 
                <Text>{'\n'}</Text>
                {facebookService.makeLogoutButton((accessToken) => {
                    this.logout()
                })}
            </View>
          </React.Fragment>
        )
    }

    logout() {
        const _this = this;
        this.state = {
            owner: null,
            picture: null
        }
        const unsubscribe = auth().onAuthStateChanged( async (user) => {
            let u = user.toJSON();
            u.gender = '';//remove
            const orientation = await firestore().collection("orientation").doc(u.uid).get();
            let bucket = orientation.data().orientation === 'gay' || u.gender !== 'male' && u.gender !== 'female' 
                ? 'location' : u.gender;
            firestore().collection(bucket).doc(u.uid).delete().then(function() {
                _this.props.navigation.navigate('LoginNav');
                unsubscribe();
            }).catch(function(error) {
                unsubscribe();
                console.error("Error removing document: ", error);
            });
        })
        
      }
}

export default Profile;