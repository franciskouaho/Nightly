# Cloud Functions - Nightly

Ce dossier contient les fonctions Cloud Firebase pour l'application Nightly.

## Installation

```bash
# Installer les dépendances
yarn install

# Compiler le TypeScript
yarn build
```

## Déploiement

```bash
# Déployer les fonctions
yarn deploy
```

## Test des fonctions

### 1. Lancer le shell Firebase

```bash
yarn shell
```

### 2. Tester la fonction deleteUser

Dans le shell Firebase, exécutez :
```javascript
deleteUser({uid: "VOTRE_UID_ICI"})
```

Exemple de réponse attendue :
```javascript
{
  success: true,
  message: "Utilisateur supprimé avec succès"
}
```

### 3. Tester la fonction setAnnualSubscription

Dans le shell Firebase, exécutez :
```javascript
setAnnualSubscription({uid: "VOTRE_UID_ICI"})
```

Exemple de réponse attendue :
```javascript
{
  success: true,
  message: "Abonnement annuel activé avec succès",
  subscriptionExpiresAt: "2025-03-21T..."
}
```

## Utilisation dans l'application

Pour utiliser ces fonctions dans votre application React Native :

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

// Pour supprimer un utilisateur
const deleteUserFunction = httpsCallable(functions, 'deleteUser');
await deleteUserFunction({ uid: 'VOTRE_UID_ICI' });

// Pour activer un abonnement annuel
const setAnnualSubscriptionFunction = httpsCallable(functions, 'setAnnualSubscription');
await setAnnualSubscriptionFunction({ uid: 'VOTRE_UID_ICI' });
```

## Gestion des erreurs

Les fonctions peuvent retourner les erreurs suivantes :

- `unauthenticated` : L'utilisateur n'est pas authentifié
- `invalid-argument` : L'UID n'est pas fourni
- `not-found` : L'utilisateur n'existe pas
- `internal` : Erreur interne du serveur

## Logs

Pour voir les logs des fonctions :

```bash
yarn logs
``` 