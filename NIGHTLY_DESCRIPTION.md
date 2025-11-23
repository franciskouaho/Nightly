# 🌙 Nightly - Description Complète

## 📱 Vue d'ensemble

**Nightly** est une application mobile de jeux sociaux multijoueurs conçue pour animer les soirées entre amis, les couples et les groupes. L'application propose une collection variée de jeux interactifs allant des classiques comme "Action ou Vérité" à des modes exclusifs premium.

### Informations Générales
- **Nom** : Nightly
- **Version** : 1.7.1
- **Bundle ID iOS** : `com.emplica.nightly`
- **Package Android** : `com.emplica.nightly.android`
- **Version Code Android** : 35
- **Propriétaire** : iamfrancisco
- **EAS Project ID** : `3de41614-7f99-4215-bec0-9a2ece4bbd35`

---

## 🎮 Modes de Jeu

### Catégories de Jeux

#### 1. **PREMIERS PAS** (Gratuit)
Jeux d'entrée pour découvrir Nightly sans engagement.

- **Action ou Vérité** (`truth-or-dare`)
  - Type : Action interactive
  - Gratuit
  - Police : Righteous-Regular
  - Tags : Gratuit, Fun, Porte d'entrée

- **Question Piège** (`trap-answer`)
  - Type : Quiz à choix multiples
  - Gratuit
  - Police : SigmarOne-Regular
  - Tags : Gratuit, Quiz, Logique, Fun

#### 2. **SOIRÉES ENTRE POTES** (Premium)
Le cœur de Nightly pour des soirées mémorables.

- **Écoute sans Juger** (`listen-but-don-t-judge`)
  - Type : Écriture de réponses
  - Premium
  - Police : PermanentMarker-Regular
  - Tags : Soirée, Histoire, Humour, Premium

- **Pile ou Face** (`pile-ou-face`)
  - Type : Choix multiples
  - Gratuit
  - Nouveau jeu (badge "NEW")
  - Police : Righteous-Regular
  - Tags : Soirée, Hasard, Fun, Révélations

#### 3. **ÉVÉNEMENTS & SAISONNIERS** (Premium)
Éditions limitées disponibles seulement quelques semaines.

- **Quiz Halloween** (`quiz-halloween`)
  - Type : Quiz à choix multiples
  - Premium
  - Saisonnier (Halloween)
  - Police : Creepster-Regular
  - Tags : Saisonnier, Halloween, Exclusif, Premium

#### 4. **COUPLE** 💋 (Premium)
Pour pimenter les soirées à deux.

- **Double Défi** (`double-dare`)
  - Type : Action interactive
  - Premium
  - Niveaux : Hot, Extreme, Chaos
  - Modes : Versus, Fusion
  - Police : RubikMoonrocks-Regular
  - Tags : Couple, Défis, Extrême, Premium

- **Désir Interdit** (`forbidden-desire`)
  - Type : Action interactive
  - Premium
  - Police : Lobster-Regular
  - Tags : Couple, Extrême, Révélations, Premium

- **Jamais Je N'ai Jamais - Hot** (`never-have-i-ever-hot`)
  - Type : Écriture de réponses
  - Premium
  - Police : Pacifico-Regular
  - Tags : Couple, Spicy, Premium

- **Jamais Je N'ai Jamais - Classique** (`never-have-i-ever-classic`)
  - Type : Écriture de réponses
  - Premium
  - Bientôt disponible (comingSoon)
  - Police : RockSalt-Regular
  - Tags : Couple, Drôle, Gages, Premium

#### 5. **À DISTANCE** 🌍 (Premium)
Pour jouer même à distance.

- **Génie ou Menteur** (`genius-or-liar`)
  - Type : Écriture de réponses
  - Premium
  - Police : Tourney-Regular
  - Tags : Distance, Bluff, Fun, Premium

- **Devine le Mot** (`word-guessing`)
  - Type : Écriture de réponses
  - Premium
  - Police : Bangers-Regular
  - Tags : Distance, Rapidité, Créatif, Premium

---

## 🏗️ Architecture Technique

### Stack Technologique

#### Frontend
- **Framework** : React Native 0.81.5
- **Expo** : SDK 54.0.0
- **Navigation** : Expo Router 6.0.14 (file-based routing)
- **Langage** : TypeScript 5.9.2
- **Gestion d'état** : React Context API
- **Stockage local** : AsyncStorage 2.2.0

#### Backend & Services
- **Base de données** : Firebase Firestore
- **Authentification** : Firebase Auth (anonyme + Google)
- **Stockage** : Firebase Storage
- **Fonctions Cloud** : Firebase Cloud Functions
- **Notifications** : Firebase Cloud Messaging (FCM)
- **Analytics** : 
  - Firebase Analytics
  - PostHog (EU)
  - AppsFlyer

