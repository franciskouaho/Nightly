# Configuration du Widget dans Xcode - Guide Complet

Après avoir généré le projet iOS avec `npx expo prebuild`, vous devez configurer le widget dans Xcode.

## Étapes dans Xcode

### 1. Ouvrir le projet

```bash
cd ios
xed .
```

Ou ouvrir `ios/Nightly.xcworkspace` dans Xcode.

### 2. Vérifier que le widget target existe

1. Dans le **Project Navigator** (barre latérale gauche), cherchez le dossier `expo:targets/widget`
2. Vous devriez voir :
   - `expo-target.config.cjs`
   - `Info.plist`
   - `NightlyWidget.swift`
   - `LiveActivity.swift`

3. Dans la **liste des targets** (à gauche du sélecteur de schéma), vous devriez voir :
   - `Nightly` (l'app principale)
   - `widget` (le widget target)

### 3. Configurer les App Groups (IMPORTANT)

Les App Groups permettent de partager des données entre l'app et le widget.

#### Pour l'app principale (target "Nightly") :

1. Sélectionnez le **target "Nightly"** dans la liste des targets
2. Allez dans l'onglet **"Signing & Capabilities"**
3. Vérifiez que **App Groups** est présent
4. Si ce n'est pas le cas, cliquez sur **"+ Capability"** et ajoutez **App Groups**
5. Vérifiez que `group.com.emplica.nightly.data` est coché

#### Pour le widget (target "widget") :

1. Sélectionnez le **target "widget"** dans la liste des targets
2. Allez dans l'onglet **"Signing & Capabilities"**
3. Cliquez sur **"+ Capability"** et ajoutez **App Groups**
4. Cochez `group.com.emplica.nightly.data`

**⚠️ IMPORTANT :** Les deux targets (app et widget) doivent avoir le même App Group ID !

### 4. Configurer le Signing (Code Signing)

#### Pour l'app principale :

1. Sélectionnez le target **"Nightly"**
2. Allez dans **"Signing & Capabilities"**
3. Cochez **"Automatically manage signing"**
4. Sélectionnez votre **Team** (votre Apple Developer account)
5. Vérifiez le **Bundle Identifier** : `com.emplica.nightly`

#### Pour le widget :

1. Sélectionnez le target **"widget"**
2. Allez dans **"Signing & Capabilities"**
3. Cochez **"Automatically manage signing"**
4. Sélectionnez le **même Team** que l'app principale
5. Vérifiez le **Bundle Identifier** : `com.emplica.nightly.widget` (devrait être automatique)

**⚠️ IMPORTANT :** Les deux targets doivent être signés avec le même Team et le même Provisioning Profile si possible.

### 5. Vérifier les Entitlements

#### Pour l'app principale :

1. Vérifiez que le fichier `Nightly.entitlements` existe
2. Vérifiez qu'il contient :
```xml
<key>com.apple.security.application-groups</key>
<array>
    <string>group.com.emplica.nightly.data</string>
</array>
```

#### Pour le widget :

1. Vérifiez que le fichier `generated.entitlements` existe dans `expo:targets/widget/`
2. S'il n'existe pas, créez-le ou le prebuild le créera automatiquement
3. Vérifiez qu'il contient le même App Group

### 6. Vérifier les Build Settings

#### Pour le widget target :

1. Sélectionnez le target **"widget"**
2. Allez dans **"Build Settings"**
3. Vérifiez :
   - **iOS Deployment Target** : `17.0` (ou la version minimale que vous utilisez)
   - **Product Bundle Identifier** : `com.emplica.nightly.widget`
   - **Product Name** : `widget`

### 7. Build et Test

1. **Sélectionnez le schéma "widget"** dans le sélecteur de schéma (en haut à gauche)
2. Sélectionnez un **simulateur iPhone** (iOS 17.0+)
3. Cliquez sur **Product > Build** (Cmd+B) pour builder le widget
4. Si le build réussit, c'est bon !

### 8. Builder l'app complète

Pour tester le widget avec l'app :

1. **Sélectionnez le schéma "Nightly"** (l'app principale)
2. Builder et lancer l'app (Cmd+R)
3. Une fois l'app lancée :
   - Sur le simulateur, appuyez longuement sur l'écran d'accueil
   - Sélectionnez "Modifier l'écran d'accueil"
   - Cliquez sur le "+" en haut à gauche
   - Cherchez "Nightly Couple"
   - Ajoutez le widget

### 9. Tester le widget

1. **Ajoutez le widget** à l'écran d'accueil (voir étape 8)
2. **Ouvrez l'app Nightly**
3. **Allez sur l'écran Couples** (si vous avez un partenaire connecté)
4. Les données devraient se synchroniser et apparaître dans le widget
5. Si le widget n'affiche pas les données :
   - Vérifiez les App Groups dans Xcode
   - Vérifiez les logs de l'app pour voir si les données sont sauvegardées
   - Vérifiez que `ExtensionStorage.reloadWidget()` est appelé

## Vérifications courantes

### Le widget n'apparaît pas dans la liste des widgets

- Vérifiez que le widget target build sans erreur
- Vérifiez que `Info.plist` est bien configuré
- Vérifiez que le `WidgetBundle` est bien défini dans `NightlyWidget.swift`

### Les données ne s'affichent pas dans le widget

- Vérifiez que les App Groups sont identiques dans les deux targets
- Vérifiez que les données sont bien sauvegardées via `WidgetService`
- Vérifiez les logs : `console.log('✅ Widget synchronisé avec Firebase:', ...)`
- Forcer une mise à jour : `ExtensionStorage.reloadWidget()` depuis l'app

### Erreur de build "No such module 'WidgetKit'"

- Vérifiez que vous utilisez iOS 17.0+ dans les Build Settings
- Vérifiez que `WidgetKit` est dans les frameworks dans `expo-target.config.cjs`

### Erreur de signature

- Vérifiez que les deux targets utilisent le même Team
- Vérifiez que les Bundle Identifiers sont corrects
- Vérifiez que les Provisioning Profiles sont à jour

## Structure attendue dans Xcode

```
Nightly.xcworkspace
├── Nightly (App target)
│   ├── Signing & Capabilities
│   │   └── App Groups: group.com.emplica.nightly.data
│   └── ...
│
├── widget (Widget Extension target)
│   ├── Signing & Capabilities
│   │   └── App Groups: group.com.emplica.nightly.data
│   ├── expo:targets/widget/
│   │   ├── expo-target.config.cjs
│   │   ├── Info.plist
│   │   ├── NightlyWidget.swift
│   │   └── LiveActivity.swift
│   └── ...
```

## Commandes utiles

```bash
# Générer le projet iOS avec le widget
npx expo prebuild -p ios --clean

# Ouvrir Xcode
cd ios
xed .

# Nettoyer le build
cd ios
xcodebuild clean -workspace Nightly.xcworkspace -scheme Nightly

# Builder uniquement le widget
cd ios
xcodebuild build -workspace Nightly.xcworkspace -scheme widget -destination 'platform=iOS Simulator,name=iPhone 15'
```

## Notes importantes

- Les App Groups doivent être configurés dans Xcode après le prebuild
- Le widget doit être signé avec le même Team que l'app principale
- Les données sont partagées via UserDefaults avec le suite name `group.com.emplica.nightly.data`
- Le widget se met à jour automatiquement toutes les 30 minutes ou quand `ExtensionStorage.reloadWidget()` est appelé

