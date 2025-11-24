# Guide Tracking Paywall - Nightly

## 🎯 Vue d'ensemble

Le paywall s'affiche automatiquement après que l'utilisateur termine l'onboarding. Tous les événements sont trackés dans Firebase Analytics et PostHog pour analyser les conversions.

### Flow complet

```
Welcome
  → Onboarding (9 étapes)
    → Ready ("C'est parti!")
      → Paywall A (plan hebdomadaire/annuel)
        → [Optionnel] Paywall B (upgrade annuel)
          → App principale (Tabs)
```

---

## 📊 Événements trackés

### Tous les événements Paywall

| Événement | Déclenché quand | Propriétés | Plateformes |
|-----------|-----------------|------------|-------------|
| `paywall_viewed` | Le paywall s'affiche | `paywall_type` (A/B), `source`, `timestamp` | Firebase + PostHog |
| `paywall_plan_selected` | Utilisateur sélectionne un plan | `paywall_type`, `plan_type` (weekly/monthly/annual), `price`, `timestamp` | Firebase + PostHog |
| `paywall_purchase_success` | Achat réussi | `paywall_type`, `plan_type`, `price`, `currency`, `timestamp` | Firebase + PostHog |
| `paywall_purchase_failed` | Échec d'achat | `paywall_type`, `plan_type`, `error_message`, `timestamp` | Firebase + PostHog |
| `paywall_purchase_cancelled` | Utilisateur annule l'achat | `paywall_type`, `plan_type`, `timestamp` | Firebase + PostHog |
| `paywall_closed` | Paywall fermé | `paywall_type`, `reason` (user_closed/purchase_success/upgrade_suggested), `timestamp` | Firebase + PostHog |
| `paywall_restore_attempt` | Tentative de restauration d'achat | `paywall_type`, `success` (true/false), `timestamp` | Firebase + PostHog |
| `paywall_terms_clicked` | Clic sur CGU/Privacy Policy | `paywall_type`, `timestamp` | Firebase + PostHog |

### Propriétés détaillées

#### `paywall_type`
- `A` - Premier paywall (hebdomadaire ou annuel)
- `B` - Deuxième paywall (upgrade annuel avec réduction)

#### `plan_type`
- `weekly` - Plan hebdomadaire (essai gratuit 3 jours puis X€/semaine)
- `monthly` - Plan mensuel (si disponible)
- `annual` - Plan annuel

#### `source` (pour paywall_viewed)
- `post_onboarding` - Affiché après l'onboarding
- `upgrade_from_A` - Paywall B affiché après fermeture du Paywall A
- Autres sources personnalisées

#### `reason` (pour paywall_closed)
- `user_closed` - Utilisateur ferme le paywall avec le bouton X
- `purchase_success` - Fermeture après achat réussi
- `upgrade_suggested` - Fermeture du Paywall A pour suggérer le Paywall B

---

## 🔧 Implémentation technique

### 1. Service Analytics

**Fichier:** `services/paywallAnalytics.ts`

Toutes les fonctions de tracking sont centralisées dans ce service:

```typescript
// Exemples d'utilisation
await trackPaywallViewed('A', 'post_onboarding');
await trackPaywallPlanSelected('A', 'weekly', 4.99);
await trackPaywallPurchaseSuccess('A', 'weekly', 4.99, 'EUR');
await trackPaywallClosed('A', 'user_closed');
```

### 2. Fichiers modifiés

#### `app/onboarding/ready.tsx`
- Affiche le paywall après l'onboarding
- Track `paywall_viewed` avec source `post_onboarding`

```typescript
const handleLetsGo = async () => {
  await trackOnboardingCompleted();
  showPaywallA(true); // Force show paywall
  await trackPaywallViewed('A', 'post_onboarding');
  router.replace("/(tabs)");
};
```

#### `components/PaywallModalA.tsx`
Tracking ajouté pour:
- ✅ Sélection de plan (useEffect sur `selectedPlan`)
- ✅ Achat réussi
- ✅ Achat échoué
- ✅ Achat annulé
- ✅ Restauration d'achat
- ✅ Clic sur CGU
- ✅ Fermeture du paywall

