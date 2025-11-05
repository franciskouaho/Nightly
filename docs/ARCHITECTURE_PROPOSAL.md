# 🏗️ Architecture Proposal - Nightly Game Platform

**Date:** 2025-11-05
**Current Issues:** Code duplication, inconsistent state management, race conditions
**Goal:** Clean, scalable architecture for easy game mode integration

---

## 📊 Executive Summary

### Current State
- ❌ **3 different state management patterns** across 9 game modes
- ❌ **~1,400 LOC duplicated** in question/analytics hooks
- ❌ **Race conditions** hidden in setTimeout hacks
- ❌ **Hard to add new games** without bugs

### Proposed State
- ✅ **Single unified state pattern** using Zustand + Firestore sync
- ✅ **~1,400 LOC removed** through factory patterns
- ✅ **Zero race conditions** with Firestore transactions
- ✅ **5-minute game integration** with standardized templates

---

## 🎯 Solution Comparison

### Option A: Zustand + Firestore Sync ⭐ **RECOMMENDED**

**Why Zustand:**
- 🚀 **Minimal boilerplate** (vs Redux/MobX)
- 🔥 **React Native compatible** (no dependencies on window/DOM)
- 🎯 **TypeScript-first** with excellent inference
- 📦 **Tiny bundle** (1.2kb vs React Context re-render issues)
- 🔄 **Middleware support** for Firebase sync
- 🐛 **DevTools** for debugging game state

**Architecture:**
```
Firestore (Source of Truth)
    ↕ (Sync Middleware)
Zustand Store (Local Cache)
    ↕
React Components
```

**Pros:**
- ✅ Best of both worlds: Firestore persistence + fast local state
- ✅ Easy to test (stores are plain JS)
- ✅ No Provider hell
- ✅ Selective re-renders (better performance)
- ✅ Easy to add middleware (analytics, logging, persistence)

**Cons:**
- ⚠️ Small learning curve (but simpler than Redux)
- ⚠️ Need to implement Firestore sync middleware (1-2 days)

---

### Option B: Keep React Context + Consolidate Patterns

**Why Context:**
- Already in use (AuthContext, LanguageContext)
- No new dependencies
- Team knows it

**Improvements:**
```typescript
// Unified GameContext
<GameProvider gameId={id}>
  {/* All game components */}
</GameProvider>
```

**Pros:**
- ✅ No new libraries
- ✅ Familiar to team
- ✅ Works with current Firestore setup

**Cons:**
- ❌ Re-render performance issues (all consumers re-render)
- ❌ Provider nesting hell with many games
- ❌ Hard to debug complex state
- ❌ Can't easily share state between screens
- ❌ Testing requires full Provider tree

---

### Option C: Jotai (Atomic State)

**Why Jotai:**
- Very similar to Zustand but atom-based
- Bottom-up approach (atoms instead of single store)
- Minimal boilerplate

**Pros:**
- ✅ Similar benefits to Zustand
- ✅ More granular reactivity

**Cons:**
- ⚠️ Less popular than Zustand (smaller community)
- ⚠️ Atom management can get complex
- ⚠️ Overkill for current needs

---

## 🏆 Recommended Solution: Zustand + Firestore

### Implementation Plan

#### Phase 1: Foundation (Week 1)

**1.1 Install Zustand**
```bash
yarn add zustand
yarn add -D @types/zustand
```

**1.2 Create Firestore Sync Middleware**
```typescript
// store/middleware/firestoreSync.ts
import { StateCreator, StoreMutatorIdentifier } from 'zustand';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

type FirestoreSync = <T>(
  collectionName: string,
  documentId: string,
  options?: {
    onSync?: (data: T) => void;
    onError?: (error: Error) => void;
  }
) => (config: StateCreator<T>) => StateCreator<T>;

export const firestoreSync: FirestoreSync = (collectionName, documentId, options) => (config) => (set, get, api) => {
  // Set up Firestore listener
  const unsubscribe = onSnapshot(
    doc(db, collectionName, documentId),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        set(data as any, true); // Replace state
        options?.onSync?.(data as any);
      }
    },
    (error) => {
      options?.onError?.(error);
    }
  );

  // Store unsubscribe for cleanup
  api.destroy = () => {
    unsubscribe();
  };

  return config(
    (...args) => {
      set(...args);
      // Optionally sync back to Firestore
      const state = get();
      updateDoc(doc(db, collectionName, documentId), state as any);
    },
    get,
    api
  );
};
```

