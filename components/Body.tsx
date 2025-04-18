import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import React, {ReactNode} from 'react'

type Porps = {
    children: ReactNode,
    theme: string,
    styles?: ViewStyle
}

const Body = ({children, theme, styles} : Porps) => {
  return (
    <>
        <View style={[{flex: 1},styles, theme === 'dark' ? defaultStyles.dark : defaultStyles.light]}>{children}</View>
    </>
  )
}

export default Body

const defaultStyles  = StyleSheet.create({
    dark: {
        backgroundColor: '#1e1e1e',
    },
    light: {
        backgroundColor: '#fff',
    },
})