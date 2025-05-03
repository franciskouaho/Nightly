import React, { useRef, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RulesDrawerProps = {
  visible: boolean;
  onClose: () => void;
};

const RulesDrawer = ({ visible, onClose }: RulesDrawerProps) => {
  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnimation]);

  const translateY = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
    extrapolate: 'clamp',
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <Animated.View 
          style={[
            styles.container, 
            { transform: [{ translateY }] }
          ]}
        >
          <View style={styles.inner}>
            <View style={styles.header}>
              <Text style={styles.title}>RÈGLES DU JEU</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.subtitle}>PLUSIEURS TÉLÉPHONES</Text>
              <View style={styles.ruleCard}>
                <Text style={styles.emoji}>🎲</Text>
                <Text style={styles.ruleText}>Un joueur est désigné aléatoirement.</Text>
              </View>
              <View style={styles.ruleCard}>
                <Text style={styles.emoji}>🤔</Text>
                <Text style={styles.ruleText}>Tous les joueurs reçoivent la même question concernant le joueur visé.</Text>
              </View>
              <View style={styles.ruleCard}>
                <Text style={styles.emoji}>👀</Text>
                <Text style={styles.ruleText}>Chaque joueur y répond de manière anonyme.</Text>
              </View>
              <View style={styles.ruleCard}>
                <Text style={styles.emoji}>📦</Text>
                <Text style={styles.ruleText}>Le joueur désigné lit toutes les réponses et vote pour sa préférée.</Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>Le joueur dont la réponse est choisie :</Text>
                <Text style={styles.pointsText}>+1 pt.</Text>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 6, 20, 0.92)',
  },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#2B1845',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
    maxHeight: '85%',
  },
  inner: {
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 0,
    maxHeight: '100%',
  },
  subtitle: {
    fontSize: 15,
    color: '#C7B8F5',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  ruleCard: {
    backgroundColor: '#3D2956',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  emoji: {
    fontSize: 28,
    marginRight: 14,
  },
  ruleText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 22,
    paddingHorizontal: 10,
    backgroundColor: '#3D2956',
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  scoreText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  pointsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RulesDrawer;