#### `components/PaywallModalB.tsx`
Même tracking que PaywallModalA, avec `paywall_type: 'B'`

---

## 📈 Analyses et Funnels

### 1. Firebase Analytics

#### Funnel: Onboarding → Paywall → Achat

1. **Analytics** → **Analysis Hub** → **Funnel analysis**
2. Configuration:

```
Étape 1: onboarding_completed
Étape 2: paywall_viewed (where paywall_type = "A")
Étape 3: paywall_plan_selected
Étape 4: paywall_purchase_success

Fenêtre: 1 heure
```

**Ce qu'il montre:**
- Taux de conversion onboarding → paywall
- Combien voient le paywall et sélectionnent un plan
- Taux de conversion final (achat)

#### Funnel: Upgrade vers Paywall B

```
Étape 1: paywall_viewed (where paywall_type = "A")
Étape 2: paywall_closed (where reason = "upgrade_suggested")
Étape 3: paywall_viewed (where paywall_type = "B")
Étape 4: paywall_purchase_success (where paywall_type = "B")
```

**Ce qu'il montre:**
- Efficacité de la stratégie d'upgrade
- Combien d'utilisateurs passent de A à B
- Taux de conversion du Paywall B

### 2. PostHog

#### Funnel Principal: Conversion Paywall

1. **Product analytics** → **Insights** → **New insight**
2. Type: **Funnels**
3. Configuration:

```
Étape 1: paywall_viewed
         → Filtre: paywall_type = "A"
         → Filtre: source = "post_onboarding"

Étape 2: paywall_plan_selected
         → Filtre: paywall_type = "A"

Étape 3: paywall_purchase_success
         → Filtre: paywall_type = "A"

Fenêtre de conversion: 30 minutes
```

#### Insight: Plans les plus populaires

**Type:** Trends

```
Événement: paywall_plan_selected
Grouper par: plan_type
Afficher: Total count
Période: Last 30 days
```

**Ce qu'il montre:** Répartition Weekly vs Annual

#### Insight: Raisons de fermeture

**Type:** Pie Chart

```
Événement: paywall_closed
Grouper par: reason
Afficher: Total count
Période: Last 30 days
```

**Ce qu'il montre:**
- % qui ferment sans acheter (user_closed)
- % qui achètent (purchase_success)
- % qui passent au Paywall B (upgrade_suggested)

#### Dashboard: Paywall Performance

Créez un dashboard avec ces insights:

**Section 1: Conversion**
- Funnel principal (onboarding → paywall → achat)
- Taux de conversion par étape
- Durée moyenne avant achat

**Section 2: Plans**
- Plans sélectionnés (Weekly vs Annual)
- Prix moyen par plan
- Revenue total par plan

**Section 3: Comportement**
- Raisons de fermeture (pie chart)
- Taux de restauration
- Clics sur CGU

---

## 🎯 Métriques clés à surveiller

### Taux de conversion

| Métrique | Calcul | Objectif |
|----------|--------|----------|
| **Conversion Onboarding → Paywall** | `paywall_viewed` / `onboarding_completed` | > 95% |
| **Conversion Paywall → Sélection** | `paywall_plan_selected` / `paywall_viewed` | > 60% |
| **Conversion Sélection → Achat** | `paywall_purchase_success` / `paywall_plan_selected` | > 30% |
| **Conversion Globale** | `paywall_purchase_success` / `paywall_viewed` | > 20% |

### Comportement utilisateur

| Métrique | Description |
|----------|-------------|
| **Plan préféré** | Weekly vs Annual (via `paywall_plan_selected`) |
| **Taux de fermeture sans achat** | `paywall_closed` (reason: user_closed) / `paywall_viewed` |
| **Taux d'upgrade B** | `paywall_viewed` (type: B) / `paywall_closed` (reason: upgrade_suggested) |
| **Taux de restauration** | `paywall_restore_attempt` (success: true) / total attempts |

### Revenue

