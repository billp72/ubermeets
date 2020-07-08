'use strict'
import React, { Component } from 'react'
import Statusbar from '../Components/IosStatusBar'
import {
    StyleSheet, View, Animated, Dimensions, FlatList
} from 'react-native'
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Geolocation from '@react-native-community/geolocation';
import auth from '@react-native-firebase/auth';
import firestore, {firebase} from '@react-native-firebase/firestore';
import { GeoFirestore } from 'geofirestore';
import { userServices } from '../services/UserServices';

import Images          from '../Components/Images';
const emitter = require('tiny-emitter/instance');

const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = 0.0421;
const LATITUDE = 40.7367;
const LONGITUDE = -73.9899;

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class Map extends Component {
    _isMounted = false;
     unsubscribe = null;
    _watchId;
    constructor(props) {
        super(props);
        const firestoreForDefaultApp = firebase.firestore();
        this.geofirestore = new GeoFirestore(firestoreForDefaultApp);
        this.GeoCollectionReference = null;
        this.GeoCollectionReferenceSet = null;
        this.index = 0;
        this.animation = new Animated.Value(0);
        this.state = {
            latitude: LATITUDE,
            longitude: LONGITUDE,
            token: null,
            image:'',
            name: '',
            gender:null,
            orientation:null,
            error: null,
            markers: []
        };
        
    }

    shouldComponentUpdate(nextProps, nextState) {
      return nextState.longitude !== undefined &&
             nextState.latitude !== undefined 
      
    }

    async componentDidMount () {
        this._isMounted = true;
        const _this = this;
        const userobj = auth().currentUser;

        this.setState({
            token: userobj.uid
        })

        const userInfo = await firestore().collection('userinfo').doc(userobj.uid).get();
    
        this.setState({
            name: userInfo.data().name,
            image: userInfo.data().image,
            orientation: userInfo.data().orientation,
            gender: userInfo.data().gender,
            deviceID: userInfo.data().deviceID,
            birthday: userInfo.data().birthday
        })
  
        if(this.state.orientation === 'straight' && 
           this.state.gender === 'male' ||
           this.state.gender === 'female'){
            this.GeoCollectionReferenceSet = this.geofirestore.collection(this.state.gender);
            if(this.state.gender === 'male'){
              this.GeoCollectionReference = this.geofirestore.collection('female');
            }else if(this.state.gender === 'female'){
              this.GeoCollectionReference = this.geofirestore.collection('male');
            }
        }
        if(this.state.orientation === 'gay' 
          || this.state.gender !== 'male' 
          && this.state.gender !== 'female'){
          this.GeoCollectionReferenceSet = this.geofirestore.collection('location');
          this.GeoCollectionReference = this.geofirestore.collection('location');
        }
       
       this.props.navigation.addListener('willFocus', (route) => { 
          if(route.state.routeName === 'Map'){ 
            _this.getLatestMarkers();
            emitter.emit('status', {status:'yes'})
          } 
       })

        this._watchId = Geolocation.watchPosition(
            async position => {
                
                const { latitude, longitude } = position.coords;
               
                const document = await this.GeoCollectionReferenceSet.doc(this.state.token).get();
                if(document && document.exists){
                  document.ref.update({
                    coordinates: new firestore.GeoPoint(position.coords.latitude, position.coords.longitude)
                  })
                }

                const GeoQuery = this.GeoCollectionReference.near(
                    { 
                     center: new firestore.GeoPoint(position.coords.latitude,
                     position.coords.longitude), radius: 30 
                    });
                
                 GeoQuery.get().then((GeoQuerySnapshot) => {
                    if(this._isMounted){
                       let newstate = [];
                       GeoQuerySnapshot.forEach(d => {
                          userServices.checkUser(d.id, this.state.token).then(response => {
                            if(!response){
                              let res = d.data();
                              res.id = d.id; 
                              newstate.push(res)
                              this.setState(state => {
                                state.markers = newstate
                                return state;
                              });
                            }
                          }).catch(error => {
                              console.log(error)
                          })
                       })
                     }    
                  },(error) => {
                    console.log(error)
                  });

                this.setState({
                    latitude,
                    longitude
                });
            }, 
            error => console.log(error),
            { 
              enableHighAccuracy: false,
              //maximumAge: 0,
              //timeout: 60000,
              distanceFilter: 10
            }
        );
        
        this.animation.addListener(({ value }) => {
            let normalizeCoords = {}
            let index = Math.floor(value / CARD_WIDTH + 0.3); // animate 30% away from landing on the next item
            if (index >= this.state.markers.length) {
              let statelength = this.state.markers.length;
              index = statelength - 1
            }
            if (index <= 0) {
              index = 0;
            }
      
            clearTimeout(this.regionTimeout);
            this.regionTimeout = setTimeout(() => {
              if (this.index !== index) {
                this.index = index;
                const { coordinates } = this.state.markers[index];
                normalizeCoords.latitude = coordinates._latitude;
                normalizeCoords.longitude = coordinates._longitude;
                this.map.animateToRegion(
                  {
                    ...normalizeCoords,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA,
                  },
                  350
                );
              }
            }, 10);
          });
    }

    static navigationOptions = {
      swipeEnabled: false
    };

    componentWillUnmount(){
        if(this.unsubscribe) this.unsubscribe();
        Geolocation.clearWatch(this._watchId);
        this._isMounted = false;
    }

    getLatestMarkers = () => {
        Geolocation.getCurrentPosition( async (position) => {
          
            this.setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })

           const document = await this.GeoCollectionReferenceSet.doc(this.state.token).get();

           if(!document.exists){
              const userInfo = await firestore().collection('userinfo').doc(this.state.token).get();
              document.ref.set({
                  coordinates: new firestore.GeoPoint(position.coords.latitude, position.coords.longitude),
                  name: userInfo.data().name,
                  image: userInfo.data().image,
                  orientation: userInfo.data().orientation,
                  gender: userInfo.data().gender,
                  deviceID: userInfo.data().deviceID,
                  birthday: userInfo.data().birthday
              })
           }
           const GeoQuery = this.GeoCollectionReference.near(
              { 
               center: new firestore.GeoPoint(position.coords.latitude,
               position.coords.longitude), radius: 30 
            });

            GeoQuery.get().then((GeoQuerySnapshot) => {
              if(this._isMounted){
                let newstate = [];
                GeoQuerySnapshot.forEach(d => {
                    userServices.checkUser(d.id, this.state.token).then(response => {
                       if(!response){
                          let res = d.data();
                          res.id = d.id; 
                          newstate.push(res);
                          this.setState(state => {
                              state.markers = newstate
                              return state;
                          });
                        }
                     }).catch(error => {
                         console.log(error)
                     })
                 })
               } 
            }, (error) => {
              console.log(error)
            },
             {
              enableHighAccuracy: false,
              //timeout: 60000,
              //maximumAge:0
              distanceFilter: 2
             }
            )
        })
    }

    getMapRegion = () => ({
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    });
    //send device id
    tinderScreen = (data) => {
      data.from = {
          token: this.state.token,
          name: this.state.name,
          coordinates: new firestore.GeoPoint(this.state.latitude, this.state.longitude),
          image: this.state.image,
          deviceID: this.state.deviceID,
          orientation: this.state.orientation,
          birthday: this.state.birthday
      }
      this.props.navigation.navigate('Meet', data);
   }

    render() {
          
        const interpolations = this.state.markers.map((marker, index) => {
            const inputRange = [
              (index - 1) * CARD_WIDTH,
              index * CARD_WIDTH,
              ((index + 1) * CARD_WIDTH),
            ];
            
            const opacity = this.animation.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: "clamp",
            });
            return { opacity };
        });
       
        return (
          
          <View style={styles.container}>
            <Statusbar barStyle="light-content" />
            <MapView
               ref={map => this.map = map}
               provider={PROVIDER_GOOGLE}
               region={this.getMapRegion()}
               style={{ ...StyleSheet.absoluteFillObject }}
            >
                {this.state.markers.map((marker, index) => {
                    
                      const opacityStyle = {
                        opacity: interpolations[index].opacity,
                      };
                    return(
                        <MapView.Marker
                            key={index}
                            tracksViewChanges={false} 
                            coordinate={{longitude: marker.coordinates._longitude, latitude: marker.coordinates._latitude}}
                        >
                            <Animated.View style={[styles.markerWrap, opacityStyle]}>
                                <Animated.View style={[styles.ring]} />
                                    <View style={styles.marker} />
                            </Animated.View>
                        </MapView.Marker>
                    )
                })}
                </MapView>
                <AnimatedFlatList
                    horizontal
                    initialNumToRender={7}
                    showsHorizontalScrollIndicator={false}
                    data={this.state.markers}
                    renderItem={(item) => <Images itm={item} tinder={this.tinderScreen} />}
                    onScroll={Animated.event(
                      [
                      {
                          nativeEvent: {
                          contentOffset: {
                              x: this.animation,
                          },
                          },
                      },
                      ],
                      { useNativeDriver: true }
                  )}
                    keyExtractor={marker => marker.id}
                    style={styles.scrollView}
                    contentContainerStyle={styles.endPadding}
                />
                    
              </View>
            )
          }
       }

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollView: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        paddingVertical: 10,
    },
    endPadding: {
        paddingRight: width - CARD_WIDTH,
    },
    markerWrap: {
      alignItems: "center",
      justifyContent: "center",
    },
    marker: {
      width: 10,
      height: 10,
      borderRadius: 4,
      backgroundColor: "rgba(130,4,150, 0.9)",
    },
    ring: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "rgba(130,4,150, 0.3)",
      position: "absolute",
      borderWidth: 1,
      borderColor: "rgba(130,4,150, 0.5)",
    }
});

export default Map;