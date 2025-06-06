import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Dimensions, Image, Modal, KeyboardAvoidingView, Platform, ViewStyle, TextStyle, ImageStyle, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { verifyWord } from './utils/wordVerification';
import { doc, getFirestore, onSnapshot, updateDoc, getDoc } from '@react-native-firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import GameResults from '@/components/game/GameResults';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Define an interface for the styles
interface ComponentStyles {
  container: ViewStyle;
  keyboardAvoidingContainer: ViewStyle;
  content: ViewStyle;
  scrollContent: ViewStyle;
  duelHeader: ViewStyle;
  playerDuelContainer: ViewStyle;
  duelAvatar: ImageStyle;
  defaultDuelAvatar: ViewStyle;
  defaultDuelAvatarText: TextStyle;
  playerDuelName: TextStyle;
  duelTextContainer: ViewStyle;
  duelIcon: TextStyle;
  duelText: TextStyle;
  roundDots: ViewStyle;
  dot: ViewStyle;
  filledDot: ViewStyle;
  correctDot: ViewStyle;
  incorrectDot: ViewStyle;
  notPlayedDot: ViewStyle;
  mainContentArea: ViewStyle;
  lettersCard: ViewStyle;
  letters: TextStyle;
  themeContainer: ViewStyle;
  themeText: TextStyle;
  howToPlayText: TextStyle;
  input: TextStyle;
  button: ViewStyle;
  buttonGradient: ViewStyle;
  buttonDisabled: ViewStyle;
  playersContainer: ViewStyle;
  playersTitle: TextStyle;
  playerEntry: ViewStyle;
  playerAvatar: ImageStyle;
  defaultAvatar: ViewStyle;
  defaultAvatarText: TextStyle;
  playerText: TextStyle;
  duelAvatarPlaceholder: ViewStyle;
  buttonText: TextStyle;
  roundNumberContainer: ViewStyle;
  roundNumberText: TextStyle;
}

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
  const [totalRounds, setTotalRounds] = useState<number>(15);

  const { id } = useLocalSearchParams();
  const gameDocId = typeof id === 'string' ? id : Array.isArray(id) ? id[id.length - 1] : '';
  const { user } = useAuth();

  // Calculate current round number
  const currentRound = useMemo(() => {
    const histories = Object.values(gameHistory);
    if (histories.length === 0) {
      return 1; // Start at round 1 if no history
    }
    const maxRoundsPlayed = histories.reduce((max, history) => Math.max(max, history.length), 0);
    return maxRoundsPlayed + 1;
  }, [gameHistory]);

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
        const gamePlayersFromDoc = gameData.players || []; // Récupérer la liste des joueurs du document game

        // Mettre à jour totalRounds à partir des données de la partie
        setTotalRounds(gameData.totalRounds || 15); // Use value from gameData, fallback to 15

        // Créer une map des joueurs existants dans l'état actuel pour ne pas perdre d'informations si on le remplace
        const existingPlayersMap = players.reduce((acc, player) => {
            acc[player.id] = player;
            return acc;
        }, {} as any);

        // Combiner les joueurs du document game, les IDs des scores, et les joueurs existants
        const allPlayerIds = new Set([
            ...Object.keys(scoresData),
            ...gamePlayersFromDoc.map((p: any) => p.id),
            ...players.map(p => p.id) // Inclure les IDs des joueurs déjà dans l'état
        ]);

        const db = getFirestore();
        const playerDetailsPromises = Array.from(allPlayerIds).map(async (id) => { // Utiliser Array.from pour itérer sur le Set
             const userDoc = await getDoc(doc(db, 'users', id));
             const playerFromGameDoc = gamePlayersFromDoc.find((p: any) => p.id === id);
             const existingPlayer = existingPlayersMap[id];

             let playerInfo: any = {
                 id: id,
                 score: scoresData[id] || existingPlayer?.score || 0, // Prioriser le score du document game, sinon l'état existant
                 history: (gameData.history && gameData.history[id]) || existingPlayer?.history || [], // Récupérer l'histoire
             };

             if (userDoc.exists()) {
                 const userData = userDoc.data() as any;
                 playerInfo.pseudo = userData.pseudo;
                 playerInfo.avatar = userData.avatar;
                 // Prioriser le name du document game, sinon user data, sinon fallback
                 playerInfo.name = playerFromGameDoc?.name || userData.pseudo || userData.displayName || 'Joueur Inconnu';
             } else {
                 // Si le document user n'existe pas, utiliser les infos du document game ou état existant, sinon fallback
                 playerInfo.pseudo = playerFromGameDoc?.pseudo || existingPlayer?.pseudo || 'Joueur Inconnu';
                 playerInfo.avatar = playerFromGameDoc?.avatar || existingPlayer?.avatar || undefined;
                 playerInfo.name = playerFromGameDoc?.name || playerFromGameDoc?.pseudo || existingPlayer?.name || existingPlayer?.pseudo || 'Joueur Inconnu';
             }

             // Inclure d'autres propriétés de LocalPlayer si elles sont dans gamePlayersFromDoc ou existingPlayer
             playerInfo.isHost = playerFromGameDoc?.isHost ?? existingPlayer?.isHost ?? false;
             playerInfo.isReady = playerFromGameDoc?.isReady ?? existingPlayer?.isReady ?? false;
             playerInfo.username = playerFromGameDoc?.username || existingPlayer?.username || playerInfo.pseudo;
             playerInfo.displayName = playerFromGameDoc?.displayName || existingPlayer?.displayName || playerInfo.pseudo;
             playerInfo.level = playerFromGameDoc?.level || existingPlayer?.level || 1;


             return playerInfo;
         });


        const fetchedDetails = await Promise.all(playerDetailsPromises);

        // Mettre à jour l'état 'players' avec les détails combinés
        setPlayers(fetchedDetails as any);


        // Calculate current user's score after players state is updated
        const currentUserScore = fetchedDetails.find(p => p.id === user?.uid)?.score || 0;
        setScore(currentUserScore);


        // Initialize or update game history for all players based on the fetched details
        const updatedGameHistory: {[playerId: string]: number[]} = {};
        fetchedDetails.forEach(player => {
             updatedGameHistory[player.id] = player.history || [];
        });
        setGameHistory(updatedGameHistory);


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
    // if (players.length < 1 || players.length > 4) {
    //   Alert.alert(t('game.error'), t('home.games.two-letters-one-word.playerCountError') || 'Le jeu se joue en solo ou jusqu\'à 4 joueurs.');
    //   return;
    // }
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
        setInvalidExample(result.example || t('home.games.two-letters-one-word.noExampleAvailable'));
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
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
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
                    <Text style={styles.playerDuelName}>{players.find(p => p.id === user.uid)?.name || 'Moi'}</Text>
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
                   {/* Display Current Round */}
                   <View style={styles.roundNumberContainer}>
                     <Text style={styles.roundNumberText}>{t('game.round')}: {currentRound}/{totalRounds}</Text>
                   </View>
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
          </ScrollView>
        </KeyboardAvoidingView>
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

const styles = StyleSheet.create<ComponentStyles>({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
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
  roundNumberContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundNumberText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});