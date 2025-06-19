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
                            <Text style={{ fontSize: 16, color: '#00FFFF', marginBottom: 20, textAlign: 'center', fontWeight: 'bold', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, padding: 8, fontFamily: 'System' }}>
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

    // CORRECTION: Calcul du currentRound basé sur les vraies réponses
    const currentRound = useMemo(() => {
        if (!user?.uid) return 1;

        const myHistory = gameHistory[user.uid] || [];

        // Si la partie est en phase de résultats, retourner le dernier tour
        if (gamePhase === 'results') {
            return totalRounds;
        }

        // Compter seulement les réponses valides (pas les 0 d'initialisation)
        // Le tour actuel est basé sur le nombre de vraies réponses données + 1
        const validResponsesCount = myHistory.length;
        const calculatedRound = validResponsesCount + 1;

        return Math.min(Math.max(calculatedRound, 1), totalRounds);
    }, [gameHistory, user?.uid, gamePhase, totalRounds]);

    useEffect(() => {
        if (!gameDocId) return;

        const db = getFirestore();
        const gameRef = doc(db, 'games', gameDocId);

        const unsubscribe = onSnapshot(gameRef, async (docSnap) => {
            if (!docSnap.exists()) {
                Alert.alert('Erreur', 'Partie introuvable');
                return;
            }

            const gameData = docSnap.data();

            // Initialisation des données de base
            setLetters(gameData.currentLetters || generateRandomLetters());
            setTheme(THEMES.includes(gameData.currentTheme) ? gameData.currentTheme : THEMES[0]);
            setTotalRounds(gameData.totalRounds || 15);

            // CORRECTION: Mise à jour de l'historique - ne pas créer d'entrées vides
            const newGameHistory: {[playerId: string]: number[]} = {};
            if (gameData.history) {
                Object.keys(gameData.history).forEach(playerId => {
                    // Utiliser l'historique tel qu'il est stocké dans Firebase
                    const playerHistory = Array.isArray(gameData.history[playerId])
                        ? gameData.history[playerId].filter((val: any) => val !== undefined && val !== null)
                        : [];
                    newGameHistory[playerId] = playerHistory;
                });
            }

            // Initialiser l'historique du joueur actuel s'il n'existe pas (avec un tableau vide)
            if (user?.uid && !newGameHistory[user.uid]) {
                newGameHistory[user.uid] = [];
            }

            setGameHistory(newGameHistory);

            // Mise à jour des joueurs
            const updatedPlayers = await Promise.all(
                (gameData.players || []).map(async (player: any) => {
                    const userDoc = await getDoc(doc(db, 'users', player.id));
                    const userData = userDoc.exists() ? userDoc.data() : {};
                    return {
                        ...player,
                        pseudo: userData.pseudo || player.pseudo || 'Joueur Inconnu',
                        avatar: userData.avatar || player.avatar,
                        history: newGameHistory[player.id] || []
                    };
                })
            );
            setPlayers(updatedPlayers);

            // Vérification de fin de partie
            const isSolo = updatedPlayers.length === 1;
            const currentUserHistory = newGameHistory[user?.uid || ''] || [];
            const isGameComplete = isSolo
                ? currentUserHistory.length >= (gameData.totalRounds || 15)
                : updatedPlayers.every(p => (newGameHistory[p.id] || []).length >= (gameData.totalRounds || 15));

            if (isGameComplete && gameData.status !== 'finished') {
                // Mettre à jour le statut uniquement si l'utilisateur est l'hôte
                const isHost = updatedPlayers.find(p => p.id === user?.uid)?.isHost;
                if (isHost) {
                    try {
                        await updateDoc(gameRef, { status: 'finished' });
                    } catch (e) {
                        console.error('Erreur lors de la fin de partie:', e);
                    }
                }
            }

            // Mise à jour de la phase de jeu
            setGamePhase(gameData.status === 'finished' ? 'results' : 'playing');
        });

        return () => unsubscribe();
    }, [gameDocId, user?.uid]);

    const handleSubmit = async () => {
        if (!word.trim() || !user?.uid || currentRound > totalRounds) {
            return;
        }

        setIsLoading(true);
        try {
            const result = await verifyWord({
                word: word.trim(),
                firstLetter: letters[0],
                secondLetter: letters[1],
                theme
            });

            if (gameDocId) {
                const db = getFirestore();
                const gameRef = doc(db, 'games', gameDocId);
                const currentHistory = gameHistory[user.uid] || [];

                // Vérifier si on peut encore ajouter une réponse
                if (currentHistory.length < totalRounds) {
                    const newHistory = [...currentHistory, result.isValid ? 1 : 0];
                    await updateDoc(gameRef, {
                        [`history.${user.uid}`]: newHistory
                    });
                }
            }

            // Afficher le résultat
            if (result.isValid) {
                setShowSuccessModal(true);
            } else {
                setInvalidExample(result.example);
                setShowInvalidModal(true);
            }
        } catch (error) {
            console.error('Erreur:', error);
            Alert.alert('Erreur', 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
            setWord('');
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

        // Si l'utilisateur est l'hôte ou s'il n'y a qu'un seul joueur, permettre le passage au tour suivant
        const currentUserPlayer = players.find(p => p.id === user?.uid);
        const isSoloMode = players.length === 1;

        if (!currentUserPlayer?.isHost && !isSoloMode) {
            return;
        }

        // CORRECTION: Vérification améliorée pour le mode multijoueur
        if (!isSoloMode) {
            // Calculer le nombre minimum de réponses que tous les joueurs devraient avoir
            // En mode multijoueur, on vérifie que tous ont répondu au tour actuel
            const minResponsesNeeded = currentRound;

            const allPlayersResponded = players.every(player => {
                const playerHistory = gameHistory[player.id] || [];
                // Chaque joueur doit avoir au moins autant de réponses que le tour actuel
                return playerHistory.length >= minResponsesNeeded;
            });

            if (!allPlayersResponded) {
                Alert.alert(
                    t('game.waitingForPlayers'),
                    t('game.waitingForPlayersMessage', { currentRound })
                );
                return;
            }
        }

        // Vérifier si le jeu est terminé (tous les tours joués)
        if (currentRound >= totalRounds) {
            if (gameDocId) {
                const db = getFirestore();
                const gameRef = doc(db, 'games', gameDocId);
                try {
                    await updateDoc(gameRef, {
                        status: 'finished' // Marquer la partie comme terminée
                    });
                } catch (e) {
                    console.error('Erreur lors de la fin de la partie:', e);
                    Alert.alert('Erreur', 'Impossible de terminer la partie.');
                }
            }
            return; // Ne pas passer au tour suivant si la partie est terminée
        }

        // Si l'utilisateur est l'hôte ou en mode solo, passer au tour suivant
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
                answers: {},
                // Réinitialiser le statut de réponse pour le nouveau tour
                [`responses.${currentRound + 1}`]: {},
            });

            // Mise à jour locale immédiate pour éviter de garder les anciennes lettres
            setLetters(newLetters);
            setTheme(newTheme as string);
        } catch (e) {
            console.error('Erreur lors du passage au tour suivant:', e);
            Alert.alert('Erreur', 'Impossible de passer au tour suivant.');
        } finally {
            setShowInvalidModal(false);
        }
    };

    const handleSuccessClose = () => {
        setShowSuccessModal(false);
    };

    // Calculate current user's player object
    const currentUserPlayer = players.find(p => p.id === user?.uid);
    const isHost = currentUserPlayer?.isHost;

    // Determine button text and action for invalid word modal based on host status
    const invalidModalButton1Text = isHost
        ? t('home.games.two-letters-one-word.nextButton')
        : t('common.ok') || 'OK';

    const invalidModalButton1Action = isHost
        ? handleNext
        : handleRetry; // handleRetry just closes the modal

    // Affichage conditionnel du fond selon la phase du jeu
    if (gamePhase === 'results') {
        return (
            <View style={{ flex: 1 }}>
                <GameResults
                    players={players}
                    scores={players.reduce((acc, player) => ({ ...acc, [player.id]: player.score }), {})}
                    userId={user?.uid || ''}
                />
            </View>
        );
    }

    // Ajout d'une variable pour clarifier la condition et éviter TS2367
    const isResultsPhase = gamePhase === 'results' as any;

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
                button1Text={invalidModalButton1Text}
                button1Action={invalidModalButton1Action}
            />
            {/* Tout le contenu de l'écran de jeu ici */}
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
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
                                        {[...Array(totalRounds)].map((_, i) => {
                                            const result = (gameHistory[user.uid] || [])[i];
                                            return (
                                                <View
                                                    key={i}
                                                    style={[
                                                        styles.dot,
                                                        (typeof result === 'undefined') ? styles.notPlayedDot :
                                                            result === 1 ? styles.correctDot : styles.incorrectDot
                                                    ]}
                                                >
                                                    <Text style={{ color: 'transparent' }}>.</Text>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            ) : (
                                <View style={styles.playerDuelContainer}> {/* Placeholder */}
                                    <View style={styles.duelAvatarPlaceholder} />
                                    <Text style={styles.playerDuelName}>Moi</Text>
                                    <View style={styles.roundDots}>
                                        {[...Array(totalRounds)].map((_, i) => (
                                            <View key={i} style={[styles.dot, styles.notPlayedDot]}>
                                                <Text style={{ color: 'transparent' }}>.</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* DUEL text */}
                            <View style={styles.duelTextContainer}>
                                {/* Display Current Round */}
                                <View style={styles.roundNumberContainer}>
                                    <Text style={styles.roundNumberText}>{t('game.round', { current: currentRound, total: totalRounds })}</Text>
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
                                            // If opponent exists, map their history up to totalRounds
                                            [...Array(totalRounds)].map((_, i) => {
                                                const opponentId = players.find(p => p.id !== user?.uid)?.id || '';
                                                const result = (gameHistory[opponentId] || [])[i];
                                                return (
                                                    <View
                                                        key={i}
                                                        style={[
                                                            styles.dot,
                                                            (typeof result === 'undefined') ? styles.notPlayedDot :
                                                                result === 1 ? styles.correctDot : styles.incorrectDot
                                                        ]}
                                                    >
                                                        <Text style={{ color: 'transparent' }}>.</Text>
                                                    </View>
                                                );
                                            })
                                        ) : ( /* If no opponent, show placeholder dots */
                                            [...Array(totalRounds)].map((_, i) => (
                                                <View key={i} style={[styles.dot, styles.notPlayedDot]}>
                                                    <Text style={{ color: 'transparent' }}>.</Text>
                                                </View>
                                            ))
                                        )}
                                    </View>
                                </View>
                            ) : ( /* Placeholder if no opponent user found */
                                <View style={styles.playerDuelContainer}> {/* Placeholder container */}
                                    <View style={styles.duelAvatarPlaceholder} />
                                    <Text style={styles.playerDuelName}>Adversaire</Text>
                                    <View style={styles.roundDots}>
                                        {/* Show dots for current user's history if available */}
                                        {[...Array(totalRounds)].map((_, i) => {
                                            const result = (gameHistory[user?.uid || ''] || [])[i];
                                            return (
                                                <View
                                                    key={i}
                                                    style={[
                                                        styles.dot,
                                                        (typeof result === 'undefined') ? styles.notPlayedDot :
                                                            result === 1 ? styles.correctDot : styles.incorrectDot
                                                    ]}
                                                >
                                                    <Text style={{ color: 'transparent' }}>.</Text>
                                                </View>
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
                                keyboardType="default"
                                returnKeyType="done"
                                blurOnSubmit={true}
                                autoFocus={Platform.OS === 'android'}
                                editable={!isLoading && !isResultsPhase && currentRound <= totalRounds}
                            />
                        </View>

                        {/* Button at the bottom */}
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading || isResultsPhase || currentRound > totalRounds}
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