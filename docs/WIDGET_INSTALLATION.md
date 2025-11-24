# Installation du Widget - Guide Rapide

## ✅ Ce qui est déjà fait

Le dossier `targets/widget/` a été créé avec tous les fichiers nécessaires :
- ✅ `expo-target.config.js` - Configuration du widget
- ✅ `Info.plist` - Métadonnées du widget
- ✅ `NightlyWidget.swift` - Widget principal (statistiques couple)
- ✅ `LiveActivity.swift` - Live Activity (parties en cours)

## 📦 Installation des dépendances

Si ce n'est pas déjà fait, installez les dépendances :

```bash
# Option 1: Avec bun (recommandé si vous utilisez bun)
bun install

# Option 2: Avec npm
npm install

# Option 3: Avec yarn
yarn install
```

Assurez-vous que `@bacons/apple-targets` est installé :

```bash
npm list @bacons/apple-targets
# ou
yarn list @bacons/apple-targets
```

Si le package n'est pas installé :

```bash
npm install @bacons/apple-targets
# ou
yarn add @bacons/apple-targets
```

## 🔨 Génération du projet Xcode

Une fois les dépendances installées, générez le projet iOS avec le widget :

```bash
npx expo prebuild -p ios --clean
```

Cette commande va :
1. Générer le projet Xcode dans le dossier `ios/`
2. Créer le target widget dans Xcode
3. Lier les fichiers Swift du dossier `targets/widget/`
4. Configurer les App Groups

## 🚀 Ouverture dans Xcode

Après la génération, ouvrez le projet dans Xcode :

```bash
xed ios
```

Ou double-cliquez sur `ios/Nightly.xcworkspace` dans Finder.

## 📱 Tester le widget

1. **Build et run l'application** depuis Xcode
2. **Ajouter le widget** :
   - Long press sur l'icône de l'app sur l'écran d'accueil
   - Sélectionnez "Modifier l'écran d'accueil"
   - Ajoutez le widget "Nightly Couple"

## 🔍 Vérification

Le widget devrait :
- Afficher le streak actuel
- Afficher la distance GPS (si activée)
- Afficher le défi quotidien (si disponible)
- Afficher les jours ensemble

## ⚠️ Notes importantes

- **iOS 17.0+** requis pour les widgets
- **iOS 16.1+** requis pour les Live Activities
- Le widget se met à jour automatiquement toutes les 30 minutes
- Les données sont partagées via App Groups (`group.com.emplica.nightly.data`)

## 🐛 Problèmes courants

### Erreur "Failed to resolve plugin"

Si vous obtenez une erreur lors de `npx create-target`, ce n'est pas grave car le dossier est déjà créé manuellement.

### Le widget ne s'affiche pas

1. Vérifiez que les App Groups sont bien configurés dans Xcode
2. Vérifiez les signatures dans Xcode (Signing & Capabilities)
3. Assurez-vous que les données sont sauvegardées via `WidgetService`

### Build errors dans Xcode

1. Clean le build : `Product > Clean Build Folder` (Cmd+Shift+K)
2. Réinstaller les pods : `cd ios && pod install && cd ..`
3. Re-préparer le projet : `npx expo prebuild -p ios --clean`

