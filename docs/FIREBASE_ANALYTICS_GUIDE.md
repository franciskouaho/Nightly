# Guide Firebase Analytics - Suivi des Liaisons de Compte

## 🎯 Événements trackés

### 1. `account_linked`
Déclenché quand un utilisateur anonyme lie son compte à Google ou Apple.

**Paramètres:**
- `method`: "google" ou "apple"
- `user_id`: UID Firebase de l'utilisateur
- `timestamp`: Date et heure ISO

### 2. `premium_granted`
Déclenché quand l'abonnement gratuit est accordé.

**Paramètres:**
- `reason`: "account_link"
- `user_id`: UID Firebase
- `duration_days`: 3
- `timestamp`: Date et heure ISO

---

## 📊 Configuration dans Firebase Console

### Étape 1 : Activer les événements comme conversions

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet "Nightly"
3. **Analytics** → **Events**
4. Attendez que les événements apparaissent (peut prendre 24h après le premier déclenchement)
5. Pour chaque événement (`account_linked` et `premium_granted`):
   - Cliquez sur les **⋮** (3 points)
   - Sélectionnez **"Mark as conversion"**
   - Activez le toggle

### Étape 2 : Créer un rapport dans "Analysis"

1. **Analytics** → **Analysis** → **Create new analysis**
2. Choisissez **"Funnel analysis"** ou **"Custom analysis"**

#### Option A : Funnel Analysis (Entonnoir de conversion)

```
Étape 1: first_open (Ouverture de l'app)
Étape 2: account_linked (Liaison du compte)
Étape 3: premium_granted (Premium accordé)
```

Cela vous montrera le taux de conversion de l'ouverture jusqu'à la liaison.

#### Option B : Custom Analysis (Analyse personnalisée)

**Configuration:**
- **Technique**: Segmentation
- **Dimension**: Event name
- **Metric**: Event count
- **Filter**: event_name = "account_linked" OR event_name = "premium_granted"

### Étape 3 : Créer des audiences

Créez des audiences pour cibler les utilisateurs:

#### Audience "Utilisateurs ayant lié leur compte"
1. **Analytics** → **Audiences** → **New Audience**
2. **Conditions:**
   - Include users who: `event_name = account_linked`
3. Nommez: "Users Linked Account"

#### Audience "Utilisateurs anonymes actifs"
1. **New Audience**
2. **Conditions:**
   - Include users who: `first_open` exists
   - Exclude users who: `account_linked` exists
3. Nommez: "Anonymous Active Users"

---

## 📈 Rapports disponibles dans Firebase

### Dashboard "Overview"

Après avoir marqué les événements comme conversions, vous verrez:

- **Conversions** (onglet principal)
  - Total des conversions `account_linked`
  - Total des conversions `premium_granted`
  - Taux de conversion par rapport aux utilisateurs actifs

### Events (Vue détaillée)

1. **Analytics** → **Events**
2. Cliquez sur `account_linked` pour voir:
   - Nombre total d'occurrences
   - Utilisateurs uniques
   - Valeur moyenne par utilisateur
   - Tendance sur 7/30 jours

### DebugView (Pour tester)

En développement, activez le DebugView:

```bash
# iOS
adb shell setprop debug.firebase.analytics.app YOUR_PACKAGE_NAME

# Android
adb shell setprop debug.firebase.analytics.app com.yourcompany.nightly
```

Puis allez sur **Analytics** → **DebugView** pour voir les événements en temps réel.

---

## 📊 KPIs à suivre

### Métriques principales

1. **Taux de conversion anonyme → lié**
   - Formule: (Nb comptes liés / Nb utilisateurs actifs) × 100
   - Objectif: > 20%

2. **Méthode de liaison préférée**
   - Google vs Apple
   - Permet d'optimiser l'UX

3. **Temps moyen avant liaison**
   - Combien de temps après l'inscription?
   - Permet d'ajuster le timing du modal

4. **Rétention après liaison**
   - Les utilisateurs qui lient leur compte reviennent-ils plus?
   - Utilisez **Analytics** → **Retention**

### Tableaux de bord recommandés

Créez ces rapports personnalisés:

#### Rapport 1: Vue d'ensemble des liaisons
- **Type**: Custom Analysis
- **Métrique**: Event count
- **Dimension**: Date
- **Segments**:
  - account_linked (method=google)
  - account_linked (method=apple)

#### Rapport 2: Conversion funnel
- **Type**: Funnel Analysis
- **Étapes**:
  1. screen_view (Home screen)
  2. account_linked
  3. premium_granted

#### Rapport 3: Géographie
- **Type**: Custom Analysis
- **Métrique**: Event count
- **Dimension**: Country
- **Event**: account_linked

---

## 🔔 Alertes et Notifications

### Créer une alerte pour les conversions

1. **Analytics** → **Custom Definitions** → **Create Custom Alert**
2. **Configuration:**
   - **Metric**: Conversions
   - **Event**: account_linked
   - **Condition**: Falls below X per day
   - **Action**: Send email

Cela vous alertera si les conversions chutent.

---

## 🚀 Export vers Google Sheets (Sans BigQuery)

Pour exporter automatiquement vos données:

1. **Analytics** → **Custom Definitions** → **Create Custom Report**
2. Configurez votre rapport
3. **Share** → **Schedule email delivery**
4. Ou utilisez l'API Firebase Analytics

---

## 📱 Test en production

Une fois déployé, testez:

1. Créez un compte anonyme
2. Liez-le à Google/Apple
3. Attendez 24-48h
4. Vérifiez dans **Analytics** → **Events**

Les événements devraient apparaître avec tous les paramètres.

---

## 💡 Tips

- Les données Analytics ont un délai de 24-48h
- Utilisez **DebugView** pour des tests en temps réel
- Exportez vers BigQuery pour des analyses avancées (gratuit jusqu'à 10GB/mois)
- Créez des audiences pour le remarketing
- Comparez les cohortes (utilisateurs liés vs non-liés)

---

## 🆘 Dépannage

### Les événements n'apparaissent pas

1. Vérifiez que Firebase Analytics est bien initialisé dans l'app
2. Vérifiez les logs: `console.log` devrait afficher "✅ Compte anonyme lié..."
3. Attendez 24-48h (délai de propagation)
4. Utilisez DebugView pour voir en temps réel

### Les paramètres sont vides

- Vérifiez que les paramètres sont des types supportés (string, number, boolean)
- Maximum 25 paramètres par événement
- Longueur max: 100 caractères par paramètre

### Les conversions ne s'affichent pas

- Assurez-vous d'avoir marqué les événements comme conversions
- Attendez 24-48h après avoir marqué
- Vérifiez que les événements ont bien été déclenchés au moins une fois
