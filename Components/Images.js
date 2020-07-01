//images component
import React, { PureComponent } from 'react';
import {
    Text, StyleSheet, View, Image, TouchableHighlight, Alert, Dimensions
} from 'react-native'
import { flagContent } from '../services/SendMessage';

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = height / 4;
const CARD_WIDTH = CARD_HEIGHT - 50;

class Images extends PureComponent {

    flag = (data) => {
      Alert.alert(
        "FLAG",
        "Are your sure you want to flag "+data.name+"?",
        [
          {
            text: "YES",
            onPress: () => {flagContent(data)}
          },
          { 
            text: "NO", 
            style: "cancel"
          }
        ],
        { cancelable: false }
      )
      
    }

    render() { 
        return (
            <View style={styles.card}>
            <Image
                source={{uri:this.props.itm.item.image}}
                style={styles.cardImage}
                resizeMode="cover"
            />
            <View style={styles.textContent}>
                <TouchableHighlight activeOpacity={0.4} underlayColor="#F5F5F5" 
                  onPress={(e) => {e.stopPropagation(); this.props.tinder(this.props.itm.item)}}>
                  <Text 
                        numberOfLines={1} 
                        style={styles.cardtitle}>
                    {this.props.itm.item.name}
                  </Text> 
                </TouchableHighlight>
            </View>
            <TouchableHighlight activeOpacity={0.4} underlayColor="#F5F5F5" 
                  onPress={(e) => {e.stopPropagation(); this.flag(this.props.itm.item)}}>
                    <Image source={require('../assets/flag.png')} style={{width:20,height:20}} />
            </TouchableHighlight>
      </View>
     )
    }
}

const styles = StyleSheet.create({
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
      textContent: {
        flex: 1
      }
});

export default Images;