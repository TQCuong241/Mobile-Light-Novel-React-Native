import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons'

type Porps = {
    onPress: () => void
    theme: string
}

const ButtonBack = ({onPress, theme} : Porps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btn}>
      <Ionicons name='chevron-back-outline' size={30} color={theme === 'light' ? 'black' : 'white'}/>
      <Text style={[theme === 'light' ? styles.textLight : styles.textDark]}>Quay lại</Text>
    </TouchableOpacity>
  )
}

export default ButtonBack

const styles = StyleSheet.create({
    btn: {
        flexDirection: 'row', 
        width: 100,
        alignItems: 'center',
        marginTop: 5,
        marginLeft: 10
    },
    textLight: {
        color: 'black'
    },
    textDark: {
        color: 'white'
    }
})