# Résolution de l'erreur "Cycle inside Nightly"

## Problème
L'erreur `error: Cycle inside Nightly; building could produce unreliable results.` indique qu'il y a une dépendance circulaire dans les Build Phases.

## Solutions

### Solution 1 : Nettoyer le build (à faire en premier)
Dans Xcode :
1. **Product → Clean Build Folder** (Cmd+Shift+K)
2. Fermer Xcode complètement
3. Rouvrir Xcode
4. Builder à nouveau (Cmd+B)

### Solution 2 : Vérifier que les fichiers Swift du widget ne sont PAS dans le target Nightly
1. Sélectionner `ios/widget/NightlyWidget.swift` dans le Project Navigator
2. Ouvrir le File Inspector (icône document) ou Cmd+Option+1
3. Section "Target Membership"
4. Vérifier que **UNIQUEMENT** `widgetExtension` est coché
5. Vérifier que `Nightly` **N'EST PAS** coché

Faire la même chose pour :
- `ios/widget/LiveActivity.swift`
- `ios/widget/widgetBundle.swift`

### Solution 3 : Vérifier les Build Phases du target Nightly
1. Sélectionner le target `Nightly`
2. Onglet "Build Phases"
3. Section "Embed Foundation Extensions" :
   - Le widgetExtension.appex doit être là (c'est normal)
   - Mais vérifier qu'il n'y a pas de dépendance circulaire

### Solution 4 : Vérifier que le widgetExtension n'a PAS de dépendances vers Nightly
1. Sélectionner le target `widgetExtension`
2. Onglet "Build Phases"
3. Section "Dependencies" :
   - Elle doit être **vide** ou ne contenir que des frameworks système
   - Il ne doit **PAS** y avoir de dépendance vers `Nightly`

### Solution 5 : Supprimer et recréer la phase "Embed Foundation Extensions" (si nécessaire)
Si le problème persiste :
1. Sélectionner le target `Nightly`
2. Onglet "Build Phases"
3. Supprimer la phase "Embed Foundation Extensions"
4. Cliquer sur "+" → "New Copy Files Phase"
5. Configurer :
   - Destination : "Frameworks"
   - Code Sign On Copy : ✅
   - Ajouter le widgetExtension.appex

### Solution 6 : Vérifier les frameworks
Le target Nightly ne doit PAS inclure WidgetKit ou SwiftUI dans ses frameworks si elles ne sont pas nécessaires directement.

## Vérification rapide
Dans Xcode, allez dans :
- **Product → Scheme → Edit Scheme**
- Sélectionner "Build" dans la liste de gauche
- Vérifier l'ordre de build :
  1. widgetExtension doit être construit **avant** Nightly
  2. Nightly doit **embeder** widgetExtension après

L'ordre devrait être :
```
1. Build widgetExtension
2. Build Nightly (qui embed widgetExtension)
```

Pas :
```
1. Build Nightly (qui dépend de widgetExtension)
2. Build widgetExtension (qui dépend de Nightly) ❌ CYCLE !
```

