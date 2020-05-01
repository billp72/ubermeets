'use-strict'
import React, { Component } from 'react'
import {
    Text, StyleSheet, View, Image, Switch
} from 'react-native'
import { facebookService } from '../services/FacebookService';
import firestore, {firebase} from '@react-native-firebase/firestore';
import { GeoFirestore } from 'geofirestore';
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
        const firestoreForDefaultApp = firebase.firestore();
        this.geofirestore = new GeoFirestore(firestoreForDefaultApp);
        this.state = {
            owner: null,
            picture: null,
            disable:null,
            toggle:null
        }
    }

    componentDidMount(){
       const user = auth().currentUser;
       user.gender = 'location'//remove
       this.props.navigation.addListener('willFocus', async (route) => { 
            if(route.state.routeName == 'Profile'){ 
                const document = await this.geofirestore.collection(user.gender).doc(user.uid).get();
                if(document && document.exists){
                    console.log('ON')
                    this.setState({
                        disable:false,
                        toggle:false
                    })
                 }else{
                    console.log('OFF')
                    this.setState({
                        disable:true,
                        toggle:true
                    })
                 }
            } 
        })
       
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
    
    tracking = async (value) => {
        const user = auth().currentUser;
        user.gender = 'location'
        const document = await firestore().collection(user.gender).doc(user.uid).get();
        if(document && document.exists){
            firestore().collection(user.gender).doc(user.uid).delete().then(() => {
               this.setState({
                   disable:true,
                   toggle:value
                })
            }).catch(function(error) {
                console.error("Error removing document: ", error);
            });
        }
            
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
                <Text style={{padding:10}}>When tracking is Off, reacquire by going to the Map tab</Text>
                <Text style={{fontWeight:'700', fontSize:20}}>{this.state.toggle?'Tracking Off':'Tracking On'}</Text>
                <Text>{'\n'}</Text>
                <Switch
                    style={{transform: [{ scaleX: 1.9 }, { scaleY: 1.9 }]}}
                    disabled={this.state.disable}
                    trackColor={{false: 'gray', true: '#841584'}}
                    thumbColor="blue"
                    ios_backgroundColor="gray"
                    onValueChange={(value) => this.tracking(value)}
                    value={this.state.toggle}
                />
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