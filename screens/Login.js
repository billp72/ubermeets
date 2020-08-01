import React from 'react'
import { StyleSheet, View, Text, 
  Image, Dimensions, Switch, TouchableOpacity, Alert } from 'react-native'
import {facebookService} from '../services/FacebookService'
import auth from '@react-native-firebase/auth';
import firestore, {firebase} from '@react-native-firebase/firestore';
//import Geolocation from '@react-native-community/geolocation';
import { GeoFirestore } from 'geofirestore';
import { requestUserPermission } from '../services/Permission'
import  CheckBox from '../Components/CheckBox'
import TrackingIos from '../Components/Component';
import appleAuth, {
  AppleButton,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
  AppleAuthCredentialState,
  AppleAuthError,
  AppleButtonType,
  AppleButtonStyle,
} from '@invertase/react-native-apple-authentication';
const emitter = require('tiny-emitter/instance');


export default class LogInPage extends React.Component {
  constructor(props) {
    super(props)
    const firestoreForDefaultApp = firebase.firestore();
    this.geofirestore = new GeoFirestore(firestoreForDefaultApp);
    this.GeoCollectionReferenceSet = null;
    this.login = this.login.bind(this)
    this.state = {
      imageHeight: Dimensions.get('window').width - 50,
      toggle:false,
      termsAccepted: false,
      modalVisible: false
    }   
  }

 componentDidMount(){
    const apple = firestore().collection('applelogin').doc('apple');
    apple.get().then((doc) => {
      this.setState({
        show: doc.data().show
      })
    })
    emitter.emit('status', {status:'no'})
 }

 setOrientation = (value) => {
    this.setState({toggle: value})
 }

 handleCheckBox = () => this.setState({ termsAccepted: !this.state.termsAccepted })


 AppleBtn = (show) => {
   if(show){
    return (
      <AppleButton
        buttonStyle={AppleButton.Style.BLACK}
        buttonType={AppleButton.Type.SIGN_IN}
        onPress={() => {
            this.state.termsAccepted ? this.selectGender() : ''
          }
        }
        style={styles.appleButton}
      />
    )
   }
  }
  selectGender = () => {
    Alert.prompt(
      "Enter gender",
      "male, female, other",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: (gender) => {
            let orientation = this.state.toggle ? 'gay' : 'straight';
            this.handleResponse(gender, orientation)
          }
        }
      ]
    );
  }

  render() {
    return (
      <View style={styles.main}>
        <TrackingIos />
        <Image source={require('../assets/mainphoto.jpg')} style={{width:'100%', height:this.state.imageHeight}} />
         <View style={styles.container}>
          <Text style={{textAlign:'center', padding:10, fontSize:20}}>
            Meet someone at the bar, club, coffee house or wherever you are
          
          </Text> 
          <Text style={{fontWeight:'700', fontSize:20, padding:20}}>{this.state.toggle?'Gay':'Straight'}</Text>
          
          <Switch
              style={{transform: [{ scaleX: 1.9 }, { scaleY: 1.9 }]}}
              trackColor={{false: 'gray', true: '#841584'}}
              thumbColor="blue"
              ios_backgroundColor="gray"
              onValueChange={(value) => this.setOrientation(value)}
              value={this.state.toggle}
          />
          <Text>{'\n'}</Text>
          <CheckBox 
                    selected={this.state.termsAccepted} 
                    onPress={this.handleCheckBox}
                    text='Accept terms and conditions'
                /> 
          <TouchableOpacity
              disabled={!this.state.termsAccepted}
              onPress={() => facebookService.makeLoginButton((accessToken, url) => {
                let orientation = this.state.toggle ? 'gay' : 'straight'
                this.login(accessToken, url, orientation)
              })}
              style={styles.facebook}>
              <Text style={{color: 'white', fontWeight:'bold'}}>Log In</Text>
          </TouchableOpacity>
          {this.AppleBtn(this.state.show)}
        </View>
      </View>
    )
  }

  login(accessToken, url, o) {
    const _this = this;
    const { navigate } = this.props.navigation;
    auth().signInWithCredential(auth.FacebookAuthProvider.credential(accessToken)).then(async(result) => {

        result.user.gender = result.additionalUserInfo.profile.gender || 'other';
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
          
        //const document = await _this.GeoCollectionReferenceSet.doc(result.user.uid).get();
        const userInfo = await firestore().collection('userinfo').doc(result.user.uid).get();
        const deviceid = await requestUserPermission() || '';
        //add device id here
        userInfo.ref.set({
          name: result.additionalUserInfo.profile.first_name,
          birthday: result.user.birthday,
          image: url,
          orientation: o,
          gender: result.user.gender,
          appleLogin: false,
          deviceID: deviceid
        });
        navigate('LoggedInNav');
     }).catch((error) => {
       console.error(error.message)
     })
     
  }

  async handleResponse(gender, o) {
    
    const { navigate } = this.props.navigation;
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleAuthRequestOperation.LOGIN,
        requestedScopes: [
          AppleAuthRequestScope.EMAIL,
          AppleAuthRequestScope.FULL_NAME
        ]
      });
      if(appleAuthRequestResponse['realUserStatus']){
        
        // Create a Firebase credential from the response
        const { identityToken, nonce } = appleAuthRequestResponse;
        const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
        auth().signInWithCredential(appleCredential).then( async (response) => {
        
          const data = {
            gender: gender.toLowerCase() == 'male' || gender.toLowerCase() == 'female' ? gender.toLowerCase() : 'other',
            birthday: '08/22/1990',
            url: 'https://i.postimg.cc/FzBmZRCv/silhouette.png',
            uid: response.user.uid,
            name: appleAuthRequestResponse.fullName.givenName
          }
          //console.log(data)
          const userInfo = await firestore().collection('userinfo').doc(data.uid).get();
          const deviceid = await requestUserPermission() || '';
            //add device id here
         
          userInfo.ref.set({
              name: data.name,
              birthday: userInfo.data().birthday || '',
              image: userInfo.data().image || data.url,
              orientation: o,
              gender: data.gender,
              applelogin: true,
              deviceID: deviceid
          });
           
          
          navigate('LoggedInNav');
        
        })
      }
    }catch(error){
      if(error.code === AppleAuthError.CANCELED){
        
      }
      if(error.code === AppleAuthError.FAILED){
        Alert.alert('Touch ID Wrong');
      }
      if(error.code === AppleAuthError.INVALID_RESPONSE){
        Alert.alert('Touch ID Wrong');
      }
      if(error.code === AppleAuthError.NOT_HANDLED){

      }
      if(error === AppleAuthError.UNKNOWN){
        Alert.alert('Touch ID Wrong');
      }
    }
    
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  appleButton: {
    width:300,
    height: 50,
    margin:10
  },
  facebook: {
    backgroundColor: '#3b5998',
    height:50,
    padding: 10,
    width:300,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius:5
  },
  main:{
    flex:1
  }
})