'use-strict'
import React, { Component } from 'react'
import {
    Text, StyleSheet, View, Image, Switch,TouchableOpacity
} from 'react-native'
import { facebookService } from '../services/FacebookService';
import firestore, {firebase} from '@react-native-firebase/firestore';
import { GeoFirestore } from 'geofirestore';
import auth from '@react-native-firebase/auth';

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
       this.props.navigation.addListener('willFocus', async (route) => { 
            if(route.state.routeName == 'Profile'){ 
                const orientation = await firestore().collection('userinfo').doc(user.uid).get()
                const bucket = orientation.data().orientation === 'gay' ? 'location' : orientation.data().gender;
         
                const document = await this.geofirestore.collection(bucket).doc(user.uid).get();
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
        const orientation = await firestore().collection('userinfo').doc(user.uid).get()
        const bucket = orientation.data().orientation === 'gay' ? 'location' : orientation.data().gender;
        firestore().collection(bucket).doc(user.uid).delete().then(() => {
               this.setState({
                   disable:true,
                   toggle:value
                })
        }).catch(function(error) {
                console.error("Error removing document: ", error);
        });   
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
                <TouchableOpacity
                    onPress={() => facebookService.makeLogoutButton((accessToken) => {
                        this.logout()
                    })}
                    style={{
                        backgroundColor: '#3b5998',
                        padding: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Text style={{color: 'white', fontWeight:'bold'}}>Log Out</Text>
                </TouchableOpacity>
            </View>
          </React.Fragment>
        )
    }

   async logout() {
        const _this = this;
        const user = auth().currentUser;
        const orientation = await firestore().collection("userinfo").doc(user.uid).get();
        let bucket = orientation.data().orientation === 'gay' ? 'location' : orientation.data().gender;
        firestore().collection(bucket).doc(user.uid).delete().then(() => {
            _this.props.navigation.navigate('LoginNav');
            _this.state = {
                owner: null,
                picture: null,
                disable:null,
                toggle:null
            }
        }).catch(function(error) {
            console.error("Error removing document: ", error);
        });
    }
}

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

export default Profile;