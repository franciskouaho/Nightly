import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import HalloweenDecorations from './HalloweenDecorations';

interface HalloweenWrapperProps {
  children: React.ReactNode;
  showSpiderwebs?: boolean;
  showParticles?: boolean;
}

const HalloweenWrapper: React.FC<HalloweenWrapperProps> = ({ 
  children, 
  showSpiderwebs = true, 
  showParticles = true 
}) => {
  return (
    <View style={styles.container}>
      {children}
      
      {/* Décorations de base */}
      {showParticles && <HalloweenDecorations />}
      
      {/* Toiles d'araignées par défaut */}
      {showSpiderwebs && (
        <>
          <Image
            source={require("@/assets/halloween/logo.png")}
            style={styles.spiderweb1}
          />
          <Image
            source={require("@/assets/halloween/logo.png")}
            style={styles.spiderweb2}
          />
          <Image
            source={require("@/assets/halloween/logo.png")}
            style={styles.spiderweb3}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  spiderweb1: {
    position: "absolute",
    top: 50,
    right: 15,
    width: 40,
    height: 40,
    opacity: 0.6,
    zIndex: 10,
  },
  spiderweb2: {
    position: "absolute",
    bottom: 150,
    left: 10,
    width: 35,
    height: 35,
    opacity: 0.5,
    zIndex: 10,
    transform: [{ rotate: '180deg' }],
  },
  spiderweb3: {
    position: "absolute",
    top: 100,
    left: 20,
    width: 30,
    height: 30,
    opacity: 0.4,
    zIndex: 10,
    transform: [{ rotate: '90deg' }],
  },
});

export default HalloweenWrapper;
