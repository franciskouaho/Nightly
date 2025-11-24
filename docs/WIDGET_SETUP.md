# Guide de Configuration - Widget et Live Activity

Ce guide explique comment configurer et utiliser les widgets et Live Activities pour l'application Nightly.

## Prérequis

- Expo SDK 54+
- Xcode 16+ (macOS 15 Sequoia)
- CocoaPods 1.16.2+ (Ruby 3.2.0+)
- iOS 17.0+ pour les widgets
- iOS 16.1+ pour les Live Activities

## Installation

1. **Installer les dépendances:**
   ```bash
   npm install @bacons/apple-targets
   # ou
   yarn add @bacons/apple-targets
   ```

2. **Le plugin est déjà configuré dans `app.json`:**
   - Le plugin `@bacons/apple-targets` est ajouté dans les plugins
   - Les App Groups sont configurés (`group.com.emplica.nightly.data`)

## Structure des fichiers

```
targets/
  widget/
    expo-target.config.js    # Configuration du widget
    Info.plist               # Métadonnées du widget
    NightlyWidget.swift      # Widget principal (statistiques couple)
    LiveActivity.swift       # Live Activity (parties en cours)
```

## Génération du projet Xcode

1. **Générer le projet iOS:**
   ```bash
   npx expo prebuild -p ios --clean
   ```

2. **Ouvrir le projet dans Xcode:**
   ```bash
   xed ios
   ```

3. **Développer le widget:**
   - Le widget est dans le dossier `expo:targets/widget` dans Xcode
   - Tous les fichiers Swift sont dans `targets/widget/`

## Widget Principal

Le widget principal affiche:
- **Streak actuel** (nombre de jours consécutifs)
- **Distance GPS** entre les partenaires
- **Défi quotidien** actif
- **Jours ensemble** depuis la connexion

### Mise à jour des données

Le widget se met à jour automatiquement via `WidgetService`:

```typescript
import { WidgetService } from '@/services/widgetService';

// Synchroniser les données du couple
await WidgetService.syncCoupleData(
  userId,
  partnerId,
  { currentStreak: 5, longestStreak: 10 },
  '2.5km',
  45,
  { hasActive: true, text: 'Défi du jour: ...' }
);
```

Les données sont partagées via App Groups (`group.com.emplica.nightly.data`) et sont accessibles par le widget Swift.

### Mise à jour manuelle

Pour forcer une mise à jour du widget:

```typescript
import { ExtensionStorage } from '@bacons/apple-targets';

const storage = new ExtensionStorage('group.com.emplica.nightly.data');
storage.set('currentStreak', 5);
ExtensionStorage.reloadWidget();
```

## Live Activity

La Live Activity affiche les parties en cours sur l'écran de verrouillage et dans le Dynamic Island.

### Configuration

La Live Activity est configurée dans `LiveActivity.swift` avec:
- **Attributes:** `NightlyGameActivityAttributes`
- **Content State:** État dynamique de la partie
- **UI:** Interface pour l'écran de verrouillage et Dynamic Island

### Démarrer une Live Activity

**Note:** Les Live Activities doivent être démarrées depuis le code natif Swift. Pour l'instant, la configuration est prête mais nécessite un module natif ou un bridge pour démarrer depuis React Native.

Pour démarrer depuis Swift:

```swift
import ActivityKit

let attributes = NightlyGameActivityAttributes(
    roomId: "room123",
    roomCode: "ABC123"
)

let contentState = NightlyGameActivityAttributes.ContentState(
    gameName: "Pile ou Face",
    playerCount: 4,
    currentRound: 1,
    totalRounds: 5,
    status: "playing"
)

if ActivityAuthorizationInfo().areActivitiesEnabled {
    do {
        let activity = try Activity<NightlyGameActivityAttributes>.request(
            attributes: attributes,
            contentState: contentState
        )
    } catch {
        print("Erreur: \(error)")
    }
}
```

## App Groups

Les App Groups permettent de partager des données entre l'application principale et le widget:

- **ID:** `group.com.emplica.nightly.data`
- **Configuration:** Défini dans `app.json` et `targets/widget/expo-target.config.js`

### Données partagées

Le widget accède aux données via `UserDefaults`:

```swift
let defaults = UserDefaults(suiteName: "group.com.emplica.nightly.data")
let streak = defaults?.integer(forKey: "currentStreak") ?? 0
```

## Personnalisation

### Couleurs du widget

Les couleurs sont définies dans `expo-target.config.js`:

```javascript
colors: {
  $widgetBackground: "#2A0505",  // Fond du widget
  $accent: "#C41E3A",             // Couleur d'accent
  gradient1: { light: "#C41E3A", dark: "#8B1538" },
  gradient2: { light: "#FFB6C1", dark: "#FF7F50" },
}
```

### Images

Les images sont définies dans `expo-target.config.js`:

```javascript
images: {
  logo: "../../assets/christmas/logo.png",
}
```

## Développement

1. **Modifier le widget:**
   - Éditer les fichiers Swift dans `targets/widget/`
   - Les changements sont sauvegardés en dehors du dossier `ios/`

2. **Re-préparer le projet:**
   - Après avoir modifié `expo-target.config.js`, re-run:
     ```bash
     npx expo prebuild -p ios --clean
     ```

3. **Tester le widget:**
   - Build et run l'application dans Xcode
   - Ajouter le widget à l'écran d'accueil (long press sur l'app)
   - Le widget devrait afficher les données du couple

## Build et Distribution

1. **Build avec EAS:**
   ```bash
   eas build --platform ios
   ```

2. **Vérifier les signatures:**
   - Les widgets doivent être signés avec le même certificat que l'app
   - EAS Build gère cela automatiquement

## Troubleshooting

### Le widget ne s'affiche pas

1. Vérifier que les App Groups sont configurés correctement
2. Vérifier que les données sont bien sauvegardées dans l'App Group
3. Forcer une mise à jour: `ExtensionStorage.reloadWidget()`

### Les données ne se synchronisent pas

1. Vérifier que l'App Group ID est le même dans `app.json` et `expo-target.config.js`
2. Vérifier que les données sont bien écrites dans `UserDefaults` avec le bon suite name
3. Vérifier les logs pour voir si les données sont bien sauvegardées

### Le widget ne se met pas à jour

1. Le widget se met à jour toutes les 30 minutes par défaut
2. Forcer une mise à jour avec `ExtensionStorage.reloadWidget()`
3. Vérifier que le `TimelineProvider` est bien configuré

### Erreurs de build

1. Vérifier que toutes les dépendances sont installées
2. Clean le build: `cd ios && pod install && cd ..`
3. Re-préparer le projet: `npx expo prebuild -p ios --clean`

## Ressources

- [Documentation @bacons/apple-targets](https://github.com/EvanBacon/expo-apple-targets)
- [WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [ActivityKit Documentation](https://developer.apple.com/documentation/activitykit)
- [App Groups Documentation](https://developer.apple.com/documentation/xcode/configuring-app-groups)

