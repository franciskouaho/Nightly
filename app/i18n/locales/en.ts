const en = {
  // General
  app: {
    name: "Nightly",
  },
  
  // Language Screen
  language: {
    title: "Language",
    selectLanguage: "Select your preferred language for the application",
    updated: "Language Updated",
    updatedMessage: "The application language has been changed.",
    error: "Error",
    errorMessage: "Could not change the language.",
  },

  // Navigation
  navigation: {
    back: "Back",
    home: "Home",
    profile: "Profile",
    settings: "Settings",
  },

  // Error Messages
  errors: {
    general: "An error occurred",
    tryAgain: "Please try again",
    networkError: "Network error",
    authError: "Authentication error",
  },

  // Authentication
  auth: {
    login: {
      title: "Login",
      email: "Email",
      password: "Password",
      submit: "Log in",
      forgotPassword: "Forgot password?",
      noAccount: "No account?",
      signUp: "Sign up",
      username: "Your nickname",
      usernameRequired: "Please enter your nickname",
      usernameLength: "Nickname must be at least 3 characters long",
      enterUsername: "Enter your nickname to play",
      connecting: "Connecting...",
      play: "Play",
      selectCharacter: "Choose your character",
      characterDescription:
        "Select a character that represents you for the game",
    },
    register: {
      title: "Sign Up",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      submit: "Sign up",
      haveAccount: "Already have an account?",
      login: "Log in",
    },
  },

  // Profile
  profile: {
    title: "Profile",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    username: "Username",
    defaultUsername: "Player",
    email: "Email",
    bio: "Bio",
    avatar: "Profile picture",
    changeAvatar: "Change picture",
    settings: "Settings",
    logout: "Log out",
    logoutError: "An error occurred while logging out. Please try again.",
    contact: "Contact us",
    contactEmail: "Send us an email at support@cosmicquest.com",
    buyAssetsTitle: "Buy assets",
    insufficientPoints: "Insufficient points",
    insufficientPointsMessage:
      "You do not have enough points to unlock this asset.",
    success: "Success",
    assetUnlocked: "{{asset}} has been successfully unlocked!",
    unlockError: "An error occurred while unlocking the asset.",
    restorePurchases: "Restore purchases",
    restoring: "Restoring...",
    restoreSuccess: "Success",
    restoreSuccessMessage: "Your purchases have been successfully restored",
    restoreError: "An error occurred while restoring purchases",
    avatarChanged: "Your profile picture has been successfully updated!",
    avatarChangeError: "An error occurred while changing your profile picture.",
    premium: {
      title: "Premium Pass",
      try: "Try premium",
      free: "3 days free",
      price: "then €3.99 per week",
      features: {
        unlock: "Unlock all modes",
        weekly: "A new pack every week",
        friends: "Free access for your friends",
        cancel: "Cancel anytime",
      },
    },
  },

  // Home
  home: {
    title: "Home",
    welcome: "Welcome",
    createGame: "Create game",
    joinGame: "Join game",
    enterCode: "Enter code",
    join: "Join",
    gameModes: {
      title: "Game modes",
      classic: "Classic",
      custom: "Custom",
      quick: "Quick",
    },
    errors: {
      noConnection:
        "No internet connection. Please check your connection and try again.",
      loginRequired: "You must be logged in to create a game room.",
      invalidSession: "Your user session is invalid. Please log in again.",
      roomCreationFailed: "Could not create the room",
      invalidCode: "Invalid game code",
      roomNotFound: "Room not found",
      gameStarted: "This game has already started",
      roomFull: "This game is full",
      notAuthenticated: "User not authenticated",
      alreadyInGame: "You are already in this game",
      serverTimeout:
        "The server is taking too long to respond. Please try again.",
      networkError: "Network error: check your internet connection",
      permissionDenied: "Access denied: check Firestore security rules",
    },
    room: {
      create: "Create room",
      join: "Join room",
      code: "Room code",
      players: "Players",
      status: {
        waiting: "Waiting",
        playing: "Playing",
        finished: "Finished",
      },
    },
    codePlaceholder: "Enter the game code",
    loading: "Connecting to the game...",
    categories: {
      events: "EVENTS",
      nightly_modes: "SUGGESTION OF THE WEEK",
      same_room: "IN THE SAME ROOM",
      online: "REMOTE",
    },
    subtitles: {
      events: "Special games for special occasions",
      same_room: "To be played in the same room, together!",
      online: "To play even when you are not together",
    },
    games: {
      "listen-but-don-t-judge": {
        name: "WE LISTEN BUT WE DON'T JUDGE",
        description: "A free mode for a good laugh with friends.",
        tags: { free: "FREE" },
      },
      "truth-or-dare": {
        name: "TRUTH OR DARE",
        description: "The classic revisited with exclusive challenges.",
        tags: { premium: "PREMIUM" },
      },
      "never-have-i-ever-hot": {
        name: "NEVER HAVE I EVER 🔞",
        description: "Naughty and inappropriate questions... Ready to own up?",
        tags: { premium: "PREMIUM" },
      },
      "genius-or-liar": {
        name: "GENIUS OR LIAR",
        description:
          "A fun mode where you have to prove your knowledge or face the consequences.",
        tags: { premium: "PREMIUM" },
      },
      "the-hidden-village": {
        name: "THE HIDDEN VILLAGE",
        description:
          "A game of bluffing, strategy, and discussion... for those who like to accuse their friends 😈",
        tags: { premium: "PREMIUM" },
      },
      "trap-answer": {
        name: "Trap Question",
        description:
          "A quiz where a wrong answer makes you lose points... Can you avoid the traps?",
        tags: { free: "FREE" },
      },
      "quiz-halloween": {
        name: "HALLOWEEN QUIZ 🎃",
        description:
          "Test your knowledge about Halloween with scary questions!",
        tags: {
          halloween: "HALLOWEEN",
          premium: "PREMIUM",
        },
      },
      "two-letters-one-word": {
        name: "2 Letters 1 Word",
        description:
          "Find a word that contains the two given letters and matches the theme.",
        tags: {
          free: "FREE",
          new: "NEW",
          premium: "PREMIUM",
        },
      },
      "word-guessing": {
        name: "GUESS THE WORD",
        description:
          "Have someone guess a word without using the forbidden words... A game of words and speed!",
        tags: { premium: "PREMIUM" },
      },
    },
  },

  // Common translations
  common: {
    ok: "OK",
    loading: "Loading...",
    lumicoins: "Lumicoins",
  },

  // Settings
  settings: {
    title: "Settings",
    language: "Language",
    notifications: "Notifications",
    theme: "Theme",
    privacy: "Privacy",
    about: "About",
    help: "Help",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    system: "System",
    buyAssets: {
      title: "Buy assets",
      available: "Available assets",
      availableAssetsTitle: "Available assets",
      owned: "Owned",
      cost: "Cost",
      points: "points",
      buy: "Buy",
      notAvailable: "Unavailable",
      equip: "Equip",
      confirm: "Confirm purchase",
      cancel: "Cancel",
      success: "Asset purchased successfully!",
      error: "Error during purchase",
      insufficientPoints: "Insufficient points",
    },
  },

  // ... (tout le reste inchangé jusqu’à la fin)

  // Paywall (corrigé, sans doublon)
  paywall: {
    title: "🎃 Nightly Premium 🎃",
    subtitle: "HALLOWEEN SPECIAL",
    tagline: "PLAY WITHOUT LIMITS IN THE DARKNESS",
    features: {
      unlimited: "Unlimited access to all modes",
      weekly: "New cards every week",
      visuals: "Exclusive visual themes",
      characters: "Character customization",
      updates: "Priority updates",
    },
    plans: {
      weekly: {
        title: "Free Trial",
        badge: "FREE",
        period: "3 days",
        description: "Test all features",
      },
      monthly: {
        title: "Monthly",
        badge: "POPULAR",
        period: "per month",
        description: "Full access to everything",
      },
      annual: {
        title: "Annual",
        badge: "SAVE",
        period: "per year",
        description: "Save more than 50%",
    },
    },
    freeTrial: "3 DAYS",
    cta: "START TRIAL",
    annual: {
      title: "🔥 LIMITED OFFER 🔥",
      subtitle: "SAVE MORE THAN 50%",
      tagline: "Don't miss this unique opportunity!",
      features: {
        savings: "Save more than $30 per year",
      },
      discount: "off",
      savings: "Save {amount} {currency}",
      cta: "GRAB THE DEAL",
    },
    alerts: {
      productUnavailable: {
        title: "Product not available",
        message: "This product is not available at the moment.",
      },
      success: {
        title: "Congratulations!",
        message: "Your subscription has been activated successfully!",
      },
      pending: {
        title: "Pending",
        message: "Your purchase is being processed.",
      },
      error: {
        title: "Error",
        message: "An error occurred during the purchase.",
      },
      restoreSuccess: {
        title: "Restoration successful",
        message: "Your purchases have been restored successfully!",
      },
      restoreError: {
        title: "Restoration error",
        message: "Unable to restore your purchases.",
      },
      termsError: {
        title: "Error",
        message: "Unable to open terms of use.",
      },
    },
    footer: {
      restore: "Restore purchases",
      terms: "Terms of use",
    },
  },
};

export default en; 
