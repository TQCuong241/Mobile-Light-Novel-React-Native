import { Stack } from "expo-router"

export default function Layout() {

  return (  
    <Stack> 
      <Stack.Screen name="filter" options={{ headerShown: false }} />
      <Stack.Screen name="mota" options={{ headerShown: false }} />
      <Stack.Screen name="read" options={{ headerShown: false }} />
      <Stack.Screen name="search" options={{ headerShown: false }} />
      <Stack.Screen name="naptien" options={{ headerShown: false }} />
      <Stack.Screen name="lsnaptien" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  )
}
