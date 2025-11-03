"use client"

import React from "react"
import { Tabs, router, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "react-native"
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from "../../constants/Colors"

export default function TabLayout() {
  const { user } = useAuth();
  const pathname = usePathname();

  const isHome = pathname === '/(tabs)' || pathname === '/(tabs)/';
  const isLeaderboard = pathname === '/(tabs)/leaderboard';

  const CustomTabBar = () => {
    return (
      <View style={styles.customTabBar}>
        {/* Bouton Home */}
        <TouchableOpacity
          style={styles.roundButton}
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.8}
        >
          <View style={[
            styles.buttonGlassBackground,
            isHome && styles.buttonGlassBackgroundActive,
          ]}>
            <View style={styles.buttonGlassInner}>
              <View style={styles.buttonGlassHighlight} />
              <Ionicons size={28} name="home" color={isHome ? "#FFD700" : "white"} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Bouton Leaderboard */}
        <TouchableOpacity
          style={styles.roundButton}
          onPress={() => router.push('/(tabs)/leaderboard')}
          activeOpacity={0.8}
        >
          <View style={[
            styles.buttonGlassBackground,
            isLeaderboard && styles.buttonGlassBackgroundActive,
          ]}>
            <View style={styles.buttonGlassInner}>
              <View style={styles.buttonGlassHighlight} />
              <Ionicons size={28} name="trophy" color={isLeaderboard ? "#FFD700" : "white"} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <>
      <Tabs 
        screenOptions={{ 
          headerShown: false,
          tabBarStyle: { display: 'none' }
        }}
      >
        <Tabs.Screen 
          name="index"
        />
        <Tabs.Screen 
          name="leaderboard"
        />
        <Tabs.Screen 
          name="profil"
          options={{
            href: null
          }}
        />
        <Tabs.Screen 
          name="game/[id]"
          options={{
            href: null
          }}
        />
        <Tabs.Screen 
          name="settings/buy-assets/index"
          options={{
            href: null
          }}
        />
      </Tabs>
      <CustomTabBar />
    </>
  );
}

const styles = StyleSheet.create({
  customTabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  roundButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  buttonGlassBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(196, 30, 58, 0.8)', // Rouge glamour
    borderWidth: 1.5,
    borderColor: 'rgba(196, 30, 58, 0.4)',
    shadowColor: 'rgba(196, 30, 58, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  buttonGlassBackgroundActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.35)', // Doré
    borderColor: 'rgba(255, 215, 0, 0.6)',
  },
  buttonGlassInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 250, 240, 0.15)', // Ivoire
    position: 'relative',
    borderRadius: 30,
  },
  buttonGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(232, 180, 184, 0.15)', // Rose doux
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});

