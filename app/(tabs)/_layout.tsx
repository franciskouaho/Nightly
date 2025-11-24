"use client"

import React from "react"
import { Tabs, router, usePathname } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "react-native"
import { Platform, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from "../../constants/Colors"
import LinkAccountModal from "@/components/LinkAccountModal";
import { isAnonymousUser } from "@/services/linkAccount";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LINK_MODAL_SHOWN_KEY = "@nightly_link_modal_shown";

function CustomTabBar() {
  const pathname = usePathname();
  const isHome = pathname === '/(tabs)' || pathname === '/(tabs)/';
  const isCouples = pathname === '/(tabs)/couples';
  const isLeaderboard = pathname === '/(tabs)/leaderboard';

  const [selectedMode, setSelectedMode] = React.useState<'home' | 'couples'>(
    isCouples ? 'couples' : 'home'
  );

  // Synchroniser avec le pathname
  React.useEffect(() => {
    if (isCouples) {
      setSelectedMode('couples');
    } else if (isHome) {
      setSelectedMode('home');
    }
  }, [isHome, isCouples]);

  return (
    <View style={styles.customTabBar}>
      {/* Conteneur HOME/COUPLE */}
      <View style={styles.homeCoupleContainer}>
        {/* Bouton Home */}
        <TouchableOpacity
          style={[
            styles.homeCoupleButton,
            selectedMode === 'home' && styles.homeCoupleButtonActive
          ]}
          onPress={() => {
            setSelectedMode('home');
            router.push('/(tabs)');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.homeCoupleButtonContent}>
            <Ionicons size={22} name="home" color="white" />
            <Text style={styles.homeCoupleButtonText}>HOME</Text>
          </View>
        </TouchableOpacity>

        {/* Bouton Couple */}
        <TouchableOpacity
          style={[
            styles.homeCoupleButton,
            selectedMode === 'couples' && styles.homeCoupleButtonActive
          ]}
          onPress={() => {
            setSelectedMode('couples');
            router.push('/(tabs)/couples');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.homeCoupleButtonContent}>
            <Ionicons size={22} name="heart" color="white" />
            <Text style={styles.homeCoupleButtonText}>COUPLE</Text>
          </View>
        </TouchableOpacity>
      </View>

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
          <View style={[
            styles.buttonGlassInner,
            isLeaderboard && styles.buttonGlassInnerActive,
          ]}>
            {isLeaderboard && <View style={styles.buttonGlassHighlightActive} />}
            {!isLeaderboard && <View style={styles.buttonGlassHighlight} />}
            <Ionicons 
              size={28} 
              name="trophy" 
              color={isLeaderboard ? "#FFD700" : "white"} 
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const { user, restoreSession } = useAuth();
  const [showLinkModal, setShowLinkModal] = React.useState(false);

  // Vérifier si on doit afficher le modal de liaison
  React.useEffect(() => {
    const checkAndShowModal = async () => {
      try {
        // Attendre un peu pour laisser l'app se charger
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Vérifier si l'utilisateur est anonyme
        if (!isAnonymousUser()) {
          return;
        }

        // Vérifier si le modal a déjà été affiché
        const modalShown = await AsyncStorage.getItem(LINK_MODAL_SHOWN_KEY);

        if (!modalShown) {
          setShowLinkModal(true);
          // Marquer comme affiché (mais on peut le réafficher plus tard)
          await AsyncStorage.setItem(LINK_MODAL_SHOWN_KEY, new Date().toISOString());
        } else {
          // Si le modal a été affiché il y a plus de 7 jours, le réafficher
          const lastShown = new Date(modalShown);
          const daysSinceLastShown = (Date.now() - lastShown.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSinceLastShown > 7) {
            setShowLinkModal(true);
            await AsyncStorage.setItem(LINK_MODAL_SHOWN_KEY, new Date().toISOString());
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du modal de liaison:', error);
      }
    };

    if (user) {
      checkAndShowModal();
    }
  }, [user]);

  const handleLinkSuccess = async () => {
    setShowLinkModal(false);
    // Recharger la session pour mettre à jour le statut
    await restoreSession();
    // Ici on pourrait aussi déclencher l'attribution de l'abonnement gratuit
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
          name="couples"
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

      {/* Modal de liaison de compte */}
      <LinkAccountModal
        visible={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onLinkSuccess={handleLinkSuccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
  customTabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    zIndex: 1000,
  },
  homeCoupleContainer: {
    flexDirection: 'row',
    borderRadius: 30,
    padding: 4,
    height: 64,
    flex: 1,
    backgroundColor: 'rgba(196, 30, 58, 0.8)', // Match leaderboard color
    borderWidth: 1.5,
    borderColor: 'rgba(196, 30, 58, 0.4)',
    shadowColor: 'rgba(196, 30, 58, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  homeCoupleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    gap: 8,
  },
  homeCoupleButtonLeft: {
    // No specific left/right styles needed with the new padding layout
  },
  homeCoupleButtonRight: {
    // No specific left/right styles needed with the new padding layout
  },
  homeCoupleButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Active state
  },
  // Removed complex glass inner styles as they are replaced by the simpler design
  homeCoupleButtonGlassBackground: {
    display: 'none',
  },
  homeCoupleButtonGlassBackgroundActive: {
    display: 'none',
  },
  homeCoupleButtonGlassInner: {
    display: 'none',
  },
  homeCoupleButtonGlassInnerInactive: {
    display: 'none',
  },
  homeCoupleButtonGlassInnerActive: {
    display: 'none',
  },
  homeCoupleButtonGlassHighlight: {
    display: 'none',
  },
  homeCoupleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  homeCoupleButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Montserrat-Bold', // Ensure font matches
    fontWeight: '700',
    letterSpacing: 0.8,
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
    backgroundColor: 'rgba(196, 30, 58, 0.8)', // Keep leaderboard distinct or match? Keeping as is for now unless requested.
    borderWidth: 1.5,
    borderColor: 'rgba(196, 30, 58, 0.4)',
    shadowColor: 'rgba(196, 30, 58, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  buttonGlassBackgroundActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
    borderColor: 'rgba(255, 215, 0, 0.8)',
    borderWidth: 2,
    shadowColor: 'rgba(255, 215, 0, 0.6)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
  },
  buttonGlassInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 250, 240, 0.15)',
    position: 'relative',
    borderRadius: 30,
  },
  buttonGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(232, 180, 184, 0.15)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  buttonGlassInnerActive: {
    backgroundColor: 'rgba(255, 250, 240, 0.25)',
  },
  buttonGlassHighlightActive: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});

