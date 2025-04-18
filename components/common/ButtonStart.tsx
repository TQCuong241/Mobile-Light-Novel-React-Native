import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import React from 'react'

type Porps = {
    name: string
    onPress: () => void
    theme: string
    styles?: ViewStyle
}

const ButtonStart = ({name, onPress, theme, styles} : Porps) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles, defaultStyles.btn, theme === 'dark' ? defaultStyles.btnDark : defaultStyles.btnLight]}>
      <Text style={[defaultStyles.btnText, theme === 'dark' ? defaultStyles.btnDarkText : defaultStyles.btnLightText]}>{name}</Text>
    </TouchableOpacity>
  )
}

export default ButtonStart

const defaultStyles = StyleSheet.create({
    btn: {
        borderRadius: 7,
        paddingVertical: 15,
        paddingHorizontal: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnDark : {
        backgroundColor: '#FCAFB7'
    },
    btnLight: {
        backgroundColor: '#2A2A46',
    },
    btnText: {
        fontWeight: 'bold',
        fontSize: 20,
        fontFamily: 'serif',
        letterSpacing: 1,
    },
    btnDarkText: {

    },
    btnLightText: {
        color: 'white'
    },
})