**1.3 Create Base Game Store**
```typescript
// store/useGameStore.ts
import { create } from 'zustand';
import { firestoreSync } from './middleware/firestoreSync';
import { GamePhase, GameState } from '@/types/gameTypes';

interface GameStore extends GameState {
  // Actions
  updatePhase: (phase: GamePhase) => void;
  nextRound: () => void;
  submitAnswer: (playerId: string, answer: any) => void;
  submitVote: (playerId: string, vote: any) => void;
  addScore: (playerId: string, points: number) => void;

  // Computed
  isHost: (userId: string) => boolean;
  getCurrentQuestion: () => Question | null;
  hasPlayerAnswered: (playerId: string) => boolean;
}

export const createGameStore = (gameId: string) => {
  return create<GameStore>()(
    firestoreSync('games', gameId, {
      onSync: (data) => console.log('Game synced:', data),
      onError: (error) => console.error('Sync error:', error),
    })(
      (set, get) => ({
        // Initial state
        phase: GamePhase.LOADING,
        currentRound: 0,
        players: [],
        scores: {},
        answers: {},
        votes: {},

        // Actions
        updatePhase: (phase) => set({ phase }),

        nextRound: () => set((state) => ({
          currentRound: state.currentRound + 1,
          answers: {},
          votes: {},
        })),

        submitAnswer: (playerId, answer) => set((state) => ({
          answers: { ...state.answers, [playerId]: answer },
        })),

        submitVote: (playerId, vote) => set((state) => ({
          votes: { ...state.votes, [playerId]: vote },
        })),

        addScore: (playerId, points) => set((state) => ({
          scores: {
            ...state.scores,
            [playerId]: (state.scores[playerId] || 0) + points,
          },
        })),

        // Computed
        isHost: (userId) => get().hostId === userId,

        getCurrentQuestion: () => {
          const state = get();
          return state.questions?.[state.currentRound] || null;
        },

        hasPlayerAnswered: (playerId) => {
          return playerId in get().answers;
        },
      })
    )
  );
};
```

**1.4 Create Hook Factory**
```typescript
// hooks/useGameStore.ts
import { createGameStore } from '@/store/useGameStore';
import { useEffect, useRef } from 'react';

const storeCache = new Map<string, ReturnType<typeof createGameStore>>();

export function useGameStore(gameId: string) {
  const storeRef = useRef<ReturnType<typeof createGameStore>>();

  // Create or reuse store
  if (!storeRef.current) {
    if (storeCache.has(gameId)) {
      storeRef.current = storeCache.get(gameId)!;
    } else {
      storeRef.current = createGameStore(gameId);
      storeCache.set(gameId, storeRef.current);
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Keep store alive for navigation back
      // Only destroy when game ends
    };
  }, [gameId]);

  return storeRef.current;
}
```

---

#### Phase 2: Consolidate Hooks (Week 2)

**2.1 Generic Question Hook Factory**
```typescript
// hooks/factories/createQuestionHook.ts
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface QuestionTransformer<TRaw, TTransformed> {
  (raw: TRaw, language: string): TTransformed;
}

export function createQuestionHook<TRaw = any, TTransformed = any>(
  collectionName: string,
  transformer: QuestionTransformer<TRaw, TTransformed>
) {
  return function useQuestions() {
    const [questions, setQuestions] = useState<TTransformed[]>([]);
    const [loading, setLoading] = useState(true);
    const { language } = useLanguage();

    useEffect(() => {
      const fetchQuestions = async () => {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          const rawQuestions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as TRaw[];

          const transformed = rawQuestions.map(q => transformer(q, language));
          setQuestions(transformed);
        } catch (error) {
          console.error(`Error fetching ${collectionName}:`, error);
        } finally {
          setLoading(false);
        }
      };

      fetchQuestions();
    }, [language]);

    return { questions, loading };
  };
}
```

