# 💎 PaywallB (Offre Annuelle) - Quand s'affiche-t-il ?

## 🎯 Réponse Simple :

Le **PaywallB** s'affiche **UNIQUEMENT** en tant qu'**exit-intent** (offre de dernière chance) quand l'utilisateur ferme le PaywallA.

---

## 🔄 Flow Complet :

```
Utilisateur déclenche PaywallA (plan court)
    ↓
Voit l'offre : Essai 3 jours / Mensuel
    ↓
Ferme le PaywallA (bouton X ou retour)
    ↓
⏰ Attend 45 secondes
    ↓
✅ Vérification des conditions :
   - Pas membre premium ? ✅
   - Pas en partie active ? ✅
   - Cooldown de 8h respecté ? ✅
   - Moins de 3 affichages cette session ? ✅
    ↓
💎 PaywallB s'affiche (Offre annuelle -50%)
```

---

## 📋 Conditions d'Affichage

### ✅ Le PaywallB s'affiche SI :

1. **L'utilisateur a fermé le PaywallA** (pas acheté)
2. **45 secondes se sont écoulées** depuis la fermeture
3. **N'est PAS membre premium**
4. **N'est PAS en train de jouer** (pas dans une partie)
5. **Cooldown respecté** : 8 heures depuis le dernier affichage du PaywallB
6. **Maximum pas atteint** : moins de 3 affichages du PaywallB dans cette session

### ❌ Le PaywallB NE s'affiche PAS si :

- ❌ L'utilisateur est déjà membre premium
- ❌ L'utilisateur est en pleine partie (pour ne pas déranger)
- ❌ Le PaywallB a été affiché il y a moins de 8 heures
- ❌ Le PaywallB a déjà été affiché 3 fois dans cette session
- ❌ L'utilisateur a acheté dans le PaywallA (conversion réussie)

---

## 💻 Code Source

**Fichier :** `hooks/usePaywallManager.ts`

### Déclenchement (ligne 221-228) :
```typescript
const handlePaywallAClose = useCallback(async () => {
  closePaywallA();

  // Attendre avant de suggérer l'annuel
  setTimeout(async () => {
    await showPaywallB(); // Affichage après 45 secondes
  }, 45000); // 45 secondes
}, [closePaywallA, showPaywallB]);
```

### Vérifications (ligne 125-156) :
```typescript
const canShowPaywallB = useCallback(async () => {
  // 1. Vérifier si membre premium ou en partie
  if (isProMember || paywallState.isInActiveGame) {
    return false;
  }

  // 2. Vérifier le cooldown de 8 heures
  if (paywallState.lastPaywallBShown) {
    const hoursSinceLastShow =
      (Date.now() - paywallState.lastPaywallBShown) / (1000 * 60 * 60);
    if (hoursSinceLastShow < finalConfig.cooldownHours) {
      return false; // Trop tôt
    }
  }

  // 3. Vérifier le compteur de session (max 3)
  const count = /* ... récupère depuis AsyncStorage ... */;
  if (count >= finalConfig.maxPaywallBPerSession) {
    return false; // Quota atteint
  }

  return true; // Toutes les conditions OK
}, [isProMember, paywallState, finalConfig]);
```

---

## 🎯 Stratégie "Exit-Intent"

### Pourquoi cette approche ?

1. **💰 Maximiser la conversion :**
   - L'utilisateur a déjà vu le PaywallA mais n'a pas acheté
   - On lui propose une **meilleure offre** (annuel -50%)
   - Crée un sentiment d'**urgence** et d'**opportunité**

2. **🧠 Psychologie de l'achat :**
   - Le délai de 45 secondes laisse respirer
   - Pas trop agressif (pas immédiat)
   - Message : "Dernière chance pour économiser !"

3. **📊 Données du marché :**
   - Les exit-intent upsells augmentent la conversion de **+30%**
   - L'offre annuelle a une **meilleure LTV** (Lifetime Value)

---

## 📊 Configuration Actuelle

**Fichier :** `app/_layout.tsx`

```typescript
<PaywallProvider config={{
  cooldownHours: 8,           // 8 heures entre les PaywallB
  maxPaywallBPerSession: 3,   // Max 3 fois par session
}}>
```

### Signification :
- **cooldownHours: 8** → Le PaywallB peut s'afficher **3 fois par jour maximum**
- **maxPaywallBPerSession: 3** → Protection anti-spam dans la même session

---

## 🧪 Scénarios de Test

### Test 1 : Exit-Intent Standard
```
✅ Ouvre l'app
✅ Joue à 2 parties
✅ PaywallA s'affiche
✅ Ferme le PaywallA (bouton X)
⏰ Attends 45 secondes
💎 PaywallB s'affiche !
```

