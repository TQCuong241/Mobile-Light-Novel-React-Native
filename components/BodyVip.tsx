import { ScrollView, StyleSheet, Text, View, ViewStyle, RefreshControl, RefreshControlProps } from 'react-native'
import React, { ReactNode } from 'react'
import { Stack } from 'expo-router'

type Porps = {
    children: ReactNode,
    theme: string,
    styles?: ViewStyle,
    refreshControl?: React.ReactElement<RefreshControlProps>
}

const BodyVip = ({ children, theme, styles, refreshControl }: Porps) => {
  return (
    <>
        <ScrollView 
            style={[styles, theme === 'dark' ? defaultStyles.dark : defaultStyles.light]} 
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
        >
            {children}
        </ScrollView>
    </>
  )
}

export default BodyVip

const defaultStyles = StyleSheet.create({
    dark: {
        backgroundColor: '#1e1e1e',
    },
    light: {
        backgroundColor: '#fff',
    },
})