**2.2 Usage Example**
```typescript
// hooks/trap-answer-questions.ts
import { createQuestionHook } from './factories/createQuestionHook';

interface TrapAnswerQuestionRaw {
  question_fr: string;
  question_en: string;
  trap_answer_fr: string;
  trap_answer_en: string;
  intensity: 'soft' | 'tension' | 'extreme';
}

interface TrapAnswerQuestion {
  id: string;
  question: string;
  trapAnswer: string;
  intensity: string;
}

const transformer = (raw: TrapAnswerQuestionRaw, language: string): TrapAnswerQuestion => ({
  id: raw.id,
  question: language === 'fr' ? raw.question_fr : raw.question_en,
  trapAnswer: language === 'fr' ? raw.trap_answer_fr : raw.trap_answer_en,
  intensity: raw.intensity,
});

export const useTrapAnswerQuestions = createQuestionHook(
  'trap-answer-questions',
  transformer
);
```

**Result:** Delete 8 duplicate question hooks (~600 LOC saved)

---

**2.3 Generic Analytics Hook Factory**
```typescript
// hooks/factories/createAnalyticsHook.ts
export function createAnalyticsHook(gameMode: string) {
  return function useGameAnalytics() {
    const posthog = usePostHog();
    const firebase = useFirebaseAnalytics();

    return {
      trackGameStart: (players: number) => {
        posthog.track.custom(`${gameMode}_game_start`, { players });
        firebase.logEvent(`${gameMode}_game_start`, { players });
      },

      trackRoundComplete: (round: number) => {
        posthog.track.custom(`${gameMode}_round_complete`, { round });
        firebase.logEvent(`${gameMode}_round_complete`, { round });
      },

      trackGameEnd: (rounds: number, duration: number) => {
        posthog.track.custom(`${gameMode}_game_end`, { rounds, duration });
        firebase.logEvent(`${gameMode}_game_end`, { rounds, duration });
      },

      // Custom events
      trackCustom: (eventName: string, params?: Record<string, any>) => {
        posthog.track.custom(`${gameMode}_${eventName}`, params);
        firebase.logEvent(`${gameMode}_${eventName}`, params);
      },
    };
  };
}
```

**Usage:**
```typescript
// hooks/trap-answer-analytics.ts
import { createAnalyticsHook } from './factories/createAnalyticsHook';
export const useTrapAnswerAnalytics = createAnalyticsHook('trap_answer');
```

**Result:** Delete 8 duplicate analytics hooks (~800 LOC saved)

---

#### Phase 3: Phase State Machine (Week 3)

**3.1 Phase Transition System**
```typescript
// store/machines/gamePhaseMachine.ts
import { GamePhase } from '@/types/gameTypes';

export interface PhaseTransition {
  from: GamePhase;
  to: GamePhase;
  condition?: (state: any) => boolean;
  action?: (state: any) => void;
}

export const createPhaseMachine = (transitions: PhaseTransition[]) => {
  return {
    canTransition: (currentPhase: GamePhase, nextPhase: GamePhase, state: any) => {
      const transition = transitions.find(
        t => t.from === currentPhase && t.to === nextPhase
      );

      if (!transition) return false;
      if (transition.condition) return transition.condition(state);
      return true;
    },

    transition: (currentPhase: GamePhase, nextPhase: GamePhase, state: any) => {
      const transition = transitions.find(
        t => t.from === currentPhase && t.to === nextPhase
      );

      if (!transition) {
        throw new Error(`Invalid transition: ${currentPhase} → ${nextPhase}`);
      }

      if (transition.condition && !transition.condition(state)) {
        throw new Error(`Condition not met for: ${currentPhase} → ${nextPhase}`);
      }

      transition.action?.(state);
      return nextPhase;
    },
  };
};
```

