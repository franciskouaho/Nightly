# Ajouter les questions et règles des nouveaux jeux

## ⚠️ Instructions importantes

Les **questions** et les **règles** pour **Dare or Strip** et **Blind Test Générations** sont prêtes dans les fichiers suivants :
- `new-games-questions.ts` - Questions pour Firebase
- `new-games-rules.ts` - Règles du jeu pour Firebase

---

## 📝 ÉTAPE 1 : Ajouter les Questions

### Comment les ajouter à Firebase :

1. **Ouvrir** le fichier `uploadQuestionsToFirebase.ts`

2. **Trouver** la ligne qui commence par `const questions = {`

3. **Copier** le contenu de `new-games-questions.ts` et l'**ajouter** dans l'objet `questions`

   Exemple de structure finale :
   ```typescript
   const questions = {
     "word-guessing": {
       // questions existantes...
     },
     "dare-or-strip": {
       translations: {
         fr: [
           { text: "Fais un massage sensuel..." },
           // etc.
         ],
         en: [
           { text: "Give your partner a sensual massage..." },
           // etc.
         ],
       },
     },
     "blindtest-generations": {
       translations: {
         fr: [
           { category: "noel", text: "Vive le vent", answer: "Vive le vent" },
           // etc.
         ],
         en: [
           { category: "noel", text: "Jingle Bells", answer: "Jingle Bells" },
           // etc.
         ],
       },
     },
     // autres jeux existants...
   };
   ```

4. **Exécuter** le script pour uploader les questions :
   ```bash
   cd /Users/francis/workspace/Nightly
   node scripts/uploadQuestionsToFirebase.js
   ```

---

## 📜 ÉTAPE 2 : Ajouter les Règles

### Comment les ajouter à Firebase :

1. **Ouvrir** le fichier `initGameRules.ts`

2. **Trouver** la ligne après `"pile-ou-face": { ... },` (environ ligne 1971)

3. **Copier** le contenu de `new-games-rules.ts` et l'**ajouter** dans l'objet `gameRules` avant la fermeture `};`

   Exemple :
   ```typescript
   const gameRules = {
     // ... jeux existants ...
     "pile-ou-face": {
       // règles pile-ou-face...
     },
     "dare-or-strip": {
       translations: {
         fr: {
           rules: [
             {
               title: "Gage ou Retire",
               description: "...",
               emoji: "🔥",
             },
             // etc.
           ],
         },
         // autres langues...
       },
     },
     "blindtest-generations": {
       translations: {
         fr: {
           rules: [
             {
               title: "Choisis ta catégorie",
               description: "...",
               emoji: "🎯",
             },
             // etc.
           ],
         },
         // autres langues...
       },
     },
   };
   ```

4. **Exécuter** le script pour uploader les règles :
   ```bash
   cd /Users/francis/workspace/Nightly
   yarn init-rules
   ```

---

## 📋 Résumé des nouveaux jeux

### 🎭 Dare or Strip
- **30 questions** en français + **30 en anglais**
- Format questions : `{ text: "Question..." }`
- **4 règles** traduites en 7 langues (FR, EN, ES, DE, IT, PT, AR)

### 🎵 Blind Test Générations
- **50 questions** en français + **50 en anglais** (10 par catégorie)
- **Catégories** :
  - Noël (`noel`)
  - Génériques TV (`generiques`)
  - Tubes 80s/90s/2000s (`tubes-80s-90s-2000s`)
  - TikTok (`tiktok`)
  - Musiques de films (`films`)
- Format questions : `{ category: "...", text: "...", answer: "..." }`
- **4 règles** traduites en 7 langues (FR, EN, ES, DE, IT, PT, AR)

---

## ✅ Vérification

Après l'upload, vérifier dans Firebase Console :

### Questions
- Collection `gameQuestions`
- Documents `dare-or-strip` et `blindtest-generations`
- Champs `translations.fr` et `translations.en`

### Règles
- Collection `rules`
- Documents `dare-or-strip` et `blindtest-generations`
- Traductions pour toutes les langues : fr, en, es, de, it, pt, ar

---

## 🎯 Ordre d'exécution recommandé

1. ✅ Ajouter les questions dans `uploadQuestionsToFirebase.ts`
2. ✅ Exécuter `node scripts/uploadQuestionsToFirebase.js`
3. ✅ Ajouter les règles dans `initGameRules.ts`
4. ✅ Exécuter `yarn init-rules`
5. ✅ Vérifier dans Firebase Console que tout est bien uploadé
