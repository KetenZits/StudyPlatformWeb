import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#C9984E',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
          backgroundColor: '#FFFFFF',
          borderWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 10,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={26} 
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="posts/post"
        options={{
          title: "Post",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'book' : 'book-outline'} 
              size={26} 
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="auth/login"
        options={{
          title: "Login",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'log-in' : 'log-in-outline'} 
              size={26} 
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="store/index"
        options={{
          title: "Store",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'storefront' : 'storefront-outline'} 
              size={26} 
              color={color}
            />
          )
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={26} 
              color={color}
            />
          )
        }}
      />
    </Tabs>
  )
}

export default _layout