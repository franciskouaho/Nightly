# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nightly is a React Native mobile game application built with Expo. It's a multiplayer party game platform featuring multiple game modes like "Never Have I Ever Hot", "Truth or Dare", "Genius or Liar", "Trap Answer", and more. The app uses Firebase for backend services (Firestore, Auth, Storage, Analytics) and includes RevenueCat for subscription management.

**Key Technologies:**
- React Native 0.79.6 with React 19.0.0
- Expo SDK ~53.0.23 with expo-router for file-based routing
- TypeScript 5.8.3
- Firebase (via @react-native-firebase packages)
- Yarn 4.10.3 (with workspaces)
- PostHog and AppsFlyer for analytics
- RevenueCat for in-app purchases

## Common Commands

### Development
```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Run on specific platforms
yarn android    # Android device/emulator
yarn ios        # iOS simulator

# Linting
yarn lint       # Run ESLint
```

### Testing
```bash
yarn test       # Run tests with Jest in watch mode
```

### Firebase-related Scripts
```bash
# Initialize game rules in Firestore
yarn init-rules

# Upload questions to Firebase
yarn upload-questions
```

### Cloud Functions (in cloud-functions/ directory)
```bash
cd cloud-functions
yarn install
yarn build      # Compile TypeScript
yarn deploy     # Deploy functions to Firebase
yarn shell      # Test functions locally
yarn logs       # View function logs
```

### Building
```bash
# The project uses EAS (Expo Application Services) for builds
# Android versionCode in app.json: 30
# iOS uses App Store Connect versioning
```

## Architecture

### Project Structure

**File-based Routing (expo-router):**
- `app/` - Main application screens with file-based routing
  - `app/(tabs)/` - Tab-based screens (home, leaderboard, profile)
  - `app/(auth)/` - Authentication screens (login flow)
  - `app/room/[id].tsx` - Game lobby/room screen
  - `app/game/[gameMode]/[id].tsx` - Individual game mode screens

**Core Directories:**
- `components/` - Reusable UI components (themed components, game-specific UIs)
- `hooks/` - Custom React hooks for business logic, analytics, and game-specific questions
- `contexts/` - React Context providers (AuthContext, LanguageContext, PaywallContext)
- `services/` - Service layer (auth, notifications, Firebase queries)
- `types/` - TypeScript type definitions
- `constants/` - App constants, colors, themes (Halloween, Christmas)
- `utils/` - Utility functions
- `config/` - Configuration files (Firebase, Google Auth, PostHog)
- `cloud-functions/` - Firebase Cloud Functions (separate workspace)

### State Management

The app uses React Context for global state:

1. **AuthContext** (`contexts/AuthContext.tsx`)
   - Manages user authentication state
   - Provides `user` object and `setUser` function
   - Integrates with Firebase Auth

2. **LanguageContext** (`contexts/LanguageContext.tsx`)
   - Handles i18n with react-i18next
   - Provides game content localization
   - Used via `useLanguage()` hook

3. **PaywallContext** (`contexts/PaywallContext.tsx`)
   - Manages subscription/paywall state
   - Controls when to show paywalls (cooldown system)
   - Integrates with RevenueCat
   - Key functions: `showPaywallA()`, `showPaywallB()`, `isProMember`

### Game Flow Architecture

**Room Creation & Joining:**
1. Users create rooms via home screen (`app/(tabs)/index.tsx`)
2. Rooms stored in Firestore `rooms` collection with unique 6-digit codes
3. Players can join via code entry or QR scanning
4. `useRoom()` hook manages room state with real-time Firestore listeners

**Game Phases** (defined in `types/gameTypes.ts`):
```typescript
enum GamePhase {
  LOADING = 'loading',
  CHOIX = 'choix',
  QUESTION = 'question',
  WAITING = 'waiting',
  VOTE = 'vote',
  WAITING_FOR_VOTE = 'waiting_for_vote',
  RESULTS = 'results',
  END = 'end'
}
```

**Game State Management:**
- Each game mode has its own screen in `app/game/[gameMode]/[id].tsx`
- Real-time updates via Firestore listeners
- Game progression managed by `useGame()` and game-specific hooks
- Host controls game flow (next round, phase transitions)

### Firebase Integration

**Collections Structure:**
- `rooms/` - Game lobbies with player lists
- `games/` - Active game state documents
- `users/` - User profiles, subscriptions, points
- Questions stored per game mode (e.g., `trap-answer-questions/`)

