# Comprehensive Codebase Analysis: Nightly Game Mode Architecture

## Executive Summary

Nightly is a React Native multiplayer party game platform with 9+ game modes featuring complex state management through Firebase real-time listeners and React Context. The architecture shows **significant code duplication, inconsistent patterns, and scattered state management** that would benefit from standardization and abstraction.

---

## 1. Current Game Mode Architecture

### 1.1 Game Modes Overview

| Game Mode | Type | Players | State Pattern | Analytics | Special Features |
|-----------|------|---------|---------------|-----------|-----------------|
| **Truth or Dare** | Free | 2+ | Firestore Listener + Local State | `useTruthOrDareAnalytics` | Choice-based (truth/dare), voting system |
| **Trap Answer** | Free | 1+ | `useGame` hook + Local State | Game analytics | Quiz with trap answers, history tracking |
| **Never Have I Ever Hot** | Premium | 2+ | `useGame` hook + Custom Refs | `useNeverHaveIEverHotAnalytics` | Mode selector (never/ever), naughty counter |
| **Forbidden Desire** | Premium | 2+ | Firestore Listener | `useForbiddenDesireAnalytics` | Intensity selector (soft/tension/extreme) |
| **Double Dare** | Premium | 2+ | Firestore Listener | `useDoubleDareAnalytics` | Dual selectors (level + mode) |
| **Genius or Liar** | Premium | 2+ | Firestore Listener | `useGeniusOrLiarAnalytics` | Answer submission + bluffing |
| **Listen But Don't Judge** | Premium | 2+ | Firestore Listener | `useListenButDontJudgeAnalytics` | Story-based gameplay |
| **Word Guessing** | Premium | 2+ | Firestore Listener | Game analytics | Drawing/description-based |
| **Quiz Halloween** | Seasonal | 1+ | Custom Implementation | Game analytics | Themed quiz with seasonal content |

### 1.2 Game Mode File Structure

```
app/game/
├── [gameMode]/
│   └── [id].tsx                    # Game screen component (~800-1500 lines)
├── [id].tsx                        # Fallback/loading screen

hooks/
├── [gameMode]-questions.ts         # Question fetching + transformation
├── use[GameMode]Analytics.ts       # Game-specific analytics tracking
└── useGame.ts                      # Generic game state management

contexts/
├── AuthContext.tsx                 # User authentication state
├── LanguageContext.tsx             # i18n + game content loading
└── PaywallContext.tsx              # Subscription/paywall management
```

---

## 2. State Management Analysis

### 2.1 State Management Layers

#### Layer 1: Firebase Firestore (Source of Truth)
- **Collections:**
  - `rooms/` - Lobby state with player lists
  - `games/` - Active game documents with phase, rounds, scores
  - `users/` - User profiles, points, subscriptions
  - `gameQuestions/` - Game content per game mode and language
  - `usernames/` - Username uniqueness tracking

- **Real-time Listeners:**
  ```typescript
  // Truth or Dare pattern (direct listener)
  onSnapshot(doc(db, "games", id), (docSnap) => {
    const gameData = docSnap.data() as TruthOrDareGameState;
    setGame(gameData);
  });

  // Trap Answer / Never Have I Ever pattern (useGame hook)
  const { gameState, updateGameState } = useGame(gameId);
  ```

#### Layer 2: React Context (Global State)

**AuthContext:**
- Manages user authentication (anonymous login with username)
- Handles session restoration via AsyncStorage
- Special support for reviewer accounts
- Functions: `signIn()`, `signOut()`, `checkExistingUser()`, `firstLogin()`

**LanguageContext:**
- Manages i18n with react-i18next
- Fetches game content (questions) from Firestore per language
- Provides game localization helpers
- Function: `getGameContent(gameId)` → returns translated questions

**PaywallContext:**
- Manages subscription state via RevenueCat integration
- Controls paywall display with cooldown system
- Tracking: `showPaywallA()`, `showPaywallB()`
- Caches subscription status for performance

#### Layer 3: Local Component State

```typescript
// Truth or Dare (direct Firestore pattern)
const [game, setGame] = useState<TruthOrDareGameState | null>(null);
const [loading, setLoading] = useState(true);
const [isGameOver, setIsGameOver] = useState(false);
const [voteTimer, setVoteTimer] = useState(10);
const [canValidateVote, setCanValidateVote] = useState(false);
const [voteHandled, setVoteHandled] = useState(false);

// Never Have I Ever Hot (useGame + custom refs)
const { gameState, updateGameState } = useGame(gameId);
const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
const [isInverted, setIsInverted] = useState(false);
const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
const questionUpdateInProgressRef = useRef(false);

// Trap Answer (useGame pattern)
const { gameState, updateGameState, updatePlayerAnswers } = useGame<TrapGameState>(gameId);
const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
const isTransitioningRef = useRef(false);
```

### 2.2 State Management Patterns

