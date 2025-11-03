# 🎮 Paywall après les parties gratuites

## Objectif

Afficher le paywall après que l'utilisateur ait joué **2-3 parties gratuites**, pour maximiser la conversion tout en laissant l'utilisateur découvrir l'app.

## Architecture mise en place

### 1. Service de tracking (`services/sessionTrackingService.ts`)

Gère le comptage des sessions gratuites avec AsyncStorage :

- `incrementFreeSessionsCount()` - Incrémente le compteur après chaque partie
- `shouldShowPaywallAfterSession()` - Retourne `true` après 2-3 parties
- `resetFreeSessionsCount()` - Réinitialise quand l'utilisateur s'abonne

### 2. Hook réutilisable (`hooks/useGameEndPaywall.ts`)

Hook à utiliser dans **tous les écrans de jeu gratuits** :

```typescript
import { useGameEndPaywall } from '@/hooks/useGameEndPaywall';

// Dans votre composant de jeu
const [isGameEnded, setIsGameEnded] = useState(false);

// Utiliser le hook
useGameEndPaywall('truth-or-dare', isGameEnded);

// Quand la partie se termine (dernier round, etc.)
setIsGameEnded(true);
```

## Comment intégrer dans un jeu

### Jeux concernés (gratuits)

- ✅ `truth-or-dare` - Action ou Vérité
- ✅ `trap-answer` - Question Piège

### Étapes d'intégration

1. **Importer le hook** dans l'écran du jeu :
   ```typescript
   import { useGameEndPaywall } from '@/hooks/useGameEndPaywall';
   ```

2. **Ajouter un state** pour tracker la fin de partie :
   ```typescript
   const [isGameEnded, setIsGameEnded] = useState(false);
   ```

3. **Utiliser le hook** :
   ```typescript
   useGameEndPaywall('truth-or-dare', isGameEnded);
   ```

4. **Détecter la fin de partie** et mettre à jour le state :
   ```typescript
   // Exemple : quand on atteint le dernier round
   if (currentRound >= totalRounds) {
     setIsGameEnded(true);
   }

   // Ou quand l'utilisateur quitte la partie
   const handleQuitGame = () => {
     setIsGameEnded(true);
     router.back();
   };
   ```

### Exemple complet

```typescript
import React, { useState, useEffect } from 'react';
import { useGameEndPaywall } from '@/hooks/useGameEndPaywall';

export default function TruthOrDareGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameEnded, setIsGameEnded] = useState(false);

  // Hook pour le paywall de fin de partie
  useGameEndPaywall('truth-or-dare', isGameEnded);

  // Écouter les changements du jeu
  useEffect(() => {
    // ... votre logique Firestore ...

    if (gameState) {
      // Détecter la fin de partie
      if (gameState.currentRound >= gameState.totalRounds) {
        setIsGameEnded(true);
      }
    }
  }, [gameState]);

  const handleBackToHome = () => {
    setIsGameEnded(true); // Marquer comme terminé
    router.push('/(tabs)');
  };

  return (
    // ... votre UI ...
  );
}
```

## Comportement du paywall

### Quand le paywall s'affiche

1. ✅ **Clic sur jeu premium** → Paywall immédiat
2. ✅ **Après 2-3 parties gratuites** → Paywall avec délai de 1.5s
3. ❌ **À l'ouverture de l'app** → DÉSACTIVÉ (commenté dans `app/(tabs)/index.tsx`)

### Logs de débogage

Le système affiche des logs pour tracker le comportement :

```
🎮 Partie gratuite terminée (truth-or-dare) - Sessions: 1
✅ 2 partie(s) gratuite(s) restante(s) avant le paywall

🎮 Partie gratuite terminée (truth-or-dare) - Sessions: 2
💰 Affichage du paywall après la partie gratuite
```

## Gestion de l'abonnement

Quand l'utilisateur s'abonne, appeler :

```typescript
import { resetFreeSessionsCount } from '@/services/sessionTrackingService';

// Lors de l'achat réussi
await resetFreeSessionsCount();
```

## TODO : Intégration dans les jeux

- [ ] `app/game/truth-or-dare/[id].tsx`
- [ ] `app/game/trap-answer/[id].tsx`

Pour chaque jeu, il faut :
1. Importer `useGameEndPaywall`
2. Ajouter `useState` pour `isGameEnded`
3. Détecter la fin de partie et appeler `setIsGameEnded(true)`

## Notes

- Le hook utilise un `useRef` pour éviter d'afficher le paywall plusieurs fois
- Le délai de 1.5s avant l'affichage améliore l'UX
- Les utilisateurs avec abonnement ou pro ne voient jamais le paywall
- Le système fonctionne avec AsyncStorage pour persister entre les sessions
