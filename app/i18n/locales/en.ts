const en = {
  // General
  app: {
    name: 'Nightly',
  },
  
  // Language Screen
  language: {
    title: 'Language',
    selectLanguage: 'Select your preferred language for the application',
    updated: 'Language Updated',
    updatedMessage: 'The application language has been changed.',
    error: 'Error',
    errorMessage: 'Could not change the language.',
  },

  // Navigation
  navigation: {
    back: 'Back',
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
  },

  // Error Messages
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
      submit: 'Log in',
      forgotPassword: 'Forgot password?',
      noAccount: 'No account?',
      signUp: 'Sign up',
      username: 'Your nickname',
      usernameRequired: 'Please enter your nickname',
      usernameLength: 'Nickname must be at least 3 characters long',
      enterUsername: 'Enter your nickname to play',
      connecting: 'Connecting...',
      play: 'Play',
      selectCharacter: 'Choose your character',
      characterDescription: 'Select a character that represents you for the game',
    },
    register: {
      title: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      submit: 'Sign up',
      haveAccount: 'Already have an account?',
      login: 'Log in',
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
    avatar: 'Profile picture',
    changeAvatar: 'Change picture',
    settings: 'Settings',
    logout: 'Log out',
    logoutError: 'An error occurred while logging out. Please try again.',
    contact: 'Contact us',
    contactEmail: 'Send us an email at support@cosmicquest.com',
    buyAssetsTitle: 'Buy assets',
    insufficientPoints: 'Insufficient points',
    insufficientPointsMessage: 'You do not have enough points to unlock this asset.',
    success: 'Success',
    assetUnlocked: '{{asset}} has been successfully unlocked!',
    unlockError: 'An error occurred while unlocking the asset.',
    restorePurchases: 'Restore purchases',
    restoring: 'Restoring...',
    restoreSuccess: 'Success',
    restoreSuccessMessage: 'Your purchases have been successfully restored',
    restoreError: 'An error occurred while restoring purchases',
    avatarChanged: 'Your profile picture has been successfully updated!',
    avatarChangeError: 'An error occurred while changing your profile picture.',
    premium: {
      title: 'Premium Pass',
      try: 'Try premium',
      free: '3 days free',
      price: 'then €3.99 per week',
      features: {
        unlock: 'Unlock all modes',
        weekly: 'A new pack every week',
        friends: 'Free access for your friends',
        cancel: 'Cancel anytime',
      },
    },
  },

  // Home
  home: {
    title: 'Home',
    welcome: 'Welcome',
    createGame: 'Create game',
    joinGame: 'Join game',
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
      roomCreationFailed: 'Could not create the room',
      invalidCode: 'Invalid game code',
      roomNotFound: 'Room not found',
      gameStarted: 'This game has already started',
      roomFull: 'This game is full',
      notAuthenticated: 'User not authenticated',
      alreadyInGame: 'You are already in this game',
      serverTimeout: 'The server is taking too long to respond. Please try again.',
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
      events: "EVENTS",
      nightly_modes: "SUGGESTION OF THE WEEK",
      same_room: "IN THE SAME ROOM",
      online: "REMOTE"
    },
    subtitles: {
      events: "Special games for special occasions",
      same_room: "To be played in the same room, together!",
      online: "To play even when you are not together"
    },
    games: {
      "listen-but-don-t-judge": {
        name: "WE LISTEN BUT WE DON'T JUDGE",
        description: "A free mode for a good laugh with friends.",
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
        description: "A fun mode where you have to prove your knowledge or face the consequences.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "the-hidden-village": {
        name: "THE HIDDEN VILLAGE",
        description: "A game of bluffing, strategy, and discussion... for those who like to accuse their friends 😈",
        tags: {
          premium: "PREMIUM"
        }
      },
      "trap-answer": {
        name: "Trap Question",
        description: "A quiz where a wrong answer makes you lose points... Can you avoid the traps?",
        tags: {
          free: "FREE"
        }
      },
      "quiz-halloween": {
        name: "HALLOWEEN QUIZ 🎃",
        description: "Test your knowledge about Halloween with scary questions!",
        tags: {
          halloween: "HALLOWEEN",
          premium: "PREMIUM"
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
        invalidWordMessage: "This word does not meet the requested criteria.",
        noWordError: "Please enter a word",
        error: "An error occurred",
        howToPlay: "Find a word that contains the two given letters and matches the chosen theme.",
        "theme.marque": "a brand",
        "theme.ville": "a city",
        "theme.prenom": "a name",
        "theme.pays": "a country",
        "theme.animal": "an animal",
        "theme.metier": "a job",
        "theme.sport": "a sport",
        "theme.fruit": "a fruit",
        "theme.legume": "a vegetable",
        "theme.objet": "an object",
        "exampleWord": "Example: {{word}}",
        "nextButton": "Next round",
        "playerCountError": "The game is for 1 to 4 players.",
        "noExampleAvailable": "No example available",
      },
      'word-guessing': {
        name: 'GUESS THE WORD',
        description: 'Have someone guess a word without using the forbidden words... A game of words and speed!',
        tags: {
          premium: 'PREMIUM'
        },
      },
    }
  },

  // Common translations
  common: {
    ok: 'OK',
    loading: 'Loading...',
    lumicoins: 'Lumicoins',
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
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    system: 'System',
    buyAssets: {
      title: 'Buy assets',
      available: 'Available assets',
      availableAssetsTitle: 'Available assets',
      owned: 'Owned',
      cost: 'Cost',
      points: 'points',
      buy: 'Buy',
      notAvailable: 'Unavailable',
      equip: 'Equip',
      confirm: 'Confirm purchase',
      cancel: 'Cancel',
      success: 'Asset purchased successfully!',
      error: 'Error during purchase',
      insufficientPoints: 'Insufficient points',
    },
  },

  // Game
  game: {
    round: 'Round {{current}}/{{total}}',
    start: 'Start',
    join: 'Join',
    leave: 'Leave game',
    players: 'Players',
    waiting: 'Waiting',
    yourTurn: 'Your turn',
    gameOver: 'Game over',
    winner: 'Winner',
    draw: 'Draw',
    error: "Error",
    unknownMode: "Unknown game mode: {{mode}}",
    notFound: "No game document found for id: {{id}}",
    noMode: "No game mode found in the game document.",
    loading: "Loading...",
    results: {
      title: "Final Results",
      subtitle: "Congratulations to all!",
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
        title: "Game over!",
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
      },
      naughty: {
        title: 'Naughtiest Player Ranking',
      },
      yourCurrentRank: 'Your current rank',
    },
    player: 'the player',
    truthOrDare: {
      title: 'Truth or Dare',
      choice: 'Choice',
      question: 'Question',
      action: 'Dare',
      submitChoice: 'Submit choice',
      submitAnswer: 'Submit answer',
      next: 'Next',
      endGame: 'End game',
      endTitle: 'Congratulations to all!',
      endSubtitle: 'You have finished the Truth or Dare game',
      home: 'Back to home',
      readAloud: 'Read aloud',
      targetChooses: '{{name}} chooses between Truth or Dare!',
      targetAnswers: '{{name}} answers the truth!',
      targetDoesDare: '{{name}} does the dare!',
      error: 'An error occurred',
      noQuestions: 'No questions available',
      errorNext: 'An error occurred while moving to the next round',
      naughtyRanking: 'Naughty ranking',
      truth: "Truth",
      dare: "Dare",
      chooseTask: "Choose: Truth or Dare?",
      isThinking: "is thinking...",
      willChoose: "will choose",
      or: "or",
      iAnswered: "I answered",
      iRefuse: "I pass",
      voteInProgress: "Vote in progress",
      otherPlayersDecide: "The other players decide if",
      playedGame: "played the game",
      votes: "votes",
      vote: "Vote",
      did: "Did",
      thanksVote: "Thanks for your vote!",
      yes: "Yes",
      no: "No",
      round: "Round",
      roundEnd: "End of the round for",
      scores: "Scores",
      errorSelectingQuestion: "Error selecting the question",
      noQuestionsAvailable: "No questions available for this choice",
    },
    listenButDontJudge: {
      title: 'We Listen But We Don\'t Judge',
      question: 'Question',
      next: 'Next',
      endGame: 'End game',
      endTitle: 'Congratulations to all!',
      endSubtitle: 'You have finished the We Listen But We Don\'t Judge game',
      home: 'Back to home',
      readAloud: 'Read aloud',
      targetAnswers: '{{name}} answers!',
      error: 'An error occurred',
      noQuestions: 'No questions available',
      errorNext: 'An error occurred while moving to the next round',
      waiting: 'Waiting for other players...',
      answerPlaceholder: 'Write your answer here...',
      submit: 'Submit',
      errorSubmit: 'Error submitting answer',
      waitingForOthers: 'Waiting for other votes...',
      waitingVote: 'Waiting for target player vote...',
      voteTitle: 'Choose the best answer',
    },
    neverHaveIEverHot: {
      never: "I have never",
      ever: "I have",
      waiting: "Waiting for the target player's choice...",
      prepare: "Get ready to answer!",
      submit: "Submit",
      next: "Next round",
      endGame: "End game",
      errorSubmit: "Could not submit the answer",
      endTitle: "Congratulations to all!",
      endSubtitle: "You have finished the Never Have I Ever 🔞 game",
      home: "Back to home",
      readAloud: "Read the question aloud",
      targetReads: "{{name}} reads the question",
      noQuestions: "No questions available",
      errorNext: "An error occurred while moving to the next round",
      naughtyRanking: "Naughty ranking"
    },
    geniusOrLiar: {
      // --- Main UI Keys from screenshots ---
      accuseTitle: 'Who is the liar?',
      pretendKnows: 'claims to know',
      accuseNoOne: 'Accuse no one',
      roundResults: 'Round Results',
      correctAnswerLabel: 'The correct answer was: {{answer}}',
      givenAnswerLabel: 'Your answer: {{answer}}',
      drinks: 'sips',
      
      // --- Player Statuses ---
      playerStatus: {
        wrongAnswer: 'Wrong answer',
        dontKnow: 'Didn\'t know the answer',
        correctAnswer: 'Correct answer!',
        correctButAccused: 'Genius, but accused!',
        liarNotAccused: 'The lie passed!',
        liarAccused: 'Liar, and busted!',
      },
      accuserStatus: {
        correctAccusation: 'Good call!',
        wrongAccusation: 'Wrong accusation!'
      },
      
      // --- General Gameplay ---
      answerPlaceholder: 'Your answer...',
      validate: 'Validate',
      know: 'I know',
      dontKnow: 'I don\'t know',
      accuse: 'Accuse',
      nextRound: 'Next Round',
      showResults: 'Show Results',
      endGame: 'Show Final Results',
      chooseGameMode: 'Choose the game mode',
      pointsMode: 'Points',
      forfeitsMode: 'Sips',
      points: 'points',
      forfeit: 'sip',
      forfeits: 'sips',

      // --- Waiting / Info Text ---
      yourAnswer: 'Your answer',
      waitingForPlayers: 'Waiting for other players...',
      waitingForAnswers: 'Waiting for other players to answer...',
      waitingForVotes: 'Waiting for other players to vote...',
      playersWhoKnow: 'Players who claim to know:',
      playersWhoDontKnow: 'Players who don\'t know:',
      noOneKnows: 'Nobody knew the answer!',
      allPlayersKnow: 'Everyone knew the answer!',
      wasAccused: 'Was accused',
      accusedBy: 'Accused by {{count}}',

      // --- Error / Edge Cases ---
      errorSubmit: 'Error submitting answer.',
      noQuestionAvailable: 'No questions available for this game.',
      incorrectQuestionFormat: 'Incorrect question format (ID: {{id}})',
      modeSelectError: 'Error selecting game mode.',
      
      // --- Question Categories ---
      questionTypes: {
        cultureG: 'General Knowledge',
        cultureGHard: 'General Knowledge (Hard)',
        culturePop: 'Pop Culture',
        cultureGeek: 'Geek Culture',
        cultureArt: 'Art',
        hard: 'Hard',
        devinette: 'Riddle',
        verite: 'Truth'
      }
    },
    theHiddenVillage: {
      title: 'THE HIDDEN VILLAGE',
      subtitle: 'A game of bluffing and strategy',
      description: 'A game of bluffing, strategy, and discussion... for those who like to accuse their friends 😈',
      principles: {
        title: '🌓 GAME PRINCIPLE',
        list: [
          'Each night, a "traitor" player eliminates another player.',
          'Each day, the survivors debate and vote to eliminate who they suspect.',
          'Objective: unmask the culprit before they eliminate everyone.'
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
          description: 'Guesses if a player is a villager or a traitor.'
        },
        protector: {
          name: 'The Protector',
          description: 'Protects a player each night.'
        },
        villager: {
          name: 'The Villager',
          description: 'No power. Vote wisely.'
        },
        liar: {
          name: 'The Liar',
          description: 'Fun role. Sows doubt.'
        }
      },
      objectives: {
        title: '🎯 OBJECTIVES',
        traitor: 'Traitor: eliminate everyone else without getting caught.',
        village: 'Village: discover the traitor before they win.'
      }
    },
    trapAnswer: {
      title: "Trap Question",
      question: "Question",
      next: "Next",
      endGame: "End game",
      endTitle: "Congratulations to all!",
      endSubtitle: "You have finished the Trap Question game",
      home: "Home",
      readAloud: "Read aloud",
      targetAnswers: "{{name}} answers!",
      error: "An error occurred",
      noQuestions: "No questions available",
      errorNext: "An error occurred while moving to the next round",
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
      invalidWordMessage: "This word does not meet the requested criteria.",
      noWordError: "Please enter a word",
      error: "An error occurred",
      howToPlay: "Find a word that contains the two given letters and matches the chosen theme.",
      "theme.marque": "a brand",
      "theme.ville": "a city",
      "theme.prenom": "a name",
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
    waitingForPlayersTitle: "Waiting for players",
    waitingForPlayersMessage: "Please wait for all players to submit their word.",
    actionNotAllowedTitle: "Action not allowed",
    onlyHostCanAdvance: "Only the host can advance to the next round.",
    word_guessing: {
      targetPlayer: 'Have {{player}} guess',
      forbiddenWords: 'Forbidden words',
      guesserInstructions: 'Your friend is trying to make you guess a word!',
      guesserInfo: 'Listen carefully and try to find the word without them using the forbidden words.',
      found: 'Word found!',
      forbidden: 'Forbidden word!',
      nextWord: 'Next word',
      categories: {
        lieux: 'Places',
        aliments: 'Foods',
        transport: 'Transport',
        technologie: 'Technology',
        sports: 'Sports',
        loisirs: 'Hobbies',
        nature: 'Nature',
        objets: 'Objects',
        animaux: 'Animals',
      },
    },
  },

  // Splash Screen
  splash: {
    title: 'Nightly',
    subtitle: 'Ready to play',
    loading: 'Loading...',
  },

  // Rules
  rules: {
    title: 'GAME RULES',
    loading: 'Loading rules...',
    confirm: 'I have read the rules',
    confirmStart: 'I have read the rules, start the game',
    general: {
      title: 'GENERAL RULES',
      description: 'A player is randomly designated each round.'
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
    loading: "Loading the room...",
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
    startGame: "Start game",
    inviteTitle: "Join my game",
    inviteMessage: "Join my game on Nightly! Code: {{code}}",
    error: "Error",
    errorLoading: "Could not load the room",
    errorStart: "Could not start the game",
    errorLeave: "Could not leave the room",
    errorReady: "Could not set to ready",
    errorCopy: "Error copying the code",
    errorShare: "Error sharing",
    successCopy: "Code copied to clipboard",
    minPlayersRequired: "Minimum {{count}} players required",
    notEnoughPlayers: "Not enough players",
    rounds: "rounds",
    title: "Game room"
  },

  topBar: {
    greeting: 'Hello',
    notifications: {
      title: 'Notifications',
      comingSoon: 'This feature is coming soon!'
    }
  },

  // Paywall
  paywall: {
    title: '🎃 Nightly Premium 🎃',
    subtitle: 'HALLOWEEN SPECIAL',
    tagline: 'PLAY WITHOUT LIMITS IN THE DARKNESS',
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
        description: 'Perfect for a night or a weekend with friends'
      },
      monthly: {
        badge: 'PARTY',
        title: 'Nightly Party',
        period: 'per month',
        description: 'For those who play regularly'
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
      terms: 'Terms of service'
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
        message: 'Your subscription has been processed but is not yet active. Please restart the application.'
      },
      error: {
        title: 'Error',
        message: 'The purchase failed. Please try again or choose another payment method.'
      },
      restoreSuccess: {
        title: 'Success',
        message: 'Your purchase has been restored!'
      },
      restoreError: {
        title: 'Error',
        message: 'Failed to restore purchases'
      },
      termsError: {
        title: 'Error',
        message: 'Could not open terms of service'
      }
    },
    prices: {
      weekly: '3.99',
      monthly: '7.99',
      annual: '29.99',
      currency: '€'
    },
    freeTrial: '3 days free',
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
        description: 'A mysterious cat with shining eyes'
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
        description: 'A bird with bright colors'
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
    title: "Invite friends",
    roomCode: "Room code",
    instruction: "Scan the QR code or share this code to invite your friends to the room.",
    shareButton: "Share"
  },

  ads: {
    title: 'Watch an ad for 3 more rounds!',
  },
};

export default en; 