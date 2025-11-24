# Guide du Système Couples - Nightly

## 🎯 Vue d'ensemble

Le système "Couples" permet à deux utilisateurs de se connecter entre eux pour partager une expérience commune dans l'app. Chaque utilisateur obtient un **code unique** de 6 caractères qu'il peut partager avec son partenaire pour établir la connexion.

---

## 📋 Table des matières

1. [Fonctionnement général](#fonctionnement-général)
2. [Génération du code couple](#génération-du-code-couple)
3. [Connexion entre deux utilisateurs](#connexion-entre-deux-utilisateurs)
4. [Structure Firestore](#structure-firestore)
5. [Écran Couples](#écran-couples)
6. [Fonctionnalités disponibles](#fonctionnalités-disponibles)
7. [Sécurité et validations](#sécurité-et-validations)

---

## 🔄 Fonctionnement général

### Schéma du flow

```
Utilisateur A                    Utilisateur B
    │                               │
    ├─ Crée un compte              ├─ Crée un compte
    │  → Code généré: ABC123       │  → Code généré: XYZ789
    │                               │
    ├─ Va sur l'onglet "Couples"   ├─ Va sur l'onglet "Couples"
    │                               │
    ├─ Partage son code ABC123 ────┼─► Reçoit le code ABC123
    │                               │
    │                               ├─ Entre le code ABC123
    │                               │
    │ ◄────────────────────────────┼─ Validation
    │        Connexion établie!     │
    │                               │
    └─ Les deux sont maintenant ───┴─ connectés comme "couple"
```

---

## 🔢 Génération du code couple

### Où et quand ?

Le code couple est **généré automatiquement** lors de la création du compte, dans les fichiers:
- `app/onboarding/account.tsx` (connexion Google/Apple)

### Fonction de génération

```typescript
const generateCoupleCode = (length = 6) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
```

### Caractéristiques du code

- **Longueur:** 6 caractères
- **Format:** Lettres MAJUSCULES (A-Z) et chiffres (0-9)
- **Exemple:** `AB12CD`, `XY34ZQ`, `MN56OP`
- **Stocké dans:** Firestore `users/{uid}/coupleCode`
- **Unique:** Chaque utilisateur a un code différent

### Moment de génération

Le code est créé lors de:
1. **Connexion Google** (ligne 106 de account.tsx)
2. **Connexion Apple** (ligne 264 de account.tsx)

```typescript
// Générer un code de couple si l'utilisateur n'en a pas déjà un
const existingCoupleCode = userDoc.exists()
  ? (userDoc.data() as any).coupleCode
  : null;
const coupleCode = existingCoupleCode || generateCoupleCode(6);

const userData = {
  uid: user.uid,
  pseudo: data.pseudo.trim(),
  // ... autres champs
  coupleCode: coupleCode, // Sauvegardé dans Firestore
};
```

---

## 🤝 Connexion entre deux utilisateurs

### Étape 1: Affichage du code

**Utilisateur A** accède à l'onglet "Couples" et voit:

```
┌─────────────────────────────────┐
│     Votre code:                 │
│                                 │
│   ┌──────────────────┐         │
│   │    ABC123   📋   │         │  ← Cliquer pour copier
│   └──────────────────┘         │
│                                 │
│   Partagez ce code avec        │
│   votre partenaire             │
└─────────────────────────────────┘
```

### Étape 2: Saisie du code

**Utilisateur B** clique sur **"Entrer le code de mon partenaire"** et entre le code `ABC123`.

### Étape 3: Validation du code

Le système vérifie:

1. ✅ **Format valide:** Minimum 6 caractères alphanumériques
2. ✅ **Code existe:** Un utilisateur avec ce code existe dans Firestore
3. ✅ **Pas son propre code:** L'utilisateur ne peut pas se connecter avec lui-même
4. ✅ **Partenaire disponible:** Le propriétaire du code n'est pas déjà en couple avec quelqu'un d'autre
5. ✅ **Utilisateur disponible:** L'utilisateur actuel n'a pas déjà un partenaire

### Étape 4: Établissement de la connexion

Si toutes les validations passent:

```typescript
// Mettre à jour les deux documents
await updateDoc(userRef, { partnerId: partnerId });
await updateDoc(partnerRef, { partnerId: user.uid });
```

**Résultat:**
- `users/{userA_uid}/partnerId` = `userB_uid`
- `users/{userB_uid}/partnerId` = `userA_uid`

Les deux utilisateurs sont maintenant **connectés comme couple** ! 🎉

---

## 🗄️ Structure Firestore

### Collection: `users`

Chaque document utilisateur contient:

```typescript
{
  uid: string,                    // ID unique de l'utilisateur
  pseudo: string,                 // Pseudo choisi
  coupleCode: string,             // Code à 6 caractères (ex: "ABC123")
  partnerId?: string,             // UID du partenaire (si connecté)
  couplePhoto?: string,           // URL de la photo du couple (optionnel)
  createdAt: string,              // Date de création du compte
  // ... autres champs
}
```

### Exemple concret

**Utilisateur A:**
```json
{
  "uid": "abc-def-123",
  "pseudo": "Francisco",
  "coupleCode": "XY12AB",
  "partnerId": "ghi-jkl-456",  // ← Connecté avec utilisateur B
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

**Utilisateur B:**
```json
{
  "uid": "ghi-jkl-456",
  "pseudo": "Maria",
  "coupleCode": "CD34EF",
  "partnerId": "abc-def-123",  // ← Connecté avec utilisateur A
  "createdAt": "2025-01-16T14:20:00.000Z"
}
```

---

## 🎨 Écran Couples

**Fichier:** `app/(tabs)/couples.tsx`

### Vue sans partenaire

Quand l'utilisateur n'a **pas encore de partenaire connecté** (`partnerId` absent ou invalide):

```
┌─────────────────────────────────────────┐
│                                         │
│         Votre code:                     │
│                                         │
│    ┌──────────────────────┐            │
│    │   ABC123    📋       │            │
│    └──────────────────────┘            │
│                                         │
│    Partagez ce code avec               │
│    votre partenaire                    │
│                                         │
│    ┌─────────────────────────────┐    │
│    │  ➤  Renvoyer le code        │    │
│    └─────────────────────────────┘    │
│                                         │
│    ┌─────────────────────────────┐    │
│    │  👤  Entrer le code          │    │
│    └─────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

#### Actions disponibles:

1. **Copier le code** - Clic sur le code pour le copier dans le presse-papier
2. **Renvoyer le code** - TODO: Envoyer par SMS/Email
3. **Entrer le code** - Ouvre un drawer modal pour saisir le code du partenaire

### Vue avec partenaire connecté

Quand l'utilisateur **a un partenaire** (`partnerId` valide):

```
┌─────────────────────────────────────────┐
│   [Photo du couple]                     │
│                                         │
│   FRANCISCO & MARIA                     │
│                                         │
│   🔥 current streak: 0 days            │
│   📅 joined on: Jan 15, 2025           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│   Widgets                               │
│   ┌──────────┬────────────────────┐   │
│   │ ❤️❤️     │  👤━━❤━━👤        │   │
│   │   42     │    999km           │   │
│   │ days     │  between us        │   │
│   │ together │                    │   │
│   └──────────┴────────────────────┘   │
│                                         │
│   Your daily                            │
│   ┌─────────────────────────────┐     │
│   │  🔥🔥                        │     │
│   │  It's time to connect!      │     │
│   │                             │     │
│   │  [Discover daily]           │     │
│   └─────────────────────────────┘     │
│                                         │
│   History                               │
│   ┌─────────────────────────────┐     │
│   │      🔥                      │     │
│   │       0                      │     │
│   │  Streak with MARIA          │     │
│   │                             │     │
│   │  Su Mo Tu We Th Fr Sa       │     │
│   │  🔥 🔥 🔥 ⚪ ⚪ ⚪ ⚪      │     │
│   │  1  2  3                    │     │
│   └─────────────────────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

---

## ✨ Fonctionnalités disponibles

### 1. Widgets

#### Widget "Days Together"
- **Calcul:** Depuis la date de création du compte le plus ancien entre les deux partenaires
- **Affichage:** Nombre de jours avec icône de cœurs
- **Source:** `coupleData.daysTogether`

```typescript
const userCreatedAt = new Date(userData.createdAt);
const partnerCreatedAt = new Date(partnerData.createdAt);
const coupleCreatedAt = userCreatedAt > partnerCreatedAt
  ? partnerCreatedAt
  : userCreatedAt;

const daysTogether = Math.floor(
  (new Date().getTime() - coupleCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
);
```

#### Widget "Distance"
- **Affichage:** Distance entre les deux utilisateurs
- **Valeur actuelle:** Fixe à "999km" (TODO: Calculer avec GPS)
- **Future implémentation:** Utiliser la géolocalisation des deux utilisateurs

### 2. Header du couple

- **Photo du couple:** Image de fond (par défaut: image Unsplash)
- **Noms:** Format `UTILISATEUR_A & UTILISATEUR_B`
- **Current Streak:** Nombre de jours consécutifs de connexion (TODO)
- **Joined on:** Date de création du plus ancien compte

### 3. Daily Challenge

- **Concept:** Jeu quotidien pour renforcer la connexion
- **Statut:** TODO (bouton "Discover daily" présent mais non implémenté)
- **Objectif:** Augmenter le streak en jouant chaque jour

### 4. History & Streak

- **Visualisation:** Calendrier avec flammes pour chaque jour actif
- **Streak counter:** Nombre de jours consécutifs
- **Statut:** TODO (actuellement fixé à 0)

---

## 🔒 Sécurité et validations

### Validations lors de la connexion

**Fichier:** `app/(tabs)/couples.tsx` - fonction `handleSubmitCode`

#### 1. Format du code

```typescript
const cleanCode = inputCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

if (cleanCode.length < 6) {
  Alert.alert(t("errors.general"), "Le code doit contenir au moins 6 caractères");
  return;
}
```

#### 2. Code valide dans la base

```typescript
const usersRef = collection(db, "users");
const q = query(usersRef, where("coupleCode", "==", cleanCode));
const querySnapshot = await getDocs(q);

if (querySnapshot.empty) {
  Alert.alert(t("errors.general"), "Code invalide. Vérifiez le code et réessayez.");
  return;
}
```

#### 3. Pas son propre code

```typescript
if (cleanCode === coupleCode) {
  Alert.alert(t("errors.general"), "Vous ne pouvez pas utiliser votre propre code");
  return;
}
```

#### 4. Partenaire disponible

```typescript
if (partnerData.partnerId && partnerData.partnerId !== user.uid) {
  Alert.alert(t("errors.general"), "Ce code est déjà utilisé par un autre couple");
  return;
}
```

#### 5. Utilisateur disponible

```typescript
if (userData && userData.partnerId) {
  Alert.alert(t("errors.general"), "Vous avez déjà un partenaire connecté");
  return;
}
```

### Gestion des erreurs

Tous les cas d'erreur affichent une alerte avec un message clair:
- ❌ Code trop court
- ❌ Code invalide/inexistant
- ❌ Code déjà utilisé
- ❌ Utilisateur déjà en couple
- ❌ Tentative de connexion avec soi-même

---

## 🎯 Fonctionnalités futures (TODO)

### 1. Calcul de distance réel

```typescript
// TODO: Implémenter avec la géolocalisation
const distance = calculateDistance(
  { lat: user.location.lat, lng: user.location.lng },
  { lat: partner.location.lat, lng: partner.location.lng }
);
```

### 2. Streak tracking

Suivre les jours consécutifs où les deux partenaires:
- Se connectent à l'app
- Jouent au daily challenge
- Interagissent ensemble

**Structure Firestore suggérée:**

```typescript
{
  couples: {
    "{coupleId}": {
      userA_uid: string,
      userB_uid: string,
      currentStreak: number,
      lastActiveDate: string,
      history: {
        "2025-01-15": { played: true },
        "2025-01-16": { played: true },
        "2025-01-17": { played: false }, // Streak cassé
      }
    }
  }
}
```

### 3. Daily Challenge

Implémenter un jeu quotidien spécial pour les couples:
- Questions à deux
- Défis communs
- Vérités ou défis pour couples
- Deviner les réponses de l'autre

### 4. Upload de photo du couple

```typescript
const handleUploadCouplePhoto = async (imageUri: string) => {
  const storageRef = storage().ref(`couples/${user.uid}_${partnerId}/photo.jpg`);
  await storageRef.putFile(imageUri);
  const url = await storageRef.getDownloadURL();

  // Mettre à jour les deux utilisateurs
  await updateDoc(userRef, { couplePhoto: url });
  await updateDoc(partnerRef, { couplePhoto: url });
};
```

### 5. Envoi du code par SMS/Email

```typescript
const handleResendCode = async () => {
  // Implémenter l'envoi du code via:
  // - SMS (Twilio)
  // - Email (SendGrid)
  // - WhatsApp
  // - Partage natif (Share API)
};
```

### 6. Déconnexion du couple

Permettre à un utilisateur de se "déconnecter" de son partenaire:

```typescript
const handleDisconnect = async () => {
  Alert.alert(
    "Se déconnecter ?",
    "Êtes-vous sûr de vouloir vous déconnecter de votre partenaire ?",
    [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          await updateDoc(userRef, { partnerId: null });
          await updateDoc(partnerRef, { partnerId: null });
          setHasPartner(false);
        }
      }
    ]
  );
};
```

---

## 📊 Analytics recommandés

### Événements à tracker

```typescript
// Service: services/couplesAnalytics.ts

// Quand un utilisateur copie son code
trackCoupleCodeCopied(userId: string)

// Quand un utilisateur entre un code
trackCoupleCodeEntered(userId: string, codeLength: number)

// Quand la connexion réussit
trackCoupleConnected(userA_uid: string, userB_uid: string, daysToConnect: number)

// Quand la connexion échoue
trackCoupleConnectionFailed(userId: string, reason: string)

// Quand un utilisateur visite l'écran couples
trackCouplesScreenViewed(userId: string, hasPartner: boolean)

// Quand le daily challenge est joué
trackCoupleDailyPlayed(coupleId: string, gameType: string)
```

### Métriques clés

| Métrique | Description | Formule |
|----------|-------------|---------|
| **Taux de connexion** | % d'utilisateurs qui se connectent en couple | `couples_connected / total_users` |
| **Temps moyen avant connexion** | Jours entre création compte et connexion couple | Moyenne de `daysToConnect` |
| **Couples actifs** | Couples qui jouent au moins 1x/semaine | Count avec `lastActiveDate` < 7 jours |
| **Streak moyen** | Moyenne des streaks actuels | Moyenne de `currentStreak` |
| **Taux de rétention couples** | % de couples qui restent actifs après 30 jours | `active_after_30d / total_couples` |

---

## 🐛 Troubleshooting

### Problème: Le code ne fonctionne pas

**Solutions:**
1. Vérifier que le code est bien en MAJUSCULES et sans espaces
2. Vérifier que le code existe dans Firestore (`users` collection)
3. S'assurer que l'utilisateur n'est pas déjà en couple
4. Vérifier les permissions Firestore

### Problème: Le partenaire n'apparaît pas

**Solutions:**
1. Vérifier que `partnerId` est bien défini dans les deux documents
2. Recharger l'écran (pull to refresh ou relancer l'app)
3. Vérifier que le document du partenaire existe dans Firestore
4. Check les logs console pour les erreurs

### Problème: Les données ne se mettent pas à jour

**Solutions:**
1. Implémenter un listener Firestore en temps réel au lieu de useEffect:

```typescript
useEffect(() => {
  if (!user?.uid) return;

  const db = getFirestore();
  const userRef = doc(db, "users", user.uid);

  // Écouter les changements en temps réel
  const unsubscribe = onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      if (userData.partnerId) {
        // Mettre à jour l'état
        setHasPartner(true);
        // Récupérer les données du partenaire
        fetchPartnerData(userData.partnerId);
      }
    }
  });

  return () => unsubscribe();
}, [user?.uid]);
```

---

## ✅ Checklist d'implémentation

Pour implémenter complètement le système couples:

- [x] Génération du coupleCode lors de la création de compte
- [x] Affichage du code dans l'écran Couples
- [x] Copie du code dans le presse-papier
- [x] Modal pour entrer le code du partenaire
- [x] Validation du code entré
- [x] Connexion des deux utilisateurs (partnerId)
- [x] Affichage de l'écran couples avec partenaire
- [x] Calcul des jours ensemble
- [ ] Calcul de la distance réelle (GPS)
- [ ] Implémentation du streak tracking
- [ ] Daily challenge pour couples
- [ ] Upload de photo du couple
- [ ] Envoi du code par SMS/Email
- [ ] Fonctionnalité de déconnexion
- [ ] Listener temps réel pour les mises à jour
- [ ] Analytics complet du système couples
- [ ] Tests E2E du flow complet

---

## 📚 Ressources

- **Firestore Security Rules:** Protéger les données des couples
- **Cloud Functions:** Automatiser certaines tâches (ex: streak calculation)
- **Push Notifications:** Rappeler au couple de jouer au daily challenge
- **Deep Links:** Partager le code via un lien direct

---

## 🎉 Conclusion

Le système couples de Nightly permet aux utilisateurs de:
- ✅ Se connecter facilement avec un code unique à 6 caractères
- ✅ Suivre les jours passés ensemble
- ✅ Visualiser leur connexion et leur "streak"
- 🚧 Jouer à des jeux quotidiens ensemble (à venir)
- 🚧 Partager des moments et des défis (à venir)

C'est une fonctionnalité sociale clé qui renforce l'engagement et la rétention dans l'application! 💑
