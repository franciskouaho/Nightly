import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getFirestore, doc, onSnapshot } from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function EndScreen() {
  const { t } = useTranslation();
  const { id: gameId } = useLocalSearchParams();
  const router = useRouter();
  const [winner, setWinner] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!gameId) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(gameId));
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (!doc.exists) return;
      const data = doc.data();
      if (data?.status === 'ended') {
        setWinner(data.winner);
        setReason(data.endReason || null);
      }
    });
    return () => unsubscribe();
  }, [gameId]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  let winnerText = '';
  if (winner === 'traitors') winnerText = t('Les traîtres ont gagné !');
  else if (winner === 'villagers') winnerText = t('Le village a triomphé !');
  else winnerText = t('Fin de la partie');

  return (
    <LinearGradient
      colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>  
        <Text style={styles.title}>{winnerText}</Text>
        {reason && <Text style={styles.reason}>{reason}</Text>}
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}> 
          <Text style={styles.buttonText}>{t('Retour à l\'accueil')}</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  reason: {
    fontSize: 18,
    color: '#A855F7',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#A855F7',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 