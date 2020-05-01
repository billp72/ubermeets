'use strict'
import React, {Component} from 'react'
import {
    Text, Button, StyleSheet, View
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
             <View style={styles.btn}><Button color="#841584" title={btn1} onPress={btn1Func} /></View>
             <View style={styles.btn}><Button color="#841584" title={btn2} onPress={btn2Func} /></View>
          </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1
    },
    btn: {
        width:'50%',
        height:'1%'
    }
});

export default Buttons;