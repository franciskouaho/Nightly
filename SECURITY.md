# 🔒 Règles de Sécurité Firebase - Production

## 📋 Vue d'ensemble

Ce document décrit les règles de sécurité strictes mises en place pour l'application Nightly en production.

## 🛡️ Règles Firestore

### 🔐 Authentification requise

- **Toutes les opérations** nécessitent une authentification Firebase
- **Aucun accès anonyme** autorisé

### 👤 Gestion des utilisateurs (`/users/{userId}`)

- **Lecture** : Seulement le propriétaire
- **Création** : Validation des champs obligatoires (`id`, `username`, `displayName`, `avatar`)
- **Modification** : Seulement les champs autorisés (`username`, `displayName`, `avatar`, `lastLogin`, `stats`)
- **Suppression** : Admins uniquement

### 🏠 Salles de jeu (`/rooms/{roomId}`)

- **Lecture** : Seulement les joueurs participants
- **Création** : L'hôte devient automatiquement le premier joueur
- **Modification** : Hôte ou joueurs participants, champs limités
- **Suppression** : Hôte uniquement

### 🎮 Jeux actifs (`/games/{gameId}`)

- **Lecture** : Seulement les joueurs participants
- **Création** : Hôte doit être dans la liste des joueurs
- **Modification** : Joueurs participants, champs de jeu uniquement
- **Suppression** : Hôte uniquement

### 📚 Contenu en lecture seule

- **Questions** (`/questions/{gameType}/{questionId}`) : Lecture authentifiée uniquement
- **Traductions** (`/translations/{language}/{translationId}`) : Lecture authentifiée uniquement
- **Classements** (`/leaderboards/{gameType}`) : Lecture authentifiée uniquement
- **Événements** (`/events/{eventId}`) : Lecture authentifiée uniquement

### 📊 Données privées

- **Statistiques** (`/stats/{userId}`) : Propriétaire uniquement
- **Notifications** (`/notifications/{userId}/{notificationId}`) : Propriétaire uniquement
- **Rapports** (`/reports/{reportId}`) : Création uniquement, lecture admins

## 🗄️ Règles Storage

### 📁 Structure des dossiers

```
/avatars/{userId}/          - Avatars utilisateur (max 5MB)
/profiles/{userId}/         - Images de profil (max 3MB)
/gameAssets/{assetId}/      - Assets de jeu (admin only)
/gameImages/{gameId}/       - Images de jeux (admin only)
/events/{eventId}/          - Images d'événements (admin only)
/screenshots/{userId}/      - Captures d'écran (max 10MB)
/debug/{userId}/            - Logs de debug (temporaires)
/temp/{userId}/             - Fichiers temporaires (max 50MB)
/backups/{userId}/          - Sauvegardes (max 100MB)
/config/                    - Configuration (admin only)
/translations/{language}/   - Traductions (admin only)
/cache/{userId}/            - Cache utilisateur (max 20MB)
/downloads/{userId}/        - Téléchargements (max 100MB)
/shared/{userId}/           - Médias partagés (max 25MB)
```

### 🔒 Contrôles de sécurité

- **Types de fichiers** : Validation stricte des extensions
- **Tailles maximales** : Limites par type de fichier
- **Authentification** : Requise pour toutes les opérations
- **Propriété** : Accès limité au propriétaire ou aux admins

## 👨‍💼 Rôles administrateur

### 🔑 Définition d'un admin

```javascript
// Dans Firebase Auth, ajouter un claim personnalisé
admin.auth().setCustomUserClaims(uid, { admin: true });
```

### 🛠️ Permissions admin

- **Lecture/Écriture** : Tous les documents et fichiers
- **Suppression** : Utilisateurs, rapports, achats
- **Configuration** : Questions, traductions, événements

## 🚨 Sécurité par défaut

### ❌ Politique de refus par défaut

- **Tous les chemins non spécifiés** sont refusés
- **Aucun accès anonyme** autorisé
- **Validation stricte** des données

### 🔍 Surveillance

- **Logs Firebase** : Toutes les tentatives d'accès sont loggées
- **Alertes** : Notifications pour les tentatives suspectes
- **Audit** : Révision régulière des accès

## 📝 Bonnes pratiques

### ✅ Recommandations

1. **Authentification** : Toujours vérifier `request.auth != null`
2. **Validation** : Valider les données avant écriture
3. **Limitation** : Limiter les champs modifiables
4. **Audit** : Logger les actions importantes
5. **Test** : Tester les règles avec Firebase Emulator

### ⚠️ Points d'attention

- **Claims personnalisés** : Nécessaires pour les admins
- **Structure des données** : Respecter les schémas définis
- **Performance** : Éviter les requêtes complexes dans les règles
- **Mise à jour** : Tester les modifications en staging

## 🔧 Déploiement

```bash
# Tester les règles localement
firebase emulators:start --only firestore,storage

# Déployer en production
firebase deploy --only firestore:rules,storage
```

## 📞 Support

Pour toute question sur la sécurité :

- **Email** : security@nightly.app
- **Documentation** : [Firebase Security Rules](https://firebase.google.com/docs/rules)
- **Audit** : Révision mensuelle des règles
