# ✅ Checklist Paywall - Vérification Funnel

## ⚠️ RÈGLE D'OR : Le paywall ne doit JAMAIS s'afficher au lancement

---

## 🔍 Vérifications Critiques

### ❌ Ce qui NE doit PAS arriver :

1. **❌ Paywall au lancement de l'app**
   - Quand l'utilisateur ouvre l'app pour la première fois
   - Quand l'utilisateur revient dans l'app
   - Sans avoir joué à aucune partie

2. **❌ Paywall avant d'avoir joué**
   - Avant d'avoir terminé au moins 1 partie
   - Avant 15 minutes d'utilisation
   - Sans avoir cliqué sur un jeu premium

3. **❌ Spam de paywall**
   - Plusieurs fois de suite
   - Sans respecter le cooldown de 60 minutes
   - Plus de 3 fois dans la même session

---

## ✅ Ce qui DOIT arriver :

### 1. Premier lancement
```
✅ Utilisateur ouvre l'app
  → Accès direct aux jeux gratuits
  → Aucun paywall
  → Tags "PREMIUM" visibles sur les jeux premium
```

### 2. Après avoir joué
```
✅ Utilisateur joue à "Action ou Vérité" (partie 1)
  → Fin de partie
  → Écran de résultats
  → Retour à l'accueil
  → Aucun paywall (seulement 1 partie jouée)

✅ Utilisateur joue à "Question Piège" (partie 2)
  → Fin de partie
  → Écran de résultats (2 secondes)
  → 💰 PAYWALL s'affiche !
```

### 3. Clic sur jeu premium
```
✅ Utilisateur clique sur "DÉSIR INTERDIT"
  → 💰 PAYWALL s'affiche immédiatement
```

### 4. Bouton profil
```
✅ Utilisateur va dans Profil
  → Clique sur "ESSAYER LE PREMIUM"
  → 💰 PAYWALL s'affiche
```

### 5. Exit-intent upsell
```
✅ PAYWALL A affiché
  → Utilisateur ferme le paywall
  → Attend 45 secondes
  → 💰 PAYWALL B (annuel) s'affiche
```

---

## 🧪 Tests à Faire (Dans l'ordre)

### Test 1 : Première utilisation ⚠️ CRITIQUE
```bash
1. Désinstalle l'app
2. Réinstalle l'app
3. Ouvre l'app
4. ✅ ATTENDU: Aucun paywall, accès direct aux jeux
```

**Console attendue :**
```
Aucun log de paywall
Pas de: "💰 showPaywallA appelé"
Pas de: "💰 PaywallModalA - isVisible: true"
```

### Test 2 : Après 2 parties
```bash
1. Joue à une partie gratuite (Action ou Vérité)
2. Termine la partie
3. ✅ ATTENDU: Retour à l'accueil, pas de paywall
4. Joue à une 2ème partie gratuite
5. Termine la partie
6. ✅ ATTENDU: Après 2 secondes, paywall s'affiche
```

**Console attendue :**
```
🎮 Partie terminée - vérification smart paywall
📊 Parties gratuites jouées: 2
💰 Affichage paywall: end_game (parties: 2, minutes: 5)
💰 showPaywallA appelé - forceShow: false, isProMember: false
💰 PaywallModalA - isVisible: true
```

### Test 3 : Cooldown respecté
```bash
1. Le paywall s'est affiché après 2 parties
2. Ferme le paywall
3. Joue à une 3ème partie
4. ✅ ATTENDU: Pas de paywall (cooldown de 60 min)
```

**Console attendue :**
```
🎮 Partie terminée - vérification smart paywall
⏳ Paywall en cooldown, pas d'affichage
```

### Test 4 : Clic sur jeu premium
```bash
1. Sur l'écran d'accueil
2. Clique sur un jeu marqué "PREMIUM"
3. ✅ ATTENDU: Paywall s'affiche immédiatement
```

### Test 5 : Retour après fermeture app
```bash
1. Ferme complètement l'app (kill)
2. Rouvre l'app
3. ✅ ATTENDU: Retour à l'accueil, pas de paywall
4. Les compteurs sont conservés
```

---

## 🚨 Red Flags (Signes de Problème)

