# Ajouter un nouveau jeu

Ce guide explique comment ajouter un nouveau mode de jeu à l'application.

## 1. Ajouter le mode de jeu dans la configuration

Ouvrez le fichier `app/data/gameModes.ts` et ajoutez votre jeu dans la bonne catégorie (`gameCategories`).

Exemple :

```ts
{
  id: 'nouveau-jeu',
  name: 'NOM DU JEU',
  description: 'Description du jeu.',
  image: require('@/assets/jeux/mon-nouveau-jeu.png'),
  colors: ["rgba(0,0,0,0.8)", "rgba(50,50,50,0.9)"],
  borderColor: "#123456",
  shadowColor: "#123456",
  tag: 'GRATUIT' ou 'PREMIUM',
  tagColor: "#abcdef",
  premium: false,
  interactive: 'write' | 'choice' | 'action'
}
```

- **id** : identifiant unique (utilisé partout)
- **name** : nom affiché
- **description** : courte description
- **image** : chemin de l'illustration (ajoutez l'image dans `assets/jeux/`)
- **colors, borderColor, shadowColor** : couleurs d'habillage
- **tag/tagColor** : badge (ex : PREMIUM)
- **premium** : true/false
- **interactive** : type d'interaction principale

## 2. Ajouter les règles du jeu

Ouvrez `scripts/initGameRules.ts` et ajoutez une entrée dans l'objet `gameRules` avec l'`id` de votre jeu. Prévoyez les traductions pour chaque langue supportée.

Exemple :

```js
"nouveau-jeu": {
  translations: {
    fr: { rules: [ { title: "Titre", description: "Description", emoji: "🎲" } ] },
    en: { rules: [ { title: "Title", description: "Description", emoji: "🎲" } ] },
    // ... autres langues
  }
}
```

Lancez le script pour mettre à jour les règles dans Firestore si besoin :

```bash
node scripts/initGameRules.ts
```

## 3. Créer la logique et l'interface du jeu

- Créez un dossier pour votre jeu dans `app/game/` (ex : `app/game/nouveau-jeu/`).
- Inspirez-vous des fichiers existants (`truth-or-dare`, `never-have-i-ever-hot`, etc.).
- Implémentez la logique spécifique dans un fichier `[id].tsx`.
- Utilisez les types du dossier `types/` pour la structure du state.

## 4. Tester le nouveau jeu

- Vérifiez l'apparition du jeu dans la liste.
- Lancez une partie et testez toutes les phases.
- Vérifiez la synchronisation, les scores, et l'affichage des règles.

## Conseils et bonnes pratiques

- Utilisez un identifiant unique et cohérent partout.
- Ajoutez une image optimisée dans `assets/jeux/`.
- Testez sur plusieurs appareils si possible.
- Relisez les traductions et descriptions.

Pour toute question, contactez l'équipe technique ou consultez le code des autres jeux pour vous inspirer.
