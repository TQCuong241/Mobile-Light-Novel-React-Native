import { Tabs } from 'expo-router';
import { View, Animated, StyleSheet, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import useThemeStore from '@/config/useThemeStore';
import { useEffect, useRef, useState } from 'react';
import useUser from '@/hooks/useUser';
import { database_id, databases, thong_bao_id } from '@/services/dataAppwrite';
import { Query } from 'react-native-appwrite';

type TabIconProps = {
  focused: boolean;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  theme: 'light' | 'dark';
  notificationCount?: number
};

export default function TabLayout() {
  const { theme } = useThemeStore()
  const { user } = useUser()
  const [notificationCount, setNotificationCount] = useState(0)
  
  useEffect(() => {
    load_thong_bao()
    const interval = setInterval(load_thong_bao, 5000)
    return () => clearInterval(interval)
  }, [user])

  const load_thong_bao = async () => {
    try{
      const result = await databases.listDocuments(
        database_id,
        thong_bao_id,
        [Query.equal('user_id', user.$id), Query.equal('trang_thai', 0), Query.select(['$id'])]
      )
      if (result.documents.length > 0){
        setNotificationCount(result.documents.length)
      }else{
        setNotificationCount(0)
      }
    }catch{}
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: theme === "light" ? "#fff" : "#1e1e1e",
          borderTopWidth: 0,
          height: 50,
          paddingBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="book"
        options={{
          title: 'Tủ sách',
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused}
              activeIcon="book-sharp" 
              inactiveIcon="book-outline"
              theme={theme}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="notification"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused}
              activeIcon="notifications-sharp" 
              inactiveIcon="notifications-outline"
              theme={theme}
              notificationCount={notificationCount}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused}
              activeIcon="home-sharp" 
              inactiveIcon="home-outline"
              theme={theme}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="setting"
        options={{
          title: 'Chức năng',
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused}
              activeIcon="settings-sharp" 
              inactiveIcon="settings-outline"
              theme={theme}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused}
              activeIcon="bag-sharp" 
              inactiveIcon="bag-outline"
              theme={theme}
            />
          ),
        }}
      />

    </Tabs>
  );
}

const TabIcon = ({ focused, activeIcon, inactiveIcon, theme, notificationCount = 0 }: TabIconProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.2 : 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
      <Animated.View 
        style={[
          styles.iconWrapper,
          {
            backgroundColor: focused 
              ? (theme === "light" ? "#673ab7" : "#bb86fc")
              : 'transparent',
            transform: [{ scale: scaleAnim }]
          },
          focused && styles.activeIconWrapper,
        ]}
      >
        <Ionicons 
          name={focused ? activeIcon : inactiveIcon} 
          size={focused ? 28 : 24}
          color={focused ? "#fff" : (theme === "light" ? "#888" : "#bbb")} 
        />
        {notificationCount > 0 && (
          <View style={[
            styles.badge,
            {
              backgroundColor: theme === "light" ? "#ff3b30" : "#ff453a",
            }
          ]}>
            <Text style={styles.badgeText}>
              {notificationCount > 99 ? '99+' : notificationCount}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
  iconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    marginBottom: 25,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 25,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});