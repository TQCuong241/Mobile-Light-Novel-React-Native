import { Stack } from "expo-router"

export default function Layout() {

  return (  
    <Stack> 
      <Stack.Screen name="dsTruyen" options={{ headerShown: false }} />
      <Stack.Screen name="upChuong" options={{ headerShown: false }} />
    </Stack>
  )
}