#### Pattern A: Direct Firestore Listener (Truth or Dare)
```typescript
// ✗ PROBLEM: Direct listener in component, no abstraction
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, "games", id), (docSnap) => {
    setGame(docSnap.data() as TruthOrDareGameState);
  });
  return () => unsubscribe();
}, [id]);

// Manual state updates scattered throughout
await updateDoc(doc(db, "games", id), {
  phase: "vote",
  votes: {},
});
```

#### Pattern B: useGame Hook (Trap Answer, Never Have I Ever Hot)
```typescript
// ✓ BETTER: Abstracted hook but with inconsistent implementations
const { gameState, updateGameState, updatePlayerAnswers } = useGame(gameId);

// Automatic listener setup in hook
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, "games", gameId), (docSnap) => {
    setGameState(docSnap.data() as T);
  });
  return () => unsubscribe();
}, [gameId]);

// Transaction support for playerAnswers
await runTransaction(db, async (transaction) => {
  const currentData = await transaction.get(gameRef);
  const updatedPlayerAnswers = {
    ...currentData.playerAnswers,
    [userId]: answer,
  };
  transaction.update(gameRef, { playerAnswers: updatedPlayerAnswers });
});
```

**Issue:** `useGame` hook is DUPLICATED in implementation across different calls but provides inconsistent interfaces:
- Truth or Dare uses direct listener (no useGame)
- Trap Answer uses `useGame` + `updatePlayerAnswers`
- Never Have I Ever Hot uses `useGame` + custom refs

### 2.3 Game Phase Management

```typescript
export enum GamePhase {
  LOADING = "loading",
  CHOIX = "choix",           // Choice phase (Truth or Dare, level selection)
  QUESTION = "question",     // Question display
  WAITING = "waiting",       // Waiting for players
  VOTE = "vote",             // Voting on answers
  WAITING_FOR_VOTE = "waiting_for_vote",
  RESULTS = "results",       // Round results
  END = "end"                // Game over
}
```

**Pattern Issues:**
- Phase transitions handled INCONSISTENTLY across game modes
- Some use string literals ("question", "resultat") vs enums
- No centralized state machine for phase management
- Each game mode has custom phase logic

Example from Truth or Dare:
```typescript
// Phase checking scattered:
if (game.phase === GamePhase.CHOIX) { /* render choice screen */ }
if (game.phase === "question" || game.phase === "action") { /* render question */ }
if (game.phase === "vote") { /* render voting screen */ }
if (game.phase === "resultat") { /* render results */ }
```

---

## 3. Code Duplication & Inconsistencies

### 3.1 Critical Duplication

#### Duplication 1: Game Initialization
**Files:** `useRoom.ts`, `app/room/[id].tsx`, each game screen

```typescript
// In useRoom.ts
const gameData = {
  gameId: room.gameId,
  gameMode: room.gameMode,
  players: room.players.map(p => ({ id: p.id, name: p.name, ... })),
  phase: GamePhase.WAITING,
  currentRound: 1,
  totalRounds: 5,
  scores: {},
  ...
};

// In game screen
const { gameState, updateGameState } = useGame(gameId);
// Also initializes with default state:
const [gameState, setGameState] = useState<T | null>(() => {
  const defaultState: GameState = {
    phase: GamePhase.WAITING,
    currentRound: 0,
    totalRounds: 3,
    ...
  };
});
```

**Impact:** Initialization values inconsistent (5 vs 3 rounds, different properties)

#### Duplication 2: Question Fetching & Transformation

```typescript
// truth-or-dare-questions.ts
const transformQuestion = (question: any, index: number): Question => ({
  id: (index + 1).toString(),
  text: question.text,
  theme: question.type,
  roundNumber: index + 1
});

useEffect(() => {
  const fetchQuestions = async () => {
    const db = getFirestore();
    const questionsRef = doc(db, 'gameQuestions', 'truth-or-dare');
    const questionsDoc = await getDoc(questionsRef);
    const questionsData = questionsDoc.data();
    const rawQuestions = questionsData?.translations?.[currentLanguage] || [];
    const transformedQuestions = rawQuestions.map(transformQuestion);
    setQuestions(transformedQuestions);
  };
  fetchQuestions();
}, [isRTL, language]);

// trap-answer-questions.ts (DUPLICATED)
export const transformQuestion = (question: any, index: number): TrapQuestion => ({
  id: `q_${index}`,
  text: question.question,
  theme: question.type,
  question: question.question,
  answers: [
    { text: question.answer, isCorrect: true, isTrap: false },
    ...question.traps.map((trap: string) => ({
      text: trap,
      isCorrect: false,
      isTrap: true
    })),
  ].sort(() => Math.random() - 0.5),
});

useEffect(() => {
  const fetchQuestions = async () => {
    // SAME CODE REPEATED
    const db = getFirestore();
    const questionsRef = doc(db, 'gameQuestions', 'trap-answer');
    const questionsDoc = await getDoc(questionsRef);
    const questionsData = questionsDoc.data();
    const currentLanguage = isRTL ? 'ar' : language || 'fr';
    const rawQuestions = questionsData?.translations?.[currentLanguage] || [];
    const transformedQuestions = rawQuestions.map(transformQuestion);
    setQuestions(transformedQuestions);
  };
  fetchQuestions();
}, [isRTL, language]);
```

