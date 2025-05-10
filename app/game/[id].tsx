import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { useGameAnalytics } from '@/hooks/useGameAnalytics';

export default function GameRouter() {
  const router = useRouter();
  const { id, gameId } = useLocalSearchParams();
  const gameAnalytics = useGameAnalytics();

  useEffect(() => {
    const redirect = async () => {
      let mode = gameId;
      console.log('🔄 Mode à chercher (param):', mode);
      if (!mode) {
        const db = getFirestore();
        const gameDoc = await getDoc(doc(db, 'games', String(id)));
        if (gameDoc.exists()) {
          console.log('gameDoc data:', gameDoc.data());
          mode = gameDoc.data()?.gameId;
          console.log('Mode extrait du doc games:', mode);
          
          // Track le début du jeu
          await gameAnalytics.trackGameStart(String(id), mode);
        } else {
          console.log('Pas de doc games trouvé pour id:', id);
          Alert.alert('Erreur', `Aucun document de jeu trouvé pour l'id: ${id}`);
          return;
        }
      }
      if (!mode) {
        Alert.alert('Erreur', 'Aucun mode de jeu trouvé dans le document games.');
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

      Alert.alert('Erreur', `Mode de jeu inconnu: ${mode}`);
    };
    redirect();
  }, [id, gameId, router]);

  return null;
}
