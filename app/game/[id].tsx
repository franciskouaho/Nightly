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
  const gameAnalytics = useGameAnalytics();
  const { t } = useTranslation();
  const { language } = useLanguage();

  useEffect(() => {
    const redirect = async () => {
      let mode = gameId;
      if (!mode) {
        const db = getFirestore();
        const gameDoc = await getDoc(doc(db, 'games', String(id || '')));
        if (gameDoc.exists()) {
          mode = gameDoc.data()?.gameId;
          
          // Track le début du jeu
          await gameAnalytics.trackGameStart(String(id || ''), mode);
        } else {
          Alert.alert(t('game.error'), t('game.notFound', { id }));
          return;
        }
      }
      if (!mode) {
        Alert.alert(t('game.error'), t('game.noMode'));
        return;
      }

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

      Alert.alert(t('game.error'), t('game.unknownMode', { mode }));
    };
    redirect();
  }, [id, gameId, router, t, language]);

  return null;
}