**Impact:** 9+ game mode question hooks with ~80% duplicated code

#### Duplication 3: Analytics Tracking
Each game has a custom analytics hook:
- `useTruthOrDareAnalytics`
- `useNeverHaveIEverHotAnalytics`
- `useTrapAnswerAnalytics` (missing, using generic)
- `useForbiddenDesireAnalytics`
- `useDoubleDareAnalytics`
- `useGeniusOrLiarAnalytics`
- `useListenButDontJudgeAnalytics`

All follow similar pattern:
```typescript
export function useTruthOrDareAnalytics() {
  const { track } = usePostHog();
  const { logEvent } = useFirebaseAnalytics();

  return {
    trackChoice: (gameId, choice) => {
      track.custom('truth_or_dare_choice', { gameId, choice });
      logEvent('truth_or_dare_choice', { gameId, choice });
    },
    trackRoundComplete: (gameId, round, total) => { ... },
    trackGameComplete: (gameId, totalRounds, duration) => { ... },
    trackVote: (gameId, vote, userId) => { ... },
  };
}
```

**Better approach:** Generic factory pattern
```typescript
function createGameAnalytics(gameMode: string) {
  const { track } = usePostHog();
  return {
    trackChoice: (gameId, data) => track.custom(`${gameMode}_choice`, { gameId, ...data }),
    // ...
  };
}
```

#### Duplication 4: Timer Logic

Truth or Dare:
```typescript
useEffect(() => {
  if (game?.phase === "vote") {
    setVoteTimer(15);
    setCanValidateVote(false);
    const interval = setInterval(() => {
      setVoteTimer((t) => {
        if (t <= 1) {
          setCanValidateVote(true);
          clearInterval(interval);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }
}, [game?.phase]);
```

Trap Answer:
```typescript
useEffect(() => {
  if (gameState?.phase === GamePhase.QUESTION && gameState?.currentQuestion?.id) {
    setTimeLeft(TIMER_DURATION);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, [gameState?.phase, gameState?.currentQuestion?.id]);
```

**Impact:** ~50+ lines of duplicated timer code in multiple game modes

#### Duplication 5: Round Progression Logic

Truth or Dare (manual):
```typescript
async function handleNextRound() {
  if (!game || !user) return;
  const db = getFirestore();
  const gameRef = doc(db, "games", String(id));

  await gameAnalytics.trackRoundComplete(...);

  await updateDoc(gameRef, {
    currentRound: game.currentRound + 1,
    phase: "choix",
    currentQuestion: null,
    answers: [],
    votes: {},
  });
}
```

Never Have I Ever Hot (custom logic):
```typescript
const handleNextRound = useCallback(async () => {
  if (!gameState) return;
  if (questionUpdateInProgress.current) return;

  questionUpdateInProgress.current = true;

  try {
    const responseCounts = Object.values(answers).reduce(
      (acc, val) => {
        if (val === true) acc.yes++;
        if (val === false) acc.no++;
        return acc;
      },
      { yes: 0, no: 0 },
    );

    await gameAnalytics.trackRoundComplete(...);

    if (gameState.currentRound >= TOTAL_ROUNDS) {
      const endGameState = {
        ...gameState,
        phase: GamePhase.END,
        scores: latestScores.current,
        naughtyAnswers: latestNaughtyAnswers.current,
      };
      await updateGameState(endGameState);
      return;
    }

    const nextQuestion = /* complex question selection */;
    const nextPlayerIndex = /* complex player rotation */;
    const newGameState = {
      ...gameState,
      currentQuestion: nextQuestion,
      targetPlayer: nextPlayer,
      currentRound: gameState.currentRound + 1,
      phase: GamePhase.QUESTION,
      scores: latestScores.current,
    };

    await updateGameState(newGameState);
  } finally {
    setTimeout(() => {
      questionUpdateInProgress.current = false;
    }, 500);
  }
}, [gameState, updateGameState, gameAnalytics, gameId, getGameContent, t, askedQuestions, answers, TOTAL_ROUNDS]);
```

**Impact:** Every game mode has custom round progression, hard to maintain consistency

### 3.2 Inconsistency Matrix

| Aspect | Truth or Dare | Trap Answer | Never Have I Ever | Forbidden Desire | Double Dare |
|--------|---------------|-------------|-------------------|------------------|-------------|
| **State Hook** | Direct Firestore | `useGame` | `useGame` + Refs | Direct Firestore | Direct Firestore |
| **Phase Strings** | Mix of enums + strings | Enums | Enums | Likely mixed | Likely mixed |
| **Timer Pattern** | setInterval + state | setInterval + ref | N/A (no timer) | N/A | N/A |
| **Round Logic** | Manual updateDoc | useGameEndPaywall | Custom with refs | Manual | Manual |
| **Analytics Hook** | Dedicated | Generic | Dedicated | Dedicated | Dedicated |
| **Questions Loading** | getGameContent | Direct fetch | getGameContent | Custom | Custom |
| **Player Rotation** | Manual index calc | Sequential | Complex mapping | Manual | Manual |
| **Score Tracking** | In Firestore update | Local + Firestore | Local refs + update | Firestore | Firestore |

