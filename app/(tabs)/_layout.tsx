"use client"

import React from "react"
import { Tabs } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "react-native"
import Colors from "../../constants/Colors"

export default function TabLayout() {
  const { user } = useAuth();
  
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.background
        },
        tabBarStyle: { display: 'none' }
      }}
    >
      <Tabs.Screen 
        name="index"
        options={{
          href: user ? undefined : null
        }}
      />
    </Tabs>
  );
}