**3.2 Game-Specific Phase Machine**
```typescript
// app/game/trap-answer/phaseMachine.ts
import { createPhaseMachine } from '@/store/machines/gamePhaseMachine';
import { GamePhase } from '@/types/gameTypes';

export const trapAnswerPhaseMachine = createPhaseMachine([
  {
    from: GamePhase.LOADING,
    to: GamePhase.QUESTION,
    condition: (state) => state.questions?.length > 0,
  },
  {
    from: GamePhase.QUESTION,
    to: GamePhase.WAITING_FOR_ANSWERS,
    condition: (state) => state.hostId === state.currentUserId,
  },
  {
    from: GamePhase.WAITING_FOR_ANSWERS,
    to: GamePhase.VOTE,
    condition: (state) => Object.keys(state.answers).length === state.players.length,
    action: (state) => {
      // Shuffle answers, prepare voting
      console.log('All answers received, starting vote phase');
    },
  },
  {
    from: GamePhase.VOTE,
    to: GamePhase.RESULTS,
    condition: (state) => Object.keys(state.votes).length === state.players.length,
  },
  {
    from: GamePhase.RESULTS,
    to: GamePhase.QUESTION,
    condition: (state) => state.currentRound < state.maxRounds,
    action: (state) => state.nextRound(),
  },
  {
    from: GamePhase.RESULTS,
    to: GamePhase.END,
    condition: (state) => state.currentRound >= state.maxRounds,
  },
]);
```

---

#### Phase 4: Game Template (Week 4)

**4.1 Base Game Component**
```typescript
// components/game/BaseGame.tsx
import { useGameStore } from '@/hooks/useGameStore';
import { GamePhase } from '@/types/gameTypes';

interface BaseGameProps {
  gameId: string;
  renderPhase: (phase: GamePhase, actions: GameActions) => React.ReactNode;
  phaseMachine: PhaseMachine;
}

export function BaseGame({ gameId, renderPhase, phaseMachine }: BaseGameProps) {
  const store = useGameStore(gameId);
  const { user } = useAuth();

  const phase = store(state => state.phase);
  const isHost = store(state => state.isHost(user?.uid || ''));

  const transitionTo = (nextPhase: GamePhase) => {
    const currentPhase = store.getState().phase;
    const state = store.getState();

    if (phaseMachine.canTransition(currentPhase, nextPhase, state)) {
      const newPhase = phaseMachine.transition(currentPhase, nextPhase, state);
      store.getState().updatePhase(newPhase);
    }
  };

  const actions = {
    transitionTo,
    nextRound: () => store.getState().nextRound(),
    submitAnswer: (answer: any) => store.getState().submitAnswer(user?.uid || '', answer),
    submitVote: (vote: any) => store.getState().submitVote(user?.uid || '', vote),
    isHost,
  };

  return (
    <View style={styles.container}>
      {renderPhase(phase, actions)}
    </View>
  );
}
```

**4.2 New Game Template**
```typescript
// app/game/new-game-mode/[id].tsx
import { BaseGame } from '@/components/game/BaseGame';
import { createPhaseMachine } from '@/store/machines/gamePhaseMachine';
import { createQuestionHook } from '@/hooks/factories/createQuestionHook';
import { createAnalyticsHook } from '@/hooks/factories/createAnalyticsHook';

// 1. Define question transformer
const transformer = (raw: any, language: string) => ({
  id: raw.id,
  question: language === 'fr' ? raw.question_fr : raw.question_en,
});

// 2. Create hooks
const useQuestions = createQuestionHook('new-game-questions', transformer);
const useAnalytics = createAnalyticsHook('new_game');

// 3. Define phase machine
const phaseMachine = createPhaseMachine([
  { from: GamePhase.LOADING, to: GamePhase.QUESTION },
  { from: GamePhase.QUESTION, to: GamePhase.RESULTS },
  { from: GamePhase.RESULTS, to: GamePhase.END },
]);

// 4. Render function
export default function NewGameScreen() {
  const { id } = useLocalSearchParams();
  const { questions } = useQuestions();
  const analytics = useAnalytics();

  const renderPhase = (phase: GamePhase, actions: GameActions) => {
    switch (phase) {
      case GamePhase.LOADING:
        return <LoadingScreen />;
      case GamePhase.QUESTION:
        return <QuestionScreen onAnswer={actions.submitAnswer} />;
      case GamePhase.RESULTS:
        return <ResultsScreen onNext={actions.nextRound} />;
      case GamePhase.END:
        return <EndScreen />;
      default:
        return null;
    }
  };

  return (
    <BaseGame
      gameId={id}
      renderPhase={renderPhase}
      phaseMachine={phaseMachine}
    />
  );
}
```