---

## 4. Pain Points & Technical Debt

### 4.1 Game Lifecycle Issues

#### Problem 1: Inconsistent Initialization
- **Truth or Dare:** Uses direct Firestore listener, game state created inline
- **Trap Answer:** Uses `useGame` hook with default state
- **Never Have I Ever Hot:** Uses `useGame` hook with explicit initialization in useEffect
- **Result:** Confusing for new developers, maintenance nightmare

#### Problem 2: Phase Transition Chaos
```typescript
// Truth or Dare mixes enums and strings
if (game.phase === GamePhase.CHOIX) { }
if (game.phase === "question" || game.phase === "action") { }
if (game.phase === "vote") { }
if (game.phase === "resultat") { } // String literal!

// Never Have I Ever Hot
if (gameState.phase === GamePhase.END) { }
if (gameState.phase === GamePhase.QUESTION) { }

// Trap Answer
if (gameState?.phase === GamePhase.END) { }
if (gameState?.phase === GamePhase.QUESTION) { }
```

**Missing phases:** What about "CHOIX" vs "QUESTION"? Some games use both, others don't.

#### Problem 3: Real-time Synchronization Issues

**Truth or Dare Vote Validation (from code comments):**
```typescript
// ⚠️ FIX: Timer pour le vote - augmenté à 15s pour laisser plus de temps
// ⚠️ FIX: Vérification simplifiée si tous ont voté - logique unifiée
// ⚠️ FIX: Les autres joueurs votent (pas le joueur ciblé)
// ⚠️ FIX: Attendre 1 seconde pour laisser l'UI se mettre à jour
// ⚠️ FIX: Tous les votes reçus, validation dans 1s...
```

**Issues:**
- Race conditions with vote validation
- Reliance on setTimeout hacks instead of proper transaction logic
- Manual vote counting instead of Firestore queries
- Inconsistency: Some games auto-validate, others require manual confirmation

**Trap Answer Issue:**
```typescript
// ⚠️ FIX: Flag pour éviter les doubles appels de nextQuestion
// ⚠️ FIX: Passage automatique au tour suivant après 2 secondes
const isTransitioningRef = useRef(false);

useEffect(() => {
  if (
    gameState?.phase === GamePhase.QUESTION &&
    gameState?.players?.length > 0 &&
    Object.keys(gameState?.playerAnswers || {}).length ===
      gameState?.players?.length &&
    !isTransitioningRef.current
  ) {
    isTransitioningRef.current = true;
    const timeout = setTimeout(() => {
      nextQuestion();
    }, 2000);
    return () => {
      clearTimeout(timeout);
      isTransitioningRef.current = false;
    };
  }
}, [gameState?.phase, gameState?.playerAnswers, gameState?.players]);
```

**Issue:** Hacky race condition prevention using Refs instead of proper state management

### 4.2 State Management Scalability Issues

#### Problem 1: Local State Duplication
Many games maintain local state that mirrors Firestore:
```typescript
// Never Have I Ever Hot
const { gameState, updateGameState } = useGame(gameId);
const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
const [isInverted, setIsInverted] = useState(false);
const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
const latestScores = useRef(gameState?.scores);
const latestNaughtyAnswers = useRef(gameState?.naughtyAnswers);

// Why maintain answers locally if they're in Firestore?
// Why use refs instead of proper derived state?
```

#### Problem 2: Custom Refs for State Management
```typescript
// Never Have I Ever Hot
const gameStartTime = useRef(Date.now());
const previousQuestionId = useRef<string | null>(null);
const questionUpdateInProgress = useRef(false);
const initialAnswersRef = useRef<Record<string, boolean | null>>({});
const latestScores = useRef(gameState?.scores);
const latestNaughtyAnswers = useRef(gameState?.naughtyAnswers);

// Trap Answer
const isTransitioningRef = useRef(false);
const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

// Truth or Dare
const gameStartTime = useRef(Date.now());
const voteValidationInProgressRef = useRef(false);
```

**Issue:** Refs used to avoid re-renders, but creates implicit state that's hard to track

#### Problem 3: Firestore Updates Scattered
```typescript
// Truth or Dare - updates can happen from:
// 1. handleChoice() - sets phase, currentQuestion
// 2. handleValidate() - sets phase to vote
// 3. handleRefuse() - sets phase to vote
// 4. handleVote() - conditionally updates next round
// 5. useEffect watching votes - conditionally updates next round
// 6. handleNextRound() - progresses to next round

// No centralized update logic, risk of inconsistent state
```

### 4.3 Analytics & Instrumentation Issues

