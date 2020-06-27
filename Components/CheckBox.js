import React from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { TouchableOpacity, StyleSheet, Text, Linking } from 'react-native'

const EULA = () => {
    Linking.openURL('https://www.termsfeed.com/live/c00de54a-159b-4f1e-a459-d63870851784')
        .catch((err) => console.error('An error occurred', err));
}
const CheckBox = ({ selected, onPress, style, textStyle, size = 30, color = '#211f30', text = '', ...props}) => (
    <TouchableOpacity style={styles.checkBox} onPress={onPress} {...props}>
        <Icon
            size={size}
            color={color}
            name={ selected ? 'check-box' : 'check-box-outline-blank'}
        />
  
        <TouchableOpacity onPress={(e) => {e.stopPropagation(); EULA()}}><Text>{text}</Text></TouchableOpacity>
    </TouchableOpacity>
)

const styles = StyleSheet.create({
    checkBox: {
        flexDirection: 'row',
        alignItems: 'center'
      }
})

export default CheckBox