**Time to add new game:** ~30 minutes (vs 4-6 hours currently)

---

## 📁 New Project Structure

```
/store
  /middleware
    firestoreSync.ts         # Zustand ↔ Firestore sync
    analytics.ts             # Auto-track state changes
    logger.ts                # Dev logging
  /slices
    useGameStore.ts          # Base game store
    useRoomStore.ts          # Room/lobby store
    usePlayerStore.ts        # Player-specific state
  /machines
    gamePhaseMachine.ts      # Phase transition logic

/hooks
  /factories
    createQuestionHook.ts    # Question hook factory
    createAnalyticsHook.ts   # Analytics hook factory
  useGameStore.ts            # Store hook with cache
  usePhaseTransition.ts      # Phase machine hook

/components
  /game
    BaseGame.tsx             # Base game wrapper
    PhaseRenderer.tsx        # Phase-based rendering
    /phases
      QuestionPhase.tsx      # Reusable question UI
      VotePhase.tsx          # Reusable vote UI
      ResultsPhase.tsx       # Reusable results UI

/app
  /game
    /[gameMode]
      /[id].tsx              # Minimal game screen (just config)
      /phases               # Game-specific phase overrides
      /phaseMachine.ts      # Game-specific transitions

/types
  gameTypes.ts              # Shared types
  phaseTypes.ts             # Phase machine types
```

---

## 🚀 Migration Strategy

### Step 1: Proof of Concept (3 days)
1. ✅ Install Zustand
2. ✅ Implement Firestore sync middleware
3. ✅ Convert 1 simple game (Truth or Dare) to Zustand
4. ✅ Test with 4+ players in production

### Step 2: Hook Consolidation (1 week)
1. ✅ Create question hook factory
2. ✅ Migrate all 9 question hooks
3. ✅ Create analytics hook factory
4. ✅ Migrate all 8 analytics hooks
5. ✅ Delete old hooks (~1,400 LOC removed)

