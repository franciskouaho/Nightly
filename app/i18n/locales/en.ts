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
      usernameLength: 'Username must be at least 3 characters long',
      enterUsername: 'Enter your username to play',
      connecting: 'Connecting...',
      play: 'Play',
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
    avatar: 'Profile picture',
    changeAvatar: 'Change picture',
    settings: 'Settings',
    logout: 'Logout',
    logoutError: 'An error occurred while logging out. Please try again.',
    contact: 'Contact us',
    contactEmail: 'Send us an email at support@cosmicquest.com',
    premium: {
      title: 'Premium Pass',
      try: 'Try premium',
      free: 'Free 3 days',
      price: 'then $3.99 per week',
      features: {
        unlock: 'Unlock all modes',
        weekly: 'New pack every week',
        friends: 'Free access for your friends',
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
        tag: "FREE"
      },
      "truth-or-dare": {
        name: "TRUTH OR DARE",
        description: "The classic game revisited with exclusive challenges.",
        tag: "PREMIUM"
      },
      "never-have-i-ever-hot": {
        name: "NEVER HAVE I EVER 🔞",
        description: "Naughty and cheeky questions... Ready to confess?",
        tag: "PREMIUM"
      },
      "genius-or-liar": {
        name: "GENIUS OR LIAR",
        description: "A fun mode where you must prove your knowledge or face dares.",
        tag: "PREMIUM"
      }
    }
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
  },

  // Game
  game: {
    start: 'Start',
    join: 'Join',
    leave: 'Leave',
    players: 'Players',
    waiting: 'Waiting',
    yourTurn: 'Your turn',
    gameOver: 'Game over',
    winner: 'Winner',
    draw: 'Draw',
    error: "Error",
    unknownMode: "Unknown game mode: {{mode}}",
    notFound: "No game document found for id: {{id}}",
    noMode: "No game mode found in the games document.",
    loading: "Loading...",
    results: {
      title: "Final results",
      subtitle: "Congratulations everyone!",
      bravo: "Congrats {{name}}!",
      points: "points",
      home: "Home",
      calculating: "Calculating results..."
    },
    listenButDontJudge: {
      waiting: "Waiting for other players...",
      submit: "Submit",
      vote: "Vote",
      next: "Next round",
      errorSubmit: "Unable to submit answer",
      errorVote: "Unable to submit vote",
      errorNext: "An error occurred while moving to the next round",
      noQuestions: "No questions available",
      endTitle: "Game over!",
      endSubtitle: "Thanks for playing!"
    },
    truthOrDare: {
      truth: "Truth!",
      dare: "Dare!",
      submit: "Submit",
      next: "Next round",
      errorSubmit: "Unable to submit answer",
      errorVote: "Unable to submit vote",
      errorNext: "An error occurred while moving to the next round",
      endTitle: "Game over!",
      endSubtitle: "Thanks for playing Truth or Dare!"
    },
    geniusOrLiar: {
      know: "I know!",
      dontKnow: "I don't know",
      accuse: "Accuse",
      skip: "Skip",
      submit: "Submit",
      next: "Next round",
      errorSubmit: "Unable to submit answer",
      errorVote: "Unable to submit accusation",
      errorNext: "An error occurred while moving to the next round",
      endTitle: "Game over!",
      endSubtitle: "Thanks for playing Genius or Liar!"
    },
    neverHaveIEverHot: {
      never: "Never have I ever",
      ever: "I have already",
      waiting: "Waiting for the target player's choice...",
      prepare: "Get ready to answer!",
      submit: "Submit",
      next: "Next round",
      errorSubmit: "Unable to submit answer",
      endTitle: "Congratulations everyone!",
      endSubtitle: "You finished the Never Have I Ever 🔥 game",
      home: "Back to home"
    }
  },

  // Splash Screen
  splash: {
    title: 'Nightly',
    subtitle: 'Get ready to play',
    loading: 'Loading...',
  },

  room: {
    loading: "Loading room...",
    notFound: "Room not found",
    codeLabel: "Room code",
    codeCopied: "Code copied to clipboard",
    players: "Players",
    host: "Host",
    ready: "Ready!",
    rules: "rules",
    rulesNotRead: "Please read the rules before starting the game.",
    iAmReady: "I'm ready!",
    startGame: "Start the game",
    inviteTitle: "Join my game",
    inviteMessage: "Join my game on Nightly! Code: {{code}}",
    error: "Error",
    errorLoading: "Unable to load the room",
    errorStart: "Unable to start the game",
    errorLeave: "Unable to leave the room",
    errorReady: "Unable to set ready",
    errorCopy: "Error copying the code",
    errorShare: "Error sharing",
    successCopy: "Code copied to clipboard",
    minPlayers: "At least 2 players are required to start the game.",
    allReady: "All players are ready!",
    waiting: "Waiting for other players..."
  },

  topBar: {
    greeting: 'Hello',
    notifications: {
      title: 'Notifications',
      comingSoon: 'This feature will be available soon!'
    }
  },

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
        description: 'Perfect for a night or weekend with friends'
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
        title: 'Product unavailable',
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
        message: 'Unable to open Terms of Use'
      }
    },
    prices: {
      weekly: '3.99',
      monthly: '7.99',
      annual: '29.99',
      currency: '$'
    },
    freeTrial: 'Free 3 days',
  },
}; 