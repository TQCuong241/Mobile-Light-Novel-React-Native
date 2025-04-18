import { Stack } from "expo-router"

export default function Layout() {

  return (  
    <Stack> 
      <Stack.Screen name="upTruyen" options={{ headerShown: false }} />
      <Stack.Screen name="(upChuong)" options={{ headerShown: false }} />
      <Stack.Screen name="duyetQuyen" options={{ headerShown: false }} />
      <Stack.Screen name="xinQuyen" options={{ headerShown: false }} />
    </Stack>
  )
}