#### Monétisation
- **Abonnements** : RevenueCat (react-native-purchases 8.9.5)
- **Plans** : Essai gratuit 3 jours, Mensuel, Annuel

#### UI/UX
- **Gradients** : expo-linear-gradient
- **Polices** : Expo Google Fonts (15+ polices personnalisées)
- **Animations** : react-native-reanimated 4.1.1
- **Haptique** : expo-haptics
- **Confettis** : react-native-confetti

#### Fonctionnalités
- **QR Code** : expo-camera + react-native-qrcode-svg
- **Notifications** : expo-notifications
- **Localisation** : expo-localization (i18n)
- **Avis** : expo-store-review + react-native-in-app-review
- **Mises à jour** : expo-updates (OTA updates)

---

## 🔐 Authentification & Utilisateurs

### Système d'Authentification

**Authentification Anonyme Firebase**
- Connexion sans email/mot de passe
- Création de compte avec pseudo unique
- Vérification de disponibilité des pseudos
- Migration automatique des profils en cas de changement d'UID

**Fonctionnalités**
- Pseudo unique par utilisateur
- Avatar par défaut (renard)
- Points et système de classement
- Gestion des sessions persistantes
- Support des reviewers (Google/Apple)

**Stockage Utilisateur**
- Firestore : Collection `users` et `usernames`
- AsyncStorage : UID local pour restauration de session
- Migration automatique en cas de changement d'identité Firebase

---

## 💰 Système de Monétisation

### Modèle Freemium

#### Jeux Gratuits
- Action ou Vérité
- Question Piège
- Pile ou Face

#### Jeux Premium
Tous les autres modes nécessitent un abonnement Premium.

### Stratégie de Funnel

#### Étape 1 : Acquisition (TikTok)
- Publicités mettant en avant les jeux gratuits
- Message : "On a commencé avec Action/Vérité… puis on a découvert les autres jeux Nightly 😭🔥"

#### Étape 2 : Découverte sans friction
- **Aucun paywall au lancement**
- Accès immédiat aux jeux gratuits
- Tags "PREMIUM" visibles mais non intrusifs
- Jeux premium cliquables → déclenchent le paywall

#### Étape 3 : Conversion intelligente

**Smart Paywall System** (`useSmartPaywall.ts`)
- Déclenchement après 2 parties gratuites OU 15 minutes d'utilisation
- Cooldown de 60 minutes entre affichages
- Tracking automatique des parties jouées

**Déclencheurs du Paywall**
1. Après N parties gratuites (défaut : 2)
2. Après N minutes d'utilisation (défaut : 15)
3. Clic sur un jeu Premium
4. Bouton "Essayer le Premium" dans le profil

### Offres Premium

#### PaywallModalA (Plan Court)
- **Essai gratuit 3 jours** (recommandé)
  - Badge "GRATUIT"
  - Puis 3,99€/semaine
- **Plan Mensuel**
  - Badge "POPULAIRE"
  - Accès complet

**Avantages mis en avant**
- 🔓 Accès illimité à tous les modes
- 🔥 Nouvelles cartes chaque semaine
- 🎨 Ambiances visuelles exclusives
- 👤 Personnalisation des personnages
- ⚡ Mises à jour prioritaires

#### PaywallModalB (Plan Annuel - Exit Intent)
- **Déclenchement** : 45 secondes après fermeture du PaywallA
- **Offre** : Réduction annuelle -50%
- **Conditions** :
  - Cooldown de 8 heures
  - Maximum 3 affichages par session
  - Pas en pleine partie

---

## 📊 Analytics & Tracking

### Services Intégrés

#### 1. Firebase Analytics
- Tracking des événements de jeu
- Analytics spécifiques par mode de jeu
- Suivi des conversions

#### 2. PostHog (EU)
- Product analytics
- Feature flags
- Session tracking
- API Key : `phc_z8yLZKPz4orGGZQlGTh4FIap9nSMAUiwQJYbSjdvaf6`
- Host : `https://eu.i.posthog.com`

#### 3. AppsFlyer
- Attribution marketing
- Tracking des installations
- Conversion tracking
- Dev Key : `gA54F938iBNhpDafLAYZ6F`

### Événements Trackés

**Authentification**
- `af_login` : Connexion utilisateur
- `af_complete_registration` : Inscription complétée

**Jeux**
- `game_started` : Début de partie
- `game_completed` : Fin de partie
- `game_mode_selected` : Sélection d'un mode
- Événements spécifiques par jeu (ex: `double_dare_level_selected`)