#### Problem 1: Inconsistent Event Tracking
```typescript
// Truth or Dare
await gameAnalytics.trackChoice(String(id), choice);
await gameAnalytics.trackRoundComplete(...);
await gameAnalytics.trackGameComplete(...);
await gameAnalytics.trackVote(String(id), vote, user.uid);

// Never Have I Ever Hot
gameAnalytics.trackQuestionStart(String(gameId), questionId);
gameAnalytics.trackPlayerResponse(String(gameId), playerId, value ? "yes" : "no");
await gameAnalytics.trackRoundComplete(..., responseCounts);

// Trap Answer
// No dedicated analytics hook!
```

#### Problem 2: Missing Events
- No tracking for: player joining, room creation, connection issues, game crashes
- Inconsistent event parameters across game modes
- No centralized event schema

### 4.4 Firebase Integration Issues

#### Problem 1: No Transaction Consistency
Only Trap Answer uses transactions:
```typescript
await runTransaction(db, async (transaction) => {
  const gameSnap = await transaction.get(gameRef);
  if (!gameSnap.exists()) throw new Error("Game document does not exist");
  const currentPlayerAnswers = gameSnap.data().playerAnswers || {};
  if (currentPlayerAnswers[userId]) return; // Idempotent
  transaction.update(gameRef, {
    playerAnswers: { ...currentPlayerAnswers, [userId]: answer },
  });
});
```

Other games use direct updates:
```typescript
// Truth or Dare - race condition possible
await updateDoc(doc(db, "games", String(id)), {
  [voteField]: updatedVotes,
});
```

#### Problem 2: No Batch Operations
Updates are sequential:
```typescript
// In Never Have I Ever Hot
const newGameState = {
  ...gameState,
  currentQuestion: nextQuestion,
  targetPlayer: nextPlayer,
  currentRound: gameState.currentRound + 1,
  phase: GamePhase.QUESTION,
  scores: latestScores.current,
  naughtyAnswers: latestNaughtyAnswers.current,
};

await updateGameState(newGameState); // Single large update
```

Better approach would use batch writes for atomicity

### 4.5 Type Safety Issues

#### Problem 1: Game-Specific Type Extensions
```typescript
// Truth or Dare
interface TruthOrDareGameState extends Omit<GameState, "phase"> {
  currentPlayerId: string;
  currentChoice: "verite" | "action" | null;
  phase: string; // OVERRIDES enum with string!
  votes?: { [playerId: string]: "yes" | "no" };
  spectatorVotes?: { [playerId: string]: "yes" | "no" };
  spectators?: string[];
  playerScores: { [playerId: string]: number };
  gameMode: "truth-or-dare";
}

// Never Have I Ever Hot
interface NeverHaveIEverHotGameState {
  phase: GamePhase; // Uses enum correctly
  currentRound: number;
  totalRounds: number;
  // ...
}

// Trap Answer
interface TrapGameState {
  phase: GamePhase;
  // Different from Truth or Dare!
}
```

**Issue:** `phase` type is inconsistent across games (string vs enum)

#### Problem 2: Missing Type Guards
```typescript
// No type guards for instanceof checks
if (gameState instanceof TrapGameState) { } // ✗ Won't work

// Must rely on string checks
if (room?.gameMode === 'trap-answer') { }
```

---

## 5. Context Usage Patterns

### 5.1 AuthContext Strengths
- Clear separation of concerns (authentication only)
- Good session management with AsyncStorage
- Special handling for reviewer accounts
- Analytics integration for user tracking

### 5.2 LanguageContext Strengths
- Handles i18n initialization correctly
- Fetches game content on demand via `getGameContent()`
- Fallback to French for missing translations
- RTL support

**Weakness:**
```typescript
// getGameContent duplicates the Firebase fetch logic
// Should be abstracted to useFirestore hook
const getGameContent = async (gameId: string) => {
  const db = getFirestore();
  const questionsDoc = await getDoc(doc(db, 'gameQuestions', gameId));
  const questionsData = questionsDoc.data() || { translations: {} };
  const questions = questionsData.translations[currentLanguage] ||
                   questionsData.translations['fr'] || [];
  return { rules: [], questions };
};

// Also replicated in every question hook!
```

### 5.3 PaywallContext Issues
- Good abstraction of paywall logic
- But implementation details hidden in `usePaywallManager` hook
- No clear documentation of when paywalls trigger
- Potential for inconsistent paywall display across game modes

---

## 6. How Game Lifecycle is Managed

### 6.1 Complete Game Flow

