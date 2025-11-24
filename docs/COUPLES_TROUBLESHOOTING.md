# Guide de Troubleshooting - Système de Couples

Ce document contient les solutions aux problèmes courants liés au système de couples dans l'application Nightly.

## Table des matières

1. [Problèmes de connexion](#problèmes-de-connexion)
2. [Problèmes de localisation GPS](#problèmes-de-localisation-gps)
3. [Problèmes de streak](#problèmes-de-streak)
4. [Problèmes de défis quotidiens](#problèmes-de-défis-quotidiens)
5. [Problèmes d'analytics](#problèmes-danalytics)
6. [Problèmes généraux](#problèmes-généraux)

## Problèmes de connexion

### Le code couple ne fonctionne pas

**Symptômes:**
- Le code copié ne peut pas être utilisé par le partenaire
- Message d'erreur "Code invalide"
- Le code semble correct mais la connexion échoue

**Solutions:**

1. **Vérifier le format du code:**
   - Le code doit contenir au moins 6 caractères
   - Seuls les lettres majuscules (A-Z) et chiffres (0-9) sont acceptés
   - Les caractères spéciaux et espaces sont automatiquement supprimés

2. **Vérifier que le code n'est pas déjà utilisé:**
   - Un utilisateur ne peut pas utiliser son propre code
   - Si un partenaire est déjà connecté, il faut d'abord se déconnecter

3. **Vérifier la connexion Firestore:**
   - S'assurer que l'application a accès à Internet
   - Vérifier les règles Firestore pour l'accès aux collections `users` et `usernames`

4. **Réessayer après un court délai:**
   - Parfois, il y a un délai de propagation dans Firestore
   - Attendre 5-10 secondes et réessayer

### Le partenaire ne voit pas la connexion

**Symptômes:**
- L'un des partenaires voit la connexion, l'autre non
- Les données du couple ne se synchronisent pas

**Solutions:**

1. **Rafraîchir l'application:**
   - Fermer complètement l'application
   - La rouvrir pour forcer le rechargement des données

2. **Vérifier la synchronisation Firestore:**
   - Les deux utilisateurs doivent avoir le champ `partnerId` dans leur document `users`
   - Le `partnerId` doit pointer vers l'UID de l'autre partenaire

3. **Vérifier les permissions Firestore:**
   - Les règles doivent permettre la lecture des documents utilisateurs connectés

## Problèmes de localisation GPS

### La distance ne s'affiche pas

**Symptômes:**
- Le widget de distance affiche "N/A" ou reste vide
- La distance ne se calcule jamais

**Solutions:**

1. **Vérifier les permissions de localisation:**
   - Sur iOS: Paramètres → Nightly → Localisation → "Toujours" ou "Lors de l'utilisation"
   - Sur Android: Paramètres → Apps → Nightly → Permissions → Localisation → "Autoriser tout le temps"

2. **Activer le partage de localisation:**
   - Les deux partenaires doivent activer le partage de localisation
   - Utiliser le bouton "Activer GPS" dans le widget de distance

3. **Vérifier que les deux partenaires ont activé le partage:**
   - Le calcul de distance nécessite que les deux utilisateurs partagent leur localisation
   - Si seulement un partenaire active le partage, la distance ne s'affichera pas

4. **Vérifier la précision GPS:**
   - Le GPS peut prendre quelques secondes pour obtenir une position précise
   - Si vous êtes à l'intérieur, le signal GPS peut être faible

### La distance est incorrecte

**Symptômes:**
- La distance affichée semble être beaucoup trop grande ou petite
- La distance ne se met pas à jour

**Solutions:**

1. **Mettre à jour la localisation:**
   - L'application met à jour automatiquement la position, mais vous pouvez forcer une mise à jour
   - Attendre quelques secondes pour que le GPS obtienne une position précise

2. **Vérifier que les deux positions sont à jour:**
   - Les positions peuvent être mises en cache
   - Attendre un moment et vérifier à nouveau

3. **Comprendre le calcul:**
   - La distance est calculée avec la formule de Haversine (distance à vol d'oiseau)
   - Ce n'est pas la distance routière, mais la distance géographique directe

### Permission de localisation refusée

**Symptômes:**
- L'application demande la permission mais elle est refusée
- Impossible d'activer le partage de localisation

**Solutions:**

1. **Réinitialiser les permissions:**
   - Sur iOS: Paramètres → Nightly → Réinitialiser les permissions
   - Sur Android: Paramètres → Apps → Nightly → Permissions → Réinitialiser

2. **Activer manuellement dans les paramètres système:**
   - Ne pas compter uniquement sur la demande de l'application
   - Aller dans les paramètres système de l'appareil

3. **Vérifier les paramètres de confidentialité:**
   - Certains appareils ont des paramètres de confidentialité stricts
   - Vérifier les paramètres système généraux

## Problèmes de streak

### Le streak ne s'incrémente pas

**Symptômes:**
- Après avoir complété un défi quotidien, le streak reste à 0
- Le streak n'augmente jamais

**Solutions:**

1. **Vérifier que les deux partenaires ont complété le défi:**
   - Le streak augmente uniquement si les deux partenaires complètent le défi quotidien
   - Vérifier que votre partenaire a également répondu

2. **Vérifier la date:**
   - Le streak s'incrémente uniquement si le défi a été complété le même jour
   - Si vous complétez le défi après minuit, il sera compté pour le jour précédent

3. **Vérifier la connexion au partenaire:**
   - Le streak nécessite que les deux partenaires soient connectés
   - Vérifier que le `partnerId` est bien défini dans Firestore

4. **Vérifier la collection `couples` dans Firestore:**
   - Les données de streak sont stockées dans la collection `couples`
   - Le document doit avoir l'ID formaté comme `{uid1}_{uid2}` (UIDs triés)

### Le streak est réinitialisé sans raison

**Symptômes:**
- Le streak revient à 0 alors que vous complétez les défis chaque jour
- Le streak est perdu après une mise à jour de l'application

**Solutions:**

1. **Comprendre les règles du streak:**
   - Le streak est réinitialisé si un jour est manqué
   - Si vous complétez le défi aujourd'hui mais pas hier, le streak recommence à 1

2. **Vérifier la date de dernière activité:**
   - Le streak vérifie automatiquement si vous avez manqué un jour
   - Cela se fait au lancement de l'application

3. **Vérifier la synchronisation Firestore:**
   - Assurez-vous que les données sont bien sauvegardées dans Firestore
   - Il peut y avoir un délai de synchronisation

### L'activité de la semaine ne s'affiche pas correctement

**Symptômes:**
- Les jours actifs ne sont pas affichés correctement
- L'activité de la semaine est vide

**Solutions:**

1. **Attendre le chargement:**
   - L'activité de la semaine peut prendre quelques secondes à charger
   - Vérifier que le hook `useCoupleStreak` a bien terminé le chargement

2. **Vérifier les données dans Firestore:**
   - L'activité est calculée à partir de `lastActivityDate` et `currentStreak`
   - Vérifier que ces champs sont corrects dans le document `couples`

## Problèmes de défis quotidiens

### Le défi quotidien ne s'affiche pas

**Symptômes:**
- Aucun défi n'apparaît dans la section "Your daily"
- Le message "Aucun défi disponible" s'affiche

**Solutions:**

1. **Vérifier la connexion au partenaire:**
   - Les défis quotidiens nécessitent qu'un partenaire soit connecté
   - Vérifier que `partnerId` est bien défini

2. **Vérifier la collection `coupleChallenges` dans Firestore:**
   - Les défis sont stockés avec l'ID `{coupleId}_{date}`
   - Vérifier que le document existe

3. **Vérifier la connexion Firestore:**
   - Assurez-vous que l'application a accès à Internet
   - Vérifier les règles Firestore pour la collection `coupleChallenges`

### La réponse au défi n'est pas enregistrée

**Symptômes:**
- Après avoir envoyé une réponse, elle disparaît
- Le défi reste marqué comme "non complété"

**Solutions:**

1. **Vérifier la connexion Internet:**
   - Les réponses sont sauvegardées dans Firestore
   - Vérifier que vous avez une connexion Internet active

2. **Vérifier les règles Firestore:**
   - Les utilisateurs doivent pouvoir écrire dans `coupleChallenges`
   - Vérifier les règles d'accès

3. **Réessayer:**
   - Parfois, il y a un délai de synchronisation
   - Réessayer après quelques secondes

### Le défi n'est pas marqué comme complété

**Symptômes:**
- Les deux partenaires ont répondu, mais le défi reste "en cours"
   - Le défi devrait être marqué comme complété automatiquement

**Solutions:**

1. **Vérifier que les deux réponses sont enregistrées:**
   - Le défi est complété uniquement si les deux utilisateurs ont répondu
   - Vérifier dans Firestore que le tableau `userResponses` contient 2 éléments

2. **Vérifier les UIDs:**
   - Les `userId` dans `userResponses` doivent correspondre aux UIDs des deux partenaires
   - Vérifier que les UIDs sont corrects

3. **Attendre la synchronisation:**
   - Il peut y avoir un délai entre l'enregistrement et l'affichage
   - Rafraîchir l'application pour voir la mise à jour

## Problèmes d'analytics

### Les événements analytics ne sont pas trackés

**Symptômes:**
- Les événements ne apparaissent pas dans Firebase Analytics
   - Les logs montrent que les événements sont envoyés mais ne sont pas visibles

**Solutions:**

1. **Vérifier la configuration Firebase:**
   - Vérifier que Firebase Analytics est bien configuré
   - Vérifier les clés API et la configuration dans `config/firebase.ts`

2. **Vérifier les délais:**
   - Firebase Analytics peut prendre jusqu'à 24h pour afficher les données
   - Les événements en temps réel peuvent prendre quelques minutes

3. **Vérifier les logs:**
   - Les événements sont loggés dans la console avec le préfixe `📊 Tracking:`
   - Vérifier que les événements sont bien envoyés

4. **Vérifier les limites:**
   - Firebase Analytics a des limites sur le nombre d'événements par jour
   - Vérifier que vous n'avez pas atteint les limites

## Problèmes généraux

### Les données ne se synchronisent pas entre les partenaires

**Symptômes:**
- Un partenaire voit des données différentes de l'autre
   - Les mises à jour ne sont pas visibles immédiatement

**Solutions:**

1. **Comprendre la synchronisation Firestore:**
   - Firestore synchronise en temps réel, mais il peut y avoir des délais
   - Les mises à jour peuvent prendre quelques secondes à apparaître

2. **Rafraîchir l'application:**
   - Fermer complètement l'application et la rouvrir
   - Cela force un rechargement complet des données

3. **Vérifier la connexion Internet:**
   - La synchronisation nécessite une connexion Internet active
   - Vérifier que les deux appareils sont connectés

4. **Vérifier les règles Firestore:**
   - Les règles doivent permettre la lecture et l'écriture pour les utilisateurs connectés
   - Vérifier les règles dans `firestore.rules`

### L'application se ferme lors de l'utilisation du système de couples

**Symptômes:**
- L'application plante lorsqu'on accède à l'écran couples
   - L'application se ferme lors de l'activation du GPS

**Solutions:**

1. **Vérifier les permissions:**
   - Certaines fonctionnalités nécessitent des permissions spécifiques
   - Vérifier que toutes les permissions nécessaires sont accordées

2. **Vérifier la version de l'application:**
   - S'assurer d'utiliser la dernière version de l'application
   - Les anciennes versions peuvent avoir des bugs

3. **Vérifier les logs:**
   - Consulter les logs de l'application pour identifier l'erreur
   - Rechercher les erreurs dans la console

4. **Réinstaller l'application:**
   - Si le problème persiste, réinstaller l'application
   - Sauvegarder d'abord les données importantes

### Performances lentes

**Symptômes:**
- L'écran couples met du temps à charger
   - Les interactions sont lentes

**Solutions:**

1. **Vérifier la connexion Internet:**
   - Une connexion lente peut ralentir le chargement des données
   - Utiliser une connexion Wi-Fi ou un réseau plus rapide

2. **Réduire les données chargées:**
   - Certains écrans chargent beaucoup de données
   - Attendre que le chargement initial soit terminé

3. **Vérifier les performances Firestore:**
   - Les requêtes Firestore peuvent être lentes si beaucoup de données
   - Vérifier les index Firestore pour optimiser les requêtes

4. **Vérifier les ressources de l'appareil:**
   - Les appareils plus anciens peuvent être plus lents
   - Fermer les autres applications pour libérer de la mémoire

## Support

Si vous continuez à rencontrer des problèmes après avoir essayé ces solutions, veuillez contacter le support à:

- Email: support@nightly.app
- Ou créez une issue sur le repository avec les détails du problème

## Notes techniques

### Structure des données Firestore

**Collection `users`:**
- `partnerId`: UID du partenaire connecté
- `coupleCode`: Code unique du couple
- `location`: Objet avec `latitude`, `longitude`, `timestamp`
- `locationSharingEnabled`: Boolean indiquant si le partage de localisation est activé

**Collection `couples`:**
- ID: `{uid1}_{uid2}` (UIDs triés)
- `currentStreak`: Nombre actuel de jours consécutifs
- `longestStreak`: Meilleur streak jamais atteint
- `lastActivityDate`: Date de la dernière activité (format YYYY-MM-DD)
- `lastActivityTimestamp`: Timestamp de la dernière activité

**Collection `coupleChallenges`:**
- ID: `{coupleId}_{date}` (date au format YYYY-MM-DD)
- `challenge`: Objet avec les détails du défi
- `date`: Date du défi
- `completed`: Boolean indiquant si le défi est complété
- `userResponses`: Tableau avec les réponses des deux partenaires
- `completedAt`: Date de complétion si complété

### Hooks disponibles

- `useCoupleLocation(partnerId)`: Gère la localisation GPS et la distance
- `useCoupleStreak(partnerId)`: Gère le streak et l'activité de la semaine
- `useDailyChallenge(partnerId)`: Gère les défis quotidiens

### Analytics trackés

- `couples_screen_viewed`: Quand l'écran couples est visualisé
- `couple_connected`: Quand deux utilisateurs se connectent
- `couple_disconnected`: Quand un couple se déconnecte
- `daily_challenge`: Quand un défi quotidien est démarré/complété/sauté
- `couple_streak_increased`: Quand le streak augmente
- `couple_streak_lost`: Quand le streak est perdu
- `couple_distance_calculated`: Quand la distance est calculée
- `location_sharing_toggled`: Quand le partage de localisation est activé/désactivé

