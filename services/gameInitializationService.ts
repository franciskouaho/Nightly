import { collection, doc, setDoc, getFirestore } from '@react-native-firebase/firestore';
import { GamePhase, GameMode } from '@/types/gameTypes';
import { transformQuestion as transformTrapAnswerQuestion } from '@/hooks/trap-answer-questions';
import { transformQuestion as transformWordGuessingQuestion } from '@/hooks/word-guessing-questions';
import { transformQuestion as transformNeverHaveIEverHotQuestion } from '@/hooks/never-have-i-ever-hot-questions';
import { doubleDareQuestions, transformDoubleDareQuestion } from '@/hooks/double-dare-questions';

// Configuration des jeux avec le nombre minimum de joueurs requis
export const GAME_CONFIG = {
    'truth-or-dare': { minPlayers: 2 },
    'listen-but-don-t-judge': { minPlayers: 3 },
    'trap-answer': { minPlayers: 2 },
    'never-have-i-ever-hot': { minPlayers: 2 },
    'never-have-i-ever-classic': { minPlayers: 2 }, // ⚠️ FIX: Ajout du mode classic
    'genius-or-liar': { minPlayers: 2 },
    'two-letters-one-word': { minPlayers: 1 },
    'word-guessing': { minPlayers: 2 },
    'double-dare': { minPlayers: 2 },
    'forbidden-desire': { minPlayers: 2 },
    'quiz-halloween': { minPlayers: 2 },
    'pile-ou-face': { minPlayers: 2 },
} as const;

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

interface Player {
    id: string;
    username: string; // Dans les rooms Firestore, c'est "username"
    displayName?: string;
    name: string;
    isHost: boolean;
    isReady: boolean;
    avatar: string;
    level: number;
}

interface GameInitializationOptions {
    gameMode: string;
    players: Player[];
    hostId: string;
    selectedRounds: number;
    selectedLevel?: 'hot' | 'extreme' | 'chaos';
    selectedMode?: 'versus' | 'fusion';
    selectedIntensity?: 'soft' | 'tension' | 'extreme';
    getGameContent?: (gameMode: GameMode) => Promise<any>;
}

/**
 * Récupère le nombre minimum de joueurs pour un jeu
 */
export const getMinPlayersForGame = (gameId: string): number => {
    return GAME_CONFIG[gameId as keyof typeof GAME_CONFIG]?.minPlayers || 2;
};

/**
 * Initialise les données de base communes à tous les jeux
 */
const createBaseGameData = (options: GameInitializationOptions) => {
    const playersForGameDoc = options.players.map(player => ({
        id: player.id,
        username: player.username || player.displayName || 'Joueur', // Firestore utilise "username"
        displayName: player.username || player.displayName || 'Joueur',
        name: player.username || player.displayName || 'Joueur Inconnu',
        isHost: player.isHost || false,
        isReady: player.isReady || false,
        avatar: player.avatar || '',
        level: player.level || 1,
        score: 0,
        history: [],
    }));

    return {
        gameMode: options.gameMode,
        players: playersForGameDoc,
        status: 'playing',
        currentRound: 1,
        totalRounds: options.selectedRounds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        host: options.hostId,
        scores: {},
        history: {},
    };
};

/**
 * Initialise un jeu "Two Letters One Word"
 */
const initializeTwoLettersOneWordGame = (options: GameInitializationOptions) => {
    console.log('[DEBUG] Démarrage du jeu Two Letters One Word');
    return {
        ...createBaseGameData(options),
        currentLetters: generateTwoLettersOneWordRandomLetters(),
        currentTheme: TWO_LETTERS_ONE_WORD_THEMES[Math.floor(Math.random() * TWO_LETTERS_ONE_WORD_THEMES.length)],
    };
};

/**
 * Initialise un jeu "Truth or Dare"
 */
const initializeTruthOrDareGame = (options: GameInitializationOptions) => {
    console.log('[DEBUG] Démarrage du jeu Truth or Dare - Phase de choix');
    const initialTargetPlayer = options.players.length > 0 ? options.players[0] : null;
    const initialCurrentPlayerId = initialTargetPlayer ? initialTargetPlayer.id : null;

    return {
        ...createBaseGameData(options),
        naughtyAnswers: {},
        targetPlayer: initialTargetPlayer,
        currentPlayerId: initialCurrentPlayerId,
        currentChoice: null,
        currentQuestion: null,
        askedQuestionIds: [],
        phase: GamePhase.CHOIX,
    };
};

