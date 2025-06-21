import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, Clipboard, Share, GestureResponderEvent, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { collection, doc, onSnapshot, updateDoc, getFirestore, getDoc, setDoc, addDoc } from '@react-native-firebase/firestore';
import {GamePhase, GameMode } from '@/types/gameTypes';
import RulesDrawer from '@/components/room/RulesDrawer';
import InviteModal from '@/components/room/InviteModal';
import RoundedButton from '@/components/RoundedButton';
import Avatar from '@/components/Avatar';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { transformQuestion as transformTrapAnswerQuestion } from '../game/trap-answer/questions';
import { transformQuestion as transformWordGuessingQuestion } from '../game/word-guessing/questions';
import { transformQuestion as transformNeverHaveIEverHotQuestion } from '../game/never-have-i-ever-hot/questions';

// Liste des thèmes possibles pour 2 Lettres 1 Mot
const TWO_LETTERS_ONE_WORD_THEMES = [
    'une marque',
    'une ville',
    'un prénom',
    'un pays',
    'un animal',
    'un métier',
    'un sport',
    'un fruit',
    'un légume',
    'un objet'
] as const;

// Génère deux lettres aléatoires pour 2 Lettres 1 Mot
const generateTwoLettersOneWordRandomLetters = (): [string, string] => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let firstLetter = alphabet[Math.floor(Math.random() * alphabet.length)] as string;
    let secondLetter: string;
    do {
        secondLetter = alphabet[Math.floor(Math.random() * alphabet.length)] as string;
    } while (secondLetter === firstLetter);
    return [firstLetter, secondLetter];
};

// Configuration des jeux avec le nombre minimum de joueurs requis
const GAME_CONFIG = {
    'truth-or-dare': { minPlayers: 2 },
    'listen-but-don-t-judge': { minPlayers: 3 },
    'the-hidden-village': { minPlayers: 5 },
    'trap-answer': { minPlayers: 2 },
    'never-have-i-ever-hot': { minPlayers: 2 },
    'genius-or-liar': { minPlayers: 2 },
    'two-letters-one-word': { minPlayers: 1 },
    'word-guessing': { minPlayers: 2 }
};

// Type pour l'utilisateur
interface User {
    id: string | number;
    username: string;
    displayName?: string;
    avatar?: string;
    level?: number;
    isHost?: boolean;
}

// Type local pour Player qui correspond à ce que nous utilisons dans ce composant
interface LocalPlayer {
    id: string;
    username: string;
    displayName?: string;
    name: string; // Pour la rétrocompatibilité avec le code existant
    isHost: boolean;
    isReady: boolean;
    avatar: string;
    level: number;
}

// Interface pour l'objet Room qui correspond à ce qui est créé dans la page d'accueil
interface Room {
    id: string;
    gameId: string;
    gameMode?: string;
    name: string;
    players: LocalPlayer[];
    createdAt: string;
    status: string;
    host: string;
    maxPlayers: number;
    code: string;
    gameDocId?: string;
}

// Interface pour les données de création de salle
interface RoomCreationData {
    name: string;
    gameId: string;
    maxPlayers: number;
    host: string;
    players: LocalPlayer[];
    [key: string]: any; // Pour les propriétés additionnelles
}

interface RoomScreenStyles {
    container: ViewStyle;
    background: ViewStyle;
    loadingContainer: ViewStyle;
    loadingText: TextStyle;
    topBar: ViewStyle;
    topBarRow: ViewStyle;
    backButton: ViewStyle;
    topBarTitleContainer: ViewStyle;
    topBarTitle: TextStyle;
    shareButton: ViewStyle;
    codeContainer: ViewStyle;
    codeLabel: TextStyle;
    codeBox: ViewStyle;
    codeText: TextStyle;
    playersContainer: ViewStyle;
    playersHeaderRow: ViewStyle;
    rulesButtonRow: ViewStyle;
    rulesText: TextStyle;
    rulesCircle: ViewStyle;
    rulesQuestionMark: TextStyle;
    sectionTitle: TextStyle;
    playerCard: ViewStyle;
    playerAvatar: ImageStyle;
    playerInfo: ViewStyle;
    playerName: TextStyle;
    hostBadge: ViewStyle;
    hostText: TextStyle;
    readyBadge: ViewStyle;
    readyText: TextStyle;
    readyButton: ViewStyle;
    readyButtonGradient: ViewStyle;
    readyButtonText: TextStyle;
    rightContainer: ViewStyle;
    headerButtons: ViewStyle;
    inviteButton: ViewStyle;
    gameControlsContainer: ViewStyle;
    roundSelectorContainer: ViewStyle;
    roundSelectorButton: ViewStyle;
    roundSelectorGradient: ViewStyle;
    roundSelectorText: TextStyle;
    roundSelectorIconContainer: ViewStyle;
    starIcon: TextStyle;
    smallStarIcon: TextStyle;
    roundOptionsContainer: ViewStyle;
    roundOptionsRow: ViewStyle;
    roundOption: ViewStyle;
    roundOptionText: TextStyle;
    selectedRoundOption: ViewStyle;
    selectedRoundOptionText: TextStyle;
    startButton: ViewStyle;
    startButtonText: TextStyle;
    leaveButton: ViewStyle;
    leaveButtonText: TextStyle;
    iconButton: ViewStyle;
    minPlayersWarning: TextStyle;
    disabledButton: ViewStyle;
    centeredWarning: TextStyle;
    minPlayersText: TextStyle;
}

