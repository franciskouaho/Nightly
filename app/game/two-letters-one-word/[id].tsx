import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Dimensions, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { verifyWord } from './utils/wordVerification';
import { doc, getFirestore, onSnapshot, updateDoc, getDoc } from '@react-native-firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import GameResults from '@/components/game/GameResults';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Liste des thèmes possibles
const THEMES = [
  'theme.marque',
  'theme.ville',
  'theme.prenom',
  'theme.pays',
  'theme.animal',
  'theme.metier',
  'theme.sport',
  'theme.fruit',
  'theme.legume',
  'theme.objet'
] as const;

// Génère deux lettres aléatoires
const generateRandomLetters = (): [string, string] => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let firstLetter = alphabet[Math.floor(Math.random() * alphabet.length)] as string;
  let secondLetter: string;
  do {
    secondLetter = alphabet[Math.floor(Math.random() * alphabet.length)] as string;
  } while (secondLetter === firstLetter);
  return [firstLetter, secondLetter];
};

type CustomModalProps = {
  visible: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  title: string;
  message: string;
  example?: string;
  button1Text: string;
  button1Action: () => void;
  button2Text?: string;
  button2Action?: () => void;
};

function CustomModal({ visible, icon, iconColor, title, message, example, button1Text, button1Action, button2Text, button2Action }: CustomModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(10,20,40,0.7)' }}>
        <LinearGradient
          colors={["#1a1a2e", "#0f3460"]}
          style={{ borderRadius: 28, padding: 0, alignItems: 'center', width: 340, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 16, elevation: 12 }}
        >
          <View style={{ padding: 32, alignItems: 'center', width: '100%' }}>
            <MaterialCommunityIcons name={icon} size={60} color={iconColor} style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: iconColor, marginVertical: 8, textAlign: 'center', fontFamily: 'System' }}>{title}</Text>
            <Text style={{ fontSize: 16, color: '#fff', marginBottom: example ? 8 : 24, textAlign: 'center', fontFamily: 'System' }}>{message}</Text>
            {example && (
              <Text style={{ fontSize: 16, color: '#7B24B1', marginBottom: 20, textAlign: 'center', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: 8, fontFamily: 'System' }}>
                {example}
              </Text>
            )}
            <View style={{ flexDirection: 'row', marginTop: 8 }}>
              <TouchableOpacity
                style={{ backgroundColor: '#7B24B1', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, marginRight: button2Text ? 10 : 0, minWidth: 110, alignItems: 'center', shadowColor: '#7B24B1', shadowOpacity: 0.18, shadowRadius: 6, elevation: 2 }}
                onPress={button1Action}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }}>{button1Text}</Text>
              </TouchableOpacity>
              {button2Text && button2Action && (
                <TouchableOpacity
                  style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, minWidth: 110, alignItems: 'center', borderWidth: 1, borderColor: '#fff' }}
                  onPress={button2Action}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }}>{button2Text}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