/**
 * Initialise un jeu "Double Dare"
 */
const initializeDoubleDareGame = (options: GameInitializationOptions) => {
    console.log('[DEBUG] Démarrage du jeu Double Dare avec level:', options.selectedLevel, 'mode:', options.selectedMode);

    const levelToUse = options.selectedLevel || 'hot';
    const modeToUse = options.selectedMode || 'versus';

    // Générer la première question
    const filteredQuestions = doubleDareQuestions.filter(
        q => q.level === levelToUse && q.mode === modeToUse
    );
    const firstQuestion = filteredQuestions.length > 0
        ? transformDoubleDareQuestion(
            filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)],
            0
          )
        : null;

    return {
        ...createBaseGameData(options),
        playerScores: {},
        currentPlayerId: options.players[0]?.id || '',
        selectedLevel: levelToUse,
        selectedMode: modeToUse,
        currentQuestion: firstQuestion,
        safeWordEnabled: true,
        dareCompleted: false,
        penaltyAssigned: false,
        phase: 'dare',
    };
};

/**
 * Initialise un jeu "Forbidden Desire"
 */
const initializeForbiddenDesireGame = async (options: GameInitializationOptions) => {
    console.log('[DEBUG] Démarrage du jeu Forbidden Desire avec intensity:', options.selectedIntensity);

    const intensityToUse = options.selectedIntensity || 'soft';

    // Pour un jeu à deux joueurs, choisir aléatoirement qui commence
    const randomStartingPlayer = options.players.length > 0
        ? options.players[Math.floor(Math.random() * options.players.length)]
        : null;
    const startingPlayerId = randomStartingPlayer?.id || options.players[0]?.id || '';

    console.log('[DEBUG ForbiddenDesire] Starting player ID:', startingPlayerId);
    console.log('[DEBUG ForbiddenDesire] All players:', options.players.map(p => ({ id: p.id, name: p.name })));

    // Récupérer les questions pour générer la première
    let firstQuestion = null;
    try {
        if (options.getGameContent) {
            const gameContent = await options.getGameContent(options.gameMode as GameMode);
            const questionsArr = gameContent?.questions;
            if (questionsArr && Array.isArray(questionsArr)) {
                const filteredQuestions = questionsArr.filter((q: any) => q.intensity === intensityToUse);
                if (filteredQuestions.length > 0) {
                    firstQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des questions pour forbidden-desire:', error);
    }

    return {
        ...createBaseGameData(options),
        playerScores: {},
        currentPlayerId: startingPlayerId,
        selectedIntensity: intensityToUse,
        currentQuestion: firstQuestion,
        refusedQuestion: false,
        partnerChallenge: null,
        phase: 'question',
    };
};

/**
 * Initialise un jeu "Quiz Halloween"
 */
const initializeQuizHalloweenGame = (options: GameInitializationOptions) => {
    console.log('[DEBUG] Démarrage du jeu Quiz Halloween');
    const initialTargetPlayer = options.players.length > 0 ? options.players[0] : null;
    const initialCurrentPlayerId = initialTargetPlayer ? initialTargetPlayer.id : null;

    return {
        ...createBaseGameData(options),
        status: 'waiting',
        targetPlayer: initialTargetPlayer,
        currentPlayerId: initialCurrentPlayerId,
        currentQuestion: null,
        askedQuestionIds: [],
        phase: 'waiting',
    };
};

/**
 * Initialise un jeu générique avec questions
 */
const initializeGenericQuestionGame = async (options: GameInitializationOptions) => {
    console.log(`[DEBUG] Démarrage du jeu ${options.gameMode} - Phase Question/Action`);

    // Récupérer les questions pour le mode de jeu
    let gameContent;
    try {
        if (!options.getGameContent) {
            throw new Error('getGameContent function is required for generic question games');
        }
        gameContent = await options.getGameContent(options.gameMode as GameMode);
    } catch (error) {
        console.error('Erreur lors de la récupération du contenu du jeu:', error);
        throw new Error('Impossible de charger les questions pour ce mode de jeu');
    }

    const questionsArr = gameContent?.questions;

    if (!questionsArr || !Array.isArray(questionsArr) || questionsArr.length === 0) {
        console.error('Aucune question disponible pour ce mode de jeu:', options.gameMode);
        throw new Error('Aucune question disponible pour ce mode de jeu');
    }

    // Sélectionner la première question aléatoirement
    const firstQuestion = questionsArr[Math.floor(Math.random() * questionsArr.length)];
    console.log('[DEBUG ROOM] firstQuestion (raw from array):', firstQuestion);

    if (!firstQuestion) {
        console.error('Impossible de sélectionner la première question.');
        throw new Error('Impossible de sélectionner la première question');
    }

    // Transformer la question selon le type de jeu
    let transformedFirstQuestion;
    switch (options.gameMode) {
        case 'word-guessing':
            transformedFirstQuestion = transformWordGuessingQuestion(firstQuestion, 0);
            break;
        case 'trap-answer':
            transformedFirstQuestion = transformTrapAnswerQuestion(firstQuestion, 0);
            break;
        case 'never-have-i-ever-hot':
        case 'never-have-i-ever-classic': // ⚠️ FIX: classic utilise la même transformation que hot
            transformedFirstQuestion = transformNeverHaveIEverHotQuestion(firstQuestion, 0);
            break;
        default:
            console.warn(`Utilisation de la transformation de question générique pour: ${options.gameMode}`);
            transformedFirstQuestion = { ...firstQuestion, id: `q_0` };
            break;
    }
    console.log('[DEBUG ROOM] transformedFirstQuestion:', transformedFirstQuestion);

    const initialTargetPlayer = options.players.length > 0 ? options.players[0] : null;
    const initialCurrentPlayerId = initialTargetPlayer ? initialTargetPlayer.id : null;

    return {
        ...createBaseGameData(options),
        naughtyAnswers: {},
        targetPlayer: initialTargetPlayer,
        currentPlayerId: initialCurrentPlayerId,
        currentQuestion: transformedFirstQuestion,
        askedQuestionIds: [transformedFirstQuestion.id],
        phase: GamePhase.QUESTION,
    };
};

/**
 * Initialise un jeu "Pile ou Face"
 */
const initializePileOuFaceGame = (options: GameInitializationOptions) => {
    console.log('[DEBUG] Démarrage du jeu Pile ou Face');
    
    return {
        ...createBaseGameData(options),
        phase: 'loading',
        currentPlayerId: null,
        currentQuestion: null,
        selectedPlayerName: null,
        coinFlipResult: null,
        questionRevealed: false,
        askedQuestionIds: [],
        isFlipping: false, // État synchronisé pour l'animation
        coinFlipHistory: [], // Historique pour équilibrer les résultats
    };
};

/**
 * Crée un nouveau jeu dans Firestore avec la configuration appropriée
 */
export const createGame = async (options: GameInitializationOptions): Promise<string> => {
    const db = getFirestore();
    const gamesCollection = collection(db, 'games');
    const gameDocRef = doc(gamesCollection);
    const gameDocId = gameDocRef.id;

    let gameDataToSet;

    // Initialiser les données du jeu selon le mode
    switch (options.gameMode) {
        case 'two-letters-one-word':
            gameDataToSet = initializeTwoLettersOneWordGame(options);
            break;
        case 'truth-or-dare':
            gameDataToSet = initializeTruthOrDareGame(options);
            break;
        case 'double-dare':
            gameDataToSet = initializeDoubleDareGame(options);
            break;
        case 'forbidden-desire':
            gameDataToSet = await initializeForbiddenDesireGame(options);
            break;
        case 'quiz-halloween':
            gameDataToSet = initializeQuizHalloweenGame(options);
            break;
        case 'pile-ou-face':
            gameDataToSet = initializePileOuFaceGame(options);
            break;
        default:
            gameDataToSet = await initializeGenericQuestionGame(options);
            break;
    }

    if (!gameDataToSet) {
        console.error('Erreur: gameDataToSet n\'a pas été défini pour le mode de jeu', options.gameMode);
        throw new Error('Configuration de jeu manquante');
    }

    await setDoc(gameDocRef, gameDataToSet);
    console.log('[DEBUG] Jeu créé avec succès:', options.gameMode, gameDocId);

    return gameDocId;
};
