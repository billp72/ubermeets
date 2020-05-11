'use strict'
import React, { Component } from 'react'
import {
    Text, StyleSheet, View, Image, Animated, Dimensions,TouchableHighlight, Button, Alert
} from 'react-native'
import auth from '@react-native-firebase/auth';
import firestore, {firebase} from '@react-native-firebase/firestore';
const emitter = require('tiny-emitter/instance');

const FIREBASE_REF_MESSAGES = firestore().collection('chat');
const FIREBASE_REF_MEET = firestore().collection('meets');

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;

class Matches extends Component {
    constructor(props){
        super(props)
        this.state = {}
        this.animation = new Animated.Value(0);
    }

    componentDidMount(){

        this.unsubscribe = auth().onAuthStateChanged((user) => {
            let ur = user
            this.setState({
                id: ur.uid
            })

            let fireUnsubscribe = firestore().collection('meets').doc(ur.uid).onSnapshot(
                (snapShot) => {
                    this.setState({data:[]})
                    let match = snapShot.data();
                    this.setState({
                        ...match,
                        'fireUnsubscribe': fireUnsubscribe
                   })
            }).bind(this); 
        });

        emitter.once('message', this.getMessages, this);
    }

    getMessages(params){
        if(params){
            this.state.data.map((user, index) => {
                if(user.id === params.data.id){
                    this.state.data[index].msg = true;
                }
            })
            this.setState({
                ...this.state.data
            })
        }
    }

    parseObject(str){
        try{
            var obj = JSON.parse(str);
            return obj;
        } catch(e){
            return {};
        }
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.state.fireUnsubscribe();
    }

    static navigationOptions = {
        swipeEnabled: false
    };

    chat = (user, index) => {
        if(user.msg){
            this.state.data[index].msg = false;
            this.setState({
                ...this.state.data
            })
        }
        this.props.navigation.navigate('Chat', user);  
    }

    remove = (user, index) => {
        Alert.alert(
            "Remove",
            "Are your sure you want to remove this match?",
            [
              {
                text: "YES",
                onPress: () => {this.removed(user, index)}
              },
              { 
                text: "NO", 
                style: "cancel"
              }
            ],
            { cancelable: false }
          )
    }

    removed = (user, index) => {
        FIREBASE_REF_MEET.doc(user.id).get().then((res) => {
            const data = res.get('data').splice(1, index)
            FIREBASE_REF_MEET.doc(user.id).set({'data':data})
        });

        FIREBASE_REF_MEET.doc(this.state.id).get().then((res2) => {
            res2.get('data').forEach((c, i) => {
                if(c.chatkey == user.chatkey){
                    const data = res2.get('data').splice(1, i);
                    FIREBASE_REF_MEET.doc(this.state.id).set({'data':data})
                }
            })
        })
  
        FIREBASE_REF_MESSAGES.doc(user.chatkey).delete();
    }

    render() {

      return (
        <View style={styles.container}>       
            <Animated.ScrollView
                vertical
                scrollEventThrottle={1}
                showsVerticalScrollIndicator={false}
                snapToInterval={CARD_HEIGHT}
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
                {this.state.data && this.state.data.map((user, index) => (
                    
                    <View style={[styles.card, user.msg ? {backgroundColor:'#ced3ee'} : {backgroundColor:'#FFF'}]} key={index}>
                        <TouchableHighlight activeOpacity={0.4} underlayColor="#F5F5F5" 
                            onPress={(e) => {e.stopPropagation(); this.chat(user,index)}}>
                                <Text 
                                    numberOfLines={1} 
                                    style={styles.cardtitle}>
                                {user.name}
                                </Text> 
                            </TouchableHighlight>
                        <Image
                            source={{uri:user.image}}
                            style={styles.cardImage}
                            resizeMode="cover"
                        />
                        <View style={styles.textContent}>
                            
                            <Button color="#841584" title="Remove" onPress={(e) => {e.stopPropagation(); this.remove(user, index)}} />
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
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
    },
    scrollView: {
        position: "absolute",
        top: 30,
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
        fontSize: 16,
        marginTop: 5,
        fontWeight: "bold",
        color:"#0000EE",
      }
});

export default Matches;