**Real-time Listeners:**
- Room status changes trigger navigation to game screens
- Game state updates (phase changes, answers, votes) propagate via `onSnapshot`
- Connection handled through Firestore SDK (not WebSocket - note README mentions Socket.IO for legacy/server context)

### Analytics Architecture

Multiple analytics hooks for tracking:
- `useAnalytics()` - General analytics wrapper
- `useFirebaseAnalytics()` - Firebase Analytics
- `useAppsFlyer()` - AppsFlyer attribution
- `usePostHog()` - PostHog product analytics
- Game-specific analytics hooks (e.g., `useGameAnalytics()`, `useTruthOrDareAnalytics()`)

Each screen uses `AnalyticsScreenTracker` component for automatic screen view tracking.

### Theme System

The app supports themed experiences stored in `constants/themes/`:
- `Halloween.ts` - Halloween-themed colors, assets
- `Christmas.ts` - Christmas-themed colors, assets (current glamour theme)

Theme switching affects:
- App icon (in `app.json`)
- Color schemes
- Decorative components (`HalloweenDecorations`, `HalloweenWrapper`)
- Asset bundles

### Notification System

- `services/expoNotificationService.ts` - Expo notifications
- `services/halloweenNotificationScheduler.ts` - Scheduled seasonal notifications
- Firebase Cloud Messaging for push notifications
- Scheduled notifications set up in `app/_layout.tsx`

## Development Notes

### ESLint Configuration
- Uses flat config format (`eslint.config.js`)
- Enforces unused imports removal
- TypeScript + React rules enabled

### Monorepo Structure
- Uses Yarn workspaces
- `cloud-functions/` is a separate workspace package
- Root `package.json` manages both client and functions

### Platform-Specific Considerations

**Android:**
- Edge-to-edge enabled (Android 15+)
- Configured in `utils/android15Config.ts` and `ModernStatusBar.ts`
- ProGuard enabled for release builds
- Uses 16K page size support

**iOS:**
- Static frameworks mode for Firebase compatibility
- Requires full screen (no iPad split view)
- Background notification modes enabled
- Camera permission for QR scanning

### i18n/Localization
- Uses `react-i18next`
- Translations in `app/i18n/locales/` (e.g., `fr.ts`)
- Game content retrieved via `getGameContent()` from LanguageContext
- Question transformers per game mode handle localization

### Points & Gamification
- Users earn points through gameplay
- Points stored in Firestore user documents
- `usePoints()` hook manages point operations
- Leaderboard via `useLeaderboard()` hook
- In-app asset purchases with points (`app/(tabs)/settings/buy-assets/`)

### Deep Linking
- App scheme: `nightly://`
- Handles room joining via QR codes and deep links
- Configuration in `app.json` and handled in home screen

## Important Patterns

### Game Mode Structure
Each game mode should:
1. Define questions in `hooks/[game-mode]-questions.ts` with `transformQuestion()` function
2. Implement game screen in `app/game/[game-mode]/[id].tsx`
3. Add configuration to `GAME_CONFIG` in `constants/room.ts`
4. Include localized strings in i18n locales
5. Create game-specific analytics hook if needed
6. Add to `app/data/gameModes.ts` in appropriate category
7. Add questions to `scripts/uploadQuestionsToFirebase.ts` for Firebase upload

**Example: Forbidden Desire Game Mode**
- Questions support `intensity` field: 'soft', 'tension', or 'extreme'
- Custom game flow: intensity choice → question → answer/refuse → optional partner challenge
- Hook: `useForbiddenDesireQuestions()` filters by intensity level
- Analytics: `useForbiddenDesireAnalytics()` tracks intensity choices and challenge impositions

### Firestore Query Pattern
Use `useFirestore<T>()` hook from `hooks/useFirestore.ts`:
```typescript
const { add, update, loading } = useFirestore<Room>('rooms');
```

### Analytics Event Pattern
Track events using appropriate analytics service:
```typescript
const { track } = usePostHog();
track.custom('event_name', { property: 'value' });
```

### Component Theming
Use `useThemeColor()` hook for dynamic colors:
```typescript
const backgroundColor = useThemeColor({}, 'background');
```

## Maintenance Mode

The app includes an admin-controlled maintenance mode that can block access. Check for maintenance guards when debugging unexpected navigation behavior.

## Known Issues & Workarounds

The README.md contains extensive troubleshooting information about game phase synchronization issues and WebSocket/real-time update problems. These appear to be historical - the current implementation uses Firestore real-time listeners directly.