**Console attendue :**
```
💰 PaywallModalA - isVisible: false (fermé)
[... 45 secondes ...]
💎 PaywallModalB - isVisible: true
```

### Test 2 : Cooldown Respecté
```
✅ Le PaywallB s'est affiché (scénario 1)
✅ Ferme le PaywallB
✅ Joue à 2 autres parties
✅ PaywallA s'affiche
✅ Ferme le PaywallA
⏰ Attends 45 secondes
❌ PaywallB ne s'affiche PAS (cooldown de 8h pas passé)
```

**Console attendue :**
```
⏳ Cooldown PaywallB actif (X heures restantes)
```

### Test 3 : En Partie Active
```
✅ Lance une partie
✅ Pendant la partie, déclenche le PaywallA (clic sur jeu premium)
✅ Ferme le PaywallA
⏰ Attends 45 secondes
❌ PaywallB ne s'affiche PAS (en partie active)
```

### Test 4 : Quota Session Atteint
```
✅ PaywallB affiché 3 fois dans la session
✅ Déclenche à nouveau le PaywallA
✅ Ferme le PaywallA
⏰ Attends 45 secondes
❌ PaywallB ne s'affiche PAS (quota de 3 atteint)
```

---

## 🔧 Ajustements Possibles

### Si tu veux modifier le timing :

**Fichier :** `hooks/usePaywallManager.ts:227`

```typescript
}, 45000); // ← Change ce nombre

// Exemples :
30000  = 30 secondes (plus agressif)
60000  = 60 secondes (1 minute)
120000 = 2 minutes (très patient)
```

### Si tu veux modifier le cooldown :

**Fichier :** `app/_layout.tsx:45-46`

```typescript
<PaywallProvider config={{
  cooldownHours: 8, // ← Change ce nombre

  // Exemples :
  // 4  = 4 heures (6 fois par jour max)
  // 12 = 12 heures (2 fois par jour max)
  // 24 = 24 heures (1 fois par jour max)
}}>
```

### Si tu veux modifier le quota par session :

**Fichier :** `app/_layout.tsx:47`

```typescript
maxPaywallBPerSession: 3, // ← Change ce nombre

// Exemples :
// 1 = 1 fois par session max (très restrictif)
// 5 = 5 fois par session max (plus permissif)
```

---

## 📈 Métriques à Suivre

### KPIs PaywallB :
- [ ] **Taux d'affichage** : % d'utilisateurs qui voient le PaywallB
- [ ] **Taux de conversion PaywallB** : % qui souscrivent à l'annuel
- [ ] **Taux d'upsell** : PaywallA → PaywallB
- [ ] **Revenu moyen** : Comparaison plan court vs annuel

### Objectifs :
- **Taux d'upsell** : 20-30% des fermetures de PaywallA
- **Conversion PaywallB** : 10-15% (meilleure que PaywallA grâce à la réduction)
- **Contribution au revenu** : L'annuel devrait représenter 40-50% du chiffre d'affaires

---

## 🎨 Contenu du PaywallB

**Fichier :** `components/PaywallModalB.tsx`

### Message affiché :
- 🔥 **Titre :** "OFFRE LIMITÉE"
- 💰 **Réduction :** "ÉCONOMISEZ PLUS DE 50%"
- ⚡ **CTA :** "Ne ratez pas cette opportunité unique !"
- 💎 **Économies :** "Économisez plus de 30€ par an"

### Psychologie :
- **Urgence** : "Offre limitée"
- **Économie** : "50% de réduction"
- **Peur de manquer** : "Ne ratez pas"
- **Valeur** : "30€ économisés"

---

## ⚠️ Important

### Ce qui a été SUPPRIMÉ :

**AVANT :** Le PaywallB s'affichait automatiquement toutes les 8 heures (même sans avoir fermé le PaywallA)

**APRÈS :** Le PaywallB s'affiche **UNIQUEMENT** en exit-intent après fermeture du PaywallA

**Raison :** Meilleure expérience utilisateur + stratégie d'upsell plus cohérente

---

## 🚀 Résumé

**PaywallB = Offre de Dernière Chance**

- 💎 S'affiche après fermeture du PaywallA
- ⏰ Délai de 45 secondes (respect de l'UX)
- 🔒 Conditions strictes (cooldown, quota)
- 💰 Objectif : Upsell vers le plan annuel (-50%)
- 📈 Impact attendu : +30% de conversion

---

**Dernière mise à jour :** 2025-01-03
**Statut :** ✅ Fonctionnel et Optimisé
