# Implémentation du Tracking Onboarding

## 📋 Liste des écrans d'onboarding

1. **loading.tsx** - Écran de chargement
2. **ready.tsx** - Écran "Prêt à commencer"
3. **name.tsx** - Saisie du pseudo ✅ (DÉJÀ FAIT)
4. **age.tsx** - Saisie de la date de naissance
5. **gender.tsx** - Sélection du genre
6. **goals.tsx** - Sélection des objectifs
7. **profile.tsx** - Sélection de l'avatar
8. **account.tsx** - Connexion Google/Apple
9. **notifications.tsx** - Activation des notifications

---

## 🔧 Modifications à apporter

### 1. age.tsx

**Import à ajouter:**
```typescript
import { trackOnboardingAgeCompleted } from "@/services/onboardingAnalytics";
```

**Modifier handleContinue:**
```typescript
const handleContinue = async () => {
    updateData("birthDate", date);
    await trackOnboardingAgeCompleted(date.toISOString());
    router.push("/onboarding/gender");
};
```

---

### 2. gender.tsx

**Import à ajouter:**
```typescript
import { trackOnboardingGenderCompleted } from "@/services/onboardingAnalytics";
```

**Modifier handleGenderSelect:**
```typescript
const handleGenderSelect = async (selectedGender: string) => {
    updateData("gender", selectedGender);
    await trackOnboardingGenderCompleted(selectedGender);
    router.push("/onboarding/goals");
};
```

---

### 3. goals.tsx

**Import à ajouter:**
```typescript
import { trackOnboardingGoalsCompleted } from "@/services/onboardingAnalytics";
```

**Modifier handleContinue:**
```typescript
const handleContinue = async () => {
    updateData("goals", selectedGoals);
    await trackOnboardingGoalsCompleted(selectedGoals);
    router.push("/onboarding/profile");
};
```

---

### 4. profile.tsx

**Import à ajouter:**
```typescript
import { trackOnboardingProfileCompleted } from "@/services/onboardingAnalytics";
```

**Modifier handleContinue:**
```typescript
const handleContinue = async () => {
    updateData("avatar", selectedAvatar);
    await trackOnboardingProfileCompleted(selectedAvatar);
    router.push("/onboarding/account");
};
```

---

### 5. account.tsx

**Import à ajouter:**
```typescript
import { trackOnboardingAccountCompleted } from "@/services/onboardingAnalytics";
```

**Modifier les fonctions:**
```typescript
// Après connexion Google réussie
await trackOnboardingAccountCompleted('google');

// Après connexion Apple réussie
await trackOnboardingAccountCompleted('apple');

// Si l'utilisateur skip
await trackOnboardingAccountCompleted('skip');
```

---

### 6. notifications.tsx

**Import à ajouter:**
```typescript
import { trackOnboardingNotificationsCompleted } from "@/services/onboardingAnalytics";
```

**Modifier handleContinue:**
```typescript
const handleContinue = async () => {
    await trackOnboardingNotificationsCompleted(notificationsEnabled);
    await trackOnboardingCompleted(/* duration if tracked */);
    router.push("/(tabs)");
};
```

---

### 7. loading.tsx

**Import à ajouter:**
```typescript
import { trackOnboardingLoading } from "@/services/onboardingAnalytics";
```

**Ajouter dans useEffect:**
```typescript
useEffect(() => {
    trackOnboardingLoading();
    // ... reste du code
}, []);
```

---

### 8. ready.tsx

**Import à ajouter:**
```typescript
import { trackOnboardingReady, trackOnboardingStart } from "@/services/onboardingAnalytics";
```

**Ajouter dans useEffect:**
```typescript
useEffect(() => {
    trackOnboardingReady();
}, []);
```

**Modifier handleStart:**
```typescript
const handleStart = async () => {
    await trackOnboardingStart();
    router.push("/onboarding/name");
};
```

---

## 📊 Événements trackés

### Firebase Analytics & PostHog

| Événement | Paramètres | Déclenché quand |
|-----------|-----------|-----------------|
| `onboarding_start` | timestamp | Utilisateur clique sur "Commencer" |
| `onboarding_loading_view` | step, step_number, timestamp | Vue de l'écran loading |
| `onboarding_ready_view` | step, step_number, timestamp | Vue de l'écran ready |
| `onboarding_name_completed` | step, step_number, has_value, name_length, timestamp | Pseudo saisi |
| `onboarding_age_completed` | step, step_number, has_value, age_range, timestamp | Date de naissance saisie |
| `onboarding_gender_completed` | step, step_number, gender, timestamp | Genre sélectionné |
| `onboarding_goals_completed` | step, step_number, goals_count, goals, timestamp | Objectifs sélectionnés |
| `onboarding_profile_completed` | step, step_number, has_avatar, timestamp | Avatar sélectionné |
| `onboarding_account_completed` | step, step_number, method, is_anonymous, timestamp | Compte lié ou skippé |
| `onboarding_notifications_completed` | step, step_number, enabled, timestamp | Notifications configurées |
| `onboarding_completed` | duration_seconds, timestamp | Onboarding terminé |
| `onboarding_abandoned` | step, step_number, timestamp | Utilisateur quitte |

---

## 🎯 Métriques à suivre

### Taux de complétion par étape

```
Étape 1 (Name) → Étape 2 (Age):     X%
Étape 2 (Age) → Étape 3 (Gender):   X%
Étape 3 (Gender) → Étape 4 (Goals): X%
...
```

### Taux de complétion global

```
Users who started / Users who completed: X%
```

### Durée moyenne

```
Temps moyen pour compléter l'onboarding: X secondes
```

### Points d'abandon

```
Quel est l'écran où les utilisateurs abandonnent le plus?
```

---

## 🚀 Test

Pour tester:

1. Désinstallez et réinstallez l'app
2. Passez par tout l'onboarding
3. Vérifiez dans Firebase Analytics → DebugView
4. Vérifiez dans PostHog → Live Events

Tous les événements devraient apparaître avec leurs paramètres.

---

## 💡 Analyses possibles

### Firebase Analytics

1. **Funnel Analysis**: onboarding_start → onboarding_name_completed → ... → onboarding_completed
2. **Drop-off Analysis**: À quelle étape les utilisateurs abandonnent?
3. **Cohort Analysis**: Comparer les utilisateurs qui complètent vs ceux qui abandonnent
4. **A/B Testing**: Tester différentes versions de l'onboarding

### PostHog

1. **Funnels**: Création de funnels de conversion
2. **Session Recordings**: Voir comment les utilisateurs interagissent
3. **Cohorts**: Créer des cohortes basées sur le comportement
4. **Feature Flags**: Tester des variantes de l'onboarding

---

## 📝 Notes

- Tous les événements sont déjà implémentés dans `services/onboardingAnalytics.ts`
- Il suffit d'appeler les fonctions aux bons endroits
- Les données ont un délai de 24-48h dans Firebase Analytics
- PostHog affiche les données en temps réel
