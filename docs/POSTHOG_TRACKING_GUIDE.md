# Guide PostHog Analytics - Nightly

## 🎯 Événements trackés

### Liaison de compte

| Événement | Propriétés | Description |
|-----------|-----------|-------------|
| `account_linked` | method, user_id, was_anonymous, timestamp | Compte anonyme lié à Google/Apple |
| `premium_granted` | reason, user_id, duration_days, subscription_type, expiration_date, timestamp | Abonnement Premium accordé |

### Onboarding

| Événement | Propriétés | Description |
|-----------|-----------|-------------|
| `onboarding_start` | timestamp | Utilisateur démarre l'onboarding |
| `onboarding_step_viewed` | step, step_number, timestamp | Vue d'un écran d'onboarding |
| `onboarding_step_completed` | step, step_number, [données spécifiques], timestamp | Étape d'onboarding complétée |
| `onboarding_completed` | duration_seconds, timestamp | Onboarding terminé |
| `onboarding_abandoned` | step, step_number, timestamp | Utilisateur abandonne |

---

## 📊 Configuration dans PostHog

### 1. Accéder à PostHog

1. Allez sur [app.posthog.com](https://app.posthog.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet "Nightly"

### 2. Voir les événements en temps réel

**Live Events** (temps réel):
1. Menu de gauche → **Activity** → **Live events**
2. Vous verrez tous les événements en temps réel
3. Filtrez par nom d'événement pour voir les détails

**Events** (historique):
1. Menu de gauche → **Product analytics** → **Events**
2. Recherchez vos événements: `account_linked`, `premium_granted`, `onboarding_*`
3. Cliquez sur un événement pour voir les propriétés

---

## 🔍 Créer des Insights (Rapports)

### Insight 1: Taux de liaison de compte

**Type**: Trend

**Configuration**:
```
Événement: account_linked
Afficher: Unique users
Grouper par: method (google vs apple)
Période: Last 30 days
```

**Ce qu'il montre**: Nombre d'utilisateurs qui lient leur compte par jour, divisé par méthode.

### Insight 2: Taux de conversion Premium

**Type**: Trend

**Configuration**:
```
Événement: premium_granted
Filtre: reason = "account_link"
Afficher: Unique users
Période: Last 30 days
```

**Ce qu'il montre**: Nombre d'utilisateurs qui reçoivent le Premium gratuit.

### Insight 3: Funnel d'onboarding

**Type**: Funnel

**Configuration**:
```
Étape 1: onboarding_start
Étape 2: onboarding_step_completed (step = "name")
Étape 3: onboarding_step_completed (step = "age")
Étape 4: onboarding_step_completed (step = "gender")
Étape 5: onboarding_step_completed (step = "goals")
Étape 6: onboarding_step_completed (step = "profile")
Étape 7: onboarding_step_completed (step = "account")
Étape 8: onboarding_step_completed (step = "notifications")
Étape 9: onboarding_completed

Fenêtre de conversion: 30 minutes
```

**Ce qu'il montre**:
- Taux de complétion à chaque étape
- Où les utilisateurs abandonnent
- Conversion globale

### Insight 4: Durée moyenne de l'onboarding

**Type**: Trend

**Configuration**:
```
Événement: onboarding_completed
Propriété: duration_seconds
Afficher: Average
Période: Last 30 days
```

**Ce qu'il montre**: Temps moyen pour compléter l'onboarding.

### Insight 5: Méthode de liaison préférée

**Type**: Pie Chart

**Configuration**:
```
Événement: account_linked
Grouper par: method
Afficher: Total count
Période: Last 30 days
```

**Ce qu'il montre**: Répartition Google vs Apple.

---

## 📈 Créer un Dashboard

### Dashboard "Acquisition & Onboarding"

1. **Product analytics** → **Dashboards** → **New dashboard**
2. Nommez: "Acquisition & Onboarding"
3. Ajoutez ces Insights:

**Section 1: Onboarding Performance**
- Funnel d'onboarding
- Taux de complétion par étape
- Durée moyenne

**Section 2: Liaison de compte**
- Nombre de comptes liés (trend)
- Google vs Apple (pie chart)
- Taux de conversion anonyme → lié

**Section 3: Premium**
- Nombre de Premium accordés
- Taux d'activation du Premium

### Dashboard "Conversion & Retention"

1. **New dashboard**: "Conversion & Retention"
2. Insights:

**Section 1: Conversions**
- Funnel: onboarding → account_linked → premium_granted
- Taux de conversion global

**Section 2: Rétention**
- Rétention des utilisateurs ayant lié leur compte
- Rétention des utilisateurs ayant reçu le Premium
- Comparaison: anonyme vs lié

---

## 🎯 Créer des Cohorts (Audiences)

### Cohort 1: "Utilisateurs ayant lié leur compte"

1. **People** → **Cohorts** → **New cohort**
2. **Conditions**:
   - Performed event: `account_linked`
   - At least once
   - In the last 30 days
3. Nommez: "Users with Linked Account"

**Utilité**: Suivre le comportement de ces utilisateurs, leur rétention, etc.

### Cohort 2: "Utilisateurs qui ont complété l'onboarding"

1. **New cohort**
2. **Conditions**:
   - Performed event: `onboarding_completed`
   - At least once
3. Nommez: "Completed Onboarding"

### Cohort 3: "Utilisateurs qui ont abandonné l'onboarding"

1. **New cohort**
2. **Conditions**:
   - Performed event: `onboarding_start`
   - But did not perform: `onboarding_completed`
   - In the last 7 days
3. Nommez: "Onboarding Abandoned"

**Utilité**: Recibler ces utilisateurs, comprendre pourquoi ils abandonnent.

### Cohort 4: "Premium via liaison"

1. **New cohort**
2. **Conditions**:
   - Performed event: `premium_granted`
   - Where: `reason = "account_link"`
3. Nommez: "Premium Link Reward"

---

## 🔔 Créer des Alertes

### Alerte 1: Chute des liaisons de compte

1. **Product analytics** → **Insights** → Créez l'insight "account_linked"
2. Cliquez sur **Subscribe** (icône cloche)
3. **Configuration**:
   - Type: When the value drops below
   - Threshold: 5 (par jour)
   - Notification: Email
   - Fréquence: Daily

### Alerte 2: Taux de complétion onboarding faible

1. Créez un funnel d'onboarding
2. **Subscribe**
3. **Configuration**:
   - When conversion rate drops below: 50%
   - Notification: Email + Slack (si configuré)

---

## 🎬 Session Recordings

### Activer les enregistrements de session

1. **Product analytics** → **Session recordings**
2. **Settings** → Activez "Record sessions automatically"
3. Filtres recommandés:
   - Enregistrer uniquement si l'utilisateur effectue: `onboarding_start`
   - OU: `account_linked`

**Utilité**: Voir exactement comment les utilisateurs interagissent avec l'onboarding.

### Analyser les sessions

1. **Session recordings** → **Recent recordings**
2. Filtrez:
   - Events: `onboarding_abandoned`
   - Cohort: "Onboarding Abandoned"
3. Regardez les sessions pour comprendre pourquoi ils abandonnent

---

## 📊 Analyses avancées

### Analyse 1: Impact de la liaison sur la rétention

**Type**: Retention

**Configuration**:
```
Cohort A: Users with Linked Account
Cohort B: All users
Mesure: Return rate (D1, D7, D30)
```

**Question**: Les utilisateurs qui lient leur compte reviennent-ils plus?

### Analyse 2: Temps avant liaison

**Type**: Trend

**Configuration**:
```
Événement: account_linked
Propriété: time_since_onboarding
Afficher: Average
```

**Question**: Combien de temps après l'onboarding les utilisateurs lient-ils leur compte?

### Analyse 3: Corrélation objectifs → liaison

**Type**: Trend

**Configuration**:
```
Événement: account_linked
Grouper par: user property "goals"
```

**Question**: Certains objectifs sont-ils corrélés à plus de liaisons?

---

## 🚀 Feature Flags pour A/B Testing

### Tester différentes variantes de l'onboarding

1. **Feature flags** → **New feature flag**
2. Nommez: `onboarding_modal_timing`
3. **Variantes**:
   - Control: Modal après 2 secondes
   - Test A: Modal après 5 secondes
   - Test B: Modal après 10 secondes
4. **Rollout**: 33% chacun
5. **Success metric**: `account_linked` rate

### Tester la récompense

1. **New feature flag**: `link_reward_amount`
2. **Variantes**:
   - Control: 3 jours (5,99€)
   - Test A: 7 jours (13,93€)
   - Test B: 30 jours (59,88€)
3. **Success metric**:
   - `account_linked` rate (court terme)
   - Retention D7/D30 (long terme)

---

## 📱 Test en temps réel

### Debug mode

Pour tester en temps réel:

1. Allez sur **Activity** → **Live events**
2. Laissez cette page ouverte
3. Utilisez l'app sur votre téléphone
4. Les événements apparaissent instantanément

### Vérifier les propriétés

1. Cliquez sur un événement dans Live events
2. **View details**
3. Vérifiez que toutes les propriétés sont présentes:
   - user_id
   - method (pour account_linked)
   - step (pour onboarding)
   - etc.

---

## 💡 Tips & Best Practices

### 1. Nommage des événements

✅ **Bon**: `account_linked`, `onboarding_completed`
❌ **Mauvais**: `user_links_account`, `onboarding-completed`

- Utilisez snake_case
- Verbes au passé (completed, linked, granted)
- Soyez descriptifs mais concis

### 2. Propriétés des événements

✅ **Bon**:
```javascript
{
  method: 'google',
  was_anonymous: true,
  user_id: 'abc123'
}
```

❌ **Mauvais**:
```javascript
{
  m: 'g',
  anon: 1,
  id: 'abc123'
}
```

- Noms clairs et explicites
- Types appropriés (boolean, number, string)
- Pas d'abrév iations obscures

### 3. Fréquence de vérification

- **Live events**: En temps réel pour le debug
- **Dashboards**: Une fois par semaine pour les métriques
- **Alertes**: Configurez-les pour être notifié des anomalies

### 4. Éviter le spam

- Ne trackez pas trop d'événements (< 50 types différents)
- Groupez les événements similaires (ex: `onboarding_step_completed` avec propriété `step`)
- Évitez les événements trop fréquents (ex: scroll, mouse move)

---

## 🆘 Troubleshooting

### Les événements n'apparaissent pas

1. **Vérifiez la clé API PostHog**
   ```typescript
   // Dans votre configuration
   apiKey: 'phc_YOUR_API_KEY'
   ```

2. **Vérifiez l'initialisation**
   ```typescript
   import posthog from 'posthog-react-native';
   // S'assurer que posthog n'est pas null
   posthog?.capture('event_name', {...});
   ```

3. **Vérifiez les logs**
   ```
   console.log('📊 Tracking: account_linked');
   ```

4. **Attendez 1-2 minutes**
   - PostHog peut avoir un léger délai (< 2 minutes généralement)

### Les propriétés sont vides

- Vérifiez que les valeurs ne sont pas `undefined`
- Convertissez les dates en ISO string
- Les objets complexes doivent être sérialisés

### Double tracking

Si vous voyez des événements en double:
- Vérifiez que vous ne trackez pas à plusieurs endroits
- Assurez-vous que les composants ne se montent pas plusieurs fois

---

## 📚 Ressources

- [PostHog Docs](https://posthog.com/docs)
- [PostHog React Native SDK](https://posthog.com/docs/libraries/react-native)
- [Best Practices](https://posthog.com/docs/data/best-practices)
- [Funnels Guide](https://posthog.com/docs/user-guides/funnels)
- [Cohorts Guide](https://posthog.com/docs/user-guides/cohorts)

---

## ✅ Checklist

- [ ] Événements `account_linked` et `premium_granted` apparaissent dans PostHog
- [ ] Tous les événements d'onboarding trackés (9 étapes)
- [ ] Dashboard "Acquisition & Onboarding" créé
- [ ] Cohorts créées (4 cohorts minimum)
- [ ] Alertes configurées (2 alertes minimum)
- [ ] Funnel d'onboarding configuré
- [ ] Session recordings activés pour l'onboarding
- [ ] Tests effectués avec Live Events

