# Nightly Architecture - Executive Summary

## Quick Overview

**Nightly** is a React Native multiplayer party game with 9 game modes built on:
- **Backend:** Firebase (Firestore, Auth, Storage, Analytics)
- **State:** React Context + Firebase Listeners
- **UI:** React Native + Expo Router
- **Analytics:** PostHog, AppsFlyer, Firebase Analytics

---

## Current State Management (3 Patterns)

### Pattern A: Direct Firestore Listener
**Games:** Truth or Dare, Forbidden Desire, Double Dare
```typescript
onSnapshot(doc(db, "games", id), (docSnap) => {
  setGame(docSnap.data());
});
```
- Pros: Simple, direct
- Cons: Logic in component, hard to test

### Pattern B: useGame Hook
**Games:** Trap Answer, Never Have I Ever Hot
```typescript
const { gameState, updateGameState } = useGame(gameId);
```
- Pros: Abstracted, reusable
- Cons: Inconsistent between games, custom Refs

### Pattern C: Context-based
**Games:** All rely on AuthContext, LanguageContext, PaywallContext
- Manages: Authentication, i18n, subscriptions
- Good separation of concerns

---

## Critical Problems

| Issue | Lines Affected | Fix Time |
|-------|----------------|----------|
| **80% duplicated question hooks** | ~600 LOC | 1 week |
| **3 state management patterns** | Game screens | 2 weeks |
| **Race condition hacks (Refs)** | Multiple effects | 1 week |
| **No phase state machine** | Game logic | 1 week |
| **Scattered Firestore updates** | Game screens | 3 days |
| **9 duplicate analytics hooks** | ~800 LOC | 3 days |

---

## Game Lifecycle Flow

```
Home Screen
    ↓
Select Game Mode
    ↓
Create Room (stores in rooms/{roomId})
    ↓
Room Lobby (useRoom hook listens for changes)
    ↓
Host Clicks Start
    ↓
startGame() → Creates games/{roomId} document
    ↓
Initialize First Question
    ↓
Redirect to /game/{gameMode}/{id}
    ↓
Game Screen Mounts
    ↓
Real-time Listener on games/{id}
    ↓
Render based on gameState.phase
    ↓
Player Actions → updateDoc → All players notified
    ↓
Round Complete → Calculate Scores → Next Round
    ↓
Game Over → Show GameResults
    ↓
User Returns Home or Shares
```

---

## State Management Layers

### Layer 1: Firestore (Source of Truth)
- `rooms/{roomId}` - Lobby state
- `games/{gameId}` - Active game state
- `users/{userId}` - User profiles
- `gameQuestions/{gameMode}` - Questions per language

### Layer 2: React Context (Global)
- **AuthContext:** User auth, session, login
- **LanguageContext:** i18n, game content
- **PaywallContext:** Subscriptions, paywall display

### Layer 3: Component Local State
- Phase-specific UI state
- Temporary player responses
- Timer countdowns
- Modal visibility

---

## Code Duplication Examples

### Example 1: Question Hooks (9 copies)
```typescript
// truth-or-dare-questions.ts - 80 lines
export function useTruthOrDareQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const { isRTL, language } = useLanguage();

  useEffect(() => {
    const fetchQuestions = async () => {
      const db = getFirestore();
      const questionsRef = doc(db, 'gameQuestions', 'truth-or-dare');
      const questionsDoc = await getDoc(questionsRef);
      const questionsData = questionsDoc.data();
      const currentLanguage = isRTL ? 'ar' : language || 'fr';
      const rawQuestions = questionsData?.translations?.[currentLanguage] || [];
      const transformedQuestions = rawQuestions.map(transformQuestion);
      setQuestions(transformedQuestions);
    };
    fetchQuestions();
  }, [isRTL, language]);

  return { questions, getRandomQuestion };
}

// trap-answer-questions.ts - SAME CODE!
// forbidden-desire-questions.ts - SAME CODE!
// [6 more identical implementations]
```

**Impact:** 600+ lines of duplicated code

### Example 2: Analytics Hooks (8 copies)
```typescript
// useTruthOrDareAnalytics.ts
export function useTruthOrDareAnalytics() {
  const { track } = usePostHog();
  return {
    trackChoice: (gameId, choice) => track.custom('truth_or_dare_choice', ...),
    trackRoundComplete: (gameId, round, total) => track.custom(...),
    trackGameComplete: (gameId, totalRounds, duration) => track.custom(...),
  };
}

// useNeverHaveIEverHotAnalytics.ts - SAME PATTERN!
// [6 more identical implementations]
```

**Impact:** 800+ lines of duplicated code

### Example 3: Timer Logic (Multiple implementations)
Truth or Dare: ~20 lines
Trap Answer: ~20 lines
[3+ more variations]