**Monétisation**
- `paywall_shown` : Affichage du paywall
- `paywall_closed` : Fermeture du paywall
- `subscription_started` : Début d'abonnement
- `af_purchase` : Achat effectué

**Engagement**
- `screen_viewed` : Vue d'écran
- `free_game_completed` : Partie gratuite terminée
- `premium_game_clicked` : Clic sur jeu premium

---

## 🎨 Thèmes & Personnalisation

### Thème Christmas (Actuel)

**Couleurs Principales**
- Primary : `#C41E3A` (Glamour red - deep burgundy)
- Secondary : `#8B1538` (Dark burgundy)
- Tertiary : `#FFD700` (Gold)
- Background : `#1A1A2E` (Dark blue night)
- Text : `#FFFAF0` (Ivory)

**Gradients Disponibles**
- **glamour** : `#C41E3A` → `#8B1538`
- **christmas** : `#C41E3A` → `#8B1538`
- **snow** : `#FFFDE7` → `#FFFFFF`
- **midnight** : `#1A1A2E` → `#0D0D1A` (avec middle `#C41E3A`)
- **festive** : `#FFFAF0` → `#FFD700`
- **elegant** : `#C41E3A` → `#A01D2E`
- **luxury** : `#1A1A2E` → `#C41E3A` (avec middle `#8B1538`)

### Thème Halloween
- Disponible pour les événements saisonniers
- Décors et animations spéciales

### Polices Personnalisées
L'application utilise 15+ polices Google Fonts :
- Righteous, SigmarOne, PermanentMarker
- Creepster, RubikMoonrocks, Lobster
- Pacifico, RockSalt, Tourney, Bangers
- Et plus...

---

## 🌐 Internationalisation (i18n)

### Langues Supportées
- Français (fr)
- Anglais (en)
- Espagnol (es)
- Italien (it)
- Portugais (pt)

### Système
- **Bibliothèque** : i18next + react-i18next
- **Fichiers** : `app/i18n/locales/[lang].ts`
- **Détection automatique** : expo-localization

---

## 🎯 Fonctionnalités Principales

### Création & Rejoindre une Partie

**Créer une Salle**
- Génération automatique d'un code à 6 chiffres
- QR Code pour invitation rapide
- Gestion des joueurs en temps réel

**Rejoindre une Partie**
- Saisie du code à 6 chiffres
- Scan QR Code avec la caméra
- Vérification de disponibilité de la salle

### Système de Points & Classement
- Points gagnés selon les performances
- Classement global des joueurs
- Système de leaderboard

### Notifications
- Notifications push via FCM
- Notifications locales pour événements spéciaux
- Planification de notifications saisonnières (Halloween)

### Mises à jour OTA
- Mises à jour over-the-air via Expo Updates
- Runtime version : 1.2.3
- Channel : production

---

## 🏛️ Structure du Projet

```
Nightly/
├── app/                    # Pages (Expo Router)
│   ├── (auth)/            # Écrans d'authentification
│   ├── (tabs)/            # Navigation par onglets
│   ├── game/              # Écrans de jeu par mode
│   └── i18n/              # Fichiers de traduction
├── components/             # Composants réutilisables
│   ├── game/              # Composants spécifiques aux jeux
│   ├── room/              # Composants de salle
│   └── admin/             # Composants admin
├── contexts/              # Contextes React
│   ├── AuthContext.tsx    # Gestion de l'authentification
│   ├── LanguageContext.tsx # Gestion des langues
│   └── PaywallContext.tsx  # Gestion du paywall
├── hooks/                 # Hooks personnalisés
│   ├── useGame.ts         # Logique de jeu
│   ├── useRoom.ts         # Logique de salle
│   ├── usePaywallManager.ts # Gestion du paywall
│   └── useSmartPaywall.ts  # Paywall intelligent
├── services/              # Services métier
│   ├── auth.ts            # Service d'authentification
│   ├── gameInitializationService.ts
│   └── notificationScheduler.ts
├── constants/             # Constantes
│   ├── themes/            # Thèmes (Christmas, Halloween)
│   └── Colors.ts          # Couleurs
├── config/                # Configuration
│   ├── firebase.ts        # Config Firebase
│   ├── posthog.ts         # Config PostHog
│   └── googleAuth.ts      # Config Google Auth
├── cloud-functions/       # Firebase Cloud Functions
├── android/              # Code natif Android
├── ios/                  # Code natif iOS
└── docs/                 # Documentation
```

---

## 🔧 Configuration & Build

### Android
- **Compile SDK** : 35
- **Target SDK** : 35
- **Build Tools** : 35.0.0
- **Minify** : ProGuard activé en release
- **Shrink Resources** : Activé en release
- **Edge-to-Edge** : Activé

