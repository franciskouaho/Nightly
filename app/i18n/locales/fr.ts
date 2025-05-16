export default {
  // Général
  app: {
    name: 'Nightly',
  },
  
  // Écran de langue
  language: {
    title: 'Langue',
    selectLanguage: 'Sélectionnez votre langue préférée pour l\'application',
    updated: 'Langue mise à jour',
    updatedMessage: 'La langue de l\'application a été modifiée.',
    error: 'Erreur',
    errorMessage: 'Impossible de changer la langue.',
  },

  // Navigation
  navigation: {
    back: 'Retour',
    home: 'Accueil',
    profile: 'Profil',
    settings: 'Paramètres',
  },

  // Messages d'erreur
  errors: {
    general: 'Une erreur est survenue',
    tryAgain: 'Veuillez réessayer',
    networkError: 'Erreur de connexion',
    authError: 'Erreur d\'authentification',
  },

  // Authentification
  auth: {
    login: {
      title: 'Connexion',
      email: 'Email',
      password: 'Mot de passe',
      submit: 'Se connecter',
      forgotPassword: 'Mot de passe oublié ?',
      noAccount: 'Pas de compte ?',
      signUp: 'S\'inscrire',
      username: 'Votre pseudo',
      usernameRequired: 'Veuillez entrer votre pseudo',
      usernameLength: 'Le pseudo doit contenir au moins 3 caractères',
      enterUsername: 'Entrez votre pseudo pour jouer',
      connecting: 'Connexion...',
      play: 'Jouer',
    },
    register: {
      title: 'Inscription',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      submit: 'S\'inscrire',
      haveAccount: 'Déjà un compte ?',
      login: 'Se connecter',
    },
  },

  // Profil
  profile: {
    title: 'Profil',
    edit: 'Modifier',
    save: 'Enregistrer',
    cancel: 'Annuler',
    username: 'Nom d\'utilisateur',
    defaultUsername: 'Joueur',
    email: 'Email',
    bio: 'Biographie',
    avatar: 'Photo de profil',
    changeAvatar: 'Changer la photo',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    logoutError: 'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.',
    contact: 'Nous contacter',
    contactEmail: 'Envoyez-nous un email à support@cosmicquest.com',
    premium: {
      title: 'Passe Premium',
      try: 'Essayer le premium',
      free: 'Gratuit 3 jours',
      price: 'puis 3,99€ par semaine',
      features: {
        unlock: 'Débloque tous les modes',
        weekly: 'Un nouveau pack chaque semaine',
        friends: 'Accès gratuit pour tes amis',
        cancel: 'Résiliable à tout moment',
      },
    },
  },

  // Accueil
  home: {
    title: 'Accueil',
    welcome: 'Bienvenue',
    createGame: 'Créer une partie',
    joinGame: 'Rejoindre une partie',
    enterCode: 'Entrer le code',
    join: 'Rejoindre',
    gameModes: {
      title: 'Modes de jeu',
      classic: 'Classique',
      custom: 'Personnalisé',
      quick: 'Rapide',
    },
    errors: {
      noConnection: 'Pas de connexion internet. Veuillez vérifier votre connexion et réessayer.',
      loginRequired: 'Vous devez être connecté pour créer une salle de jeu.',
      invalidSession: 'Votre session utilisateur est invalide. Veuillez vous reconnecter.',
      roomCreationFailed: 'Impossible de créer la salle',
      invalidCode: 'Code de partie invalide',
      roomNotFound: 'Salle introuvable',
      gameStarted: 'Cette partie a déjà commencé',
      roomFull: 'Cette partie est pleine',
      notAuthenticated: 'Utilisateur non authentifié',
      alreadyInGame: 'Vous êtes déjà dans cette partie',
      serverTimeout: 'Le serveur met trop de temps à répondre. Veuillez réessayer.',
      networkError: 'Erreur réseau : vérifiez votre connexion internet',
      permissionDenied: 'Accès refusé : vérifiez les règles de sécurité Firestore',
    },
    room: {
      create: 'Créer une salle',
      join: 'Rejoindre une salle',
      code: 'Code de la salle',
      players: 'Joueurs',
      status: {
        waiting: 'En attente',
        playing: 'En cours',
        finished: 'Terminée',
      },
    },
    codePlaceholder: "Entre le code de la partie",
    loading: "Connexion à la partie...",
    categories: {
      nightly_modes: "SUGGESTION DE LA SEMAINE",
      same_room: "DANS LA MÊME PIÈCE",
      online: "À DISTANCE"
    },
    subtitles: {
      same_room: "À jouer dans la même pièce, ensemble !",
      online: "Pour jouer même quand on n'est pas ensemble"
    },
    games: {
      "listen-but-don-t-judge": {
        name: "ON ÉCOUTE MAIS ON NE JUGE PAS",
        description: "Un mode gratuit pour rigoler tranquillement entre potes.",
        tag: "GRATUIT"
      },
      "truth-or-dare": {
        name: "ACTION OU VÉRITÉ",
        description: "Le classique revisité avec des défis exclusifs.",
        tag: "PREMIUM"
      },
      "never-have-i-ever-hot": {
        name: "JE N'AI JAMAIS 🔞",
        description: "Questions coquines et déplacées... Prêts à assumer ?",
        tag: "PREMIUM"
      },
      "genius-or-liar": {
        name: "GENIE OU MENTEUR",
        description: "Un mode ludique où vous devez prouver vos connaissances ou assumer vos gages.",
        tag: "PREMIUM"
      }
    }
  },

  // Paramètres
  settings: {
    title: 'Paramètres',
    language: 'Langue',
    notifications: 'Notifications',
    theme: 'Thème',
    privacy: 'Confidentialité',
    about: 'À propos',
    help: 'Aide',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    system: 'Système',
  },

  // Jeu
  game: {
    start: 'Commencer',
    join: 'Rejoindre',
    leave: 'Quitter',
    players: 'Joueurs',
    waiting: 'En attente',
    yourTurn: 'À votre tour',
    gameOver: 'Partie terminée',
    winner: 'Gagnant',
    draw: 'Match nul',
    error: "Erreur",
    unknownMode: "Mode de jeu inconnu: {{mode}}",
    notFound: "Aucun document de jeu trouvé pour l'id: {{id}}",
    noMode: "Aucun mode de jeu trouvé dans le document games.",
    loading: "Chargement...",
    results: {
      title: "Résultats finaux",
      subtitle: "Félicitations à tous !",
      bravo: "Bravo {{name}} !",
      points: "points",
      home: "Accueil",
      calculating: "Calcul des résultats..."
    },
    player: 'le joueur',
    listenButDontJudge: {
      waiting: "En attente des autres joueurs...",
      waitingVote: "En attente du vote du joueur cible...",
      submit: "Soumettre",
      vote: "Voter",
      next: "Tour suivant",
      voteTitle: "Choisissez la meilleure réponse",
      answerPlaceholder: "Écrivez votre réponse ici...",
      round: "Tour",
      errorSubmit: "Impossible de soumettre la réponse",
      errorVote: "Impossible de soumettre le vote",
      errorNext: "Une erreur est survenue lors du passage au tour suivant",
      noQuestions: "Aucune question disponible",
      endTitle: "Fin de la partie !",
      endSubtitle: "Merci d'avoir joué !"
    },
    truthOrDare: {
      truth: "Vérité !",
      dare: "Action !",
      chooseTask: "Choisis ton défi",
      isThinking: "réfléchit...",
      willChoose: "Va-t-il choisir",
      or: "ou",
      action: "Action",
      iAnswered: "J'ai répondu",
      iRefuse: "Je refuse",
      voteInProgress: "Vote en cours",
      otherPlayersDecide: "Les autres joueurs décident si",
      playedGame: "a relevé le défi",
      vote: "Votez",
      did: "Est-ce que",
      yes: "Oui",
      no: "Non",
      thanksVote: "Merci pour votre vote !",
      votes: "votes",
      round: "Tour",
      roundEnd: "Fin du tour pour",
      scores: "Scores",
      next: "Tour suivant",
      submit: "Soumettre",
      errorSubmit: "Impossible de soumettre la réponse",
      errorVote: "Impossible de soumettre le vote",
      errorNext: "Une erreur est survenue lors du passage au tour suivant",
      endTitle: "Fin de la partie !",
      endSubtitle: "Merci d'avoir joué à Action ou Vérité !"
    },
    geniusOrLiar: {
      know: "Je sais !",
      dontKnow: "Je ne sais pas",
      accuse: "Accuser",
      skip: "Passer",
      submit: "Soumettre",
      next: "Tour suivant",
      validate: "Valider",
      answerPlaceholder: "Écrivez votre réponse ici...",
      errorSubmit: "Impossible de soumettre la réponse",
      errorVote: "Impossible de soumettre l'accusation",
      errorNext: "Une erreur est survenue lors du passage au tour suivant",
      endTitle: "Fin de la partie !",
      endSubtitle: "Merci d'avoir joué à Génie ou Menteur !",
      noQuestions: "Aucune question disponible",
      allQuestionsUsed: "Toutes les questions ont été utilisées",
      waitingForPlayers: "En attente des autres joueurs...",
      chooseGameMode: "Choisissez votre mode de jeu",
      pointsMode: "MODE POINTS",
      gagesMode: "MODE GAGES",
      accuseTitle: "Accuse quelqu'un de mentir !",
      accuseNoOne: "Je ne veux accuser personne",
      pretendKnows: "Prétend savoir",
      accusedBy: "Accusé par {{count}} joueur(s)",
      correctAnswer: "Réponse correcte : {{answer}}",
      playerStatus: {
        dontKnow: "Ne savait pas",
        correctAnswer: "Bonne réponse",
        correctButAccused: "Bonne réponse mais accusé",
        liarNotAccused: "A menti sans être accusé",
        liarAccused: "A menti et accusé"
      },
      accuserStatus: {
        correctAccusation: "Bonne accusation",
        wrongAccusation: "Accusation à tort",
        against: "contre {{name}}"
      }
    },
    neverHaveIEverHot: {
      never: "Je n'ai jamais",
      ever: "J'ai déjà",
      waiting: "En attente du choix du joueur cible...",
      prepare: "Préparez-vous à répondre !",
      submit: "Soumettre",
      next: "Tour suivant",
      endGame: "Terminer le jeu",
      errorSubmit: "Impossible de soumettre la réponse",
      endTitle: "Félicitations à tous !",
      endSubtitle: "Vous avez terminé la partie Je n'ai jamais 🔞",
      home: "Retour à l'accueil",
      readAloud: "Lis la question à haute voix",
      targetReads: "{{name}} lit la question",
      noQuestions: "Aucune question disponible",
      errorNext: "Une erreur est survenue lors du passage au tour suivant"
    }
  },

  // Splash Screen
  splash: {
    title: 'Nightly',
    subtitle: 'Préparez-vous à jouer',
    loading: 'Chargement...',
  },

  // Règles
  rules: {
    title: 'RÈGLES DU JEU',
    loading: 'Chargement des règles...',
    confirm: 'J\'ai lu les règles',
    confirmStart: 'J\'ai lu les règles, démarrer la partie',
    general: {
      title: 'RÈGLES GÉNÉRALES',
      description: 'Un joueur est désigné aléatoirement à chaque tour.'
    },
    participation: {
      title: 'PARTICIPATION',
      description: 'Tous les joueurs doivent participer activement.'
    },
    scoring: {
      title: 'SCORING',
      description: 'Les points sont attribués selon les règles spécifiques du jeu.'
    }
  },

  room: {
    loading: "Chargement de la salle...",
    notFound: "Salle introuvable",
    codeLabel: "Code de la salle",
    codeCopied: "Code copié dans le presse-papiers",
    players: "Joueurs",
    host: "Hôte",
    ready: "Prêt !",
    rules: "règles",
    rulesNotRead: "Veuillez lire les règles avant de démarrer la partie.",
    iAmReady: "Je suis prêt !",
    startGame: "Démarrer la partie",
    inviteTitle: "Rejoins ma partie",
    inviteMessage: "Rejoins ma partie sur Nightly ! Code: {{code}}",
    error: "Erreur",
    errorLoading: "Impossible de charger la salle",
    errorStart: "Impossible de démarrer la partie",
    errorLeave: "Impossible de quitter la salle",
    errorReady: "Impossible de se mettre prêt",
    errorCopy: "Erreur lors de la copie du code",
    errorShare: "Erreur lors du partage",
    successCopy: "Code copié dans le presse-papiers",
    minPlayers: "Il faut au moins 2 joueurs pour démarrer la partie.",
    allReady: "Tous les joueurs sont prêts !",
    waiting: "En attente des autres joueurs..."
  },

  topBar: {
    greeting: 'Bonjour',
    notifications: {
      title: 'Notifications',
      comingSoon: 'Cette fonctionnalité sera bientôt disponible !'
    }
  },

  paywall: {
    title: 'Nightly Premium',
    subtitle: 'UNLIMITED ACCESS',
    tagline: 'JOUEZ SANS LIMITES',
    features: {
      unlimited: 'Accès illimité à tous les modes',
      weekly: 'Nouvelles cartes chaque semaine',
      visuals: 'Ambiances visuelles exclusives',
      characters: 'Personnalisation des personnages',
      updates: 'Mises à jour prioritaires'
    },
    plans: {
      weekly: {
        badge: 'PASS',
        title: 'Nightly Pass',
        period: 'par semaine',
        description: 'Parfait pour une soirée ou un week-end entre amis'
      },
      monthly: {
        badge: 'PARTY',
        title: 'Nightly Party',
        period: 'par mois',
        description: 'Pour ceux qui jouent régulièrement'
      },
      annual: {
        badge: 'ALL ACCESS',
        title: 'Nightly All Access',
        period: 'par an',
        description: 'L\'offre ultime pour les fans'
      }
    },
    cta: 'Commencer maintenant',
    footer: {
      restore: 'Restaurer les achats',
      terms: 'CGU'
    },
    alerts: {
      productUnavailable: {
        title: 'Produit non disponible',
        message: 'L\'abonnement n\'est pas disponible pour le moment. Veuillez réessayer plus tard.'
      },
      success: {
        title: 'Succès',
        message: 'Merci pour votre achat!'
      },
      pending: {
        title: 'Information',
        message: 'Votre abonnement a été traité mais n\'est pas encore actif. Veuillez redémarrer l\'application.'
      },
      error: {
        title: 'Erreur',
        message: 'L\'achat a échoué. Veuillez réessayer ou choisir un autre moyen de paiement.'
      },
      restoreSuccess: {
        title: 'Succès',
        message: 'Votre achat a été restauré!'
      },
      restoreError: {
        title: 'Erreur',
        message: 'La restauration des achats a échoué'
      },
      termsError: {
        title: 'Erreur',
        message: 'Impossible d\'ouvrir les CGU'
      }
    },
    prices: {
      weekly: '3,99',
      monthly: '7,99',
      annual: '29,99',
      currency: '€'
    },
    freeTrial: 'Gratuit 3 jours',
  },
}; 