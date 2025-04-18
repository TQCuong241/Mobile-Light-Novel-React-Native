import { StyleSheet, TextInput, View, TouchableOpacity, Text } from 'react-native'
import React, { useState } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

const InputPassword = ({ value, onChangeText, placeholder }: Props) => {
  const [secureText, setSecureText] = useState(true);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureText}
      />
      <TouchableOpacity onPress={() => setSecureText(!secureText)} style={styles.icon}>
        <Ionicons name={secureText ? 'eye-outline' : 'eye-off-outline'} size={24} color="#888" />
      </TouchableOpacity>
    </View>
  )
}

export default InputPassword

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    height: 55,
    marginHorizontal: 20,
    backgroundColor: '#f2f2f3',
    alignItems: 'center',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    padding: 10,
  }
});
