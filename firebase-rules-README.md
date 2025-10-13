# 🔥 Règles Firebase pour Nightly - Production

## 📋 Vue d'ensemble

Ce dossier contient les règles de sécurité Firebase pour l'application Nightly en production.

## 📁 Fichiers

- `firestore.rules` - Règles pour Firestore Database
- `storage.rules` - Règles pour Firebase Storage
- `README.md` - Ce fichier d'explication

## 🔐 Règles Firestore

### 👤 Utilisateurs (`/users/{userId}`)
- **Lecture/Écriture** : Seul le propriétaire du compte
- **Lecture** : Autres utilisateurs authentifiés (pour les profils)

### 🎮 Salles de jeu (`/rooms/{roomId}`)
- **Lecture/Écriture** : Utilisateurs authentifiés
- **Création** : Seul le propriétaire (`ownerId`)
- **Modification** : Joueurs participants ou propriétaire

### 🎯 Parties de jeu (`/games/{gameId}`)
- **Lecture/Écriture** : Utilisateurs authentifiés
- **Création** : Utilisateurs authentifiés
- **Modification** : Seulement les joueurs participants

### 📖 Règles de jeu (`/gameRules/{ruleId}`)
- **Lecture** : Publique (tous les utilisateurs)
- **Écriture** : Interdite (admin uniquement via Firebase Console)

### ❓ Questions (`/questions/{questionId}`)
- **Lecture** : Publique (tous les utilisateurs)
- **Écriture** : Interdite (admin uniquement via Firebase Console)

### 📊 Statistiques (`/userStats/{userId}`)
- **Lecture/Écriture** : Seul le propriétaire du compte

### 💳 Achats (`/purchases/{purchaseId}`)
- **Lecture/Écriture** : Seul le propriétaire de l'achat
- **Création** : Seul le propriétaire de l'achat

### 🎨 Assets/Skins (`/assets/{assetId}`)
- **Lecture** : Publique
- **Écriture** : Interdite (admin uniquement)

### 🎨 Collections utilisateur (`/userAssets/{userId}`)
- **Lecture/Écriture** : Seul le propriétaire du compte

### 🔔 Notifications (`/notifications/{notificationId}`)
- **Lecture/Écriture** : Seul le propriétaire de la notification
- **Création** : Seul le propriétaire de la notification

### 🏆 Classements (`/leaderboards/{leaderboardId}`)
- **Lecture** : Publique
- **Écriture** : Interdite (admin uniquement)

### 🐛 Rapports de bugs (`/bugReports/{reportId}`)
- **Lecture/Écriture** : Utilisateurs authentifiés
- **Création** : Utilisateurs authentifiés

### 💬 Feedbacks (`/feedbacks/{feedbackId}`)
- **Lecture/Écriture** : Utilisateurs authentifiés
- **Création** : Utilisateurs authentifiés

### ⚙️ Configuration (`/appConfig/{configId}`)
- **Lecture** : Publique
- **Écriture** : Interdite (admin uniquement)

### 🎉 Événements (`/events/{eventId}`)
- **Lecture** : Publique
- **Écriture** : Interdite (admin uniquement)

### 🌍 Traductions (`/translations/{language}`)
- **Lecture** : Publique
- **Écriture** : Interdite (admin uniquement)

## 🗄️ Règles Storage

### 👤 Avatars (`/avatars/{userId}/`)
- **Lecture** : Publique
- **Écriture/Suppression** : Seul le propriétaire

### 🎮 Assets de jeu (`/gameAssets/{assetId}/`)
- **Lecture** : Publique
- **Écriture/Suppression** : Interdite (admin uniquement)

### 📸 Captures d'écran (`/screenshots/{userId}/`)
- **Lecture** : Utilisateurs authentifiés
- **Écriture/Suppression** : Seul le propriétaire

### 🔧 Debug (`/debug/{userId}/`)
- **Lecture/Écriture/Suppression** : Seul le propriétaire

### ⚙️ Configuration (`/config/`)
- **Lecture** : Publique
- **Écriture/Suppression** : Interdite (admin uniquement)

## 🚀 Déploiement

### Firestore
```bash
firebase deploy --only firestore:rules
```

### Storage
```bash
firebase deploy --only storage
```

### Tout
```bash
firebase deploy
```

## 🔒 Sécurité

### ✅ Bonnes pratiques implémentées
- Authentification requise pour les données sensibles
- Isolation des données utilisateur
- Lecture publique pour les données non-sensibles
- Protection contre l'accès non autorisé
- Règles par défaut restrictives

### ⚠️ Points d'attention
- Les règles sont restrictives par défaut
- Seuls les admins peuvent modifier les données publiques
- Chaque utilisateur ne peut accéder qu'à ses propres données
- Les données de jeu sont accessibles aux participants uniquement

## 🛠️ Maintenance

### Ajout de nouvelles collections
1. Ajouter les règles dans `firestore.rules`
2. Tester en local avec Firebase Emulator
3. Déployer en staging d'abord
4. Déployer en production

### Modification des règles existantes
1. Tester les modifications en local
2. Déployer en staging
3. Vérifier que l'application fonctionne
4. Déployer en production

## 📞 Support

En cas de problème avec les règles :
1. Vérifier les logs Firebase Console
2. Tester avec Firebase Emulator
3. Consulter la documentation Firebase
4. Contacter l'équipe de développement
