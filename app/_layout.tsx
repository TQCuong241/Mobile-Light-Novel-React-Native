import { Stack } from "expo-router"
import { useFonts } from 'expo-font'

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'frank': require('@/assets/fonts/FrankRuhlLibre-VariableFont_wght.ttf'),
    'Playfair': require('@/assets/fonts/PlayfairDisplay-VariableFont_wght.ttf'),
    'Imperial Script': require('@/assets/fonts/ImperialScript-Regular.ttf'),
    'Charm': require('@/assets/fonts/Charm-Regular.ttf'),
    'Waterfall': require('@/assets/fonts/Waterfall-Regular.ttf'),
  })

  if (!fontsLoaded) {
    return null
  }

  return (  
    <Stack       
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 150,
        presentation: 'modal',
        gestureEnabled: true,
        animationMatchesGesture: true
      }}
    > 
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(screens)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(admins)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found"/>
    </Stack>
  )
}