'use-strict'
import React, { Component } from 'react'
import {
    Text, StyleSheet, View, Image, Switch, TouchableOpacity, TouchableHighlight, Modal, TextInput, Alert
} from 'react-native'
import { facebookService } from '../services/FacebookService';
import firestore, {firebase} from '@react-native-firebase/firestore';
import { GeoFirestore } from 'geofirestore';
import auth from '@react-native-firebase/auth';
import TrackingIos from '../Components/Component';
import { Getit, Storeit } from '../services/Storage';
import { checkDate } from '../services/Helpers'
const emitter = require('tiny-emitter/instance');

class Profile extends Component {
    constructor(props){
        super(props)
        const firestoreForDefaultApp = firebase.firestore();
        this.geofirestore = new GeoFirestore(firestoreForDefaultApp);
        this.state = {
            owner: null,
            picture: null,
            disable:null,
            toggle:null,
            modalVisible: false,
        }
    }

    async componentDidMount(){
       const user = auth().currentUser;
       this.props.navigation.addListener('willFocus', async (route) => { 
            if(route.state.routeName == 'Profile'){ 
                const orientation = await firestore().collection('userinfo').doc(user.uid).get()
                const bucket = orientation.data().orientation === 'gay' 
                || orientation.data().gender == 'other' ? 'location' : orientation.data().gender;
                const document = await this.geofirestore.collection(bucket).doc(user.uid).get();
                if(document && document.exists){
                    emitter.emit('status', {status:'yes'})
                    console.log('ON')
                    this.setState({
                        disable:false,
                        toggle:false,
                        applelogin: orientation.data().applelogin,
                        picture: orientation.data().image
                    })
                 }else{
                    emitter.emit('status', {status:'no'})
                    console.log('OFF')
                    this.setState({
                        disable:true,
                        toggle:true,
                        applelogin: orientation.data().applelogin,
                        picture: orientation.data().image
                    })
                    
                 }
               
            } 
        })
        const userinfo = await firestore().collection('userinfo').doc(user.uid).get()
        let data = userinfo.data()
        if(data.applelogin){
            this.setState({
                owner: data.name,
                picture: data.image,
                birthday: data.birthday,
                gender: data.gender,
                applelogin:data.applelogin
            })
        }else{
            facebookService.fetchProfile().then(
                async response => {
                    this.setState({
                        owner: response.name,
                        picture: response.picture.data.url,
                        birthday: response.birthday,
                        gender: response.gender 
                    })  
                }
            )
            .catch(error => {
                    console.log(error)
            }) 
        }
        
        Getit('first-time').then(result => {
            if(!result){
               Storeit('first-time',true);
               this.setState({
                    modalVisible: true
                })
            }
          })
    }
    setModalVisible = (param) => this.setState({modalVisible: param})

    tracking = async (value) => {
        const user = auth().currentUser;
        const orientation = await firestore().collection('userinfo').doc(user.uid).get()
        const bucket = orientation.data().orientation === 'gay' 
        || orientation.data().gender == 'other' ? 'location' : orientation.data().gender;
        firestore().collection(bucket).doc(user.uid).delete().then(() => {
               this.setState({
                   disable:true,
                   toggle:value
                })
                let status = this.state.disable ? 'no' : 'yes';
                emitter.emit('status', {status:status});
        }).catch(function(error) {
                console.error("Error removing document: ", error);
        });   
    }

    gallary = () => {
        this.props.navigation.navigate('Gallary')
    }

    static navigationOptions = {
        swipeEnabled: false
    };

    AppleImage = (applelogin) => {
        if(applelogin){
            return(
              <TouchableOpacity
                onPress={(e) => {e.stopPropagation(); this.gallary()}}
              >
                {this.state.picture ? (
                    <Image
                        source={{ uri: this.state.picture }}
                        style={styles.imageStyle}
                    />
                ) : null} 
             </TouchableOpacity>
            )
        }else{
           return (
             this.state.picture ? (
                <Image
                    source={{ uri: this.state.picture }}
                    style={styles.imageStyle}
                />
            ) : null 
          )
        }
    }

    AppleLogout = (applelogin) => {
        if(applelogin){
          return (
            <TouchableOpacity
                onPress={() => this.logout()}
                style={styles.logout}
            >
                <Text style={{color: 'white', fontWeight:'bold'}}>Log Out</Text>
            </TouchableOpacity>
          )
       }else{
          return (
            <TouchableOpacity
                onPress={() => facebookService.makeLogoutButton((accessToken) => {
                    this.logout()
                })}
                style={styles.logout}
            >
                <Text style={{color: 'white', fontWeight:'bold'}}>Log Out</Text>
            </TouchableOpacity> 
         )
       } 
    }