export default function TwoLettersOneWord() {
  const [letters, setLetters] = useState<[string, string]>(['A', 'B']);
  const [theme, setTheme] = useState<string>(THEMES[0]);
  const [word, setWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [players, setPlayers] = useState<any[]>([]);
  const { t } = useTranslation();
  const [gamePhase, setGamePhase] = useState<'playing' | 'results'>('playing');
  const [gameHistory, setGameHistory] = useState<{[playerId: string]: number[]}>({});
  const [showInvalidModal, setShowInvalidModal] = useState(false);
  const [invalidExample, setInvalidExample] = useState<string | undefined>(undefined);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { id } = useLocalSearchParams();
  const gameDocId = typeof id === 'string' ? id : Array.isArray(id) ? id[id.length - 1] : '';
  const { user } = useAuth();

  useEffect(() => {
    if (!gameDocId) return;

    const db = getFirestore();
    const gameRef = doc(db, 'games', gameDocId);

    const unsubscribe = onSnapshot(gameRef, async (docSnap) => {
      if (docSnap.exists()) {
        const gameData = docSnap.data() || {};
        setLetters(gameData.currentLetters || ['A', 'B']);
        const loadedTheme = gameData.currentTheme;
        const themeKeyToSet = THEMES.includes(loadedTheme) ? loadedTheme : THEMES[0];
        setTheme(themeKeyToSet);

        const scoresData = gameData.scores || {};
        const playerIds = Object.keys(scoresData);

        // Initialize or update game history for all players based on scores data
        const currentHistory = gameData.history || {};
        const initializedHistory: {[playerId: string]: number[]} = {};
        playerIds.forEach(id => {
          // Ensure each player has a history array, initialize if not present
          initializedHistory[id] = currentHistory[id] || [];
        });
        // Add any players from currentHistory not in scoresData (edge case) - though less likely in a game context
         Object.keys(currentHistory).forEach(id => {
             if (!initializedHistory[id]) {
                 initializedHistory[id] = currentHistory[id];
             }
         });

        setGameHistory(initializedHistory);

        // Fetch player details for all players in the game
        if (playerIds.length > 0) {
          const db = getFirestore();
          const playerDetailsPromises = playerIds.map(async (id) => {
            const userDoc = await getDoc(doc(db, 'users', id));
            if (userDoc.exists()) {
              const userData = userDoc.data() as any;
              return { id: id, pseudo: userData.pseudo, avatar: userData.avatar };
            } else {
              return { id: id, pseudo: 'Joueur Inconnu', avatar: undefined };
            }
          });

          const fetchedDetails = await Promise.all(playerDetailsPromises);
          const detailsMap = fetchedDetails.reduce((acc, detail) => {
            acc[detail.id] = { pseudo: detail.pseudo, avatar: detail.avatar };
            return acc;
          }, {} as { [key: string]: { pseudo: string, avatar?: string } });

          // Combine scores with fetched pseudos and avatars
          const updatedPlayers = playerIds.map(playerId => ({
            id: playerId,
            score: scoresData[playerId] as number,
            pseudo: detailsMap[playerId]?.pseudo || 'Joueur Inconnu',
            avatar: detailsMap[playerId]?.avatar,
          }));

          setPlayers(updatedPlayers);

          // Find current user's score using actual user ID
          const currentUserScore = updatedPlayers.find(p => p.id === user?.uid)?.score || 0;
          setScore(currentUserScore);
        }

        if (gameData.status === 'finished') {
           setGamePhase('results');
        }

      } else {
        Alert.alert('Erreur', 'Partie introuvable ou terminée');
      }
    });

    return () => unsubscribe();
  }, [gameDocId, user?.uid]);

  const handleSubmit = async () => {
    // Vérifie le nombre de joueurs
    if (players.length < 1 || players.length > 4) {
      Alert.alert(t('game.error'), t('home.games.two-letters-one-word.playerCountError') || 'Le jeu se joue de 1 à 4 joueurs.');
      return;
    }
    if (!word.trim()) {
      Alert.alert(t('game.error'), t('home.games.two-letters-one-word.noWordError'));
      return;
    }
    setIsLoading(true);
    try {
      const result = await verifyWord({
        word: word.trim(),
        firstLetter: letters[0],
        secondLetter: letters[1],
        theme: theme
      });
      if (gameDocId && user?.uid) {
        const db = getFirestore();
        const gameRef = doc(db, 'games', gameDocId);
        const gameSnap = await getDoc(gameRef);
        const gameData = gameSnap.data() || {};
        const prevHistory = (gameData.history && gameData.history[user.uid]) || [];
        const newHistory = [...prevHistory, result.isValid ? 1 : 0];
        await updateDoc(gameRef, {
          [`history.${user.uid}`]: newHistory
        });
      }
      if (result.isValid) {
        setShowSuccessModal(true);
        setWord('');
      } else {
        setInvalidExample(result.example);
        setShowInvalidModal(true);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification ou de la mise à jour du mot:', error);
      Alert.alert(t('game.error'), t('game.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setShowInvalidModal(false);
    setWord('');
    setInvalidExample(undefined);
  };

  const handleNext = async () => {
    setShowInvalidModal(false);
    setWord('');
    setInvalidExample(undefined);

    // Met à jour Firestore pour passer au tour suivant
    if (!gameDocId) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', gameDocId);

    // Génère de nouvelles lettres et un nouveau thème
    const newLetters = generateRandomLetters();
    const newTheme = THEMES[Math.floor(Math.random() * THEMES.length)];

    try {
      await updateDoc(gameRef, {
        currentLetters: newLetters,
        currentTheme: newTheme,
        // Réinitialise les réponses des joueurs (exemple : reset un champ answers)
        answers: {},
        // Tu peux ajouter ici d'autres champs à réinitialiser si besoin
      });
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de passer au tour suivant.');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#0f3460']}
      style={styles.container}
    >
      {/* Modal succès */}
      <CustomModal
        visible={showSuccessModal}
        icon="check-circle"
        iconColor="#4CAF50"
        title={t('home.games.two-letters-one-word.validWord')}
        message={t('home.games.two-letters-one-word.validWordMessage')}
        button1Text={t('common.ok') || 'OK'}
        button1Action={handleSuccessClose}
      />
      {/* Modal erreur */}
      <CustomModal
        visible={showInvalidModal}
        icon="close-circle"
        iconColor="#F44336"
        title={t('home.games.two-letters-one-word.invalidWord')}
        message={t('home.games.two-letters-one-word.invalidWordMessage')}
        example={invalidExample ? t('home.games.two-letters-one-word.exampleWord', { word: invalidExample }) : undefined}
        button1Text={t('home.games.two-letters-one-word.nextButton')}
        button1Action={handleNext}
      />
      {gamePhase === 'playing' ? (
        <View style={styles.content}>

          {/* Duel Header */}
          <View style={styles.duelHeader}>
            {/* Current User */}
            {user && players.find(p => p.id === user.uid) ? (
              <View style={styles.playerDuelContainer}>
                {players.find(p => p.id === user.uid)?.avatar ? (
                  <Image source={{ uri: players.find(p => p.id === user.uid)?.avatar }} style={styles.duelAvatar} />
                ) : (
                  <View style={styles.defaultDuelAvatar}>
                    <Text style={styles.defaultDuelAvatarText}>{players.find(p => p.id === user.uid)?.pseudo?.charAt(0) || '?'}</Text>
                  </View>
                )}
                <Text style={styles.playerDuelName}>{players.find(p => p.id === user.uid)?.pseudo || 'Moi'}</Text>
                 {/* Add dots for rounds played based on history */}
                 <View style={styles.roundDots}>
                    {[...Array(5)].map((_, i) => {
                      const result = (gameHistory[user.uid] || [])[i];
                      return (
                        <View
                           key={i}
                           style={[
                             styles.dot,
                             result === 1 ? styles.correctDot :
                             result === 0 ? styles.incorrectDot :
                             styles.notPlayedDot
                           ]}
                        />
                      );
                    })}
                 </View>
              </View>
            ) : (
                <View style={styles.playerDuelContainer}> {/* Placeholder */}
                    <View style={styles.duelAvatarPlaceholder} />
                    <Text style={styles.playerDuelName}>Moi</Text>
                    <View style={styles.roundDots}>
                         {[...Array(5)].map((_, i) => (
                           <View key={i} style={styles.dot} />
                         ))}
                    </View>
                </View>
            )}

            {/* DUEL text */}
            <View style={styles.duelTextContainer}>
               <MaterialCommunityIcons name="sword-cross" size={30} color="#A0B0C0" style={styles.duelIcon} />
               <Text style={styles.duelText}>DUEL</Text>
            </View>

            {/* Opponent User */}
            {user && players.find(p => p.id !== user.uid) ? (
                 <View style={styles.playerDuelContainer}>
                 {players.find(p => p.id !== user.uid)?.avatar ? (
                   <Image source={{ uri: players.find(p => p.id !== user.uid)?.avatar }} style={styles.duelAvatar} />
                 ) : (
                   <View style={styles.defaultDuelAvatar}>
                     <Text style={styles.defaultDuelAvatarText}>{players.find(p => p.id !== user.uid)?.pseudo?.charAt(0) || '?'}</Text>
                   </View>
                 )}
                 <Text style={styles.playerDuelName}>{players.find(p => p.id !== user.uid)?.pseudo || 'Adversaire'}</Text>
                  {/* Add dots for rounds played based on history */}
                  <View style={styles.roundDots}>
                     {/* Use opponent's history (if opponent exists) */}
                     {players.find(p => p.id !== user?.uid) ? (
                         // If opponent exists, map their history up to 5 rounds
                         [...Array(5)].map((_, i) => {
                           const opponentId = players.find(p => p.id !== user?.uid)?.id || '';
                           const result = (gameHistory[opponentId] || [])[i];
                           return (
                             <View
                               key={i}
                               style={[
                                 styles.dot,
                                 result === 1 ? styles.correctDot :
                                 result === 0 ? styles.incorrectDot :
                                 styles.notPlayedDot
                               ]}
                             />
                           );
                         })
                     ) : ( /* If no opponent, show placeholder dots */
                         [...Array(5)].map((_, i) => (
                             <View key={i} style={styles.notPlayedDot} />
                          ))
                     )}
                  </View>
               </View>
            ) : ( /* Placeholder if no opponent user found */
                 <View style={styles.playerDuelContainer}> {/* Placeholder container */}
                     <View style={styles.duelAvatarPlaceholder} />
                     <Text style={styles.playerDuelName}>Adversaire</Text>
                      <View style={styles.roundDots}>
                         {/* Show 5 dots for current user's history if available */}
                         {[...Array(5)].map((_, i) => {
                           const result = (gameHistory[user?.uid || ''] || [])[i];
                           return (
                             <View
                               key={i}
                               style={[
                                 styles.dot,
                                 result === 1 ? styles.correctDot :
                                 result === 0 ? styles.incorrectDot :
                                 styles.notPlayedDot
                               ]}
                             />
                           );
                         })}
                      </View>
                 </View>
            )}
          </View>

          {/* Main content area - centered */}
          <View style={styles.mainContentArea}>
            
            <View style={styles.lettersCard}>
              <Text style={styles.letters}>{letters.join(' - ')}</Text>
            </View>

            {/* Theme display with neumorphic style */}
            <View style={styles.themeContainer}>
              <Text style={styles.themeText}>
                {t('home.games.two-letters-one-word.theme', { theme: t(`home.games.two-letters-one-word.${theme}`) })}
              </Text>
            </View>

            {/* Game Explanation */}
            <Text style={styles.howToPlayText}>
              {t('home.games.two-letters-one-word.howToPlay')}
            </Text>

            <TextInput
              style={styles.input}
              value={word}
              onChangeText={setWord}
              placeholder={t('home.games.two-letters-one-word.inputPlaceholder')}
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          {/* Button at the bottom */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(60, 80, 100, 0.9)', 'rgba(80, 100, 120, 1)']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isLoading ? t('home.games.two-letters-one-word.verifyingButton') : t('home.games.two-letters-one-word.verifyButton')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <GameResults
          players={players}
          scores={players.reduce((acc, player) => ({ ...acc, [player.id]: player.score }), {})}
          userId={'some-user-id'}
        />
      )}
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  playerDuelContainer: {
    alignItems: 'center',
    flex: 1,
  },
  duelAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    marginBottom: 5,
    borderWidth: 2,
    borderColor: '#A0B0C0',
  },
  defaultDuelAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7B24B1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    borderWidth: 2,
    borderColor: '#A0B0C0',
  },
  defaultDuelAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  playerDuelName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  duelTextContainer: {
    alignItems: 'center',
  },
  duelIcon: {
    marginBottom: 5,
    color: '#A0B0C0',
  },
  duelText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  roundDots: {
     flexDirection: 'row',
  },
  dot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      marginHorizontal: 3,
  },
  filledDot: {
      backgroundColor: '#7B24B1',
  },
  correctDot: {
    backgroundColor: '#4CAF50',
  },
  incorrectDot: {
    backgroundColor: '#F44336',
  },
  // Style for dots representing rounds not yet played
  notPlayedDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white/grey
  },
  mainContentArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  lettersCard: {
    backgroundColor: 'rgba(60, 80, 100, 0.8)',
    paddingVertical: 45,
    paddingHorizontal: 70,
    borderRadius: 20,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  letters: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  themeContainer: {
    backgroundColor: '#162f54',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginBottom: 40,
    shadowColor: '#0d2b4b',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 12,
  },
  themeText: {
    fontSize: 24,
    color: '#fff',
    fontFamily: 'System',
    fontWeight: '500',
  },
  // New style for game explanation text
  howToPlayText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)', // Slightly transparent white
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 30, // Space below explanation
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: width * 0.8,
    padding: 20,
    borderRadius: 15,
    color: '#fff',
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: width * 0.8,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  buttonGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  playersContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  playersTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  playerEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: '#ccc',
  },
  defaultAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: '#7B24B1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playerText: {
    fontSize: 16,
    color: '#fff',
  },
  duelAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ccc',
    marginBottom: 5,
  },
});