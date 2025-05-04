# Détails des Tests - Nightly

## Informations Générales

- **Version**: 0.0.1
- **Plateformes**: iOS et Android
- **Interface**: Portrait uniquement

## Éléments à Tester

### 1. Configuration de Base

- [ ] Vérifier que l'application se lance correctement
- [ ] Confirmer que le logo s'affiche correctement sur l'écran d'accueil
- [ ] Vérifier que l'interface s'adapte correctement au mode clair/sombre (userInterfaceStyle: automatic)

### 2. Authentification Firebase

- [ ] Tester le processus d'inscription
- [ ] Tester la connexion
- [ ] Vérifier la déconnexion
- [ ] Tester la réinitialisation du mot de passe

### 3. Navigation (Expo Router)

- [ ] Vérifier que toutes les routes fonctionnent correctement
- [ ] Tester la navigation entre les écrans
- [ ] Vérifier que le bouton retour fonctionne correctement

### 4. Fonctionnalités Spécifiques

- [ ] Tester la localisation (expo-localization)
- [ ] Vérifier que les assets se chargent correctement
- [ ] Tester le chargement des images

### 5. Compatibilité iOS

- [ ] Vérifier le support tablette
- [ ] Tester sur différentes versions d'iOS
- [ ] Confirmer que les notifications Firebase fonctionnent

### 6. Compatibilité Android

- [ ] Vérifier l'affichage de l'icône adaptative
- [ ] Tester sur différentes tailles d'écran
- [ ] Confirmer que les notifications Firebase fonctionnent

## Points d'Attention

- L'application utilise la nouvelle architecture React Native (newArchEnabled: true)
- Les services Firebase sont intégrés, vérifier particulièrement ces fonctionnalités
- L'application supporte le mode portrait uniquement

## Comment Signaler un Bug

1. Décrire le problème de manière détaillée
2. Préciser la plateforme (iOS/Android)
3. Indiquer la version du système d'exploitation
4. Fournir les étapes pour reproduire le bug
5. Ajouter des captures d'écran si possible

## Contacts

En cas de questions ou de problèmes critiques, contacter l'équipe de développement.
