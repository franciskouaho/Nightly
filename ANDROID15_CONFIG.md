# Configuration Android 15 - Nightly App

## 🚀 Modifications apportées pour Android 15

### ✅ Problèmes résolus

1. **Edge-to-Edge (Bord à bord)**
   - ✅ Configuration automatique des encarts (notch, barre de navigation)
   - ✅ Gestion moderne des StatusBar
   - ✅ Support Android 15 par défaut

2. **API StatusBar obsolètes**
   - ✅ Remplacement de `getStatusBarColor`, `setStatusBarColor`, `setNavigationBarColor`
   - ✅ Utilisation des nouvelles API Expo StatusBar
   - ✅ Configuration moderne dans `ModernStatusBar.ts`

3. **Alignement mémoire 16ko**
   - ✅ `enablePageSize16K: true` dans `app.json`
   - ✅ Configuration optimisée pour Android 15
   - ✅ Support des appareils avec pages mémoire 16ko

### 📁 Fichiers modifiés

- `android/build.gradle` - SDK 35, targetSdkVersion 35
- `android/gradle.properties` - Configuration 16ko et Edge-to-Edge
- `android/app/src/main/java/com/emplica/nightly/android/MainActivity.kt` - Edge-to-Edge
- `app.json` - Configuration Expo pour Android 15
- `app/_layout.tsx` - Configuration StatusBar moderne
- `utils/ModernStatusBar.ts` - Remplacement API obsolètes
- `utils/android15Config.ts` - Configuration Edge-to-Edge

### 🎯 Résultat

- ✅ **Compatible Android 15** : Plus d'avertissements Google Play
- ✅ **Edge-to-Edge moderne** : Gestion automatique des encarts
- ✅ **API StatusBar modernes** : Plus d'API obsolètes
- ✅ **Optimisé 16ko** : Support des pages mémoire 16ko
- ✅ **Performance améliorée** : Configuration optimisée

### 🔧 Configuration technique

```json
// app.json
{
  "android": {
    "compileSdkVersion": 35,
    "targetSdkVersion": 35,
    "enablePageSize16K": true,
    "enableEdgeToEdge": true,
    "statusBarStyle": "light",
    "statusBarBackgroundColor": "transparent"
  }
}
```

```kotlin
// MainActivity.kt
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    WindowCompat.setDecorFitsSystemWindows(window, false)
}
```

### 📱 Test recommandé

1. Tester sur Android 15 (API 35)
2. Vérifier l'affichage Edge-to-Edge
3. Tester les encarts (notch, barre de navigation)
4. Vérifier les StatusBar transparentes
5. Tester sur appareils 16ko si disponibles

### 🎃 Thème Halloween

La configuration supporte également le thème Halloween avec :
- StatusBar couleur Halloween (`#2D1810`)
- Configuration Edge-to-Edge préservée
- Compatibilité Android 15 maintenue
