# 🔑 Comment récupérer ton UID Firebase

## Méthode 1 : Via Firebase Console (Recommandé)

1. **Ouvrir Firebase Console**
   - Aller sur : [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sélectionner ton projet **Nightly**

2. **Accéder à Authentication**
   - Dans le menu de gauche, cliquer sur **"Authentication"**
   - Aller dans l'onglet **"Users"** (Utilisateurs)

3. **Trouver ton compte**
   - Chercher ton email ou nom d'utilisateur dans la liste
   - Cliquer sur la ligne de ton compte

4. **Copier l'UID**
   - Dans la popup qui s'ouvre, tu verras : **"User UID"**
   - Cliquer sur l'icône de copie 📋
   - C'est une chaîne comme : `abc123XYZ456def789...`

## Méthode 2 : Directement dans l'app (Debug)

1. **Ajouter un log temporaire**

   Dans `app/(tabs)/profil.tsx`, ajoute après la ligne 44 :

   ```typescript
   useEffect(() => {
     if (user?.uid) {
       console.log('🔑 MON UID FIREBASE:', user.uid);
       Alert.alert('Mon UID', user.uid);
     }
   }, [user]);
   ```

2. **Lancer l'app**
   - `yarn start`
   - Aller dans **Profil**
   - Une alerte va afficher ton UID
   - **Copier l'UID** et le coller dans `ADMIN_UIDS`

3. **Retirer le log** (important !)
   - Supprimer le `useEffect` ajouté

## Méthode 3 : Via les outils de développement

1. **Ouvrir React Native Debugger** ou les **Chrome DevTools**

2. **Aller dans la console**

3. **Taper** :
   ```javascript
   // Si tu utilises AsyncStorage
   AsyncStorage.getItem('userUID')

   // Ou directement depuis Firebase
   firebase.auth().currentUser.uid
   ```

## ✅ Une fois l'UID récupéré

1. **Ouvrir** `app/(tabs)/profil.tsx`

2. **Ligne 30-33**, remplacer :
   ```typescript
   const ADMIN_UIDS = [
     'YOUR_ADMIN_UID_HERE', // ❌ À remplacer
   ];
   ```

   Par :
   ```typescript
   const ADMIN_UIDS = [
     'abc123XYZ456def789...', // ✅ Ton vrai UID
   ];
   ```

3. **Sauvegarder** et **redémarrer l'app**

4. **Aller dans Profil** → Tu verras maintenant **🔧 PANNEAU ADMIN** !

## 🎯 Ajouter d'autres admins

Pour ajouter d'autres personnes en tant qu'admin :

```typescript
const ADMIN_UIDS = [
  'abc123XYZ456def789...', // Francis (toi)
  'xyz789ABC123ghi456...', // Admin 2
  'def456GHI789jkl012...',  // Admin 3
];
```

---

**Astuce** : Garde ton UID en sécurité ! Ne le partage pas publiquement.
