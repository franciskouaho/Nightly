const fr = {
  // Général
  app: {
    name: "Nightly",
  },
  common: {
    cancel: "Annuler",
    validate: "Valider",
    ok: "OK",
    newBadge: "NOUVEAU",
    skip: "Passer",
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
    notificationsEnabled: "Notifications activées",
    notificationsEnabledMessage:
      "Vous recevrez maintenant des notifications de Nightly",
    notificationsDisabled: "Notifications désactivées",
    notificationsDisabledMessage:
      "Vous ne recevrez plus de notifications de Nightly",
    notificationsError: "Erreur",
    notificationsErrorMessage:
      "Impossible d'activer les notifications. Vérifiez les permissions dans les paramètres.",
    securedAccount: "Sécurisé",
  },

  // Liaison de compte
  linkAccount: {
    warning: "Compte non sécurisé",
    title: "SÉCURISEZ VOTRE COMPTE",
    description:
      "Liez votre compte à Google ou Apple pour ne jamais perdre votre progression, vos points et vos achats.",
    benefit1: "Sauvegarde automatique de vos données",
    benefit2: "Connexion sur plusieurs appareils",
    benefit3: "Récupération facile en cas de perte",
    linkGoogle: "Lier avec Google",
    linkApple: "Lier avec Apple",
    securityNote: "Vos données actuelles seront conservées lors de la liaison",
    successTitle: "Compte lié !",
    successMessage:
      "Votre compte a été lié avec succès à Google. Vos données sont maintenant sécurisées !",
    successAppleMessage:
      "Votre compte a été lié avec succès à Apple. Vos données sont maintenant sécurisées !",
    errorTitle: "Erreur",
    errorMessage: "Impossible de lier votre compte",
  },

  // Modal de liaison de compte
  linkAccountModal: {
    title: "Sécurisez votre compte !",
    description:
      "Votre compte n'est pas encore sécurisé. Liez-le maintenant et recevez :",
    reward: "3 JOURS PREMIUM GRATUIT",
    rewardValue: "Valeur : 5,99€",
    later: "Plus tard",
    successWithReward:
      "Votre compte a été lié avec succès ! Vous avez gagné 3 jours d'abonnement Premium gratuit ! 🎉",
  },

  // Accueil
  home: {
    title: "Accueil",
    welcome: "Bienvenue",
    createGame: "Créer une partie",
    joinGame: "Rejoindre une partie",
    enterCode: "Entrer le code",
    or: "ou",
    scanQR: "Scanner QR",
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
    codePlaceholder: "Entrez le code de la partie",
    loading: "Connexion à la partie...",
    categories: {
      free_games: "PREMIERS PAS",
      couple: "COUPLE",
      soirees: "SOIRÉES ENTRE POTES",
      distance: "À DISTANCE",
      events: "ÉVÉNEMENTS & SAISONNIERS",
      nightly_modes: "SUGGESTION DE LA SEMAINE",
      same_room: "DANS LA MÊME PIÈCE",
      online: "À DISTANCE",
      famille: "FAMILLE",
    },
    subtitles: {
      free_games: "Pour découvrir Nightly",
      couple: "Faire rêver et convertir",
      soirees: "Le cœur de Nightly",
      distance: "Même à distance, la soirée continue",
      events: "Édition limitée – disponible seulement quelques semaines !",
      nightly_modes: "",
      same_room: "À jouer dans la même pièce, ensemble !",
      online: "Pour jouer même quand on n'est pas ensemble",
      famille: "Pour tous les âges",
    },
    games: {
      "listen-but-don-t-judge": {
        name: "ON ÉCOUTE MAIS ON NE JUGE PAS",
        description: "Mode tranquille et drôle — storytelling.",
        tags: {
          soiree: "SOIRÉE",
          histoire: "HISTOIRE",
          humour: "HUMOUR",
          premium: "PREMIUM",
        },
      },
      "truth-or-dare": {
        name: "ACTION OU VÉRITÉ",
        description:
          "Classique de soirée — fun, rapide, parfait pour tester l'app.",
        tags: {
          gratuit: "GRATUIT",
          fun: "FUN",
          porte_entree: "PORTE D'ENTRÉE",
        },
      },
      "double-dare": {
        name: "DOUBLE DARE",
        description: "Deux joueurs. Zéro limite. Un seul mot d'ordre : oser 💀",
        tags: {
          couple: "COUPLE",
          defis: "DÉFIS",
          extreme: "EXTRÊME",
          premium: "PREMIUM",
        },
      },
      "forbidden-desire": {
        name: "DÉSIR INTERDIT",
        description: "Osez tout vous dire… ou assumez vos désirs interdits 🔥",
        tags: {
          couple: "COUPLE",
          extreme: "EXTRÊME",
          revelations: "RÉVÉLATIONS",
          premium: "PREMIUM",
        },
      },
      "never-have-i-ever-hot": {
        name: "HOT OR NOT",
        description:
          "Le jeu des défis et confidences de couple — 100 % spicy 😏",
        tags: {
          couple: "COUPLE",
          spicy: "SPICY",
          premium: "PREMIUM",
        },
      },
      "genius-or-liar": {
        name: "GENIUS OU MENTEUR",
        description: "Pour tester qui bluffe le mieux.",
        tags: {
          distance: "DISTANCE",
          bluff: "BLUFF",
          fun: "FUN",
          premium: "PREMIUM",
        },
      },
      "the-hidden-village": {
        name: "LE VILLAGE CACHÉ",
        description: "Mode social, bluff et rires (inspiré Loup-Garou).",
        tags: {
          soiree: "SOIRÉE",
          bluff: "BLUFF",
          groupe: "GROUPE",
          premium: "PREMIUM",
        },
      },
      "trap-answer": {
        name: "QUESTION PIÈGE",
        description: "Quiz fun où une mauvaise réponse fait perdre des points.",
        tags: {
          gratuit: "GRATUIT",
          quiz: "QUIZ",
          logique: "LOGIQUE",
          fun: "FUN",
        },
      },
      "pile-ou-face": {
        name: "PILE OU FACE",
        description:
          "Questions secrètes et pile ou face... Qui sera démasqué ? 🪙",
        tags: {
          gratuit: "GRATUIT",
          soiree: "SOIRÉE",
          hasard: "HASARD",
          fun: "FUN",
          revelations: "RÉVÉLATIONS",
        },
        round: "Tour {{current}} / {{total}}",
        whoPlays: "🎰 QUI VA JOUER ?",
        wheelSpinning: "La roue tourne...",
        itIs: "🎯 C'est {{name}} !",
        question: "📝 Question",
        mustChoose: "{{name}} doit choisir un joueur",
        choosePlayer: "Choisir un joueur",
        waiting: "En attente de {{name}}...",
        choosePlayerTitle: "🎯 Choisir un joueur",
        choosePlayerSubtitle: "Qui va répondre à ta question ?",
        announcement: "{{name}} a choisi : {{selected}}",
        coinFlipQuestion: "Mais quelle était la question ? 🤔",
        coinFlipInfo: "Si c'est FACE, la question sera révélée ! 😱",
        willFlip: "{{name}} va lancer la pièce...",
        revealTitle: "😱 LA QUESTION EST RÉVÉLÉE !",
        revealAnswer: "{{name}} a répondu : {{selected}}",
        resultsTitle: "🤐 SECRET GARDÉ !",
        resultsText: "{{name}} a eu de la chance !",
        resultsSubtext: "La question restera un mystère... pour toujours ! 🤫",
        nextRound: "Tour suivant",
        viewResults: "🏆 Voir les résultats",
        loading: "Chargement...",
        error: "Partie introuvable",
        modalCancel: "❌ Annuler",
      },
      "quiz-halloween": {
        name: "QUIZ HALLOWEEN",
        description: "Jeux festifs, drôles et spicy autour d'Halloween 🎃",
        tags: {
          saisonnier: "SAISONNIER",
          halloween: "HALLOWEEN",
          exclu: "EXCLU",
          premium: "PREMIUM",
        },
      },
      "two-letters-one-word": {
        name: "2 LETTRES 1 MOT",
        description:
          "Trouvez un mot qui contient les deux lettres données et correspond au thème.",
        tags: { free: "GRATUIT", new: "NOUVEAU", premium: "PREMIUM" },
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
        description: "Jeu de rapidité et créativité.",
        tags: {
          distance: "DISTANCE",
          rapidite: "RAPIDITÉ",
          creatif: "CRÉATIF",
          premium: "PREMIUM",
        },
      },
      "qui-de-nous-deux": {
        name: "QUI DE NOUS DEUX ?",
        description: "Le jeu des vérités qui piquent et font rire.",
        tags: {
          couple: "COUPLE",
          drole: "DRÔLE",
          intime: "INTIME",
          premium: "PREMIUM",
        },
      },
      "romantic-truth": {
        name: "ROMANTIC TRUTH",
        description: "Mode plus doux, questions émotionnelles et complicité.",
        tags: {
          couple: "COUPLE",
          romantique: "ROMANTIQUE",
          emotion: "ÉMOTION",
          premium: "PREMIUM",
        },
      },
      "never-have-i-ever-classic": {
        name: "JE N'AI JAMAIS",
        description: "Les vérités qui tournent mal 😭",
        tags: {
          couple: "COUPLE",
          drole: "DRÔLE",
          gages: "GAGES",
          premium: "PREMIUM",
        },
      },
      "dare-or-strip": {
        name: "DARE OR STRIP",
        description:
          "Gage sexy ou retirer un vêtement... À vous de choisir ! 💋",
        tags: {
          couple: "COUPLE",
          "18plus": "18+",
          premium: "PREMIUM",
        },
      },
      "blindtest-generations": {
        name: "BLIND TEST GÉNÉRATIONS",
        description: "Devine les musiques de toutes les générations ! 🎵",
        tags: {
          famille: "FAMILLE",
          musique: "MUSIQUE",
          gratuit: "GRATUIT",
        },
      },
    },
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
      noAssets: "Aucun objet n'est disponible pour le moment.",
      owned: "Possédé",
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
    noMode: "Aucun mode de jeu trouvé dans le document de jeu.",
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
      yes: "Oui",
      no: "Non",
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
    "pile-ou-face": {
      viewResults: "🏆 Voir les résultats",
      nextRound: "Tour suivant",
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
    subtitle: "Jeux de soirée",
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

  // Paywall (corrigé, sans doublon)
  paywall: {
    title: "⭐ Nightly Premium ⭐",
    subtitle: "NOEL SPECIAL",
    tagline: "JOUEZ SANS LIMITES",
    features: {
      unlimited: "Accès illimité à tous les modes",
      weekly: "Nouvelles cartes chaque semaine",
      visuals: "Ambiances visuelles exclusives",
      characters: "Personnalisation des personnages",
      updates: "Mises à jour prioritaires",
    },
    plans: {
      weekly: {
        title: "Essai Gratuit",
        badge: "GRATUIT",
        period: "3 jours",
        description: "Testez toutes les fonctionnalités",
      },
      monthly: {
        title: "Mensuel",
        badge: "POPULAIRE",
        period: "par mois",
        description: "Accès complet à tout",
      },
      annual: {
        title: "Annuel",
        badge: "ÉCONOMIE",
        period: "par an",
        description: "Économisez plus de 50%",
      },
    },
    freeTrial: "3 JOURS",
    cta: "COMMENCER L'ESSAI",
    annual: {
      title: "🔥 OFFRE LIMITÉE 🔥",
      subtitle: "ÉCONOMISEZ PLUS DE 50%",
      tagline: "Ne ratez pas cette opportunité unique !",
      features: {
        savings: "Économisez plus de 30€ par an",
      },
      discount: "de réduction",
      savingsText: "Économisez {amount} {currency}",
      cta: "PROFITER DE L'OFFRE",
    },
    alerts: {
      productUnavailable: {
        title: "Produit indisponible",
        message: "Ce produit n'est pas disponible pour le moment.",
      },
      success: {
        title: "Félicitations !",
        message: "Votre abonnement a été activé avec succès !",
      },
      pending: {
        title: "En attente",
        message: "Votre achat est en cours de traitement.",
      },
      error: {
        title: "Erreur",
        message: "Une erreur est survenue lors de l'achat.",
      },
      restoreSuccess: {
        title: "Restauration réussie",
        message: "Vos achats ont été restaurés avec succès !",
      },
      restoreError: {
        title: "Erreur de restauration",
        message: "Impossible de restaurer vos achats.",
      },
      termsError: {
        title: "Erreur",
        message: "Impossible d'ouvrir les conditions d'utilisation.",
      },
    },
    footer: {
      restore: "Restaurer les achats",
      terms: "Conditions d'utilisation",
    },
    leaderboard: {
      title: "🏆 Classement Général",
      subtitle: "Les meilleurs joueurs de Nightly",
      loading: "Chargement du classement...",
      empty: "Aucun joueur dans le classement",
      emptySubtext: "Jouez pour apparaître ici !",
      rank: "Rang",
      points: "Points",
      games: "parties",
      winRate: "victoires",
      refresh: "Actualiser",
    },
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
      // Assets sans préfixe (pour buy-assets)
      panda: {
        name: "Panda",
        description: "Un adorable panda",
      },
      chatRare: {
        name: "Chat Mystérieux",
        description: "Un chat mystérieux et rare",
      },
      chatRare2: {
        name: "Chat Rare",
        description: "Un autre chat rare",
      },
      crocodile: {
        name: "Crocodile",
        description: "Un crocodile féroce",
      },
      dragon: {
        name: "Dragon",
        description: "Un dragon majestueux",
      },
      hibou: {
        name: "Hibou",
        description: "Un hibou sage",
      },
      licorne: {
        name: "Licorne",
        description: "Une licorne magique",
      },
      "loup-rare": {
        name: "Loup Rare",
        description: "Un loup rare et puissant",
      },
      ourse: {
        name: "Ourse",
        description: "Une ourse protectrice",
      },
      phoenix: {
        name: "Phénix",
        description: "Un phoenix légendaire",
      },
      "avart-dragon-rare": {
        name: "Dragon Rare",
        description: "Un dragon rare et puissant",
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

  // Onboarding
  onboarding: {
    name: {
      title: "AVANT DE COMMENCER,\nQUEL EST TON NOM ?",
      placeholder: "Entre ton nom",
      continue: "Continuer",
    },
    age: {
      title: "SALUT {{name}},\nQUEL EST TON ÂGE ?",
      selectDate: "Sélectionner une date",
      cancel: "Annuler",
      ok: "OK",
      disclaimer:
        "Tes réponses sont juste pour toi,\ngardées complètement confidentielles pour personnaliser\nton expérience",
      continue: "Continuer",
    },
    gender: {
      title: "QUEL EST TON GENRE ?",
      female: "Femme",
      male: "Homme",
      other: "Autre",
      disclaimer:
        "Tes réponses sont juste pour toi,\ngardées complètement confidentielles pour personnaliser\nton expérience",
      continue: "Continuer",
    },
    goals: {
      title: "QUE VEUX-TU DE PLUS\nDANS TA RELATION ?",
      warning: "Ton partenaire ne verra pas cela",
      knowBetter: "Mieux connaître mon partenaire",
      spiceUp: "Pimenter les choses",
      haveFun: "S'amuser",
      continue: "Continuer",
    },
    profile: {
      title: "CHOISIS TON\nAVATAR",
      subtitle: "Sélectionne un avatar qui te représente",
      loading: "Chargement des avatars...",
      error: "Impossible de charger les avatars.",
      noAvatars: "Aucun avatar disponible pour le moment.",
      continue: "Continuer",
    },
    account: {
      title: "PRESQUE TERMINÉ ! SÉCURISE\nTON COMPTE",
      subtitle:
        "Crée un compte pour sauvegarder ton historique d'activité et\nrevisiter facilement tes conversations favorites à tout moment !",
      signInGoogle: "Se connecter avec Google",
      signInApple: "Se connecter avec Apple",
    },
    ready: {
      title: "PRÊT QUAND TU L'ES,\n{{name}} !",
      subtitle: "Plongeons dans des moments inoubliables\nensemble.",
      letsGo: "C'est parti",
    },
    notifications: {
      title: "Activez les notifications",
      example:
        "Pierre vient de répondre à votre défi quotidien ✨ vous pouvez maintenant écouter la réponse !",
      benefit1: "Pas de notifications publicitaires",
      benefit2: "Écoutez les réponses dès qu'elles sont disponibles",
      benefit3: "Ne perdez pas vos séries",
      button: "Activer les notifications",
    },
    loading: {
      preTitle: "juste un instant...",
      title: "NOUS CONSTRUISONS\nLA MEILLEURE EXPÉRIENCE\nPOUR TOI !",
      step1: "Analyse de tes intérêts",
      step2: "Sélection des meilleures questions",
      step3: "Personnalisation de ton expérience",
    },
  },

  // Login
  login: {
    title: "CONTENT DE TE REVOIR !",
    subtitle:
      "Connecte-toi pour continuer ton parcours et\naccéder à tes conversations sauvegardées",
    signInGoogle: "Se connecter avec Google",
    signInApple: "Se connecter avec Apple",
  },

  // Welcome
  welcome: {
    title: "PRÊT À REDÉCOUVRIR\nTON ÂME SŒUR ?",
    subtitle:
      "Améliore tes conversations avec des questions qui vont bien au-delà de 'Comment ça va ?'",
    startForFree: "Commencer gratuitement",
    alreadyHaveAccount: "J'ai déjà un compte",
  },

  // Couples
  couples: {
    partnerNotConnected: {
      title: "Votre partenaire est à un pas de vous rejoindre.",
      subtitle:
        "Dès qu'il accepte, vous pourrez commencer à vous connecter quotidiennement et découvrir de nouvelles façons de vous rapprocher.",
      resendCode: "Renvoyer mon code",
      enterCode: "Entrer un code",
      enterCodeSubtitle:
        "Entrez le code que votre partenaire vous a partagé pour vous connecter.",
      codePlaceholder: "Entrer le code...",
      yourCode: "Votre code",
      codeHint: "Partagez ce code avec votre partenaire",
      codeCopied: "Code copié !",
      codeCopiedMessage: "Le code a été copié dans votre presse-papiers.",
    },
  },
};

export default fr;
