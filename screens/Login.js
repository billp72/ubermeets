import React from 'react'
import { StyleSheet, View, Text, Image, Dimensions, Switch } from 'react-native'
import {facebookService} from '../services/FacebookService'
import auth from '@react-native-firebase/auth';
import firestore, {firebase} from '@react-native-firebase/firestore';
import Geolocation from '@react-native-community/geolocation';
import { GeoFirestore } from 'geofirestore';
//import { ScrollView } from 'react-native-gesture-handler';

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

 async componentDidMount(){
    Dimensions.addEventListener('change',(dimensions) => {
      this.setState({
        imageHeight: Math.round(dimensions.window.width >= 800 ? 
          dimensions.window.width / 16 : dimensions.window.width - 50),
      })
    })
 }

 setOrientation = async (value) => {
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
          {facebookService.makeLoginButton((accessToken, url) => {
            let orientation = this.state.toggle ? 'gay' : 'straight'
            this.login(accessToken, url, orientation)
          })}
        </View>
      </React.Fragment>
    )
  }

  login(accessToken, url, o) {
    const _this = this;
    auth().signInWithCredential(auth.FacebookAuthProvider.credential(accessToken)).then(async(result) => {
        //const user = auth().currentUser;
        result.user.gender = '';//remove
        const orientation = await firestore().collection('orientation').doc(result.user.uid).get();

        if(!orientation.exists){
          orientation.ref.set({
            orientation: o
          })
        }
        
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
        userInfo.ref.set({
          name: result.additionalUserInfo.profile.first_name,
          image: url,
          orientation: o,
          gender: result.user.gender
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
                    image: url,
                    orientation: o,
                    gender: result.user.gender
                })
            }

            _this.props.navigation.navigate('LoggedInNav');
              
        }).catch(function(error) {
            console.error(error)
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