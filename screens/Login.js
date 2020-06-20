import React from 'react'
import { StyleSheet, View, Text, Image, Dimensions, Switch, TouchableOpacity, Alert } from 'react-native'
import {facebookService} from '../services/FacebookService'
import auth from '@react-native-firebase/auth';
import firestore, {firebase} from '@react-native-firebase/firestore';
import Geolocation from '@react-native-community/geolocation';
import { GeoFirestore } from 'geofirestore';
import { requestUserPermission } from '../services/Permission'

export default class LogInPage extends React.Component {
  constructor(props) {
    super(props)
    const firestoreForDefaultApp = firebase.firestore();
    this.geofirestore = new GeoFirestore(firestoreForDefaultApp);
    this.GeoCollectionReferenceSet = null;
    this.login = this.login.bind(this)
    this.state = {
      imageHeight: Dimensions.get('window').width - 50,
      toggle:false
    }   
  }

 componentDidMount(){
    /*
    landscape orientation is currrently turned off - not using this
    Dimensions.addEventListener('change',(dimensions) => {
      this.setState({
        imageHeight: Math.round(dimensions.window.width >= 800 ? 
          dimensions.window.width / 16 : dimensions.window.width - 50),
      })
    })*/
 }

 setOrientation = (value) => {
    this.setState({toggle: value})
 }

  render() {
    return (
      <React.Fragment>
        <Image source={require('../assets/mainphoto.jpg')} style={{width:'100%', height:this.state.imageHeight}} />
         <View style={styles.container}>
          <Text style={{textAlign:'center', padding:20, fontSize:20}}>
            Meet someone at the bar, club, coffee house or wherever you are
          
          </Text>
          <Text style={{fontWeight:'700', fontSize:20}}>{this.state.toggle?'Gay':'Straight'}</Text>
          <Text>{'\n'}</Text>
          <Switch
              style={{transform: [{ scaleX: 1.9 }, { scaleY: 1.9 }]}}
              trackColor={{false: 'gray', true: '#841584'}}
              thumbColor="blue"
              ios_backgroundColor="gray"
              onValueChange={(value) => this.setOrientation(value)}
              value={this.state.toggle}
          />
          <Text>{'\n'}</Text>
          <TouchableOpacity
              onPress={() => facebookService.makeLoginButton((accessToken, url) => {
                let orientation = this.state.toggle ? 'gay' : 'straight'
                this.login(accessToken, url, orientation)
              })}
              style={{
                backgroundColor: '#3b5998',
                padding: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{color: 'white', fontWeight:'bold'}}>Log In</Text>
          </TouchableOpacity>
        </View>
      </React.Fragment>
    )
  }

  login(accessToken, url, o) {
    const _this = this;
    auth().signInWithCredential(auth.FacebookAuthProvider.credential(accessToken)).then(async(result) => {

        result.user.gender = result.additionalUserInfo.profile.gender || 'butch';
        result.user.birthday = result.additionalUserInfo.profile.birthday;
        
        if(o === 'straight' 
          && result.user.gender === 'male' 
          || result.user.gender === 'female'){
            _this.GeoCollectionReferenceSet = _this.geofirestore.collection(result.user.gender);
        }
        if(o === 'gay' 
          || result.user.gender !== 'male' 
          && result.user.gender !== 'female'){
            _this.GeoCollectionReferenceSet = _this.geofirestore.collection('location');
        }
          
        const document = await _this.GeoCollectionReferenceSet.doc(result.user.uid).get();
        const userInfo = await firestore().collection('userinfo').doc(result.user.uid).get();
        const deviceid = await requestUserPermission();
        //add device id here
        userInfo.ref.set({
          name: result.additionalUserInfo.profile.first_name,
          birthday: result.user.birthday,
          image: url,
          orientation: o,
          gender: result.user.gender,
          deviceID: deviceid
        });
        
        const _watchId = Geolocation.getCurrentPosition((position) => {

            if(document && document.exists){
                document.ref.update({
                    coordinates: new firestore.GeoPoint(position.coords.latitude, position.coords.longitude)
              })
            }else{
                document.ref.set({
                    coordinates: new firestore.GeoPoint(position.coords.latitude, position.coords.longitude),
                    name: result.additionalUserInfo.profile.first_name,
                    birthday: result.user.birthday,
                    image: url,
                    orientation: o,
                    gender: result.user.gender,
                    deviceID: deviceid
                })
            }
            _this.props.navigation.navigate('LoggedInNav');
              
        }).catch(function(error) {
            Alert.alert(error + ' Geolocation not activated')
        });
        Geolocation.clearWatch(_watchId);
     }).catch((error) => {
       console.error(error.message)
     })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
})