```
1. HOME SCREEN
   └─ User selects game mode → navigate to room creation

2. ROOM CREATION (app/(tabs)/index.tsx)
   └─ User creates room → Firebase stores in rooms/{roomId}
   └─ Router navigates to app/room/{roomId}

3. ROOM LOBBY (app/room/[id].tsx)
   └─ Real-time listener on rooms/{roomId}
   └─ Display players, game options
   └─ Host clicks "Start Game"
   └─ useRoom.startGame() called

4. GAME INITIALIZATION (useRoom.ts - startGame)
   ├─ Validate: minPlayers met, allPlayersReady
   ├─ Create games/{roomId} document with:
   │  ├─ phase: GamePhase.WAITING
   │  ├─ currentRound: 1
   │  ├─ totalRounds: 5
   │  ├─ players: [...]
   │  ├─ scores: {}
   │  ├─ gameMode: room.gameMode
   │  └─ gameStartTime: now
   ├─ Update rooms/{roomId}:
   │  ├─ status: 'playing'
   │  └─ gameDocId: roomId
   ├─ Call initializeFirstQuestion()
   │  └─ Fetch first question from Firebase
   │  └─ Update games/{roomId}.currentQuestion
   │  └─ Update games/{roomId}.phase: GamePhase.QUESTION
   └─ Room listener redirects to /game/{gameMode}/{gameId}

5. GAME SCREEN (app/game/[gameMode]/[id].tsx)
   ├─ Component mounts
   ├─ Game listener setup (direct or via useGame hook)
   ├─ Render based on game.phase:
   │  ├─ CHOIX: Show choice options (Truth or Dare, level, etc.)
   │  ├─ QUESTION: Show question card
   │  ├─ VOTE: Show voting interface
   │  ├─ RESULTS: Show round results
   │  └─ END: Show GameResults component
   ├─ Player interactions trigger Firestore updates
   ├─ Listeners propagate changes to all players
   └─ Round progression via manual updateDoc calls

6. ROUND PROGRESSION
   ├─ Phase: CHOIX → Player makes choice
   ├─ Firestore update: phase CHOIX → QUESTION
   ├─ All players: See question displayed
   ├─ Target player: Answers/confirms
   ├─ Firestore update: phase QUESTION → VOTE
   ├─ Other players: Vote on answer
   ├─ When all voted:
   │  └─ Firestore update: Calculate scores, move to next round
   └─ Repeat until currentRound > totalRounds

7. GAME END
   ├─ currentRound > totalRounds detected
   ├─ Phase set to END
   ├─ GameResults component rendered
   ├─ useLeaderboard hook updates user.points
   ├─ User can share results or return home
   └─ Room can be deleted or reused
```

### 6.2 Round Progression Variations

#### Truth or Dare
```
WAITING → CHOIX (player chooses truth/dare)
       → QUESTION (question shown)
       → VOTE (others vote if completed)
       → RESULTS (show scores)
       → WAITING (next player)
```

#### Trap Answer
```
QUESTION (question shown)
       → WAITING (players answer)
       → AUTO-ADVANCE (2s after all answered)
       → Next QUESTION
```

#### Never Have I Ever Hot
```
MODE_SELECT (never/ever) [Local state]
         → QUESTION (question shown)
         → [Local answer collection]
         → NEXT_ROUND
         → Repeat or END
```

**Issues:**
- No standardized round progression
- Phase naming inconsistent across games
- Some games use transitions, others skip phases
- Auto-advance logic duplicated in different ways

---

## 7. Key Findings & Recommendations

### 7.1 Architecture Strengths

1. **Firebase Real-time Foundation**
   - Excellent for multiplayer sync
   - Proper use of Firestore listeners
   - Good separation of data layers

2. **Context API for Global State**
   - Clean separation: Auth, Language, Paywall
   - Proper provider pattern implementation

3. **Game Mode Modularity**
   - Each game mode in separate file
   - Game-specific logic isolated
   - Custom hooks per game mode

4. **Type Safety**
   - Good use of TypeScript interfaces
   - Game-specific state types
   - Type-safe Firebase queries

### 7.2 Critical Issues

| Issue | Severity | Impact |
|-------|----------|--------|
| **Code Duplication (80% in question hooks)** | CRITICAL | Maintenance nightmare, hard to add game modes |
| **Inconsistent State Management (3 patterns)** | HIGH | Confusing for new developers |
| **Race Condition Hacks (Refs + setTimeout)** | HIGH | Potential data corruption in multiplayer |
| **No Centralized Phase Machine** | HIGH | Hard to add new game modes |
| **Scattered Firestore Updates** | MEDIUM | Potential for inconsistent state |
| **Game Lifecycle Scattered** | MEDIUM | Hard to debug/test |
| **Duplicated Analytics Hooks** | MEDIUM | Hard to track events consistently |
| **No Batch Operations** | LOW | Performance could degrade with scale |

### 7.3 Recommended Refactoring Priorities

#### Priority 1: Centralize State Management
- Create unified `GameManager` class/hook
- Implement state machine for phase transitions
- Replace direct Firestore listeners with abstraction
- Standardize state update interface

#### Priority 2: Eliminate Question Hook Duplication
- Create generic `useGameQuestions` hook
- Accept game-specific transformers as parameters
- Reduce from 9 hooks to 1 + configurations

#### Priority 3: Consolidate Analytics
- Create `useGameAnalytics` factory
- Standardize event schema
- Create analytics middleware for events

#### Priority 4: Fix Race Conditions
- Replace setTimeout hacks with proper transactions
- Use Firestore atomic operations
- Implement proper vote validation

#### Priority 5: Standardize Phase Management
- Move to centralized GamePhase enum
- Create phase validators
- Implement phase transition middleware

---

