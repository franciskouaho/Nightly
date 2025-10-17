const fr = {
  // Général
  app: {
    name: "Nightly",
  },

  // Écran de langue
  language: {
    title: "Langue",
    selectLanguage: "Sélectionnez votre langue préférée pour l'application",
    updated: "Langue mise à jour",
    updatedMessage: "La langue de l'application a été modifiée.",
    error: "Erreur",
    errorMessage: "Impossible de changer la langue.",
  },

  // Navigation
  navigation: {
    back: "Retour",
    home: "Accueil",
    profile: "Profil",
    settings: "Paramètres",
  },

  // Messages d'erreur
  errors: {
    general: "Une erreur est survenue",
    tryAgain: "Veuillez réessayer",
    networkError: "Erreur de connexion",
    authError: "Erreur d'authentification",
  },

  // Authentification
  auth: {
    login: {
      title: "Connexion",
      email: "Email",
      password: "Mot de passe",
      submit: "Se connecter",
      forgotPassword: "Mot de passe oublié ?",
      noAccount: "Pas de compte ?",
      signUp: "S'inscrire",
      username: "Votre pseudo",
      usernameRequired: "Veuillez entrer votre pseudo",
      usernameLength: "Le pseudo doit contenir au moins 3 caractères",
      enterUsername: "Entrez votre pseudo pour jouer",
      connecting: "Connexion...",
      play: "Jouer",
      selectCharacter: "Choisissez votre personnage",
      characterDescription:
        "Sélectionnez un personnage qui vous représente pour la partie",
      subtitle: "Connectez-vous pour commencer à jouer",
    },
    register: {
      title: "Inscription",
      email: "Email",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      submit: "S'inscrire",
      haveAccount: "Déjà un compte ?",
      login: "Se connecter",
    },
  },

  // Profil
  profile: {
    title: "Profil",
    edit: "Modifier",
    save: "Enregistrer",
    cancel: "Annuler",
    username: "Nom d'utilisateur",
    defaultUsername: "Joueur",
    email: "Email",
    bio: "Biographie",
    avatar: "Photo de profil",
    changeAvatar: "Changer la photo",
    settings: "Paramètres",
    logout: "Déconnexion",
    logoutError:
      "Une erreur est survenue lors de la déconnexion. Veuillez réessayer.",
    contact: "Nous contacter",
    contactEmail: "Envoyez-nous un email à support@cosmicquest.com",
    buyAssetsTitle: "Acheter des assets",
    insufficientPoints: "Points insuffisants",
    insufficientPointsMessage:
      "Vous n'avez pas assez de points pour débloquer cet asset.",
    success: "Succès",
    assetUnlocked: "{{asset}} a été débloqué avec succès !",
    unlockError: "Une erreur est survenue lors du déblocage de l'asset.",
    restorePurchases: "Restaurer les achats",
    restoring: "Restauration...",
    restoreSuccess: "Succès",
    restoreSuccessMessage: "Vos achats ont été restaurés avec succès",
    restoreError: "Une erreur est survenue lors de la restauration des achats",
    avatarChanged: "Votre photo de profil a été mise à jour avec succès !",
    avatarChangeError:
      "Une erreur est survenue lors du changement de photo de profil.",
    premium: {
      title: "Passe Premium",
      try: "Essayer le premium",
      free: "Gratuit 3 jours",
      price: "puis 3,99€ par semaine",
      features: {
        unlock: "Débloque tous les modes",
        weekly: "Un nouveau pack chaque semaine",
        friends: "Accès gratuit pour tes amis",
        cancel: "Résiliable à tout moment",
      },
    },
  },

  // Accueil
  home: {
    title: "Accueil",
    welcome: "Bienvenue",
    createGame: "Créer une partie",
    joinGame: "Rejoindre une partie",
    enterCode: "Entrer le code",
    join: "Rejoindre",
    gameModes: {
      title: "Modes de jeu",
      classic: "Classique",
      custom: "Personnalisé",
      quick: "Rapide",
    },
    errors: {
      noConnection:
        "Pas de connexion internet. Veuillez vérifier votre connexion et réessayer.",
      loginRequired: "Vous devez être connecté pour créer une salle de jeu.",
      invalidSession:
        "Votre session utilisateur est invalide. Veuillez vous reconnecter.",
      roomCreationFailed: "Impossible de créer la salle",
      invalidCode: "Code de partie invalide",
      roomNotFound: "Salle introuvable",
      gameStarted: "Cette partie a déjà commencé",
      roomFull: "Cette partie est pleine",
      notAuthenticated: "Utilisateur non authentifié",
      alreadyInGame: "Vous êtes déjà dans cette partie",
      serverTimeout:
        "Le serveur met trop de temps à répondre. Veuillez réessayer.",
      networkError: "Erreur réseau : vérifiez votre connexion internet",
      permissionDenied:
        "Accès refusé : vérifiez les règles de sécurité Firestore",
    },
    room: {
      create: "Créer une salle",
      join: "Rejoindre une salle",
      code: "Code de la salle",
      players: "Joueurs",
      status: {
        waiting: "En attente",
        playing: "En cours",
        finished: "Terminée",
      },
    },
    codePlaceholder: "Entre le code de la partie",
    loading: "Connexion à la partie...",
    categories: {
      events: "ÉVÉNEMENTS",
      nightly_modes: "SUGGESTION DE LA SEMAINE",
      same_room: "DANS LA MÊME PIÈCE",
      online: "À DISTANCE",
    },
    subtitles: {
      events: "Jeux spéciaux pour les occasions particulières",
      same_room: "À jouer dans la même pièce, ensemble !",
      online: "Pour jouer même quand on n'est pas ensemble",
    },
    games: {
      "listen-but-don-t-judge": {
        name: "ON ÉCOUTE MAIS ON NE JUGE PAS",
        description: "Un mode premium pour rigoler tranquillement entre potes.",
        tags: {
          premium: "PREMIUM",
        },
      },
      "truth-or-dare": {
        name: "ACTION OU VÉRITÉ",
        description: "Le classique revisité avec des défis exclusifs.",
        tags: {
          premium: "PREMIUM",
        },
      },
      "never-have-i-ever-hot": {
        name: "JE N'AI JAMAIS 🔞",
        description: "Questions coquines et déplacées... Prêts à assumer ?",
        tags: {
          premium: "PREMIUM",
        },
      },
      "genius-or-liar": {
        name: "GENIE OU MENTEUR",
        description:
          "Un mode ludique où vous devez prouver vos connaissances ou assumer vos gages.",
        tags: {
          premium: "PREMIUM",
        },
      },
      "the-hidden-village": {
        name: "LE VILLAGE CACHÉ",
        description:
          "Un jeu de bluff, de stratégie et de discussions... pour ceux qui aiment accuser leurs potes 😈",
        tags: {
          premium: "PREMIUM",
        },
      },
      "trap-answer": {
        name: "QUESTION PIÈGE",
        description:
          "Un quiz où une mauvaise réponse te fait perdre des points... Pourras-tu éviter les pièges ?",
        tags: {
          free: "GRATUIT",
        },
      },
      "quiz-halloween": {
        name: "QUIZ HALLOWEEN 🎃",
        description:
          "Testez vos connaissances sur Halloween avec des questions effrayantes !",
        tags: {
          halloween: "HALLOWEEN",
          premium: "PREMIUM",
        },
      },
      "two-letters-one-word": {
        name: "2 LETTRES 1 MOT",
        description:
          "Trouvez un mot qui contient les deux lettres données et correspond au thème.",
        tags: {
          free: "GRATUIT",
          new: "NOUVEAU",
          premium: "PREMIUM",
        },
        score: "Score : {{score}}",
        theme: "Thème : {{theme}}",
        inputPlaceholder: "Entrez votre mot...",
        verifyButton: "Vérifier",
        verifyingButton: "Vérification...",
        validWord: "Mot valide !",
        validWordMessage: "Vous avez trouvé un mot valide !",
        invalidWord: "Mot invalide",
        invalidWordMessage: "Ce mot ne correspond pas aux critères demandés.",
        noWordError: "Veuillez entrer un mot",
        error: "Une erreur est survenue",
        howToPlay:
          "Trouvez un mot qui contient les deux lettres données et correspond au thème choisi.",
        "theme.marque": "une marque",
        "theme.ville": "une ville",
        "theme.prenom": "un prénom",
        "theme.pays": "un pays",
        "theme.animal": "un animal",
        "theme.metier": "un métier",
        "theme.sport": "un sport",
        "theme.fruit": "un fruit",
        "theme.legume": "un légume",
        "theme.objet": "un objet",
        exampleWord: "Exemple : {{word}}",
        nextButton: "Tour suivant",
        playerCountError: "Le jeu se joue de 1 à 4 joueurs.",
        noExampleAvailable: "Aucun exemple disponible",
      },
      "word-guessing": {
        name: "DEVINE LE MOT",
        description:
          "Faites deviner un mot sans utiliser les mots interdits... Un jeu de mots et de rapidité !",
        tags: {
          premium: "PREMIUM",
        },
      },
    },
  },

  // Common translations
  common: {
    ok: "OK",
    loading: "Chargement...",
    lumicoins: "Lumicoins",
  },

  // Settings
  settings: {
    title: "Paramètres",
    language: "Langue",
    notifications: "Notifications",
    theme: "Thème",
    privacy: "Confidentialité",
    about: "À propos",
    help: "Aide",
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
    system: "Système",
    buyAssets: {
      title: "Acheter des assets",
      available: "Assets disponibles",
      availableAssetsTitle: "Assets disponibles",
      owned: "Possédés",
      cost: "Coût",
      buy: "Acheter",
      notAvailable: "Indisponible",
      equip: "Équiper",
      points: "points",
      confirm: "Confirmer l'achat",
      cancel: "Annuler",
      success: "Asset acheté avec succès !",
      error: "Erreur lors de l'achat",
      insufficientPoints: "Points insuffisants",
    },
  },

  // Game
  game: {
    round: "Tour {{current}}/{{total}}",
    start: "Démarrer",
    join: "Rejoindre",
    leave: "Quitter la partie",
    players: "Joueurs",
    waiting: "En attente",
    yourTurn: "Votre tour",
    gameOver: "Fin de la partie",
    winner: "Vainqueur",
    draw: "Égalité",
    error: "Erreur",
    unknownMode: "Mode de jeu inconnu : {{mode}}",
    notFound: "Aucun document de jeu trouvé pour l'id : {{id}}",
    noMode: "Aucun mode de jeu trouvé dans le document de jeux.",
    loading: "Chargement...",
    results: {
      title: "Résultats Finaux",
      subtitle: "Félicitations à tous !",
      bravo: "Félicitations {{name}} !",
      points: "points",
      home: "Accueil",
      calculating: "Calcul des résultats...",
      podium: {
        first: "1ère place",
        second: "2ème place",
        third: "3ème place",
        others: "Autres joueurs",
        title: "Classement du Podium",
      },
      rank: "Classement",
      score: "Score",
      player: "Joueur",
      "two-letters-one-word": {
        title: "Fin de la partie !",
        subtitle: "Merci d'avoir joué à 2 Lettres 1 Mot !",
        totalWords: "Mots trouvés",
        bestWord: "Meilleur mot",
        averageScore: "Score moyen",
        timePlayed: "Temps joué",
        newHighScore: "Nouveau record !",
        shareResults: "Partager les résultats",
        playAgain: "Rejouer",
      },
      "word-guessing": {
        title: "Devine le Mot",
        timer: "Temps restant",
        score: "Score",
        forbiddenWords: "Mots interdits",
        start: "Démarrer",
        next: "Mot suivant",
        found: "Mot trouvé !",
        forbidden: "Mot interdit utilisé !",
        timeUp: "Temps écoulé !",
        finalScore: "Score final",
        playAgain: "Rejouer",
      },
      naughty: {
        title: "Classement des plus coquins",
      },
      yourCurrentRank: "Votre rang actuel",
    },
    player: "le joueur",
    truthOrDare: {
      title: "Action ou Vérité",
      choice: "Choix",
      question: "Question",
      action: "Action",
      submitChoice: "Envoyer le choix",
      submitAnswer: "Envoyer la réponse",
      next: "Suivant",
      endGame: "Fin de la partie",
      endTitle: "Félicitations à tous !",
      endSubtitle: "Vous avez terminé le jeu Action ou Vérité",
      home: "Retour à l'accueil",
      readAloud: "Lire à voix haute",
      targetChooses: "{{name}} choisit entre Action ou Vérité !",
      targetAnswers: "{{name}} répond à la vérité !",
      targetDoesDare: "{{name}} fait l'action !",
      error: "Une erreur est survenue",
      noQuestions: "Aucune question disponible",
      errorNext: "Une erreur est survenue lors du passage au tour suivant",
      naughtyRanking: "Classement coquin",
      truth: "Vérité",
      dare: "Action",
      chooseTask: "Choisis : Action ou Vérité ?",
      isThinking: "réfléchit...",
      willChoose: "va choisir",
      or: "ou",
      iAnswered: "J'ai répondu",
      iRefuse: "Je passe mon tour",
      voteInProgress: "Vote en cours",
      otherPlayersDecide: "Les autres joueurs décident si",
      playedGame: "a joué le jeu",
      votes: "votes",
      vote: "Vote",
      did: "Est-ce que",
      thanksVote: "Merci pour ton vote !",
      yes: "Oui",
      no: "Non",
      round: "Manche",
      roundEnd: "Fin de la manche pour",
      scores: "Scores",
      errorSelectingQuestion: "Erreur lors de la sélection de la question",
      noQuestionsAvailable: "Aucune question disponible pour ce choix",
    },
    listenButDontJudge: {
      title: "On Écoute Mais On Ne Juge Pas",
      question: "Question",
      next: "Suivant",
      endGame: "Fin de la partie",
      endTitle: "Félicitations à tous !",
      endSubtitle: "Vous avez terminé le jeu On Écoute Mais On Ne Juge Pas",
      home: "Retour à l'accueil",
      readAloud: "Lire à voix haute",
      targetAnswers: "{{name}} répond !",
      error: "Une erreur est survenue",
      noQuestions: "Aucune question disponible",
      errorNext: "Une erreur est survenue lors du passage au tour suivant",
      waiting: "En attente des autres joueurs...",
      answered: "Vous avez déjà répondu. En attente des autres joueurs...",
      alreadyAnswered: "Vous avez déjà répondu à cette question",
      answerPlaceholder: "Écrivez votre réponse ici...",
      submit: "Soumettre",
      errorSubmit: "Erreur lors de la soumission",
      waitingForOthers: "En attente des autres votes...",
      waitingVote: "En attente du vote du joueur cible...",
      voteTitle: "Choisissez la meilleure réponse",
    },

    neverHaveIEverHot: {
      never: "Je n'ai jamais",
      ever: "J'ai déjà",
      waiting: "En attente du choix du joueur cible...",
      prepare: "Prépare-toi à répondre !",
      submit: "Envoyer",
      next: "Tour suivant",
      endGame: "Fin de la partie",
      errorSubmit: "Impossible d'envoyer la réponse",
      endTitle: "Félicitations à tous !",
      endSubtitle: "Vous avez terminé le jeu Je n'ai jamais 🔞",
      home: "Retour à l'accueil",
      readAloud: "Lis la question à voix haute",
      targetReads: "{{name}} lit la question",
      noQuestions: "Aucune question disponible",
      errorNext: "Une erreur est survenue lors du passage au tour suivant",
      naughtyRanking: "Classement coquin",
    },
    geniusOrLiar: {
      // --- Main UI Keys from screenshots ---
      accuseTitle: "Qui est le menteur ?",
      pretendKnows: "prétend savoir",
      accuseNoOne: "N'accuser personne",
      roundResults: "Résultats de la manche",
      correctAnswerLabel: "La bonne réponse était : {{answer}}",
      givenAnswerLabel: "Ta réponse : {{answer}}",
      drinks: "gages",

      // --- Player Statuses ---
      playerStatus: {
        wrongAnswer: "Mauvaise réponse",
        dontKnow: "Ne savait pas la réponse",
        correctAnswer: "Bonne réponse !",
        correctButAccused: "Génie, mais accusé !",
        liarNotAccused: "Le mensonge est passé !",
        liarAccused: "Menteur, et démasqué !",
      },
      accuserStatus: {
        correctAccusation: "Bien vu !",
        wrongAccusation: "Fausse accusation !",
      },

      // --- General Gameplay ---
      answerPlaceholder: "Votre réponse...",
      validate: "Valider",
      know: "Je sais",
      dontKnow: "Je ne sais pas",
      accuse: "Accuser",
      nextRound: "Manche suivante",
      showResults: "Afficher les résultats",
      endGame: "Afficher les résultats finaux",
      chooseGameMode: "Choisissez le mode de jeu",
      pointsMode: "Points",
      forfeitsMode: "Gages",
      points: "points",
      forfeit: "gage",
      forfeits: "gages",

      // --- Waiting / Info Text ---
      yourAnswer: "Votre réponse",
      waitingForPlayers: "En attente des autres joueurs...",
      waitingForAnswers: "En attente que les autres joueurs répondent...",
      waitingForVotes: "En attente que les autres joueurs votent...",
      playersWhoKnow: "Joueurs qui prétendent savoir :",
      playersWhoDontKnow: "Joueurs qui ne savent pas :",
      noOneKnows: "Personne ne connaissait la réponse !",
      allPlayersKnow: "Tout le monde connaissait la réponse !",
      wasAccused: "A été accusé",
      accusedBy: "Accusé par {{count}}",

      // --- Error / Edge Cases ---
      errorSubmit: "Erreur lors de la soumission de la réponse.",
      noQuestionAvailable: "Aucune question disponible pour ce jeu.",
      incorrectQuestionFormat: "Format de question incorrect (ID : {{id}})",
      modeSelectError: "Erreur lors de la sélection du mode de jeu.",

      // --- Question Categories ---
      questionTypes: {
        cultureG: "Culture Générale",
        cultureGHard: "Culture Générale (Difficile)",
        culturePop: "Culture Pop",
        cultureGeek: "Culture Geek",
        cultureArt: "Art",
        hard: "Difficile",
        devinette: "Devinette",
        verite: "Vérité",
      },
    },
    theHiddenVillage: {
      title: "LE VILLAGE CACHÉ",
      subtitle: "Un jeu de bluff et de stratégie",
      description:
        "Un jeu de bluff, de stratégie et de discussions... pour ceux qui aiment accuser leurs potes 😈",
      principles: {
        title: "🌓 PRINCIPE DU JEU",
        list: [
          'Chaque nuit, un joueur "traître" élimine un autre joueur.',
          "Chaque jour, les survivants débattent et votent pour éliminer celui qu'ils soupçonnent.",
          "Objectif : démasquer le coupable avant qu'il n'élimine tout le monde.",
        ],
      },
      roles: {
        title: "🎭 RÔLES",
        traitor: {
          name: "Le Traître",
          description: "Élimine chaque nuit. Doit survivre.",
        },
        medium: {
          name: "Le Médium",
          description: "Devine si un joueur est un villageois ou un traître.",
        },
        protector: {
          name: "Le Protecteur",
          description: "Protège un joueur chaque nuit.",
        },
        villager: {
          name: "Le Villageois",
          description: "Sans pouvoir. Votez sagement.",
        },
        liar: {
          name: "Le Menteur",
          description: "Rôle amusant. Sème le doute.",
        },
      },
      objectives: {
        title: "🎯 OBJECTIFS",
        traitor: "Traître : éliminer tous les autres sans se faire prendre.",
        village: "Village : découvrir le traître avant qu'il ne gagne.",
      },
    },
    trapAnswer: {
      title: "Question Piège",
      question: "Question",
      next: "Suivant",
      endGame: "Fin de la partie",
      endTitle: "Félicitations à tous !",
      endSubtitle: "Vous avez terminé le jeu Question Piège",
      home: "Accueil",
      readAloud: "Lire à voix haute",
      targetAnswers: "{{name}} répond !",
      error: "Une erreur est survenue",
      noQuestions: "Aucune question disponible",
      errorNext: "Une erreur est survenue lors du passage au tour suivant",
      submit: "Envoyer",
      choices: "Choix",
      correctAnswer: "Bonne réponse !",
      wrongAnswer: "Mauvaise réponse.",
      correct: "Correct",
      wrong: "Faux",
      waitingForPlayers: "En attente des autres joueurs...",
      playerAnswered: "{{count}} joueur a répondu",
      playerAnswered_plural: "{{count}} joueurs ont répondu",
      yourScore: "Votre score",
      playerScores: "Scores des joueurs",
    },
    twoLettersOneWord: {
      score: "Score : {{score}}",
      theme: "Thème : {{theme}}",
      inputPlaceholder: "Entrez votre mot...",
      verifyButton: "Vérifier",
      verifyingButton: "Vérification...",
      validWord: "Mot valide !",
      validWordMessage: "Vous avez trouvé un mot valide !",
      invalidWord: "Mot invalide",
      invalidWordMessage: "Ce mot ne correspond pas aux critères demandés.",
      noWordError: "Veuillez entrer un mot",
      error: "Une erreur est survenue",
      howToPlay:
        "Trouvez un mot qui contient les deux lettres données et correspond au thème choisi.",
      "theme.marque": "une marque",
      "theme.ville": "une ville",
      "theme.prenom": "un prénom",
      "theme.pays": "un pays",
      "theme.animal": "un animal",
      "theme.metier": "un métier",
      "theme.sport": "un sport",
      "theme.fruit": "un fruit",
      "theme.legume": "un légume",
      "theme.objet": "un objet",
      exampleWord: "Exemple : {{word}}",
      nextButton: "Tour suivant",
      noExampleAvailable: "Aucun exemple disponible",
    },
    waitingForPlayersTitle: "En attente des joueurs",
    waitingForPlayersMessage:
      "Veuillez attendre que tous les joueurs aient soumis leur mot.",
    actionNotAllowedTitle: "Action non autorisée",
    onlyHostCanAdvance: "Seul l'hôte peut passer au tour suivant.",
    word_guessing: {
      targetPlayer: "Fais deviner à {{player}}",
      forbiddenWords: "Mots interdits",
      guesserInstructions: "Votre ami essaie de vous faire deviner un mot !",
      guesserInfo:
        "Écoutez attentivement et essayez de trouver le mot sans qu'il utilise les mots interdits.",
      found: "Mot trouvé !",
      forbidden: "Mot interdit !",
      nextWord: "Mot suivant",
      categories: {
        lieux: "Lieux",
        aliments: "Aliments",
        transport: "Transport",
        technologie: "Technologie",
        sports: "Sports",
        loisirs: "Loisirs",
        nature: "Nature",
        objets: "Objets",
        animaux: "Animaux",
      },
    },
  },

  // Splash Screen
  splash: {
    title: "Nightly",
    subtitle: "Prêt à jouer",
    loading: "Chargement...",
  },

  // Règles
  rules: {
    title: "RÈGLES DU JEU",
    loading: "Chargement des règles...",
    confirm: "J'ai lu les règles",
    confirmStart: "J'ai lu les règles, démarrer la partie",
    general: {
      title: "RÈGLES GÉNÉRALES",
      description: "Un joueur est désigné au hasard à chaque tour.",
    },
    participation: {
      title: "PARTICIPATION",
      description: "Tous les joueurs doivent participer activement.",
    },
    scoring: {
      title: "ATTRIBUTION DES POINTS",
      description:
        "Les points sont attribués selon les règles spécifiques du jeu.",
    },
  },

  room: {
    loading: "Chargement de la salle...",
    notFound: "Salle introuvable",
    codeLabel: "Code de la salle",
    codeCopied: "Code copié dans le presse-papiers",
    players: "{{count}} joueur",
    players_plural: "{{count}} joueurs",
    host: "Hôte",
    ready: "Prêt",
    rules: "Règles",
    rulesNotRead: "Veuillez lire les règles avant de démarrer la partie.",
    iAmReady: "Je suis prêt",
    startGame: "Démarrer la partie",
    inviteTitle: "Rejoins ma partie",
    inviteMessage: "Rejoins ma partie sur Nightly ! Code : {{code}}",
    error: "Erreur",
    errorLoading: "Impossible de charger la salle",
    errorStart: "Impossible de démarrer la partie",
    errorLeave: "Impossible de quitter la salle",
    errorReady: "Impossible de se mettre prêt",
    errorCopy: "Erreur lors de la copie du code",
    errorShare: "Erreur lors du partage",
    successCopy: "Code copié dans le presse-papiers",
    minPlayersRequired: "Minimum {{count}} joueurs requis",
    notEnoughPlayers: "Pas assez de joueurs",
    rounds: "tours",
    title: "Salle de jeu",
  },

  topBar: {
    greeting: "Bonjour",
    notifications: {
      title: "Notifications",
      comingSoon: "Cette fonctionnalité arrive bientôt !",
    },
  },

  // Paywall
  paywall: {
    title: "🎃 Nightly Premium 🎃",
    subtitle: "HALLOWEEN SPECIAL",
    tagline: "JOUEZ SANS LIMITES DANS L'OBSCURITÉ",
    features: {
      unlimited: "Accès illimité à tous les modes",
      weekly: "Nouvelles cartes chaque semaine",
      visuals: "Ambiances visuelles exclusives",
      characters: "Personnalisation des personnages",
      updates: "Mises à jour prioritaires",
    },
    plans: {
      weekly: {
        badge: "PASS",
        title: "Nightly Pass",
        period: "par semaine",
        description: "Parfait pour une soirée ou un week-end entre amis",
      },
      monthly: {
        badge: "PARTY",
        title: "Nightly Party",
        period: "par mois",
        description: "Pour ceux qui jouent régulièrement",
      },
      annual: {
        badge: "ALL ACCESS",
        title: "Nightly All Access",
        period: "par an",
        description: "L'offre ultime pour les fans",
      },
    },
    cta: "Commencer maintenant",
    footer: {
      restore: "Restaurer les achats",
      terms: "CGU",
    },
    alerts: {
      productUnavailable: {
        title: "Produit non disponible",
        message:
          "L'abonnement n'est pas disponible pour le moment. Veuillez réessayer plus tard.",
      },
      success: {
        title: "Succès",
        message: "Merci pour votre achat!",
      },
      pending: {
        title: "Information",
        message:
          "Votre abonnement a été traité mais n'est pas encore actif. Veuillez redémarrer l'application.",
      },
      error: {
        title: "Erreur",
        message:
          "L'achat a échoué. Veuillez réessayer ou choisir un autre moyen de paiement.",
      },
      restoreSuccess: {
        title: "Succès",
        message: "Votre achat a été restauré!",
      },
      restoreError: {
        title: "Erreur",
        message: "La restauration des achats a échoué",
      },
      termsError: {
        title: "Erreur",
        message: "Impossible d'ouvrir les CGU",
      },
    },
    prices: {
      weekly: "3,99",
      monthly: "7,99",
      annual: "29,99",
      currency: "€",
    },
    freeTrial: "Gratuit 3 jours",
  },

  assets: {
    avatars: {
      "avatar-panda": {
        name: "Panda",
        description: "Un adorable panda pour votre profil",
      },
      "avatar-chat": {
        name: "Chat",
        description: "Un chat mignon et joueur",
      },
      "avatar-chat-rare": {
        name: "Chat Mystérieux",
        description: "Un chat mystérieux aux yeux brillants",
      },
      "avatar-chat-rare-2": {
        name: "Chat Rare",
        description: "Un chat rare avec un design unique",
      },
      "avatar-crocodile": {
        name: "Crocodile",
        description: "Un crocodile impressionnant",
      },
      "avatar-hibou": {
        name: "Hibou",
        description: "Un hibou sage et mystérieux",
      },
      "avatar-grenouille": {
        name: "Grenouille",
        description: "Une grenouille magique et colorée",
      },
      "avatar-oiseau": {
        name: "Oiseau",
        description: "Un oiseau aux couleurs vives",
      },
      "avatar-renard": {
        name: "Renard",
        description: "Un renard rusé et élégant",
      },
      "avatar-dragon": {
        name: "Dragon",
        description: "Un dragon majestueux cracheur de feu",
      },
      "avatar-ourse": {
        name: "Ourse",
        description: "Une ourse majestueuse",
      },
      "avatar-loup-rare": {
        name: "Loup Rare",
        description: "Un loup rare et mystérieux",
      },
      "avatar-dragon-rare": {
        name: "Dragon Légendaire",
        description: "Un dragon majestueux cracheur de feu",
      },
      "avatar-licorne": {
        name: "Licorne",
        description: "Une licorne légendaire",
      },
      "avatar-phoenix": {
        name: "Phénix",
        description: "Un phénix légendaire qui renaît de ses cendres",
      },
    },
  },

  inviteModal: {
    title: "Inviter des amis",
    roomCode: "Code de la salle",
    instruction:
      "Scanne le QR code ou partage ce code pour inviter tes amis dans la salle.",
    shareButton: "Partager",
  },

  ads: {
    title: "Regardez une pub pour avoir 3 manches en plus !",
  },
};

export default fr;
