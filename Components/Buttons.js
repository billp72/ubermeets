'use strict'
import React, {Component} from 'react'
import {
    Text, TouchableHighlight, StyleSheet, View
} from 'react-native'
import PropTypes from "prop-types";

class Buttons extends Component {
    
    render() {
        const {
            btn1,
            btn2,
            btn1Func,
            btn2Func
        } = this.props;

        return (
          <View style={styles.container}>
             <View>
                 <TouchableHighlight style={styles.btn} activeOpacity={0.4} underlayColor="#F5F5F5" onPress={btn1Func}>
                     <Text>{btn1}</Text>
                </TouchableHighlight>
            </View>
             <View>
                 <TouchableHighlight style={styles.btn} activeOpacity={0.4} underlayColor="#F5F5F5" onPress={btn2Func}>
                     <Text>{btn2}</Text>
                </TouchableHighlight>
            </View>
          </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width:"90%",
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1
    },
    btn: {
        width:"100%",
        backgroundColor:"white",
        padding:10,
        borderRadius: 10,
        borderWidth: 1,
    }
});

export default Buttons;