import { Stack } from "expo-router"

export default function Layout() {

  return (  
    <Stack> 
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signUp" options={{ headerShown: false }} />
    </Stack>
  )
}