**Impact:** 50+ lines across codebase

---

## Pain Points by Severity

### CRITICAL
1. **Code Duplication**
   - 9 question hooks (80% identical)
   - 8 analytics hooks (90% identical)
   - 3 timer implementations
   - 2 state management approaches
   - **Fix:** Generic hooks with configuration

2. **Race Conditions**
   - Vote validation using setTimeout hacks
   - Ref-based transition flags
   - **Fix:** Use Firestore transactions

### HIGH
3. **Inconsistent State Management**
   - Truth or Dare uses direct Firestore
   - Trap Answer uses useGame hook
   - Never Have I Ever Hot uses useGame + Refs
   - **Fix:** Single unified approach

4. **No Phase State Machine**
   - Phase transitions scattered throughout components
   - String vs enum inconsistencies
   - **Fix:** Centralized phase validator

### MEDIUM
5. **Scattered Firestore Updates**
   - Updates in 5+ different functions per game
   - No batch operations
   - Potential for inconsistent state
   - **Fix:** Centralize in updateGameState

6. **Game Lifecycle Complexity**
   - Logic split between useRoom, useGame, game screen
   - Hard to follow game progression
   - **Fix:** Document + simplify flow

---

## Quick Metrics

| Metric | Value |
|--------|-------|
| Game Modes | 9 |
| Game Screen Files | 9 |
| Question Hook Files | 9 |
| Analytics Hook Files | 8 |
| Game Phase Enum Values | 8 |
| State Management Patterns | 3 |
| Duplicated Question Hook Code | ~600 LOC |
| Duplicated Analytics Hook Code | ~800 LOC |
| Average Game Screen Size | 900 lines |
| Total Game Screen LOC | ~8,000 |

---

## Recommended Refactoring Order

### Phase 1: Quick Wins (1 week)
- [ ] Create generic `useGameQuestions` hook
- [ ] Create generic `useGameAnalytics` hook
- [ ] Consolidate timer logic into utility

### Phase 2: State Management (2 weeks)
- [ ] Audit all game screens for state management pattern
- [ ] Migrate Truth or Dare to useGame hook
- [ ] Remove Ref-based transition flags
- [ ] Add proper Firestore transactions

### Phase 3: Stability (1 week)
- [ ] Fix vote validation race conditions
- [ ] Add comprehensive error handling
- [ ] Test multiplayer synchronization

### Phase 4: Architecture (1-2 weeks)
- [ ] Implement phase state machine
- [ ] Centralize game lifecycle logic
- [ ] Create game mode factory pattern

---

## Key Files to Know

### State Management
- `hooks/useGame.ts` - Primary state management hook
- `hooks/useRoom.ts` - Room/lobby management
- `hooks/useFirestore.ts` - Generic Firestore CRUD

### Context Providers
- `contexts/AuthContext.tsx` - Authentication
- `contexts/LanguageContext.tsx` - Internationalization
- `contexts/PaywallContext.tsx` - Subscriptions

### Game Screens
- `app/game/truth-or-dare/[id].tsx` - Direct Firestore pattern
- `app/game/never-have-i-ever-hot/[id].tsx` - useGame + Refs pattern
- `app/game/trap-answer/[id].tsx` - useGame pattern

### Game Configuration
- `app/data/gameModes.ts` - Game metadata
- `constants/room.ts` - GAME_CONFIG with min players
- `types/gameTypes.ts` - GamePhase enum, GameState interface

---

## Architecture Decision Records (ADR)

### ADR-1: Multiple State Management Patterns
**Status:** Current (should be refactored)
**Reason:** Evolved organically as new games added
**Impact:** Hard to maintain, confusing for devs
**Decision:** Standardize on useGame hook

### ADR-2: Code-over-Config Pattern
**Status:** Current
**Reason:** Game-specific logic justifies custom code
**Impact:** 600+ LOC duplication
**Decision:** Extract to generic hooks + configs

### ADR-3: Direct Firestore Listeners
**Status:** Current
**Reason:** Simple for single-game updates
**Impact:** Logic in components, hard to test
**Decision:** Centralize in hooks

### ADR-4: Phase Transitions as Imperative Updates
**Status:** Current
**Reason:** Firestore doesn't enforce schemas
**Impact:** Race conditions, inconsistent state
**Decision:** Implement phase machine + transactions

---

## Next Steps

1. **Read Full Analysis** → `/Users/francis/workspace/Nightly/CODEBASE_ANALYSIS.md`
2. **Review Game Screens** → Start with truth-or-dare/[id].tsx
3. **Understand useGame Hook** → Primary abstraction
4. **Plan Consolidation** → Generic hooks first
5. **Execute Refactor** → Phase by phase

---

*For detailed analysis with code examples, see: CODEBASE_ANALYSIS.md*
