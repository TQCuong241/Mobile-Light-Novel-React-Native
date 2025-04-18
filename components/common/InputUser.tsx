import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'

type Props = {
    value: string
    onChangeText: (text: string) => void
    placeholder?: string
    secureTextEntry?: boolean
}

const InputUser = ({value, onChangeText, placeholder, secureTextEntry = false }: Props) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
      />
    </View>
  )
}

export default InputUser

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    marginHorizontal: 20,
    height: 55,
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f2f2f3'
  }
})
