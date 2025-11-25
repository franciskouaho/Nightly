# Ajouter les questions des nouveaux jeux

## ⚠️ Instructions importantes

Les questions pour **Dare or Strip** et **Blind Test Générations** sont prêtes dans le fichier `new-games-questions.ts`.

### Comment les ajouter à Firebase :

1. **Ouvrir** le fichier `uploadQuestionsToFirebase.ts`

2. **Trouver** la ligne qui commence par `const questions = {`

3. **Ajouter** les deux nouvelles entrées du fichier `new-games-questions.ts` dans l'objet `questions`

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

## 📋 Résumé des nouveaux jeux

### 🎭 Dare or Strip
- **30 questions** en français
- **30 questions** en anglais
- Format : `{ text: "Question..." }`

### 🎵 Blind Test Générations
- **50 questions** en français (10 par catégorie)
- **50 questions** en anglais (10 par catégorie)
- **Catégories** :
  - Noël (`noel`)
  - Génériques TV (`generiques`)
  - Tubes 80s/90s/2000s (`tubes-80s-90s-2000s`)
  - TikTok (`tiktok`)
  - Musiques de films (`films`)
- Format : `{ category: "...", text: "...", answer: "..." }`

## ✅ Vérification

Après l'upload, vérifier dans Firebase Console :
- Collection `gameQuestions`
- Documents `dare-or-strip` et `blindtest-generations`
- Champs `translations.fr` et `translations.en`
