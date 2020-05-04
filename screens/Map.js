'use strict'
import React, { Component } from 'react'
import {
    Text, StyleSheet, View, Image, Animated, Dimensions, TouchableHighlight
} from 'react-native'
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import Geolocation from '@react-native-community/geolocation';
import auth from '@react-native-firebase/auth';
import firestore, {firebase} from '@react-native-firebase/firestore';
import { GeoFirestore } from 'geofirestore';
import { userServices } from '../services/UserServices';

const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = 0.0421;
const LATITUDE = 15.326572;
const LONGITUDE = -76.157227;

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;


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
    
    async componentDidMount () {
        this._isMounted = true;
        const _this = this;
        const userobj = auth().currentUser;
        const orientation = await this.geofirestore.collection('orientation').doc(userobj.uid).get();
        userobj.gender = userobj.gender || 'butch'//remove
        this.setState({
            token: userobj.uid,
            gender:userobj.gender,
            orientation: orientation.data().orientation
        })

        const userInfo = await firestore().collection('userinfo').doc(this.state.token).get();
        this.setState({
            name: userInfo.data().name,
            image: userInfo.data().image,
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
                     position.coords.longitude), radius: 150 
                    });
                
                 GeoQuery.get().then((GeoQuerySnapshot) => {
                    if(this._isMounted){
                       this.state.markers.length = 0;
                       GeoQuerySnapshot.forEach(d => {
                          userServices.checkUser(d.id, this.state.token).then(response => {
                            if(!response){
                              let res = d.data();
                              res.id = d.id; 
                              this.setState(state => {
                                state.markers.push(res)
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
              enableHighAccuracy: true,
              timeout: 20000,
              maximumAge: 1000,
              distanceFilter: 10
            }
        );
        
        this.animation.addListener(({ value }) => {
            let normalizeCoords = {}
            let index = Math.floor(value / CARD_WIDTH + 0.3); // animate 30% away from landing on the next item
            if (index >= this.state.markers.length) {
              index = this.state.markers.length - 1;
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
        this._watchId = Geolocation.getCurrentPosition( async (position) => {
          
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
                  gender: userInfo.data().gender
              })
           }
           const GeoQuery = this.GeoCollectionReference.near(
              { 
               center: new firestore.GeoPoint(position.coords.latitude,
               position.coords.longitude), radius: 150 
            });

            GeoQuery.get().then((GeoQuerySnapshot) => {
              if(this._isMounted){
                this.state.markers.length = 0;
                GeoQuerySnapshot.forEach(d => {
                    userServices.checkUser(d.id, this.state.token).then(response => {
                       if(!response){
                          let res = d.data();
                          res.id = d.id; 
                          this.setState(state => {
                              state.markers.push(res)
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
            })
        })
    }

    getMapRegion = () => ({
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    });

    tinderScreen = (data) => {
        data.from = {
            token: this.state.token,
            name: this.state.name,
            coordinates: new firestore.GeoPoint(this.state.latitude, this.state.longitude),
            image: this.state.image
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
            const scale = this.animation.interpolate({
              inputRange,
              outputRange: [1, 2.5, 1],
              extrapolate: "clamp",
            });
            const opacity = this.animation.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: "clamp",
            });
            return { scale, opacity };
        });
       
        return (
          <View style={styles.container}>
            <MapView
               ref={map => this.map = map}
               provider={PROVIDER_GOOGLE}
               region={this.getMapRegion()}
               style={{ ...StyleSheet.absoluteFillObject }}
            >
                {this.state.markers.map((marker, index) => {
                    const scaleStyle = {
                        transform: [
                          {
                            scale: interpolations[index].scale,
                          },
                        ],
                      };
                      const opacityStyle = {
                        opacity: interpolations[index].opacity,
                      };
                    return(
                        <MapView.Marker
                            key={index} 
                            coordinate={{longitude: marker.coordinates._longitude, latitude: marker.coordinates._latitude}}
                        >
                            <Animated.View style={[styles.markerWrap, opacityStyle]}>
                                <Animated.View style={[styles.ring, scaleStyle]} />
                                    <View style={styles.marker} />
                            </Animated.View>
                        </MapView.Marker>
                    )
                })}
                </MapView>
                <Animated.ScrollView
                    horizontal
                    scrollEventThrottle={1}
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_WIDTH}
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
                    style={styles.scrollView}
                    contentContainerStyle={styles.endPadding}
                    >
                    {this.state.markers.map((marker, index) => (
                        <View style={styles.card} key={index}>
                            <Image
                                source={{uri:marker.image}}
                                style={styles.cardImage}
                                resizeMode="cover"
                            />
                            <View style={styles.textContent}>
                                <TouchableHighlight activeOpacity={0.4} underlayColor="#F5F5F5" 
                                  onPress={(e) => {e.stopPropagation(); this.tinderScreen(marker)}}>
                                  <Text 
                                        numberOfLines={1} 
                                        style={styles.cardtitle}>
                                    {marker.name}
                                  </Text> 
                                </TouchableHighlight>
                            </View>
                            
                        </View>
                    ))}
                    </Animated.ScrollView>
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
    card: {
        padding: 10,
        elevation: 2,
        backgroundColor: "#FFF",
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { x: 2, y: -2 },
        height: CARD_HEIGHT,
        width: CARD_WIDTH,
        overflow: "hidden",
      },
      cardImage: {
        flex: 3,
        width: "100%",
        height: "100%",
        alignSelf: "center",
      },
      textContent: {
        flex: 1
      },
      cardtitle: {
        fontSize: 12,
        marginTop: 5,
        fontWeight: "bold",
        color:"#0000EE",
      },
      cardDescription: {
        fontSize: 12,
        color: "#444",
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
      },
});

export default Map;