## 8. Code Examples: Key Patterns

### 8.1 useGame Hook Implementation
Located: `/Users/francis/workspace/Nightly/hooks/useGame.ts`

```typescript
export function useGame<T extends GameState = GameState>(gameId: string) {
  const [gameState, setGameState] = useState<T | null>(() => {
    const defaultState: GameState = {
      phase: GamePhase.WAITING,
      currentRound: 0,
      totalRounds: 3,
      targetPlayer: null,
      currentQuestion: null,
      answers: [],
      players: [],
      scores: {},
      theme: "",
      timer: null,
    };
    return defaultState as T;
  });

  const db = getFirestore();

  // Real-time listener
  useEffect(() => {
    if (!gameId) return;
    const unsubscribe = onSnapshot(doc(db, "games", gameId), (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data() as T);
      }
    });
    return () => unsubscribe();
  }, [gameId]);

  // Update function with smart merging
  const updateGameState = async (newState: Partial<T>) => {
    if (!gameId) throw new Error("Game ID is required");

    try {
      const gameRef = doc(db, "games", gameId);
      const snap = await getDoc(gameRef);

      if (!snap.exists()) {
        // Create if doesn't exist
        await setDoc(gameRef, {
          phase: "LOADING",
          currentRound: 0,
          totalRounds: 3,
          ...newState,
        });
      } else {
        // Smart merge for playerAnswers (don't overwrite)
        const mergedState = { ...newState };
        if ((newState as any).playerAnswers !== undefined) {
          if (Object.keys((newState as any).playerAnswers).length === 0) {
            (mergedState as any).playerAnswers = {};
          } else {
            (mergedState as any).playerAnswers = {
              ...((snap.data() as T) as any).playerAnswers || {},
              ...(newState as any).playerAnswers,
            };
          }
        }
        await updateDoc(gameRef, mergedState as { [key: string]: any });
      }
    } catch (error: any) {
      console.error("Error updating game state:", error);
      throw new Error(`Failed to update game state: ${error.message}`);
    }
  };

  // Transaction-based player answer update
  const updatePlayerAnswers = async (userId: string, answer: any) => {
    if (!gameId || !userId) throw new Error("Game ID and User ID required");

    try {
      const gameRef = doc(db, "games", gameId);
      await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);
        if (!gameSnap.exists()) {
          throw new Error("Game document does not exist");
        }

        const currentPlayerAnswers = (gameSnap.data() as T) as any).playerAnswers || {};

        // Idempotent: don't overwrite existing answer
        if (currentPlayerAnswers[userId]) {
          console.warn("Player has already answered:", userId);
          return;
        }

        const updatedPlayerAnswers = {
          ...currentPlayerAnswers,
          [userId]: answer,
        };

        transaction.update(gameRef, {
          playerAnswers: updatedPlayerAnswers,
        });
      });
    } catch (error: any) {
      console.error("Error in transaction:", error);
      throw new Error(`Failed to update player answers: ${error.message}`);
    }
  };

  return { gameState, updateGameState, updatePlayerAnswers };
}
```

### 8.2 Question Hook Pattern (Duplicated)
Located: `/Users/francis/workspace/Nightly/hooks/truth-or-dare-questions.ts`

```typescript
const transformQuestion = (question: any, index: number): Question => ({
  id: (index + 1).toString(),
  text: question.text,
  theme: question.type,
  roundNumber: index + 1
});

export function useTruthOrDareQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const { isRTL, language } = useLanguage();

  useEffect(() => {
    const currentLanguageCode = isRTL ? 'ar' : (language || 'fr');
    if (!currentLanguageCode) {
      setIsLoadingQuestions(false);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const db = getFirestore();
        const questionsRef = doc(db, 'gameQuestions', 'truth-or-dare');
        const questionsDoc = await getDoc(questionsRef);

        if (questionsDoc.exists()) {
          const questionsData = questionsDoc.data();
          const rawQuestions = questionsData?.translations?.[currentLanguageCode] || [];
          const transformedQuestions = rawQuestions.map(transformQuestion);
          setQuestions(transformedQuestions);
        }
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };

    fetchQuestions();
  }, [isRTL, language]);

  const getRandomQuestion = (type?: 'verite' | 'action'): Question | null => {
    const allQuestionsOfType = type
      ? questions.filter(q => q.theme.toLowerCase() === type.toLowerCase())
      : questions;

    if (allQuestionsOfType.length === 0) return null;

    const availableOfType = allQuestionsOfType.filter(q => !askedQuestions.includes(q.id));

    // Cycling logic to repeat questions when all asked...
    const questionsToChooseFrom = availableOfType.length > 0 ? availableOfType : allQuestionsOfType;

    if (questionsToChooseFrom.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * questionsToChooseFrom.length);
    const selectedQuestion = questionsToChooseFrom[randomIndex];

    // Track asked question
    if (selectedQuestion && !askedQuestions.includes(selectedQuestion.id)) {
      setAskedQuestions([...askedQuestions, selectedQuestion.id]);
    }

    return selectedQuestion;
  };

  return { questions, getRandomQuestion, resetAskedQuestions, isLoadingQuestions };
}
```

