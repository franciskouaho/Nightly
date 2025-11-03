# 🔧 Configuration du Panneau Admin

Le panneau admin permet d'ajouter facilement des questions aux jeux, avec traduction automatique en 6 langues.

## 📋 Prérequis

1. **Clé API OpenAI**
   - Créer un compte sur [OpenAI Platform](https://platform.openai.com/)
   - Obtenir une clé API : [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Copier le fichier `.env.example` vers `.env`
   - Remplacer `EXPO_PUBLIC_OPENAI_API_KEY` par votre vraie clé

2. **UID Admin Firebase**
   - Dans le fichier `app/(tabs)/profil.tsx`, ligne 30-33
   - Remplacer `'YOUR_ADMIN_UID_HERE'` par votre UID Firebase
   - Trouver votre UID : Firebase Console → Authentication → Utilisateurs → Copier l'UID

## 🚀 Utilisation

### 1. Accéder au panneau
- Ouvrir l'app et aller dans **Profil**
- Si vous êtes admin, vous verrez : **🔧 PANNEAU ADMIN**
- Cliquer pour déplier le panneau

### 2. Ajouter une question

**Étape 1 : Sélectionner le jeu**
- Faire défiler horizontalement et cliquer sur le jeu
- Exemples : Action ou Vérité, Question Piège, Double Dare, etc.

**Étape 2 : Écrire la question en français**
- Taper la question dans le champ de texte
- Exemple : *"Quelle est la chose la plus embarrassante que tu aies faite ?"*

**Étape 3 : Configurer les options (selon le jeu)**

Certains jeux demandent des options supplémentaires :

| Jeu | Options requises |
|-----|------------------|
| **Action ou Vérité** | Type : Action ou Vérité |
| **Question Piège** | Réponse correcte |
| **Désir Interdit** | Intensité : Soft / Tension / Extrême |
| **Double Dare** | Niveau (Hot/Extreme/Chaos) + Mode (Versus/Fusion) |
| **Genius ou Menteur** | Réponse correcte |

**Étape 4 : Sauvegarder**
- Cliquer sur **"Traduire & Sauvegarder"**
- L'app va :
  1. ✅ Traduire automatiquement en 6 langues (ChatGPT)
  2. ✅ Sauvegarder dans Firebase
  3. ✅ Afficher un message de confirmation

## 🌍 Langues supportées

Le panneau traduit automatiquement dans :
- 🇫🇷 Français
- 🇬🇧 English
- 🇪🇸 Español
- 🇩🇪 Deutsch
- 🇮🇹 Italiano
- 🇵🇹 Português

## 📊 Structure Firebase

Les questions sont sauvegardées dans :
```
gameQuestions/
  ├── truth-or-dare/
  │   └── translations/
  │       ├── fr: [...]
  │       ├── en: [...]
  │       └── ...
  ├── double-dare/
  │   └── translations/
  │       └── ...
  └── ...
```

## 💰 Coût estimé

**OpenAI API (gpt-4o-mini)** :
- ~0.15$ pour 1 million de tokens d'entrée
- ~0.60$ pour 1 million de tokens de sortie

**Pour 1 question** (traduite en 6 langues) :
- Entrée : ~100 tokens
- Sortie : ~200 tokens
- **Coût : ~0.0002$ (moins de 1 centime)**

## 🔒 Sécurité

- ✅ Panneau visible uniquement pour les UIDs admin
- ✅ Clé API stockée dans `.env` (non versionné)
- ⚠️ **IMPORTANT** : Ajouter `.env` dans `.gitignore`

## 🐛 Dépannage

### Erreur "Impossible de traduire"
- Vérifier que la clé API OpenAI est correcte dans `.env`
- Vérifier que vous avez des crédits sur votre compte OpenAI

### Erreur "Impossible de sauvegarder"
- Vérifier les permissions Firebase Firestore
- Vérifier que le document `gameQuestions/{gameId}` existe

### Le panneau ne s'affiche pas
- Vérifier que votre UID est bien dans `ADMIN_UIDS` (profil.tsx:30)
- Redémarrer l'app après modification

## 📝 Exemple d'utilisation

**Ajouter une question à "Double Dare"** :

1. Sélectionner : **Double Dare**
2. Question : `"Décris ton fantasme le plus fou en regardant ton partenaire dans les yeux"`
3. Niveau : **🔥 Hot**
4. Mode : **⚔️ Versus**
5. Cliquer : **Traduire & Sauvegarder**

✅ La question sera ajoutée en français, anglais, espagnol, allemand, italien et portugais !

---

**Créé le** : 2025-01-03
**Version** : 1.0