| Métrique | Source | Description |
|----------|--------|-------------|
| **Revenue total** | `paywall_purchase_success` | Somme des `price` |
| **Revenue par plan** | `paywall_purchase_success` | Groupé par `plan_type` |
| **ARPU (Average Revenue Per User)** | Revenue total / Utilisateurs uniques | Moyenne |
| **Taux d'annulation** | `paywall_purchase_cancelled` / tentatives d'achat | % |

---

## 🧪 Test et Débogage

### 1. Test en développement

1. **Désinstallez l'app** complètement
2. **Réinstallez** via Xcode/Android Studio
3. **Passez l'onboarding complet**
4. Le paywall devrait s'afficher automatiquement
5. Testez toutes les actions:
   - ✅ Changer de plan (weekly ↔ annual)
   - ✅ Cliquer sur "Commencer l'essai"
   - ✅ Annuler l'achat
   - ✅ Fermer le paywall
   - ✅ Cliquer sur "Restaurer"
   - ✅ Cliquer sur "Conditions d'utilisation"

### 2. Vérifier les événements en temps réel

#### Firebase Analytics - DebugView

1. [Firebase Console](https://console.firebase.google.com) → Votre projet
2. **Analytics** → **DebugView**
3. Lancez votre app en mode debug
4. Vous verrez tous les événements en temps réel

#### PostHog - Live Events

1. [PostHog](https://app.posthog.com) → Votre projet
2. **Activity** → **Live events**
3. Les événements apparaissent instantanément (< 2 secondes)
4. Cliquez sur un événement pour voir toutes les propriétés

### 3. Console logs

Tous les événements sont loggués dans la console:

```
📊 Tracking: paywall_viewed A post_onboarding
📊 Tracking: paywall_plan_selected weekly 4.99
📊 Tracking: paywall_purchase_success weekly 4.99 EUR
📊 Tracking: paywall_closed A user_closed
```

Cherchez `📊 Tracking:` dans vos logs pour déboguer.

---

## 📊 Créer des Cohorts

### PostHog Cohorts

#### Cohort 1: "Paywall Viewers"

**Utilisateurs qui ont vu le paywall**

1. **People** → **Cohorts** → **New cohort**
2. Conditions:
   - Performed event: `paywall_viewed`
   - At least once
   - In the last 30 days
3. Nom: "Paywall Viewers"

#### Cohort 2: "Paywall Converters"

**Utilisateurs qui ont acheté après avoir vu le paywall**

1. **New cohort**
2. Conditions:
   - Performed event: `paywall_purchase_success`
   - At least once
3. Nom: "Paywall Converters"

#### Cohort 3: "Paywall Drop-offs"

**Utilisateurs qui ont vu le paywall mais n'ont pas acheté**

1. **New cohort**
2. Conditions:
   - Performed event: `paywall_viewed`
   - But did NOT perform: `paywall_purchase_success`
   - In the last 7 days
3. Nom: "Paywall Drop-offs"

**Utilité:** Recibler ces utilisateurs avec des promotions

#### Cohort 4: "Annual Subscribers"

**Utilisateurs qui ont choisi l'abonnement annuel**

1. **New cohort**
2. Conditions:
   - Performed event: `paywall_purchase_success`
   - Where: `plan_type = "annual"`
3. Nom: "Annual Subscribers"

---

## 🔔 Créer des Alertes

### Firebase Analytics

#### Alerte 1: Chute de conversions

1. Créez l'insight "Conversion Paywall"
2. Cliquez sur **Subscribe** (icône cloche)
3. Configuration:
   - Type: When conversion rate drops below
   - Threshold: 15%
   - Notification: Email
   - Fréquence: Daily

### PostHog

#### Alerte 1: Taux de fermeture élevé

1. Créez un Insight avec `paywall_closed` (reason: user_closed)
2. **Subscribe**
3. Configuration:
   - When the value rises above: 70% (des paywall_viewed)
   - Notification: Email + Slack

#### Alerte 2: Échecs d'achat

1. Insight: `paywall_purchase_failed`
2. **Subscribe**
3. Configuration:
   - When the count rises above: 10 (par jour)
   - Notification: Email

---

## 💡 Optimisations possibles

### A/B Testing avec PostHog

#### Test 1: Ordre des plans

**Hypothèse:** Afficher le plan annuel en premier augmente les conversions

1. **Feature flags** → **New feature flag**
2. Nom: `paywall_plan_order`
3. Variantes:
   - Control: Weekly en premier (50%)
   - Test: Annual en premier (50%)
4. Success metric: `paywall_purchase_success` (annual)

#### Test 2: Texte du CTA

**Hypothèse:** Un CTA plus urgent augmente les conversions

1. **New feature flag**: `paywall_cta_text`
2. Variantes:
   - Control: "Commencer l'essai gratuit"
   - Test A: "Débloquer maintenant"
   - Test B: "Essayer gratuitement pendant 3 jours"
3. Success metric: `paywall_purchase_success`

#### Test 3: Affichage du prix barré

**Hypothèse:** Montrer le prix original augmente la valeur perçue

1. **New feature flag**: `paywall_show_original_price`
2. Variantes:
   - Control: Prix actuel uniquement (50%)
   - Test: Prix barré + Prix actuel (50%)
3. Success metric: `paywall_purchase_success` (annual)

---

## 🚨 Troubleshooting

### Les événements n'apparaissent pas

#### Vérifier PostHog

1. Vérifiez que l'app a bien la clé API PostHog
2. Vérifiez dans les logs: `📊 Tracking: paywall_viewed`
3. Si les logs apparaissent mais pas dans PostHog:
   - Vérifiez votre connexion internet
   - Attendez 1-2 minutes
   - Vérifiez la clé API dans votre config

#### Vérifier Firebase

1. DebugView ne montre que les builds en mode debug
2. Sur iOS: Ajoutez `-FIRDebugEnabled` dans les arguments de lancement
3. Sur Android: `adb shell setprop debug.firebase.analytics.app <package_name>`
4. Les données en production arrivent avec 24-48h de délai

### Le paywall ne s'affiche pas

1. **Vérifiez l'onboarding:** L'utilisateur doit terminer tout l'onboarding
2. **Vérifiez ready.tsx:** Le `showPaywallA(true)` doit être appelé
3. **Vérifiez PaywallContext:** L'app doit être wrappée dans `<PaywallProvider>`
4. **Vérifiez les logs:** Cherchez "PaywallModalA - isVisible: true"

### Le tracking se dédouble

Si vous voyez des événements en double:
- Vérifiez que le composant ne se monte pas plusieurs fois
- Vérifiez les useEffect dependencies
- Assurez-vous de ne pas appeler le tracking à plusieurs endroits

---

## ✅ Checklist

- [ ] Paywall s'affiche après l'onboarding
- [ ] Événements `paywall_viewed` apparaissent dans PostHog Live Events
- [ ] Événements `paywall_plan_selected` trackés quand on change de plan
- [ ] Achat test réussi et `paywall_purchase_success` tracké
- [ ] Annulation d'achat tracke `paywall_purchase_cancelled`
- [ ] Fermeture du paywall tracke `paywall_closed`
- [ ] Funnel "Onboarding → Paywall → Achat" créé dans PostHog
- [ ] Dashboard "Paywall Performance" créé
- [ ] Cohorts créées (4 minimum)
- [ ] Alertes configurées (2 minimum)
- [ ] Tests effectués avec Live Events
- [ ] Documentation partagée avec l'équipe

---

## 📚 Ressources

- [PostHog Funnels Guide](https://posthog.com/docs/user-guides/funnels)
- [Firebase Analytics Events](https://firebase.google.com/docs/analytics/events)
- [RevenueCat Analytics](https://www.revenuecat.com/docs/charts)
- [Paywall Best Practices](https://www.revenuecat.com/blog/engineering/mobile-paywall-design/)

---

## 📞 Support

Pour toute question sur le tracking du paywall:
1. Vérifiez les logs console (`📊 Tracking:`)
2. Vérifiez PostHog Live Events
3. Consultez ce guide
4. Créez une issue sur GitHub si le problème persiste
