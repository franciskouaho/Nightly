# 🔧 Corrections du Système Paywall

## Problèmes identifiés et corrigés :

### 1. **Le paywall ne s'affichait jamais depuis le profil**
**Problème :** La fonction `showPaywallA()` bloquait l'affichage si l'utilisateur était déjà membre pro, même quand on clique volontairement sur "Essayer le premium".

**Solution :**
- Ajout d'un paramètre optionnel `forceShow` à `showPaywallA(forceShow?: boolean)`
- Si `forceShow = true`, le paywall s'affiche même pour les membres pro (utile pour gérer les abonnements)
- Mise à jour du bouton dans `app/(tabs)/profil.tsx` pour utiliser `showPaywallA(true)`

### 2. **Logs de debug ajoutés**
Pour faciliter le débogage futur, des logs ont été ajoutés dans :
- `hooks/usePaywallManager.ts` : Log quand `showPaywallA` est appelé
- `components/PaywallModalA.tsx` : Log de l'état du modal
- `components/PaywallModalB.tsx` : Log de l'état du modal
- `app/(tabs)/profil.tsx` : Log quand le bouton Premium est cliqué

## Fichiers modifiés :

1. ✅ `hooks/usePaywallManager.ts`
   - Ligne 159-170 : Ajout du paramètre `forceShow` avec log

2. ✅ `contexts/PaywallContext.tsx`
   - Ligne 7 : Mise à jour de la signature TypeScript

3. ✅ `app/(tabs)/profil.tsx`
   - Ligne 300-303 : Ajout de `forceShow = true` et log

4. ✅ `components/PaywallModalA.tsx`
   - Ligne 31-34 : Ajout de useEffect avec log

5. ✅ `components/PaywallModalB.tsx`
   - Ligne 48-51 : Ajout de useEffect avec log

## Comment tester :

### Test 1 : Utilisateur NON premium clique sur "Essayer le premium"
```bash
yarn start
```
1. Lance l'app
2. Va dans l'onglet "Profil"
3. Clique sur le bouton "ESSAYER LE PREMIUM"
4. **Attendu :** Le PaywallModalA doit s'afficher

**Console attendue :**
```
🔥 Bouton Premium cliqué
💰 showPaywallA appelé - forceShow: true, isProMember: false
💰 PaywallModalA - isVisible: true, isProMember: false, currentOffering: true
```

### Test 2 : Utilisateur premium clique sur "Essayer le premium"
1. Avoir un abonnement actif (ou simuler avec RevenueCat)
2. Va dans l'onglet "Profil"
3. Clique sur le bouton "ESSAYER LE PREMIUM"
4. **Attendu :** Le PaywallModalA doit s'afficher (pour gérer l'abonnement)

**Console attendue :**
```
🔥 Bouton Premium cliqué
💰 showPaywallA appelé - forceShow: true, isProMember: true
💰 PaywallModalA - isVisible: true, isProMember: true, currentOffering: true
```

### Test 3 : Clic sur un jeu premium sans abonnement
1. Va sur l'onglet "Accueil"
2. Clique sur un jeu marqué "PREMIUM" (ex: "DÉSIR INTERDIT")
3. **Attendu :** Le PaywallModalA doit s'afficher

**Console attendue :**
```
💰 showPaywallA appelé - forceShow: false, isProMember: false
💰 PaywallModalA - isVisible: true, isProMember: false, currentOffering: true
```

## Si le paywall ne s'affiche toujours pas :

### Vérifier RevenueCat :
```bash
# Vérifier que RevenueCat est bien configuré
# Dans les logs, chercher :
```

1. **Vérifier `currentOffering` :**
   - Si `currentOffering: false` dans les logs, RevenueCat n'a pas chargé les offres
   - Vérifier la configuration RevenueCat dans `hooks/useRevenueCat.ts`

2. **Vérifier que le PaywallProvider est bien monté :**
   - Vérifier dans `app/_layout.tsx` que `<PaywallProvider>` entoure l'app

3. **Vérifier AsyncStorage :**
   ```bash
   # Si besoin de réinitialiser le state du paywall :
   # Ajouter un bouton de debug dans l'app qui appelle :
   paywallManager.resetPaywallState()
   ```

## Notes importantes :

- Le système de cooldown (8 heures entre les affichages de PaywallB) est toujours actif
- Le PaywallB ne s'affiche automatiquement que 3 fois maximum par session
- Pendant une partie active (`isInActiveGame = true`), le PaywallB ne s'affiche pas automatiquement
- Le bouton "Essayer le premium" du profil ignore ces restrictions avec `forceShow = true`
