export default {
  // General
  app: {
    name: 'Nightly',
  },
  
  // Language screen
  language: {
    title: 'Language',
    selectLanguage: 'Select your preferred language for the application',
    updated: 'Language updated',
    updatedMessage: 'The application language has been changed.',
    error: 'Error',
    errorMessage: 'Unable to change language.',
  },

  // Navigation
  navigation: {
    back: 'Back',
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
  },

  // Error messages
  errors: {
    general: 'An error occurred',
    tryAgain: 'Please try again',
    networkError: 'Network error',
    authError: 'Authentication error',
  },

  // Authentication
  auth: {
    login: {
      title: 'Login',
      email: 'Email',
      password: 'Password',
      submit: 'Sign in',
      forgotPassword: 'Forgot password?',
      noAccount: 'No account?',
      signUp: 'Sign up',
      username: 'Your username',
      usernameRequired: 'Please enter your username',
      usernameLength: 'Username must be at least 3 characters',
      enterUsername: 'Enter your username to play',
      connecting: 'Connecting...',
      play: 'Play',
      selectCharacter: 'Choose your character',
      characterDescription: 'Select a character that represents you for the game',
    },
    register: {
      title: 'Register',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      submit: 'Sign up',
      haveAccount: 'Already have an account?',
      login: 'Sign in',
    },
  },

  // Profile
  profile: {
    title: 'Profile',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    username: 'Username',
    defaultUsername: 'Player',
    email: 'Email',
    bio: 'Bio',
    avatar: 'Profile Picture',
    changeAvatar: 'Change Picture',
    settings: 'Settings',
    logout: 'Logout',
    logoutError: 'An error occurred while logging out. Please try again.',
    contact: 'Contact Us',
    contactEmail: 'Send us an email at support@cosmicquest.com',
    buyAssetsTitle: 'Buy Assets',
    insufficientPoints: 'Insufficient Points',
    insufficientPointsMessage: 'You don\'t have enough points to unlock this asset.',
    success: 'Success',
    assetUnlocked: '{{asset}} has been successfully unlocked!',
    unlockError: 'An error occurred while unlocking the asset.',
    restorePurchases: 'Restore Purchases',
    restoring: 'Restoring...',
    restoreSuccess: 'Success',
    restoreSuccessMessage: 'Your purchases have been successfully restored',
    restoreError: 'An error occurred while restoring purchases',
    premium: {
      title: 'Premium Pass',
      try: 'Try Premium',
      free: 'Free 3 days',
      price: 'then $3.99/week',
      features: {
        unlock: 'Unlock all modes',
        weekly: 'New pack every week',
        friends: 'Free access for friends',
        cancel: 'Cancel anytime',
      },
    },
  },

  // Home
  home: {
    title: 'Home',
    welcome: 'Welcome',
    createGame: 'Create a game',
    joinGame: 'Join a game',
    enterCode: 'Enter code',
    join: 'Join',
    gameModes: {
      title: 'Game modes',
      classic: 'Classic',
      custom: 'Custom',
      quick: 'Quick',
    },
    errors: {
      noConnection: 'No internet connection. Please check your connection and try again.',
      loginRequired: 'You must be logged in to create a game room.',
      invalidSession: 'Your user session is invalid. Please log in again.',
      roomCreationFailed: 'Unable to create room',
      invalidCode: 'Invalid game code',
      roomNotFound: 'Room not found',
      gameStarted: 'This game has already started',
      roomFull: 'This game is full',
      notAuthenticated: 'User not authenticated',
      alreadyInGame: 'You are already in this game',
      serverTimeout: 'Server is taking too long to respond. Please try again.',
      networkError: 'Network error: check your internet connection',
      permissionDenied: 'Access denied: check Firestore security rules',
    },
    room: {
      create: 'Create room',
      join: 'Join room',
      code: 'Room code',
      players: 'Players',
      status: {
        waiting: 'Waiting',
        playing: 'Playing',
        finished: 'Finished',
      },
    },
    codePlaceholder: "Enter the game code",
    loading: "Connecting to the game...",
    categories: {
      nightly_modes: "SUGGESTION OF THE WEEK",
      same_room: "IN THE SAME ROOM",
      online: "REMOTE"
    },
    subtitles: {
      same_room: "Play together in the same room!",
      online: "Play even when you're not together"
    },
    games: {
      "listen-but-don-t-judge": {
        name: "LISTEN BUT DON'T JUDGE",
        description: "A free mode to have fun with friends.",
        tags: {
          free: "FREE"
        }
      },
      "truth-or-dare": {
        name: "TRUTH OR DARE",
        description: "The classic revisited with exclusive challenges.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "never-have-i-ever-hot": {
        name: "NEVER HAVE I EVER 🔞",
        description: "Naughty and inappropriate questions... Ready to own up?",
        tags: {
          premium: "PREMIUM"
        }
      },
      "genius-or-liar": {
        name: "GENIUS OR LIAR",
        description: "A fun mode where you must prove your knowledge or face the consequences.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "the-hidden-village": {
        name: "THE HIDDEN VILLAGE",
        description: "A game of bluff, strategy and discussions... for those who love accusing their friends 😈",
        tags: {
          premium: "PREMIUM"
        }
      },
      "trap-answer": {
        name: "Trap Answer",
        description: "A quiz where a wrong answer makes you lose points... Can you avoid the traps?",
        tags: {
          free: "FREE"
        }
      },
      "two-letters-one-word": {
        name: "2 Letters 1 Word",
        description: "Find a word that contains the two given letters and matches the theme.",
        tags: {
          free: "FREE",
          "new": "NEW",
          "premium": "PREMIUM"
        },
        score: "Score: {{score}}",
        theme: "Theme: {{theme}}",
        inputPlaceholder: "Enter your word...",
        verifyButton: "Verify",
        verifyingButton: "Verifying...",
        validWord: "Valid word!",
        validWordMessage: "You found a valid word!",
        invalidWord: "Invalid word",
        invalidWordMessage: "This word does not match the requested criteria.",
        noWordError: "Please enter a word",
        error: "An error occurred",
        howToPlay: "Find a word that contains the two given letters and matches the chosen theme.",
        // Theme translations
        "theme.marque": "a brand",
        "theme.ville": "a city",
        "theme.prenom": "a first name",
        "theme.pays": "a country",
        "theme.animal": "an animal",
        "theme.metier": "a job",
        "theme.sport": "a sport",
        "theme.fruit": "a fruit",
        "theme.legume": "a vegetable",
        "theme.objet": "an object",
        "exampleWord": "Example: {{word}}",
        "nextButton": "Next round",
        "noExampleAvailable": "No example available",
      },
      "word-guessing": {
        name: "GUESS THE WORD",
        description: "Make others guess a word without using forbidden words... A game of words and speed!",
        tags: {
          free: "FREE"
        }
      },
    },
    waitingForPlayersTitle: "Waiting for players",
    waitingForPlayersMessage: "Please wait for all players to submit their word.",
    actionNotAllowedTitle: "Action not allowed",
    onlyHostCanAdvance: "Only the host can advance to the next round.",
  },

  // Game
  game: {
    start: 'Start',
    join: 'Join',
    leave: 'Leave',
    players: 'Players',
    waiting: 'Waiting',
    yourTurn: 'Your turn',
    gameOver: 'Game Over',
    winner: 'Winner',
    draw: 'Draw',
    error: "Error",
    unknownMode: "Unknown game mode: {{mode}}",
    notFound: "No game document found for id: {{id}}",
    noMode: "No game mode found in the game document.",
    loading: "Loading...",
    results: {
      title: "Final Results",
      subtitle: "Congratulations everyone!",
      bravo: "Congratulations {{name}}!",
      points: "points",
      home: "Home",
      calculating: "Calculating results...",
      podium: {
        first: "1st place",
        second: "2nd place",
        third: "3rd place",
        others: "Other players",
        title: "Podium Ranking",
      },
      rank: "Rank",
      score: "Score",
      player: "Player",
      "two-letters-one-word": {
        title: "Game Over!",
        subtitle: "Thanks for playing 2 Letters 1 Word!",
        totalWords: "Words found",
        bestWord: "Best word",
        averageScore: "Average score",
        timePlayed: "Time played",
        newHighScore: "New high score!",
        shareResults: "Share results",
        playAgain: "Play again"
      },
      "word-guessing": {
        title: "Guess the Word",
        timer: "Time remaining",
        score: "Score",
        forbiddenWords: "Forbidden words",
        start: "Start",
        next: "Next word",
        found: "Word found!",
        forbidden: "Forbidden word used!",
        timeUp: "Time's up!",
        finalScore: "Final score",
        playAgain: "Play again"
      }
    },
    player: 'the player',
    round: 'Round {{count}}',
    truthOrDare: {
      title: 'Truth or Dare',
      choice: 'Choice',
      question: 'Question',
      action: 'Dare',
      submitChoice: 'Submit choice',
      submitAnswer: 'Submit answer',
      next: 'Next',
      endGame: 'End game',
      endTitle: 'Congratulations everyone!',
      endSubtitle: 'You finished the Truth or Dare game',
      home: 'Back to home',
      readAloud: 'Read aloud',
      targetChooses: '{{name}} chooses between Truth or Dare!',
      targetAnswers: '{{name}} answers the truth!',
      targetDoesDare: '{{name}} does the dare!',
      error: 'An error occurred',
      noQuestions: 'No questions available',
      errorNext: 'An error occurred when moving to the next round',
      naughtyRanking: 'Naughtiest ranking'
    },
    listenButDontJudge: {
      title: 'Listen but Don\'t Judge',
      question: 'Question',
      next: 'Next',
      endGame: 'End game',
      endTitle: 'Congratulations everyone!',
      endSubtitle: 'You finished the Listen but Don\'t Judge game',
      home: 'Back to home',
      readAloud: 'Read aloud',
      targetAnswers: '{{name}} answers!',
      error: 'An error occurred',
      noQuestions: 'No questions available',
      errorNext: 'An error occurred when moving to the next round'
    },
    neverHaveIEverHot: {
      never: "Never have I ever",
      ever: "I have already",
      waiting: "Waiting for the target player\'s choice...",
      prepare: "Get ready to answer!",
      submit: "Submit",
      next: "Next round",
      endGame: "End game",
      errorSubmit: "Unable to submit answer",
      endTitle: "Congratulations everyone!",
      endSubtitle: "You finished the Never Have I Ever 🔞 game",
      home: "Back to home",
      readAloud: "Read the question aloud",
      targetReads: "{{name}} reads the question",
      noQuestions: "No questions available",
      errorNext: "An error occurred when moving to the next round",
      naughtyRanking: "Naughtiest ranking"
    },
    geniusOrLiar: {
      title: 'Genius or Liar',
      question: 'Question',
      know: 'I know',
      dontKnow: 'I don\'t know',
      accuse: 'Accuse',
      submitAnswer: 'Submit answer',
      next: 'Next round',
      endGame: 'End game',
      endTitle: 'Congratulations everyone!',
      endSubtitle: 'You finished the Genius or Liar game',
      home: 'Back to home',
      readAloud: 'Read aloud',
      targetAnswers: '{{name}} answers!',
      error: 'An error occurred',
      noQuestions: 'No questions available',
      errorNext: 'An error occurred when moving to the next round',
      errorSubmit: 'Error submitting your answer or vote.'
    },
    theHiddenVillage: {
      title: 'THE HIDDEN VILLAGE',
      subtitle: 'A game of bluff and strategy',
      description: 'A game of bluff, strategy and discussions... for those who love accusing their friends 😈',
      principles: {
        title: '🌓 GAME PRINCIPLE',
        list: [
          'Each night, a "traitor" player eliminates another player.',
          'Each day, survivors discuss and vote to eliminate the one they suspect.',
          'Goal: unmask the culprit before they eliminate everyone.'
        ]
      },
      roles: {
        title: '🎭 ROLES',
        traitor: {
          name: 'The Traitor',
          description: 'Eliminates each night. Must survive.'
        },
        medium: {
          name: 'The Medium',
          description: 'Guesses if a player is a villager or traitor.'
        },
        protector: {
          name: 'The Protector',
          description: 'Protects a player each night.'
        },
        villager: {
          name: 'The Villager',
          description: 'No power. Votes wisely.'
        },
        liar: {
          name: 'The Liar',
          description: 'Fun role. Sows doubt.'
        }
      },
      objectives: {
        title: '🎯 OBJECTIVES',
        traitor: 'Traitor: eliminate everyone else without being caught.',
        village: 'Village: discover the traitor before they win.'
      }
    },
    trapAnswer: {
      title: "Trap Answer",
      question: "Question",
      next: "Next",
      endGame: "End game",
      endTitle: "Congratulations everyone!",
      endSubtitle: "You finished the Trap Answer game",
      home: "Back to home",
      readAloud: "Read aloud",
      targetAnswers: "{{name}} answers!",
      error: "An error occurred",
      noQuestions: "No questions available",
      errorNext: "An error occurred when moving to the next round",
      submit: "Submit",
      choices: "Choices",
      correctAnswer: "Correct answer!",
      wrongAnswer: "Wrong answer.",
      correct: "Correct",
      wrong: "Wrong",
      waitingForPlayers: "Waiting for other players...",
      playerAnswered: "{{count}} player has answered",
      playerAnswered_plural: "{{count}} players have answered",
      yourScore: "Your score",
      playerScores: "Player scores"
    },
    twoLettersOneWord: {
      score: "Score: {{score}}",
      theme: "Theme: {{theme}}",
      inputPlaceholder: "Enter your word...",
      verifyButton: "Verify",
      verifyingButton: "Verifying...",
      validWord: "Valid word!",
      validWordMessage: "You found a valid word!",
      invalidWord: "Invalid word",
      invalidWordMessage: "This word doesn\'t match the required criteria.",
      noWordError: "Please enter a word",
      error: "An error occurred",
      howToPlay: "Find a word that contains the two given letters and matches the chosen theme.",
      "theme.marque": "a brand",
      "theme.ville": "a city",
      "theme.prenom": "a first name",
      "theme.pays": "a country",
      "theme.animal": "an animal",
      "theme.metier": "a job",
      "theme.sport": "a sport",
      "theme.fruit": "a fruit",
      "theme.legume": "a vegetable",
      "theme.objet": "an object",
      "exampleWord": "Example: {{word}}",
      "nextButton": "Next round",
      "noExampleAvailable": "No example available",
    },
    word_guessing: {
      targetPlayer: 'Make {{player}} guess',
      forbiddenWords: 'Forbidden words',
      found: 'Word found!',
      forbidden: 'Forbidden word!',
      nextWord: 'Next word',
      categories: {
        lieux: 'Places',
        aliments: 'Food',
        transport: 'Transport',
        technologie: 'Technology',
        sports: 'Sports',
        loisirs: 'Hobbies',
        nature: 'Nature',
        objets: 'Objects',
        animaux: 'Animals',
      },
      guesserInstructions: 'Your friend is trying to make you guess a word!',
      guesserInfo: 'Listen carefully and try to find the word without them using the forbidden words.',
    },
  },

  // Settings
  settings: {
    title: 'Settings',
    language: 'Language',
    notifications: 'Notifications',
    theme: 'Theme',
    privacy: 'Privacy',
    about: 'About',
    help: 'Help',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    system: 'System',
    buyAssets: {
      title: 'Buy Assets',
      available: 'Available Assets',
      availableAssetsTitle: 'Available Assets',
      owned: 'Owned',
      cost: 'Cost',
      points: 'points',
      buy: 'Buy',
      confirm: 'Confirm Purchase',
      cancel: 'Cancel',
      success: 'Asset purchased successfully!',
      error: 'Error during purchase',
      insufficientPoints: 'Insufficient points',
      equip: 'Equip',
    },
  },

  // Splash Screen
  splash: {
    title: 'Nightly',
    subtitle: 'Ready to play',
    loading: 'Loading...',
  },

  // Rules translations
  rules: {
    title: 'GAME RULES',
    loading: 'Loading rules...',
    confirm: 'I have read the rules',
    confirmStart: 'I have read the rules, start the game',
    general: {
      title: 'GENERAL RULES',
      description: 'A player is randomly designated each turn.'
    },
    participation: {
      title: 'PARTICIPATION',
      description: 'All players must actively participate.'
    },
    scoring: {
      title: 'SCORING',
      description: 'Points are awarded according to the specific rules of the game.'
    }
  },

  room: {
    loading: "Loading room...",
    notFound: "Room not found",
    codeLabel: "Room code",
    codeCopied: "Code copied to clipboard",
    players: "{{count}} player",
    players_plural: "{{count}} players",
    host: "Host",
    ready: "Ready",
    rules: "Rules",
    rulesNotRead: "Please read the rules before starting the game.",
    iAmReady: "I am ready",
    startGame: "Start Game",
    inviteTitle: "Invite Friends",
    inviteMessage: "Join my game on Nightly! Code: {{code}}",
    error: "Error",
    errorLoading: "Unable to load the room",
    errorStart: "Unable to start the game",
    errorLeave: "Unable to leave the room",
    errorReady: "Unable to set ready",
    errorCopy: "Error copying the code",
    errorShare: "Error sharing",
    successCopy: "Code copied to clipboard",
    minPlayersRequired: "Minimum {{count}} players required",
    notEnoughPlayers: "Not enough players",
    rounds: "rounds",
    title: "Game Room"
  },

  topBar: {
    greeting: 'Hello',
    notifications: {
      title: 'Notifications',
      comingSoon: 'This feature will be available soon!'
    }
  },

  // Paywall
  paywall: {
    title: 'Nightly Premium',
    subtitle: 'UNLIMITED ACCESS',
    tagline: 'PLAY WITHOUT LIMITS',
    features: {
      unlimited: 'Unlimited access to all modes',
      weekly: 'New cards every week',
      visuals: 'Exclusive visual themes',
      characters: 'Character customization',
      updates: 'Priority updates'
    },
    plans: {
      weekly: {
        badge: 'PASS',
        title: 'Nightly Pass',
        period: 'per week',
        description: 'Perfect for a night out or a weekend with friends'
      },
      monthly: {
        badge: 'PARTY',
        title: 'Nightly Party',
        period: 'per month',
        description: 'For regular players'
      },
      annual: {
        badge: 'ALL ACCESS',
        title: 'Nightly All Access',
        period: 'per year',
        description: 'The ultimate offer for fans'
      }
    },
    cta: 'Start now',
    footer: {
      restore: 'Restore purchases',
      terms: 'Terms of Use'
    },
    alerts: {
      productUnavailable: {
        title: 'Product not available',
        message: 'The subscription is not available at the moment. Please try again later.'
      },
      success: {
        title: 'Success',
        message: 'Thank you for your purchase!'
      },
      pending: {
        title: 'Information',
        message: 'Your subscription has been processed but is not yet active. Please restart the app.'
      },
      error: {
        title: 'Error',
        message: 'Purchase failed. Please try again or choose another payment method.'
      },
      restoreSuccess: {
        title: 'Success',
        message: 'Your purchase has been restored!'
      },
      restoreError: {
        title: 'Error',
        message: 'Purchase restoration failed'
      },
      termsError: {
        title: 'Error',
        message: 'Unable to open Terms of Use'
      }
    },
    prices: {
      weekly: '3.99',
      monthly: '7.99',
      annual: '29.99',
      currency: '€'
    },
    freeTrial: 'Free 3-day trial',
  },

  assets: {
    avatars: {
      'avatar-panda': {
        name: 'Panda',
        description: 'An adorable panda for your profile'
      },
      'avatar-chat': {
        name: 'Cat',
        description: 'A cute and playful cat'
      },
      'avatar-chat-rare': {
        name: 'Mysterious Cat',
        description: 'A mysterious cat with glowing eyes'
      },
      'avatar-chat-rare-2': {
        name: 'Rare Cat',
        description: 'A rare cat with a unique design'
      },
      'avatar-crocodile': {
        name: 'Crocodile',
        description: 'An impressive crocodile'
      },
      'avatar-hibou': {
        name: 'Owl',
        description: 'A wise and mysterious owl'
      },
      'avatar-grenouille': {
        name: 'Frog',
        description: 'A magical and colorful frog'
      },
      'avatar-oiseau': {
        name: 'Bird',
        description: 'A bird with vibrant colors'
      },
      'avatar-renard': {
        name: 'Fox',
        description: 'A cunning and elegant fox'
      },
      'avatar-dragon': {
        name: 'Dragon',
        description: 'A majestic fire-breathing dragon'
      },
      'avatar-ourse': {
        name: 'Bear',
        description: 'A majestic bear'
      },
      'avatar-loup-rare': {
        name: 'Rare Wolf',
        description: 'A rare and mysterious wolf'
      },
      'avatar-dragon-rare': {
        name: 'Legendary Dragon',
        description: 'A majestic fire-breathing dragon'
      },
      'avatar-licorne': {
        name: 'Unicorn',
        description: 'A legendary unicorn'
      },
      'avatar-phoenix': {
        name: 'Phoenix',
        description: 'A legendary phoenix that rises from its ashes'
      }
    }
  },

  inviteModal: {
    title: "Invite Friends",
    roomCode: "Room Code",
    instruction: "Scan the QR code or share this code to invite your friends to the room.",
    shareButton: "Share"
  },

  // Common translations
  common: {
    ok: 'OK',
  },
}; 