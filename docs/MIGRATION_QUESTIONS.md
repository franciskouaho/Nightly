# Migration des Questions vers Sous-Collections Firebase

## 📋 Contexte

Les questions étaient stockées dans des tableaux à l'intérieur de documents Firebase, ce qui causait des problèmes :
- ❌ IDs basés sur l'index du tableau (changent si on réorganise)
- ❌ Pas d'ID unique persistant
- ❌ Difficile de tracker les questions déjà posées
- ❌ Impossible d'utiliser les requêtes Firestore avancées

## ✨ Nouvelle Structure

### Avant (Ancien Format - Tableau)
```
Firestore
└── gameQuestions (collection)
    └── word-guessing (document)
        └── translations
            └── fr: [
                  { word: "Chat", forbiddenWords: [...] },  // index 0
                  { word: "Voiture", forbiddenWords: [...] }, // index 1
                ]
```

### Après (Nouveau Format - Sous-Collection)
```
Firestore
└── gameQuestions (collection)
    └── word-guessing (document)
        └── questions (sous-collection)
            ├── word-guessing_fr_0001 (document avec ID unique)
            │   └── { id: "word-guessing_fr_0001", word: "Chat", language: "fr", ... }
            ├── word-guessing_fr_0002 (document avec ID unique)
            │   └── { id: "word-guessing_fr_0002", word: "Voiture", language: "fr", ... }
```

## 🚀 Comment Migrer

### 1. Déployer les indexes Firestore

Les indexes sont déjà configurés dans `firestore.indexes.json`. Déployez-les :

```bash
firebase deploy --only firestore:indexes
```

### 2. Exécuter le script de migration

```bash
yarn migrate-questions
# ou
bun run migrate-questions
```

Le script va :
- ✅ Lire toutes les questions depuis l'ancien format
- ✅ Créer des sous-collections avec IDs uniques
- ✅ Conserver l'ancien format pour rollback
- ✅ Migrer tous les modes de jeu et toutes les langues

### 3. Tester l'application

L'application supporte **automatiquement les deux formats** :
1. Elle essaie d'abord de lire depuis la sous-collection (nouveau format)
2. Si pas trouvé, elle fallback sur l'ancien format (tableau)

Vous verrez dans les logs :
- `✅ Loaded X questions from subcollection` → Nouveau format fonctionne
- `⚠️ Loaded X questions from old structure` → Ancien format en fallback

### 4. Vérifier que tout fonctionne

Testez tous les modes de jeu pour vérifier que les questions se chargent correctement.

## 📊 Avantages de la Nouvelle Structure

✅ **IDs Uniques Persistants**
- Chaque question a un ID stable : `word-guessing_fr_0001`
- L'ID ne change jamais, même si on supprime/réorganise

✅ **Requêtes Firestore Avancées**
```typescript
// Filtrer par langue
where('language', '==', 'fr')

// Filtrer par difficulté
where('difficulty', '==', 'hard')

// Filtrer par type
where('type', '==', 'action')
```

✅ **Meilleur Tracking**
- On peut facilement savoir quelles questions ont été posées
- Évite les doublons grâce aux IDs uniques

✅ **Scalabilité**
- Pas de limite sur le nombre de questions (les tableaux Firestore sont limités)
- Meilleures performances avec beaucoup de questions

## 🔄 Rollback (Si Nécessaire)

Si vous rencontrez des problèmes, l'ancien format est toujours disponible :

1. Le code supporte automatiquement l'ancien format en fallback
2. Les anciennes données n'ont pas été supprimées
3. Vous pouvez simplement ignorer les sous-collections

Pour forcer l'utilisation de l'ancien format, supprimez les sous-collections :
```typescript
// Dans la console Firebase ou via script
// Supprimer gameQuestions/{gameMode}/questions
```

## 📝 Notes Techniques

### Format des IDs
Les IDs suivent le pattern : `{gameMode}_{langue}_{index}`
- Exemple : `word-guessing_fr_0001`
- Padding de 4 chiffres pour le tri (0001, 0002, etc.)

### Métadonnées Ajoutées
Chaque question migrée contient :
```typescript
{
  id: "word-guessing_fr_0001",     // ID unique
  language: "fr",                   // Langue
  originalIndex: 0,                 // Index original (pour référence)
  gameMode: "word-guessing",        // Mode de jeu
  createdAt: "2025-01-05T...",     // Date de migration
  // ... autres champs de la question
}
```

### Indexes Créés
Les indexes suivants ont été créés pour optimiser les performances :
- `language + gameMode`
- `language + gameMode + type`
- `language + gameMode + difficulty`
- `language + gameMode + intensity`
- `language + gameMode + level`
- `language + gameMode + mode`

## ⚠️ Important

- **Ne pas supprimer l'ancien format** tant que vous n'êtes pas sûr que tout fonctionne
- Le document principal `gameQuestions/{gameMode}` est marqué avec `migrated: true`
- La migration peut prendre quelques minutes selon le nombre de questions

## 🎯 Résultat Attendu

Après migration réussie :
```
✅ word-guessing: 245 questions migrées
✅ trap-answer: 189 questions migrées
✅ never-have-i-ever-hot: 312 questions migrées
...

📊 RÉSUMÉ
✅ Réussis: 9/9
⏱️ Durée: 12.34s
```