### iOS
- **Deployment Target** : 15.1
- **Frameworks** : Static linking
- **Supports Tablet** : Oui

### Keystore
- **Production** : `release.keystore`
- **Alias** : `emplica`
- **Configuration** : `android/keystore.properties` (non versionné)

---

## 📱 Permissions

### Android
- `INTERNET`
- `NOTIFICATIONS`
- `RECEIVE_BOOT_COMPLETED`
- `VIBRATE`
- `WAKE_LOCK`
- `CAMERA`
- `com.android.vending.BILLING`

### iOS
- `NSCameraUsageDescription` : Pour scanner les QR codes
- `UIBackgroundModes` : `remote-notification`

---

## 🚀 Déploiement

### Expo Updates (OTA)
- **URL** : `https://u.expo.dev/3de41614-7f99-4215-bec0-9a2ece4bbd35`
- **Channel** : production
- **Check Automatically** : ON_LOAD
- **Fallback Timeout** : 0

### Build
- **EAS Build** : Configuré via `eas.json`
- **Android AAB** : Signé pour production
- **iOS** : Configuré avec Apple Team ID

---

## 📈 Métriques & KPIs

### Acquisition
- Coût par installation (CPI)
- Taux de conversion TikTok → Download
- Attribution AppsFlyer

### Engagement
- Nombre de parties jouées (moyenne)
- Temps passé dans l'app
- Taux de rétention J1, J7, J30

### Conversion
- Taux de conversion Gratuit → Essai 3 jours
- Taux de conversion Essai → Payant
- Taux d'upsell PaywallA → PaywallB
- Revenus par utilisateur (ARPU)

### Qualité
- Nombre d'affichages du paywall par utilisateur
- Taux de désinstallation post-paywall
- Reviews app store

---

## 🛠️ Scripts Disponibles

```bash
# Développement
yarn start              # Démarrer Expo
yarn android            # Lancer sur Android
yarn ios                # Lancer sur iOS
yarn web                # Lancer sur Web

# Utilitaires
yarn lint               # Linter le code
yarn init-rules         # Initialiser les règles de jeu
yarn upload-questions   # Uploader les questions vers Firebase
yarn reset-leaderboard  # Réinitialiser le leaderboard
```

---

## 🔒 Sécurité

### Firestore Rules
- Authentification requise pour la plupart des opérations
- Vérification de propriété pour les mises à jour
- Accès admin pour certaines opérations critiques

### Storage Rules
- Uploads authentifiés uniquement
- Validation des types de fichiers

### Keystore
- Fichier de production non versionné
- Propriétés sensibles dans `keystore.properties` (gitignored)

---

## 📚 Documentation Additionnelle

Le projet contient plusieurs fichiers de documentation dans `/docs` :
- `FUNNEL_STRATEGY.md` : Stratégie de conversion premium
- `PAYWALL_CHECKLIST.md` : Checklist de vérification du paywall
- `PAYWALL_B_EXPLANATION.md` : Explication du paywall annuel
- `ADMIN_PANEL_SETUP.md` : Configuration du panneau admin
- `HOW_TO_GET_UID.md` : Guide pour obtenir l'UID utilisateur

---

## 🎉 Points Forts de l'Application

1. **Expérience Utilisateur Optimale**
   - Pas de friction au lancement
   - Accès immédiat aux jeux gratuits
   - Interface moderne et intuitive

2. **Système de Monétisation Intelligent**
   - Smart paywall avec déclenchement contextuel
   - Essai gratuit pour réduire la friction
   - Upsell annuel avec exit-intent

3. **Variété de Jeux**
   - 10+ modes de jeu différents
   - Catégories adaptées (Soirées, Couple, Distance)
   - Jeux saisonniers pour maintenir l'engagement

4. **Technologie Moderne**
   - React Native avec Expo
   - Mises à jour OTA
   - Analytics multi-plateformes

5. **Multilingue**
   - Support de 5 langues
   - Interface localisée complète

---

## 📞 Support & Maintenance

### Logs de Debug
- Préfixes pour faciliter le debugging :
  - `🎮` : Fin de partie
  - `📊` : Compteur incrémenté
  - `💰` : Paywall affiché
  - `⏳` : Cooldown ou conditions non remplies

### Outils de Débogage
- `GameDebugger` : Diagnostic de l'état des jeux
- `SocketService` : Vérification des connexions WebSocket
- Utilitaires de récupération automatique

---

**Dernière mise à jour** : 2025-01-03  
**Version du document** : 1.0  
**Status** : ✅ Application en production

