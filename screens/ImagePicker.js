//ImagePicker
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  ScrollView
} from 'react-native'
import Footer from '../Components/Footer';
import firestore, {firebase} from '@react-native-firebase/firestore';
import ImagePicker from 'react-native-image-picker';
import '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
//import 'react-native-get-random-values';
//import { v4 as uuidv4 } from 'uuid';

const options = {
    title: 'Select Image',
    storageOptions: {
      skipBackup: true,
      path: 'images'
    }
  };
 
  const userobj = auth().currentUser;

  export default class App extends Component {
    state = {
      imgSource: '',
      uploading: false,
      progress: 0,
      images: ''
    };

    async componentDidMount() {
      let img;
      const userInfo = await firestore().collection('userinfo').doc(userobj.uid).get();
      img = userInfo.data().image || '';
      this.setState({
        images: img
      })
      
    }
    /**
     * Select image method
     */
    pickImage = () => {
      ImagePicker.showImagePicker(options, response => {
        if (response.didCancel) {
          alert('You cancelled image picker 😟');
        } else if (response.error) {
          alert('And error occured: ', response.error);
        } else {
          const source = { uri: response.uri };
          this.setState({
            imgSource: source,
            imageUri: response.uri
          });
        }
      });
    };
    
    uploadImage = () => {
      const ext = this.state.imageUri.split('.').pop(); // Extract image extension
      const filename = `profile.${ext}`; // Generate unique nam
      this.setState({ uploading: true });
      firebase
        .storage()
        .ref(`images/${userobj.uid}/${filename}`)
        .putFile(this.state.imageUri)
        .on(
          firebase.storage.TaskEvent.STATE_CHANGED,
           snapshot => {
            let state = {};
            state = {
              ...state,
              progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100 // Calculate progress percentage
            };
            if (snapshot.state === firebase.storage.TaskState.SUCCESS) {
             
                snapshot.ref.getDownloadURL().then(async uploadURL => {

                state = {
                  ...state,
                  uploading: false,
                  imgSource: '',
                  imageUri: '',
                  progress: 0,
                  images: uploadURL
                };
          
                const userInfo = await firestore().collection('userinfo').doc(userobj.uid).get();
                
                userInfo.ref.update({
                  'image': uploadURL
                })
              })
            }
            this.setState(state);
          },
          error => {
            unsubscribe();
            alert('Sorry, Try again.');
          }
        );
    };

    render() {
      const { uploading, imgSource, progress, images } = this.state;
      const windowWidth = Dimensions.get('window').width;
      const disabledStyle = uploading ? styles.disabledBtn : {};
      const actionBtnStyles = [styles.btn, disabledStyle];
      return (
        <View style={styles.container}>
          <Footer
                centerComponent={{ icon: 'home', color: '#fff', 
                'onPress': () => this.props.navigation.navigate('Profile'), size:36}}
                 containerStyle={{
                    backgroundColor: '#3D6DCC',
                    justifyContent: 'center',
                    bottom:0,
                  }}     
            />
          <Text style={styles.welcome}>Image Upload </Text>
          <Text style={styles.instructions}>Hello 👋, Let us upload an Image</Text>
          {/** Select Image button */}
          <TouchableOpacity style={styles.btn} onPress={this.pickImage}>
            <View>
              <Text style={styles.btnTxt}>Pick image</Text>
            </View>
          </TouchableOpacity>
          {/** Display selected image */}
          {this.state.imgSource ? (
            <Image
              source={
                {uri: images}
              }
              style={styles.image}
            />
          ) : (
            <Text>
              {"\n"}
            </Text>
          )}
          
          <TouchableOpacity
              style={actionBtnStyles}
              onPress={this.uploadImage}
              disabled={uploading}
            >
              <View>
                {uploading ? (
                  <Text style={styles.btnTxt}>Uploaded</Text>
                ) : (
                  <Text style={styles.btnTxt}>Upload image</Text>
                )}
              </View>
          </TouchableOpacity>
        </View>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5FCFF'
    },
    welcome: {
      fontSize: 20,
      textAlign: 'center',
      margin: 10
    },
    instructions: {
      textAlign: 'center',
      color: '#333333',
      marginBottom: 5
    },
    btn: {
      borderWidth: 1,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 10,
      paddingBottom: 10,
      borderRadius: 20,
      borderColor: 'rgba(0,0,0,0.3)',
      backgroundColor: 'rgb(68, 99, 147)'
    },
    btnTxt: {
      color: '#fff',
      fontWeight:'500'
    },
    image: {
      marginTop: 20,
      marginBottom: 20,
      minWidth: 200,
      height: 200
    }
  });