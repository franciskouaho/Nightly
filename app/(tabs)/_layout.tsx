"use client"

import React from "react"
import { Tabs } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useColorScheme } from "react-native"
import Colors from "../../constants/Colors"

export default function TabLayout() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "dark"
  const colors = Colors[colorScheme]
  
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.gradient.purple.frome
        },
        tabBarStyle: { display: 'none' }
      }}
    >
      <Tabs.Screen 
        name="index"
        options={{
          href: isAuthenticated ? undefined : null
        }}
      />
    </Tabs>
  );
}