This pattern is **REPLICATED 9 times** with minor variations for each game mode!

---

## 9. File Structure Reference

```
/Users/francis/workspace/Nightly/
├── app/
│   ├── game/
│   │   ├── truth-or-dare/[id].tsx           (1100+ lines)
│   │   ├── never-have-i-ever-hot/[id].tsx   (850+ lines)
│   │   ├── trap-answer/[id].tsx             (750+ lines)
│   │   ├── forbidden-desire/[id].tsx        (partial)
│   │   ├── double-dare/[id].tsx             (partial)
│   │   └── [other game modes]
│   ├── room/[id].tsx                        (250+ lines)
│   ├── (tabs)/index.tsx                     (Home screen)
│   └── data/gameModes.ts                    (Game configuration)
├── contexts/
│   ├── AuthContext.tsx                      (250 lines)
│   ├── LanguageContext.tsx                  (200 lines)
│   └── PaywallContext.tsx                   (50 lines)
├── hooks/
│   ├── useGame.ts                           (150 lines) - State management
│   ├── useRoom.ts                           (150 lines) - Room management
│   ├── useFirestore.ts                      (100 lines) - Generic Firestore
│   ├── truth-or-dare-questions.ts           (80 lines) ⚠️ DUPLICATED
│   ├── never-have-i-ever-hot-questions.ts  (70 lines) ⚠️ DUPLICATED
│   ├── trap-answer-questions.ts             (70 lines) ⚠️ DUPLICATED
│   ├── forbidden-desire-questions.ts        (70 lines) ⚠️ DUPLICATED
│   ├── double-dare-questions.ts             (70 lines) ⚠️ DUPLICATED
│   ├── [5+ more game question hooks]        (varies) ⚠️ DUPLICATED
│   ├── useTruthOrDareAnalytics.ts           (100 lines) ⚠️ DUPLICATED
│   ├── useNeverHaveIEverHotAnalytics.ts    (100 lines) ⚠️ DUPLICATED
│   ├── [6+ more game analytics hooks]       (varies) ⚠️ DUPLICATED
│   ├── usePaywallManager.ts
│   ├── usePoints.ts
│   ├── useLeaderboard.ts
│   ├── useTurnManager.ts                    (50 lines)
│   └── [other utility hooks]
├── types/
│   ├── gameTypes.ts                         (GamePhase enum, GameState interface)
│   └── [other type definitions]
├── constants/
│   ├── room.ts                              (GAME_CONFIG)
│   └── themes/
│       ├── Halloween.ts
│       └── Christmas.ts
├── services/
│   ├── gameInitializationService.ts
│   └── [notification services]
└── components/
    ├── game/
    │   ├── GameResults.tsx
    │   └── [game UI components]
    ├── room/
    │   ├── GameOptions.tsx
    │   ├── PlayersList.tsx
    │   └── [room UI components]
    └── [other components]
```

---

## 10. Conclusion

### Summary of Architecture
The Nightly codebase demonstrates a **solid Firebase + React Context foundation** for multiplayer gaming, but suffers from **significant code duplication and inconsistent patterns** that make it harder to maintain and extend.

### Immediate Actions Needed
1. **Consolidate question hooks** → 1 generic hook saves ~600 LOC
2. **Standardize state management** → Remove direct Firestore listeners
3. **Fix race conditions** → Replace Ref hacks with proper Firestore transactions
4. **Unify analytics** → Create generic analytics factory

### 2-3 Month Refactor Plan
- Week 1-2: Consolidate question hooks + analytics
- Week 2-3: Implement unified GameManager
- Week 3-4: Add state machine for phases
- Week 4-5: Fix race conditions and add batch operations
- Week 5-6: Add comprehensive error handling
- Week 6-7: Testing and validation
- Week 7-8: Documentation

### Long-term Improvements
- Consider Redux Toolkit for complex state management
- Implement middleware for game event handling
- Add comprehensive error boundaries
- Create reusable game mode template
- Build game analytics dashboard

---

## Appendix: Quick Reference

### Game Mode Count: 9
1. Truth or Dare (Free)
2. Trap Answer (Free)
3. Never Have I Ever Hot (Premium)
4. Forbidden Desire (Premium)
5. Double Dare (Premium)
6. Genius or Liar (Premium)
7. Listen But Don't Judge (Premium)
8. Word Guessing (Premium)
9. Quiz Halloween (Seasonal)

### Key Statistics
- **Duplicated Question Hook Code:** ~600 LOC
- **Duplicated Analytics Hook Code:** ~800 LOC
- **Game Screen Sizes:** 750-1100 lines each
- **Type Extensions:** 9 different GameState interfaces
- **Timer Implementations:** 3+ slightly different versions
- **State Management Patterns:** 3 (Direct Firestore, useGame, Custom Refs)

---

*Analysis completed on: 2025-11-05*
*Codebase files analyzed: 20+*
*Total LOC in game screens: ~7,500+*
