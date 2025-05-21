import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { useGameAnalytics } from '@/hooks/useGameAnalytics';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';

export default function GameRouter() {
  const router = useRouter();
  const { id, gameId } = useLocalSearchParams();
  const gameRoomId = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : '';
  const gameAnalytics = useGameAnalytics();
  const { t } = useTranslation();
  const { language } = useLanguage();

  useEffect(() => {
    console.log("[DEBUG GameRouter] useEffect triggered. gameRoomId:", gameRoomId, "gameId:", gameId);
    console.log("[DEBUG GameRouter] Current room data (from useGame hook, if available):");
    // Note: Accessing room data from useGame hook is not directly possible here.
    // We rely on the gameId param or fetching from Firestore.

    const redirect = async () => {
      let mode = gameId;
      console.log("[DEBUG GameRouter] Starting redirect logic. Initial mode:", mode);
      if (!mode) {
        const db = getFirestore();
        console.log("[DEBUG GameRouter] mode is undefined, fetching from Firestore for game ID:", gameRoomId);
        const gameDoc = await getDoc(doc(db, 'games', gameRoomId));
        if (gameDoc.exists()) {
          mode = gameDoc.data()?.gameId;
          console.log("[DEBUG GameRouter] Fetched gameId from Firestore:", mode, "for gameRoomId:", gameRoomId);
          
          // Suivre le début du jeu
          await gameAnalytics.trackGameStart(gameRoomId, mode);
        } else {
          console.log("[DEBUG GameRouter] Game document not found for ID:", gameRoomId);
          Alert.alert(t('game.error'), t('game.notFound', { id }));
          return;
        }
      }
      if (!mode) {
        console.log("[DEBUG GameRouter] Final mode is still undefined. Showing noMode alert.");
        Alert.alert(t('game.error'), t('game.noMode'));
        return;
      }

      console.log("[DEBUG GameRouter] Determined game mode:", mode, "Redirecting...");
      if (mode === 'truth-or-dare') {
        router.replace(`/game/truth-or-dare/${id}`);
        return;
      }

      if (mode === 'listen-but-don-t-judge') {
        router.replace(`/game/listen-but-don-t-judge/${id}`);
        return;
      }

      if (mode === 'genius-or-liar') {
        router.replace(`/game/genius-or-liar/${id}`);
        return;
      }

      if (mode === 'never-have-i-ever-hot') {
        router.replace(`/game/never-have-i-ever-hot/${id}`);
        return;
      }

      if (mode === 'the-hidden-village') {
        router.replace(`/game/the-hidden-village/${id}`);
        return;
      }

       if (mode === 'trap-answer') {
        router.replace(`/game/trap-answer/${id}`);
        return;
      }

      console.log("[DEBUG GameRouter] Unknown game mode:", mode, "Showing unknownMode alert.");
      Alert.alert(t('game.error'), t('game.unknownMode', { mode }));
    };
    redirect();
  }, [gameRoomId, gameId, router, t, language]);

  return null;
}
