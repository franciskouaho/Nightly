# Intégration Firebase avec le Widget

Ce document explique comment le widget est connecté à Firebase pour afficher les données en temps réel.

## Architecture

Le widget fonctionne en deux parties :

1. **React Native (App principale)** : Écoute Firebase et sauvegarde les données dans App Groups
2. **Widget Swift** : Lit les données depuis App Groups (UserDefaults) et les affiche

## Flux de données

```
Firebase Firestore
    ↓ (onSnapshot listeners)
React Native App
    ↓ (ExtensionStorage)
App Groups (UserDefaults)
    ↓ (UserDefaults)
Widget Swift
    ↓ (Affichage)
Widget UI
```

## Données synchronisées

Le widget affiche les données suivantes depuis Firebase :

### 1. Streak (Collection `couples`)
- `currentStreak` : Streak actuel
- `longestStreak` : Meilleur streak jamais atteint
- Écoute en temps réel : `onSnapshot` sur `couples/{coupleId}`

### 2. Distance GPS (Collection `users`)
- Distance calculée entre les deux partenaires
- Utilise les champs `location` et `locationSharingEnabled`
- Calcul avec la formule de Haversine
- Écoute en temps réel : `onSnapshot` sur `users/{userId}` et `users/{partnerId}`

### 3. Défi quotidien (Collection `coupleChallenges`)
- `hasActiveChallenge` : Si un défi est actif aujourd'hui
- `challengeText` : Texte du défi
- Écoute en temps réel : `onSnapshot` sur `coupleChallenges/{coupleId}_{date}`

### 4. Informations du couple
- `partnerName` : Nom du partenaire
- `daysTogether` : Nombre de jours depuis la connexion
- Calculé depuis les dates de création des comptes

## Service WidgetService

Le service `WidgetService` dans `services/widgetService.ts` gère toute la synchronisation :

### Méthodes principales

#### `syncCoupleData()`
Synchronise toutes les données depuis Firebase et les sauvegarde dans App Groups.

```typescript
await WidgetService.syncCoupleData(
  userId,
  partnerId,
  { currentStreak, longestStreak },
  distance,
  daysTogether,
  { hasActive, text }
);
```

Cette méthode :
1. Récupère les données du partenaire depuis Firebase
2. Récupère le streak depuis la collection `couples`
3. Calcule la distance GPS si les deux partenaires partagent leur localisation
4. Récupère le défi quotidien depuis `coupleChallenges`
5. Sauvegarde tout dans App Groups via `ExtensionStorage`
6. Recharge le widget pour afficher les nouvelles données

#### `setupCoupleDataListener()`
Configure les listeners Firebase en temps réel pour mettre à jour automatiquement le widget.

```typescript
const unsubscribe = WidgetService.setupCoupleDataListener(userId, partnerId);
```

Écoute les changements sur :
- `users/{partnerId}` : Nom, localisation du partenaire
- `users/{userId}` : Localisation de l'utilisateur
- `couples/{coupleId}` : Streak
- `coupleChallenges/{coupleId}_{date}` : Défi quotidien

Chaque changement déclenche une mise à jour du widget.

## Intégration dans l'écran Couples

L'écran `app/(tabs)/couples.tsx` utilise le service pour synchroniser automatiquement :

```typescript
useEffect(() => {
  if (!user?.uid) return;

  if (!hasPartner || !partnerId) {
    // Pas de partenaire, vider les données
    WidgetService.syncCoupleData(userId, null, null, null, 0, null);
    return;
  }

  // Synchroniser initialement
  WidgetService.syncCoupleData(...);

  // Écouter les changements en temps réel
  const unsubscribe = WidgetService.setupCoupleDataListener(userId, partnerId);

  return () => unsubscribe();
}, [user?.uid, hasPartner, partnerId]);
```

## Format des données dans App Groups

Les données sont sauvegardées comme suit dans UserDefaults :

```swift
let defaults = UserDefaults(suiteName: "group.com.emplica.nightly.data")

// Valeurs numériques
defaults?.integer(forKey: "currentStreak")     // Int
defaults?.integer(forKey: "longestStreak")     // Int
defaults?.integer(forKey: "daysTogether")      // Int

// Valeurs texte
defaults?.string(forKey: "distance")           // String (ex: "2.5km")
defaults?.string(forKey: "partnerName")        // String
defaults?.string(forKey: "challengeText")      // String

// Valeurs booléennes (sauvegardées comme "true"/"false")
defaults?.string(forKey: "hasActiveChallenge") // String ("true" ou "false")
```

## Calcul de la distance GPS

La distance est calculée avec la formule de Haversine :

```typescript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

## Mise à jour du widget

Le widget se met à jour de plusieurs façons :

1. **Automatiquement** : Toutes les 30 minutes (TimelineProvider)
2. **En temps réel** : Quand les données Firebase changent (ExtensionStorage.reloadWidget())
3. **Manuellement** : Via ExtensionStorage.reloadWidget() dans le code

## Logs et Debug

Le service log des informations importantes :

```typescript
console.log('✅ Widget synchronisé avec Firebase:', {
  currentStreak,
  longestStreak,
  distance,
  partnerName,
  daysTogether,
  hasActiveChallenge,
});
```

Pour vérifier que les données sont bien sauvegardées, vous pouvez :
1. Vérifier les logs dans la console React Native
2. Vérifier UserDefaults dans Xcode (Debug > Attach to Process > Simulator)
3. Vérifier Firebase Console pour voir les changements en temps réel

## Troubleshooting

### Le widget n'affiche pas les bonnes données

1. Vérifier que les App Groups sont bien configurés dans Xcode
2. Vérifier les logs pour voir si les données sont sauvegardées
3. Forcer une mise à jour : `ExtensionStorage.reloadWidget()`

### Les données ne se mettent pas à jour

1. Vérifier que les listeners Firebase sont actifs
2. Vérifier que les données changent bien dans Firebase
3. Vérifier que `setupCoupleDataListener()` est appelé

### Erreur "Permission denied" dans Firebase

1. Vérifier les règles Firestore pour les collections :
   - `couples/{coupleId}` : Lecture autorisée pour les utilisateurs du couple
   - `users/{userId}` : Lecture autorisée pour l'utilisateur et son partenaire
   - `coupleChallenges/{coupleId}_{date}` : Lecture autorisée pour les utilisateurs du couple

## Structure Firestore

```
users/
  {userId}/
    - partnerId: string
    - location: { latitude, longitude, timestamp }
    - locationSharingEnabled: boolean
    - createdAt: timestamp

couples/
  {userId1}_{userId2}/
    - currentStreak: number
    - longestStreak: number
    - lastActivityDate: string
    - lastActivityTimestamp: number

coupleChallenges/
  {coupleId}_{date}/
    - challenge: { id, type, question, category, date }
    - completed: boolean
    - userResponses: Array<{ userId, response, timestamp }>
```

## Performance

Pour optimiser les performances :

1. Les listeners Firebase se désabonnent automatiquement quand l'écran est fermé
2. Les données sont mises en cache dans UserDefaults
3. Le widget ne se recharge que quand les données changent réellement
4. Le TimelineProvider limite les mises à jour à toutes les 30 minutes

## Sécurité

Les données dans App Groups sont :
- Accessibles uniquement à l'app et ses extensions (widget)
- Stockées localement sur l'appareil
- Synchronisées uniquement si les permissions Firestore le permettent

Les règles Firestore doivent vérifier que :
- Un utilisateur ne peut lire que ses propres données et celles de son partenaire
- Un utilisateur ne peut lire que les données de son couple