/**
 * Crée une salle dans Firebase avec gestion de timeout et d'erreurs améliorée
 * @param roomData Données de la salle à créer
 * @param timeoutMs Délai maximum en millisecondes (défaut: 30000ms)
 * @returns Promise avec les données de la salle créée incluant son ID
 */
export const createFirebaseRoom = async (roomData: RoomCreationData, timeoutMs = 30000): Promise<Room> => {
    // Récupérer l'instance Firestore
    const db = getFirestore();

    // Vérification des données obligatoires
    if (!roomData.name || !roomData.host || !roomData.gameId) {
        throw new Error('Données de salle incomplètes (nom, hôte ou gameId manquant)');
    }

    // Nettoyer les données pour éviter les champs non sérialisables
    const cleanedPlayers = roomData.players.map(player => ({
        id: player.id,
        username: player.username || player.displayName || 'Joueur',
        name: player.name || player.displayName || player.username || 'Joueur',
        isHost: player.isHost || false,
        isReady: player.isReady || false,
        avatar: player.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        level: player.level || 1
    }));

    // Créer un objet propre pour Firestore (sans méthodes ou propriétés spéciales)
    const firestoreData = {
        name: roomData.name,
        gameId: roomData.gameId,
        gameMode: roomData.gameId,
        host: roomData.host,
        status: 'waiting',
        players: cleanedPlayers,
        maxPlayers: roomData.maxPlayers || 20,
        createdAt: new Date().toISOString(), // Utiliser une chaîne ISO au lieu de serverTimestamp() pour résoudre des problèmes potentiels
        updatedAt: new Date().toISOString(),
        code: roomData.code || '',
    };

    console.log('🏠 Tentative de création de salle avec données nettoyées:', JSON.stringify(firestoreData));

    try {
        // Créer une référence à la collection
        const roomsCollection = collection(db, 'rooms');

        // Mesurer le temps d'exécution
        const startTime = Date.now();

        // Utiliser une promesse avec timeout manuellement géré
        const addDocWithTimeout = async () => {
            return new Promise<Room>((resolve, reject) => {
                // Ajouter le document
                addDoc(roomsCollection, firestoreData)
                    .then(docRef => {
                        const endTime = Date.now();
                        console.log(`🏠 Salle créée avec succès en ${endTime - startTime}ms:`, docRef.id);

                        // Retourner l'objet Room avec l'ID
                        const roomWithId: Room = {
                            ...roomData,
                            id: docRef.id,
                            createdAt: firestoreData.createdAt,
                            status: 'waiting',
                            maxPlayers: firestoreData.maxPlayers,
                            code: firestoreData.code,
                            gameMode: firestoreData.gameMode,
                        };

                        resolve(roomWithId);
                    })
                    .catch(error => {
                        console.error('⚡ Erreur Firebase addDoc:', error);
                        reject(error);
                    });

                // Ajouter un timeout
                setTimeout(() => {
                    reject(new Error(`Délai d'attente dépassé lors de la création de la salle (${timeoutMs}ms)`));
                }, timeoutMs);
            });
        };

        // Exécuter avec un délai de garde
        return await addDocWithTimeout();
    } catch (error: any) {
        console.error('🔥 Erreur de création de salle détaillée:', error);

        // Vérifications supplémentaires
        if (error.code === 'permission-denied') {
            throw new Error(`Accès refusé: vérifiez les règles de sécurité Firestore`);
        } else if (error.code === 'unavailable' || error.code === 'network-request-failed') {
            throw new Error(`Problème réseau: vérifiez votre connexion internet`);
        }

        // Ajouter le délai au message pour clarté
        if (error.message.includes('Délai d\'attente dépassé')) {
            console.error(`⏱️ Délai de ${timeoutMs}ms dépassé - causes possibles:`);
            console.error('- Connexion internet instable ou lente');
            console.error('- Règles de sécurité Firestore restrictives');
            console.error('- Données non sérialisables dans l\'objet room');
            console.error('- Trafic élevé ou limitations Firebase');
        }

        throw error;
    }
};

