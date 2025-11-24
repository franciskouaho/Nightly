# Configuration du Widget - État Final

## ✅ Fichiers Créés et Configurés

### Fichiers Swift
- ✅ `ios/widget/NightlyWidget.swift` - Widget principal (Home Screen + Lock Screen)
- ✅ `ios/widget/LiveActivity.swift` - Live Activity pour les parties en cours
- ✅ `ios/widget/widgetBundle.swift` - Bundle principal du widget
- ✅ `ios/widget/Info.plist` - Configuration du widget
- ✅ `ios/widget/AppIntent.swift` - Configuration App Intent (créé par Xcode)

### Configuration
- ✅ Target `widgetExtension` créé dans Xcode
- ✅ Bundle Identifier : `com.emplica.nightly.widget`
- ✅ App Groups : `group.com.emplica.nightly.data` (à vérifier dans Xcode)

## 📋 Checklist Finale dans Xcode

### 1. Vérifier les fichiers dans le target
- [ ] Ouvrir Xcode
- [ ] Sélectionner le target `widgetExtension`
- [ ] Onglet "Build Phases" → "Compile Sources"
- [ ] Vérifier que ces fichiers sont présents :
  - `NightlyWidget.swift`
  - `LiveActivity.swift`
  - `widgetBundle.swift`
  - `AppIntent.swift`

### 2. Configurer "Minimum Deployments"
- [ ] Sélectionner le target `widgetExtension`
- [ ] Onglet "General"
- [ ] "Minimum Deployments" → **iOS 17.0** (pas 26.1 !)

### 3. Configurer les App Groups
- [ ] Sélectionner le target `widgetExtension`
- [ ] Onglet "Signing & Capabilities"
- [ ] Cliquer sur "+ Capability"
- [ ] Ajouter "App Groups"
- [ ] Cocher `group.com.emplica.nightly.data`

### 4. Configurer le Signing
- [ ] Sélectionner le target `widgetExtension`
- [ ] Onglet "Signing & Capabilities"
- [ ] Section "Signing"
- [ ] Cocher "Automatically manage signing"
- [ ] Sélectionner le Team : `kouaho francis` (même Team que l'app principale)

### 5. Vérifier que l'app principale a aussi les App Groups
- [ ] Sélectionner le target `Nightly`
- [ ] Onglet "Signing & Capabilities"
- [ ] Vérifier que "App Groups" est présent
- [ ] Vérifier que `group.com.emplica.nightly.data` est coché

## 🏗️ Builder le Widget

### Dans Xcode :
1. Sélectionner le schéma **`widgetExtension`** (en haut à gauche)
2. Sélectionner un simulateur iPhone (iOS 17.0+)
3. Appuyer sur **Cmd+B** pour builder
4. Vérifier qu'il n'y a pas d'erreurs

### Si le build réussit :
- ✅ Le widget est prêt !
- Vous pouvez maintenant builder l'app principale (`Nightly`) et tester le widget

## 🧪 Tester le Widget

### 1. Builder et lancer l'app principale
- Sélectionner le schéma **`Nightly`**
- Appuyer sur **Cmd+R** pour builder et lancer

### 2. Ajouter le widget à l'écran d'accueil
- Sur le simulateur, appuyer longuement sur l'écran d'accueil
- "Modifier l'écran d'accueil"
- Appuyer sur le "+" en haut à gauche
- Rechercher "Nightly Couple"
- Ajouter le widget (Small, Medium, Large)

### 3. Tester les données
- Ouvrir l'app Nightly
- Aller sur l'écran **Couples** (si vous avez un partenaire connecté)
- Les données devraient se synchroniser automatiquement
- Retourner à l'écran d'accueil pour voir le widget mis à jour

### 4. Tester les Lock Screen Widgets
- Sur le simulateur, déverrouiller l'iPhone
- Appuyer longuement sur l'écran de verrouillage
- "Personnaliser"
- Appuyer sur l'écran de verrouillage
- Rechercher "Nightly Couple"
- Ajouter le widget (Rectangular, Circular, Inline)

## 🔍 Vérifications Importantes

### App Groups (CRITIQUE)
Les deux targets doivent avoir **exactement le même App Group ID** :
- ✅ Target `Nightly` : `group.com.emplica.nightly.data`
- ✅ Target `widgetExtension` : `group.com.emplica.nightly.data`

### Signing (CRITIQUE)
Les deux targets doivent utiliser **le même Team** :
- ✅ Target `Nightly` : Team `kouaho francis`
- ✅ Target `widgetExtension` : Team `kouaho francis`

### Minimum Deployments
- ✅ Target `widgetExtension` : **iOS 17.0** (pour les Lock Screen Widgets)
- ✅ Target `Nightly` : iOS 15.1+ (selon votre configuration)

## 📱 Données Affichées dans le Widget

Le widget affiche :
- 🔥 **Streak actuel** (jours consécutifs)
- 📍 **Distance GPS** entre les partenaires
- 👤 **Nom du partenaire**
- ❤️ **Jours ensemble** (depuis la connexion)
- ⭐ **Défi quotidien** (si actif)

### Lock Screen Widgets
- **Rectangular** : Jours ensemble + Distance GPS
- **Circular** : Jours ensemble uniquement
- **Inline** : Texte compact avec jours ensemble et distance

## 🐛 Résolution de Problèmes

### Le widget n'apparaît pas dans la liste
- Vérifier que le build du widget a réussi
- Vérifier que `Info.plist` est correctement configuré
- Vérifier que le `WidgetBundle` est bien défini avec `@main`

### Les données ne s'affichent pas
- Vérifier les App Groups dans Xcode (même ID pour les deux targets)
- Vérifier que `WidgetService.syncCoupleData()` est appelé dans `couples.tsx`
- Vérifier les logs : `console.log('✅ Widget synchronisé avec Firebase:', ...)`
- Forcer une mise à jour : `ExtensionStorage.reloadWidget()` depuis l'app

### Erreur de build "No such module 'WidgetKit'"
- Vérifier que iOS Deployment Target est 17.0+ pour le widget
- Vérifier que `WidgetKit` est dans les frameworks

### Erreur de signature
- Vérifier que les deux targets utilisent le même Team
- Vérifier que les Bundle Identifiers sont corrects
- Nettoyer le build : Product → Clean Build Folder (Cmd+Shift+K)

## ✅ État Actuel

- ✅ Fichiers Swift créés et configurés
- ✅ Target widgetExtension créé dans Xcode
- ✅ WidgetService intégré dans couples.tsx
- ⚠️ **À faire dans Xcode** :
  - Ajouter les fichiers Swift au target widgetExtension
  - Configurer les App Groups
  - Configurer le Signing
  - Corriger le Minimum Deployments à iOS 17.0

Une fois ces étapes faites dans Xcode, le widget sera prêt à être testé !