### 🔴 Si le paywall s'affiche au lancement :

**Causes possibles :**
1. Un `useEffect` dans `usePaywallManager` déclenche automatiquement
2. Un appel à `showPaywallA()` dans `_layout.tsx` ou `index.tsx`
3. RevenueCat trigger une modal automatiquement

**Fix :**
- Vérifier `hooks/usePaywallManager.ts` ligne 281-296
- Chercher tous les `useEffect` qui appellent `showPaywall`
- Vérifier qu'il n'y a pas d'appels au montage des composants

### 🔴 Si le paywall ne s'affiche jamais :

**Causes possibles :**
1. `isProMember` est `true` (utilisateur déjà premium)
2. Le compteur de parties n'est pas incrémenté
3. Le `useSmartPaywall` n'est pas appelé dans `GameResults`

**Fix :**
- Vérifier les logs : `📊 Parties gratuites jouées: X`
- Vérifier : `💰 Affichage paywall`
- Tester avec : `resetPaywallTracking()`

---

## 📊 Logs de Debug à Surveiller

### Logs normaux (bon comportement) :
```
🎮 Partie terminée - vérification smart paywall
📊 Parties gratuites jouées: 1
⏳ Pas encore: 1 parties ou 10 minutes restantes

🎮 Partie terminée - vérification smart paywall
📊 Parties gratuites jouées: 2
💰 Affichage paywall: end_game (parties: 2, minutes: 7)
💰 showPaywallA appelé - forceShow: false, isProMember: false
💰 PaywallModalA - isVisible: true, isProMember: false, currentOffering: true
```

### Logs anormaux (problème) :
```
❌ BAD: 💰 showPaywallA appelé - isProMember: false (au lancement)
❌ BAD: 💰 PaywallModalA - isVisible: true (sans avoir joué)
❌ BAD: Multiple "💰 Affichage paywall" sans cooldown
```

---

## 🔧 Commandes de Debug

### Réinitialiser le tracking (pour tests) :
```typescript
// Dans la console ou un bouton de debug
const { resetPaywallTracking } = useSmartPaywall();
await resetPaywallTracking();
```

### Voir les stats actuelles :
```typescript
const { getPaywallStats } = useSmartPaywall();
const stats = await getPaywallStats();
console.log('📊 Stats:', stats);
```

### Forcer l'affichage (debug seulement) :
```typescript
const { showPaywallA } = usePaywall();
showPaywallA(true); // Force même si conditions non remplies
```

---

## ✅ Validation Finale

Avant de déployer en production, valider :

- [ ] ✅ Pas de paywall au premier lancement
- [ ] ✅ Pas de paywall avant d'avoir joué
- [ ] ✅ Paywall s'affiche après 2 parties
- [ ] ✅ Paywall s'affiche au clic sur jeu premium
- [ ] ✅ Cooldown de 60 minutes respecté
- [ ] ✅ Exit-intent (PaywallB) après 45 secondes
- [ ] ✅ Bouton "Essayer le premium" fonctionne
- [ ] ✅ Pas de spam de paywall
- [ ] ✅ Logs de debug présents
- [ ] ✅ Compteurs persistés (survit au kill de l'app)

---

## 📞 En Cas de Problème

### Le paywall s'affiche au lancement ? 🚨

1. **Check :** `hooks/usePaywallManager.ts:281-282`
   - Doit être commenté/supprimé
   - Ne doit PAS avoir de `useEffect` avec `showPaywallB`

2. **Check :** `app/(tabs)/index.tsx`
   - Pas de `useEffect` avec `showPaywallA` au montage
   - Pas d'appel automatique à `showPaywallA()`

3. **Check :** `app/_layout.tsx`
   - Le `<PaywallProvider>` ne doit rien déclencher

### Le compteur ne fonctionne pas ?

1. **Check :** `components/game/GameResults.tsx:148-158`
   - Le `useEffect` avec `onFreeGameCompleted()` est présent
   - Il s'exécute bien (vérifier les logs)

2. **Tester :** Réinitialiser AsyncStorage
   ```typescript
   await AsyncStorage.clear(); // Attention : efface TOUT
   ```

---

**Dernière mise à jour :** 2025-01-03
**Statut :** ✅ Vérifié et corrigé