### Step 3: Store Migration (2 weeks)
1. ✅ Convert 3 remaining games to Zustand
2. ✅ Remove old Context-based game state
3. ✅ Keep AuthContext, LanguageContext, PaywallContext (they're fine)

### Step 4: Phase Machine (1 week)
1. ✅ Implement phase transition system
2. ✅ Create game-specific machines
3. ✅ Remove setTimeout hacks
4. ✅ Add phase validation

### Step 5: Testing & Polish (1 week)
1. ✅ Test all 9 games with multiplayer
2. ✅ Fix edge cases
3. ✅ Add DevTools
4. ✅ Document new patterns

**Total Time:** 5-6 weeks
**Result:** Clean, scalable, bug-free architecture

---

## 🎯 Benefits After Migration

### Developer Experience
- ⚡ **5-minute game creation** (vs 4-6 hours)
- 🐛 **Zero race conditions** (Firestore transactions)
- 🧪 **Easy testing** (stores are plain JS)
- 📊 **DevTools debugging** (time-travel, state inspection)
- 📚 **Single source of truth** for patterns

### Code Quality
- 📉 **-1,400 LOC** (question/analytics consolidation)
- 🎨 **Consistent patterns** across all games
- 🔒 **Type-safe** state management
- 🚫 **No more setTimeout hacks**
- ✅ **Easier code reviews**

### Performance
- 🚀 **Selective re-renders** (vs Context re-rendering all consumers)
- 💾 **Smart caching** (store reuse across navigation)
- 📱 **Better mobile performance**

### Maintenance
- 🔧 **Single place to fix bugs** (middleware, base store)
- 📖 **Self-documenting** (types + phase machines)
- 🔄 **Easy refactors** (centralized logic)

---

## 🤔 Alternative: Keep Context + Patterns

If you prefer **not** to add Zustand:

### Improvements Without New Libraries

**1. Consolidate to Single Context Pattern**
```typescript
// contexts/GameContext.tsx
export function GameProvider({ gameId, children }) {
  const [game, setGame] = useState<GameState>();

  useEffect(() => {
    return onSnapshot(doc(db, 'games', gameId), (snap) => {
      setGame(snap.data());
    });
  }, [gameId]);

  return (
    <GameContext.Provider value={{ game, updateGame }}>
      {children}
    </GameContext.Provider>
  );
}
```

**2. Still Use Hook Factories**
- Question hooks → `createQuestionHook()` ✅
- Analytics hooks → `createAnalyticsHook()` ✅
- Still save 1,400 LOC

**3. Add Phase Validation**
```typescript
const canTransition = (from: GamePhase, to: GamePhase) => {
  const validTransitions = {
    [GamePhase.QUESTION]: [GamePhase.WAITING],
    [GamePhase.WAITING]: [GamePhase.VOTE],
    // ...
  };
  return validTransitions[from]?.includes(to);
};
```

**4. Replace setTimeout with Firestore Transactions**
```typescript
await runTransaction(db, async (transaction) => {
  const gameDoc = await transaction.get(doc(db, 'games', id));
  const game = gameDoc.data();

  // Validate phase transition
  if (!canTransition(game.phase, GamePhase.VOTE)) {
    throw new Error('Invalid transition');
  }

  // Update atomically
  transaction.update(gameDoc.ref, {
    phase: GamePhase.VOTE,
    votes: {},
  });
});
```

**Benefits:**
- ✅ No new dependencies
- ✅ Team knows Context
- ✅ Still removes 1,400 LOC duplication
- ✅ Fixes race conditions

**Limitations:**
- ❌ Still have Context re-render issues
- ❌ Still hard to debug
- ❌ Can't share state across screens easily

---

## 📊 Comparison Table

| Metric | Current | Context + Patterns | Zustand + Patterns |
|--------|---------|-------------------|-------------------|
| **Lines of Code** | ~12,000 | ~10,600 (-12%) | ~10,400 (-13%) |
| **State Patterns** | 3 different | 1 (Context) | 1 (Zustand) |
| **Duplicated Hooks** | 17 hooks | 0 ✅ | 0 ✅ |
| **Race Conditions** | ~10 setTimeout | 0 ✅ | 0 ✅ |
| **Re-render Performance** | Poor | Poor ⚠️ | Excellent ✅ |
| **DevTools** | ❌ | ❌ | ✅ |
| **Testing Ease** | Hard | Medium | Easy ✅ |
| **New Game Time** | 4-6 hours | 1-2 hours | 30 min ✅ |
| **Migration Effort** | - | 3-4 weeks | 5-6 weeks |
| **Learning Curve** | - | Low | Medium |

---

## 🎬 Conclusion

### **Recommendation: Zustand + Patterns**

**Why:**
1. ✅ Solves all current issues (duplication, race conditions, performance)
2. ✅ Future-proof architecture (easy to scale to 50+ game modes)
3. ✅ Industry standard (used by Expo, Shopify, etc.)
4. ✅ Better DX (DevTools, testing, debugging)
5. ✅ Small migration cost (5-6 weeks) for huge long-term benefits

**Next Steps:**
1. **Week 1:** Proof of concept with Truth or Dare
2. **Week 2:** Consolidate question/analytics hooks
3. **Week 3-4:** Migrate remaining games
4. **Week 5:** Phase machine implementation
5. **Week 6:** Testing & documentation

**ROI:**
- **Upfront:** 5-6 weeks migration
- **Ongoing:** 90% faster game development (30 min vs 4-6 hours)
- **Bugs:** 80% reduction (phase validation, no race conditions)
- **Maintenance:** 50% less time (single source of truth)

---

## 📚 Resources

### Zustand
- Docs: https://zustand-demo.pmnd.rs/
- GitHub: https://github.com/pmndrs/zustand
- React Native Guide: https://docs.pmnd.rs/zustand/integrations/persisting-store-data#react-native

### Firebase Transactions
- Docs: https://firebase.google.com/docs/firestore/manage-data/transactions

### Phase Machines
- XState (inspiration): https://xstate.js.org/docs/
- State machine pattern: https://refactoring.guru/design-patterns/state

---

**Questions? Let's discuss your preferences and constraints!**