export default function RoomScreen() {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRulesDrawerVisible, setIsRulesDrawerVisible] = useState(false);
    const [inviteModalVisible, setInviteModalVisible] = useState(false);
    const [isStartingGame, setIsStartingGame] = useState(false);
    const [hasReadRules, setHasReadRules] = useState(false);
    const [showRulesOnReady, setShowRulesOnReady] = useState(false);
    const [isReadyClicked, setIsReadyClicked] = useState(false);
    const [selectedRounds, setSelectedRounds] = useState(5);
    const [showRoundSelector, setShowRoundSelector] = useState(false);
    const { t } = useTranslation();
    const { language, isRTL, getGameContent } = useLanguage();

    // Debugging useEffect
    useEffect(() => {
        if (room) {
            console.log('DEBUG MIN PLAYERS CONDITION:', {
                gameId: room.gameId,
                playersLength: room.players?.length,
                minRequired: getMinPlayersForGame(room.gameId),
            });
        }
    }, [room?.gameId, room?.players?.length]);

    useEffect(() => {
        if (!id || !user) return;

        const db = getFirestore();
        const roomRef = doc(db, 'rooms', id as string);

        const unsubscribe = onSnapshot(roomRef, async (doc) => {
            console.log('[DEBUG] onSnapshot déclenché');
            if (doc.exists()) {
                const roomData = { ...(doc.data() as Room), id: doc.id };
                setRoom(roomData);

                // Ajout du log debug
                console.log('[DEBUG ROOM] roomData:', roomData);
                console.log('[DEBUG ROOM] Statut:', roomData.status, 'gameDocId:', roomData.gameDocId, 'gameMode:', roomData.gameMode);

                // Redirection automatique pour tous les joueurs quand la partie commence
                if (roomData.status === 'playing' && roomData.gameDocId) {
                    if (roomData.gameMode === 'truth-or-dare') {
                        router.replace(`/game/truth-or-dare/${roomData.gameDocId}`);
                    } else if (roomData.gameMode === 'listen-but-don-t-judge') {
                        router.replace(`/game/listen-but-don-t-judge/${roomData.gameDocId}`);
                    } else if (roomData.gameMode === 'the-hidden-village') {
                        router.replace(`/game/the-hidden-village/${roomData.gameDocId}`);
                    } else if (roomData.gameMode === 'trap-answer') {
                        router.replace(`/game/trap-answer/${roomData.gameDocId}`);
                    } else if (roomData.gameMode === 'never-have-i-ever-hot') {
                        router.replace(`/game/never-have-i-ever-hot/${roomData.gameDocId}`);
                    } else if (roomData.gameMode === 'genius-or-liar') {
                        router.replace(`/game/genius-or-liar/${roomData.gameDocId}`);
                    } else if (roomData.gameMode === 'two-letters-one-word') {
                        router.replace(`/game/two-letters-one-word/${roomData.gameDocId}`);
                    } else if (roomData.gameMode === 'word-guessing') {
                        router.replace(`/game/word-guessing/${roomData.gameDocId}`);
                    }
                    return;
                }
            } else {
                Alert.alert('Erreur', 'Salle introuvable');
                router.back();
            }
            setLoading(false);
        }, (error) => {
            console.error('Erreur lors de l\'écoute de la salle:', error);
            Alert.alert('Erreur', 'Impossible de charger la salle');
            router.back();
        });

        return () => unsubscribe();
    }, [id, user]);

    const getMinPlayersForGame = (gameId: string): number => {
        return GAME_CONFIG[gameId as keyof typeof GAME_CONFIG]?.minPlayers || 2;
    };

    const handleStartGame = async () => {
        if (!room || !user) return;

        const minPlayers = getMinPlayersForGame(room.gameId);

        // Déterminer le nombre minimum de joueurs à afficher dans l'alerte
        const displayMinPlayers = room.gameId === 'two-letters-one-word' ? 1 : minPlayers;

        if (room.players.length < minPlayers) {
            Alert.alert(
                t('room.notEnoughPlayers'),
                t('room.minPlayersRequired', { count: displayMinPlayers })
            );
            return;
        }

        // Réinitialiser l'état de lecture des règles
        setHasReadRules(false);
        // Afficher les règles avant de démarrer la partie
        setIsRulesDrawerVisible(true);
        setIsStartingGame(true);
    };

    const handleRulesClose = async () => {
        setIsRulesDrawerVisible(false);
        setShowRulesOnReady(false);

        // Si on était en train de démarrer la partie et que les règles ont été lues
        if (isStartingGame && hasReadRules) {
            setIsStartingGame(false);
            await startGame();
        } else if (isStartingGame) {
            // Si on ferme sans avoir lu les règles, on annule le démarrage
            setIsStartingGame(false);
            Alert.alert(
                'Règles non lues',
                'Veuillez lire les règles avant de démarrer la partie.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleRulesConfirm = async () => {
        setHasReadRules(true);
        if (isStartingGame) {
            setIsRulesDrawerVisible(false);
            setIsStartingGame(false);
            await startGame();
        } else if (showRulesOnReady) {
            await handleConfirmRulesOnReady();
            setShowRulesOnReady(false);
        } else {
            setIsRulesDrawerVisible(false);
        }
    };

    const startGame = async () => {
        setIsStartingGame(true);
        if (!room || !user) return;

        try {
            const db = getFirestore();
            const gamesCollection = collection(db, 'games');
            const gameDocRef = doc(gamesCollection);
            const gameDocId = gameDocRef.id;

            // Assurer que chaque joueur a un champ 'name' avant de le copier dans le document de jeu
            const playersForGameDoc = room.players.map(player => ({
                id: player.id,
                username: player.username || player.displayName || 'Joueur',
                displayName: player.displayName || player.username || 'Joueur',
                name: player.displayName || player.username || 'Joueur Inconnu',
                isHost: player.isHost || false,
                isReady: player.isReady || false,
                avatar: player.avatar || '',
                level: player.level || 1,
                score: 0,
                history: [],
            }));

            let gameDataToSet;
            const initialTargetPlayer = playersForGameDoc.length > 0 ? playersForGameDoc[0] : null;
            const initialCurrentPlayerId = initialTargetPlayer ? initialTargetPlayer.id : null;

            // CORRECTION: Initialiser l'historique des joueurs avec des tableaux vides au lieu de pré-remplir avec des 0
            const initialPlayersHistory: { [playerId: string]: number[] } = {};

            // Logique spécifique au jeu "Two Letters One Word"
            if (room.gameId === 'two-letters-one-word') {
                console.log('[DEBUG] Démarrage du jeu Two Letters One Word');
                gameDataToSet = {
                    gameMode: room.gameId,
                    players: playersForGameDoc,
                    status: 'playing',
                    currentRound: 1,
                    totalRounds: selectedRounds,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    host: user.uid,
                    scores: {},
                    history: initialPlayersHistory,
                    currentLetters: generateTwoLettersOneWordRandomLetters(),
                    currentTheme: TWO_LETTERS_ONE_WORD_THEMES[Math.floor(Math.random() * TWO_LETTERS_ONE_WORD_THEMES.length)],
                };
            } else if (room.gameId === 'truth-or-dare') {
                // Logique spécifique au jeu "Truth or Dare" - Commence en phase de choix
                console.log('[DEBUG] Démarrage du jeu Truth or Dare - Phase de choix');
                gameDataToSet = {
                    gameMode: room.gameId,
                    players: playersForGameDoc,
                    status: 'playing',
                    currentRound: 1,
                    totalRounds: selectedRounds,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    host: user.uid,
                    scores: {},
                    history: {},
                    naughtyAnswers: {},
                    targetPlayer: initialTargetPlayer, // Le premier joueur commence
                    currentPlayerId: initialCurrentPlayerId, // Initialiser currentPlayerId de manière sécurisée
                    currentChoice: null, // Pas encore de choix
                    currentQuestion: null, // Pas encore de question sélectionnée
                    askedQuestionIds: [], // Aucune question posée au début
                    phase: GamePhase.CHOIX, // Commence en phase de choix
                };
            }
            else {
                // Logique pour les autres modes de jeu - Commence en phase de question/action
                // Récupérer les questions pour le mode de jeu
                let gameContent;
                try {
                    gameContent = await getGameContent(room.gameId as GameMode);
                } catch (error) {
                    console.error('Erreur lors de la récupération du contenu du jeu:', error);
                    Alert.alert('Erreur', 'Impossible de démarrer la partie car les questions n\'ont pas pu être chargées.');
                    setIsStartingGame(false);
                    return;
                }

                const questionsArr = gameContent?.questions;

                if (!questionsArr || !Array.isArray(questionsArr) || questionsArr.length === 0) {
                    console.error('Aucune question disponible pour ce mode de jeu:', room.gameId);
                    Alert.alert('Erreur', 'Impossible de démarrer la partie car aucune question n\'est disponible pour ce mode de jeu.');
                    setIsStartingGame(false);
                    return;
                }

                // Sélectionner la première question aléatoirement
                const firstQuestion = questionsArr[Math.floor(Math.random() * questionsArr.length)];
                console.log('[DEBUG ROOM] firstQuestion (raw from array):', firstQuestion);

                if (!firstQuestion) {
                    console.error('Impossible de sélectionner la première question.');
                    Alert.alert('Erreur', 'Impossible de démarrer la partie car la première question n\'a pas pu être sélectionnée.');
                    setIsStartingGame(false);
                    return;
                }

                // Assurer que la question sélectionnée a une structure correcte pour le stockage
                let transformedFirstQuestion;
                switch (room.gameId) {
                    case 'word-guessing':
                        transformedFirstQuestion = transformWordGuessingQuestion(firstQuestion, 0);
                        break;
                    case 'trap-answer':
                        transformedFirstQuestion = transformTrapAnswerQuestion(firstQuestion, 0);
                        break;
                    case 'never-have-i-ever-hot':
                        transformedFirstQuestion = transformNeverHaveIEverHotQuestion(firstQuestion, 0);
                        break;
                    default:
                        // Fallback pour les autres jeux, en supposant une structure simple.
                        console.warn(`Utilisation de la transformation de question générique pour: ${room.gameId}`);
                        transformedFirstQuestion = { ...firstQuestion, id: `q_0` };
                        break;
                }
                console.log('[DEBUG ROOM] transformedFirstQuestion:', transformedFirstQuestion);

                console.log(`[DEBUG] Démarrage du jeu ${room.gameId} - Phase Question/Action`);
                gameDataToSet = {
                    gameMode: room.gameId,
                    players: playersForGameDoc,
                    status: 'playing',
                    currentRound: 1,
                    totalRounds: selectedRounds,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    host: user.uid,
                    scores: {},
                    history: initialPlayersHistory,
                    naughtyAnswers: {}, // Peut être spécifique à certains jeux, laisser pour l'instant si c'était là
                    targetPlayer: initialTargetPlayer, // Définir le premier joueur comme cible initiale
                    currentPlayerId: initialCurrentPlayerId, // Initialiser currentPlayerId de manière sécurisée
                    currentQuestion: transformedFirstQuestion, // Utiliser la question transformée
                    askedQuestionIds: [transformedFirstQuestion.id], // Ajouter l'ID de la première question à la liste des questions posées
                    phase: GamePhase.QUESTION, // Commence en phase de question/action (nom ajusté pour clarté)
                };
            }

            // Assurez-vous que gameDataToSet est défini avant d'appeler setDoc
            if (!gameDataToSet) {
                console.error('Erreur: gameDataToSet n\'a pas été défini pour le mode de jeu', room.gameId);
                Alert.alert('Erreur', 'Impossible de démarrer la partie: configuration de jeu manquante.');
                setIsStartingGame(false);
                return;
            }

            await setDoc(gameDocRef, gameDataToSet);

            // Mettre à jour la salle avec l'ID du document de jeu et le mode de jeu
            await updateDoc(doc(db, 'rooms', room.id), {
                status: 'playing',
                gameDocId: gameDocId,
                gameMode: room.gameId
            });

            // Rediriger vers le jeu
            console.log('[DEBUG] Redirection vers le jeu:', room.gameId, gameDocId);

            switch (room.gameId) {
                case 'never-have-i-ever-hot':
                case 'truth-or-dare':
                case 'listen-but-don-t-judge':
                case 'the-hidden-village':
                case 'trap-answer':
                case 'genius-or-liar':
                case 'two-letters-one-word':
                case 'word-guessing':
                    router.replace(`/game/${room.gameId}/${gameDocId}`);
                    break;
                default:
                    console.error('Mode de jeu non reconnu:', room.gameId);
                    Alert.alert('Erreur', 'Mode de jeu non reconnu');
                    setIsStartingGame(false);
            }

        } catch (error) {
            console.error('Erreur lors du démarrage du jeu:', error);
            Alert.alert('Erreur', 'Impossible de démarrer le jeu');
        } finally {
            setIsStartingGame(false);
        }
    };

    const handleInviteFriend = () => {
        setInviteModalVisible(true);
    };

    const handleLeaveRoom = async () => {
        if (!room || !user) return;

        try {
            const db = getFirestore();
            const updatedPlayers = room.players.filter(p => p.id !== user.uid);

            if (updatedPlayers.length === 0) {
                // Si c'était le dernier joueur, supprimer la salle
                await updateDoc(doc(db, 'rooms', room.id), {
                    status: 'finished'
                });
            } else if (updatedPlayers[0]) {
                // Sinon, mettre à jour la liste des joueurs
                await updateDoc(doc(db, 'rooms', room.id), {
                    players: updatedPlayers,
                    host: updatedPlayers[0].id // Le premier joueur restant devient l'hôte
                });
            }

            router.back();
        } catch (error) {
            console.error('Erreur lors de la sortie de la salle:', error);
            Alert.alert('Erreur', 'Impossible de quitter la salle');
        }
    };

    const handleShareRoom = async () => {
        if (!room) return;

        try {
            await Share.share({
                message: `Rejoins ma partie sur Nightly ! Code: ${room.code}`,
                title: 'Rejoins ma partie'
            });
        } catch (error) {
            console.error('Erreur lors du partage:', error);
        }
    };

    const handleCopyCode = async () => {
        if (!room) return;

        try {
            await Clipboard.setString(room.code);
        } catch (error) {
            console.error('Erreur lors de la copie du code:', error);
        }
    };

    const handleRoundSelection = (rounds: number) => {
        setSelectedRounds(rounds);
        setShowRoundSelector(false);
    };

    const handleConfirmRulesOnReady = async () => {
        setShowRulesOnReady(false);
        if (isReadyClicked && room && user) {
            try {
                const db = getFirestore();
                const updatedPlayers = room.players.map(p =>
                    String(p.id) === String(user?.uid) ? { ...p, isReady: true } : p
                );

                console.log('Mise à jour du statut prêt pour le joueur:', user.uid);
                await updateDoc(doc(db, 'rooms', room.id), {
                    players: updatedPlayers
                });

                // Vérification que la mise à jour a réussi
                const roomRef = doc(db, 'rooms', room.id);
                const updatedRoomDoc = await getDoc(roomRef);
                if (updatedRoomDoc.exists()) {
                    const updatedRoomData = updatedRoomDoc.data();
                    console.log('Statut mis à jour avec succès:', updatedRoomData);
                }
            } catch (error) {
                console.error('Erreur lors de la mise à jour du statut prêt:', error);
                Alert.alert('Erreur', 'Impossible de se mettre prêt');
            }
        }
        setIsReadyClicked(false);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{t('room.loading')}</Text>
            </View>
        );
    }

    if (!room || !room.id) {
        return null;
    }

    const minPlayersForGame = room.gameId ? getMinPlayersForGame(room.gameId) : -1; // Calculate minimum players

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
                locations={[0, 0.2, 0.5, 0.8, 1]}
                style={styles.background}
            >
                <View style={styles.topBar}>
                    <View style={styles.topBarRow}>
                        <TouchableOpacity onPress={handleLeaveRoom} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>

                        <View style={styles.rightContainer}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={handleInviteFriend}
                            >
                                <LinearGradient
                                    colors={["#A259FF", "#C471F5"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{ borderRadius: 12, padding: 7 }}
                                >
                                    <Ionicons name="qr-code" size={22} color="white" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.topBarTitleContainer}>
                        <Text style={styles.topBarTitle}>
                            {t('room.title')} - {t(`home.games.${room.gameId}.name`, { defaultValue: room.name?.toUpperCase() })}
                        </Text>
                    </View>
                </View>

                {/* Message du minimum de joueurs déplacé ici */}
                {room && room.players && room.gameId && room.players.length <= getMinPlayersForGame(room.gameId) && (
                    <Text style={[styles.minPlayersWarning, styles.centeredWarning]}>
                        {t('room.minPlayersRequired', { count: getMinPlayersForGame(room.gameId) })}
                    </Text>
                )}

                <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>{t('room.codeLabel')}</Text>
                    <TouchableOpacity
                        style={styles.codeBox}
                        onPress={handleCopyCode}
                    >
                        <Text style={styles.codeText}>{room.code}</Text>
                        <Ionicons name="copy-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.playersContainer}>
                    <View style={styles.playersHeaderRow}>
                        <Text style={styles.sectionTitle}>
                            {t('room.players', {count: room.players.length})} ({room.players.length}/{room.maxPlayers})
                        </Text>
                        <TouchableOpacity style={styles.rulesButtonRow} onPress={() => setIsRulesDrawerVisible(true)}>
                            <Text style={styles.rulesText}>{t('room.rules')}</Text>
                            <View style={styles.rulesCircle}>
                                <Text style={styles.rulesQuestionMark}>?</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={room.players}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.playerCard}>
                                <View style={{ marginRight: 10 }}>
                                    <Avatar
                                        source={item.avatar}
                                        size={40}
                                        username={item.displayName || item.username}
                                    />
                                </View>
                                <View style={styles.playerInfo}>
                                    <Text style={styles.playerName}>{item.displayName || item.username}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {item.isHost && (
                                            <View style={styles.hostBadge}>
                                                <Text style={styles.hostText}>{t('room.host')}</Text>
                                            </View>
                                        )}
                                        {item.isReady && (
                                            <View style={styles.readyBadge}>
                                                <Text style={styles.readyText}>{t('room.ready')}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}
                    />
                </View>

                <RulesDrawer
                    visible={isRulesDrawerVisible || showRulesOnReady}
                    onClose={handleRulesClose}
                    onConfirm={handleRulesConfirm}
                    gameId={room?.gameId}
                    isStartingGame={showRulesOnReady}
                />

                {user?.uid === room.host && room.status === 'waiting' && (
                    <>
                        <View style={styles.gameControlsContainer}>
                            <View style={styles.roundSelectorContainer}>
                                {user?.uid === room.host && room.gameId !== 'the-hidden-village' && (
                                    <TouchableOpacity
                                        style={styles.roundSelectorButton}
                                        onPress={() => setShowRoundSelector(!showRoundSelector)}
                                    >
                                        <LinearGradient
                                            colors={["#7B3FE4", "#8345E6"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.roundSelectorGradient}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={styles.roundSelectorText}>{selectedRounds} {t('room.rounds')}</Text>
                                                <View style={styles.roundSelectorIconContainer}>
                                                    <MaterialCommunityIcons name="star-four-points" size={18} color="white" style={styles.starIcon} />
                                                    <MaterialCommunityIcons name="star-four-points" size={12} color="white" style={styles.smallStarIcon} />
                                                </View>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}

                                {showRoundSelector && (
                                    <View style={styles.roundOptionsContainer}>
                                        <View style={styles.roundOptionsRow}>
                                            <TouchableOpacity
                                                key={5}
                                                style={[
                                                    styles.roundOption,
                                                    selectedRounds === 5 && styles.selectedRoundOption
                                                ]}
                                                onPress={() => handleRoundSelection(5)}
                                            >
                                                <Text style={[
                                                    styles.roundOptionText,
                                                    selectedRounds === 5 && styles.selectedRoundOptionText
                                                ]}>
                                                    5
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                key={10}
                                                style={[
                                                    styles.roundOption,
                                                    selectedRounds === 10 && styles.selectedRoundOption
                                                ]}
                                                onPress={() => handleRoundSelection(10)}
                                            >
                                                <Text style={[
                                                    styles.roundOptionText,
                                                    selectedRounds === 10 && styles.selectedRoundOptionText
                                                ]}>
                                                    10
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                key={15}
                                                style={[
                                                    styles.roundOption,
                                                    selectedRounds === 15 && styles.selectedRoundOption
                                                ]}
                                                onPress={() => handleRoundSelection(15)}
                                            >
                                                <Text style={[
                                                    styles.roundOptionText,
                                                    selectedRounds === 15 && styles.selectedRoundOptionText
                                                ]}>
                                                    15
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.roundOptionsRow}>
                                            <TouchableOpacity
                                                key={20}
                                                style={[
                                                    styles.roundOption,
                                                    selectedRounds === 20 && styles.selectedRoundOption
                                                ]}
                                                onPress={() => handleRoundSelection(20)}
                                            >
                                                <Text style={[
                                                    styles.roundOptionText,
                                                    selectedRounds === 20 && styles.selectedRoundOptionText
                                                ]}>
                                                    20
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                key={25}
                                                style={[
                                                    styles.roundOption,
                                                    selectedRounds === 25 && styles.selectedRoundOption
                                                ]}
                                                onPress={() => handleRoundSelection(25)}
                                            >
                                                <Text style={[
                                                    styles.roundOptionText,
                                                    selectedRounds === 25 && styles.selectedRoundOptionText
                                                ]}>
                                                    25
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </View>

                            <RoundedButton
                                title={t('room.startGame')}
                                onPress={handleStartGame}
                                disabled={
                                    !room.players.every(p => p.isReady) ||
                                    room.players.length < getMinPlayersForGame(room.gameId)
                                }
                                style={[
                                    styles.startButton,
                                    room.players.length < getMinPlayersForGame(room.gameId) && styles.disabledButton
                                ]}
                                textStyle={styles.startButtonText}
                            />
                        </View>
                    </>
                )}

                {user?.uid !== room.host && room.status === 'waiting' && room.id && !room.players.find(p => String(p.id) === String(user?.uid))?.isReady && (
                    <TouchableOpacity
                        style={styles.readyButton}
                        onPress={() => {
                            setShowRulesOnReady(true);
                            setIsReadyClicked(true);
                        }}
                    >
                        <LinearGradient
                            colors={["#A259FF", "#C471F5"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.readyButtonGradient}
                        >
                            <Text style={styles.readyButtonText}>{t('room.iAmReady')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                <InviteModal
                    visible={inviteModalVisible}
                    roomId={room?.code || ''}
                    onClose={() => setInviteModalVisible(false)}
                    onCopyCode={handleCopyCode}
                    onShareCode={handleShareRoom}
                />
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create<RoomScreenStyles>({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4b277d',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
    },
    topBar: {
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 10,
    },
    topBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topBarTitleContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
    },
    topBarTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },
    shareButton: {
        padding: 8,
    },
    codeContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    codeLabel: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 10,
    },
    codeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    codeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
        letterSpacing: 2,
    },
    playersContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    playersHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    rulesButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rulesText: {
        color: '#ccc',
        fontSize: 16,
        marginRight: 6,
    },
    rulesCircle: {
        width: 18,
        height: 18,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rulesQuestionMark: {
        color: '#ccc',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: -2,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 10,
    },
    playerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    playerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    playerName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    hostBadge: {
        backgroundColor: '#6c5ce7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
    },
    hostText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    readyBadge: {
        backgroundColor: '#00c853',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    readyText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    readyButton: {
        width: '90%',
        alignSelf: 'center',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 15,
    },
    readyButtonGradient: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    readyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inviteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(93, 109, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gameControlsContainer: {
        width: '100%',
        marginBottom: 15,
        position: 'relative',
        zIndex: 100,
    },
    roundSelectorContainer: {
        width: '100%',
        alignItems: 'flex-start',
        marginHorizontal: 20,
        marginBottom: 15,
        position: 'relative',
        zIndex: 100,
    },
    roundSelectorButton: {
        width: 'auto',
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 10,
    },
    roundSelectorGradient: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roundSelectorText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    roundSelectorIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 5,
    },
    starIcon: {
        marginLeft: 2,
    },
    smallStarIcon: {
        marginLeft: -4,
        marginTop: -8,
    },
    roundOptionsContainer: {
        position: 'absolute',
        bottom: '120%',
        left: 0,
        backgroundColor: 'rgba(20, 20, 30, 0.8)',
        borderRadius: 12,
        padding: 10,
        flexDirection: 'column',
        justifyContent: 'space-around',
        zIndex: 1000,
        width: 220,
    },
    roundOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    roundOption: {
        padding: 16,
        margin: 5,
        borderRadius: 12,
        backgroundColor: 'rgba(80, 80, 100, 0.3)',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roundOptionText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    selectedRoundOption: {
        backgroundColor: '#A259FF',
    },
    selectedRoundOptionText: {
        color: '#fff',
    },
    startButton: {
        marginHorizontal: 20,
        marginBottom: 15,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    leaveButton: {
        marginHorizontal: 20,
        marginBottom: 30,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    leaveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    minPlayersWarning: {
        color: '#ff6b6b',
        fontSize: 14,
        fontWeight: '500',
    },
    disabledButton: {
        opacity: 0.5,
    },
    centeredWarning: {
        textAlign: 'center',
        marginBottom: 10,
    },
    minPlayersText: {
        color: '#ccc', // Couleur grise pour l'information permanente
        fontSize: 14,
        marginTop: 5,
        textAlign: 'center',
    },
});