    AppleBirthday = (applelogin) => {
        if(applelogin){
           return( 
             <TextInput 
                style={styles.inputText}
                onChangeText={ async (text) => {
                    let total = text.length >= 8 ? checkDate(text) : false;
                    if(typeof total === 'string'){
                        this.setState({
                            birthday: total
                        })
                        const user = auth().currentUser;
                        const col = await firestore().collection('userinfo').doc(user.uid).get()
                        col.ref.update({
                            birthday:total
                        })
                    }
                    if(typeof total === 'object'){
                        Alert.alert(total.msg)
                    }
                }}
                value={this.state.birthday}
                placeholder="Date Of Birth"
            />
          )
        }else{
          return (
            <Text>
              Birthday: 
              <Text style={{fontWeight:'700'}}>
                {this.state.birthday}
             </Text>
           </Text>)
        }
    }

    render() {
        return (
          <View style={styles.main}>
             <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.modalVisible}
                >
                <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalText}>
                To add yourself to the map and commence tracking,
                click the MAP tab. 
                {"\n"}
                {"\n"}
                A Green indicator in the upper-left corner means you are being tracked. And a Red indicator
                means you are not being tracked.
                {"\n"}
                {"\n"}
                To untrack yourself, come to the PROFILE tab and toggle the switch to "Off".
                (Logging out also stops tracking)
                {"\n"}
                {"\n"}
                To prevent someone from seeing you, click their name under their picture on the map and tap "NO MEET"
                {"\n"}
                {"\n"}
                MINIMIZING THE APP DOES NOT STOP TRACKING. MAKE SURE YOU TOGGLE OFF OR LOG OUT
                </Text>
                <TouchableHighlight
                    style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                    onPress={() => {
                        this.setModalVisible(!this.state.modalVisible);
                    }}
                    >
                    <Text style={styles.textStyle}>Close</Text>
                    </TouchableHighlight>
                </View>
              </View>
            </Modal>                                                                                                                                                                      
            <TrackingIos />
            <View style={styles.container}>
            
                <Text style={styles.testSize}>{this.state.owner}</Text>
                {this.AppleBirthday(this.state.applelogin)}
                
                <Text>Gender: <Text style={{fontWeight:'700'}}>{this.state.gender}</Text></Text>
                
                {this.AppleImage(this.state.applelogin)}
               
                <Text style={{padding:10}}>reacquire tracking by going to the MAP tab</Text>
                <Text style={{fontWeight:'700', fontSize:20}}>{this.state.toggle?'Tracking Off':'Tracking On'}</Text>
                <Text>{'\n'}</Text>
                <Switch
                    style={{transform: [{ scaleX: 1.9 }, { scaleY: 1.9 }]}}
                    disabled={this.state.disable}
                    trackColor={{false: 'gray', true: '#ff0000'}}
                    thumbColor="blue"
                    ios_backgroundColor="gray"
                    onValueChange={(value) => this.tracking(value)}
                    value={this.state.toggle}                                                                       
                />
                <Text>{'\n'}</Text>
                {this.AppleLogout(this.state.applelogin)}
            </View>
          </View>
        )
    }

   async logout() {
        const _this = this;
        const user = auth().currentUser;
        const orientation = await firestore().collection("userinfo").doc(user.uid).get();
        let bucket = orientation.data().orientation === 'gay' 
        || orientation.data().gender == 'other'  ? 'location' : orientation.data().gender;
        firestore().collection(bucket).doc(user.uid).delete().then(() => {
            auth().signOut().then(() => console.log('you are logged out'));
            _this.props.navigation.navigate('LoginNav');
            _this.state = null;

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
        fontSize: 35,
        fontWeight: "bold"
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
      },
      modalView: {
        margin: 20,
        backgroundColor: "#eff0da",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
      },
      modalText: {
        marginBottom: 15,
        textAlign: "center"
      },
      openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
      },
      logout: {
        backgroundColor: '#3b5998',
        height:50,
        padding: 10,
        width:300,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius:5
      },
      inputText:{
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        textAlign: 'center',
        height: 40, 
        width:300, 
        borderColor: 'gray', 
        borderWidth: 1, 
        fontSize:26,
        marginBottom:10
      },
      main:{
        flex:1
      }
});

export default Profile;