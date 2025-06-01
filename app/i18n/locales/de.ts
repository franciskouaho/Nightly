export default {
  // General
  app: {
    name: 'Nightly',
  },
  
  // Language screen
  language: {
    title: 'Sprache',
    selectLanguage: 'Wähle deine bevorzugte Sprache für die App',
    updated: 'Sprache aktualisiert',
    updatedMessage: 'Die App-Sprache wurde geändert.',
    error: 'Fehler',
    errorMessage: 'Sprache konnte nicht geändert werden.',
  },

  // Navigation
  navigation: {
    back: 'Zurück',
    home: 'Start',
    profile: 'Profil',
    settings: 'Einstellungen',
  },

  // Error messages
  errors: {
    general: 'Ein Fehler ist aufgetreten',
    tryAgain: 'Bitte versuche es erneut',
    networkError: 'Netzwerkfehler',
    authError: 'Authentifizierungsfehler',
  },

  // Authentication
  auth: {
    login: {
      title: 'Anmelden',
      email: 'E-Mail',
      password: 'Passwort',
      submit: 'Anmelden',
      forgotPassword: 'Passwort vergessen?',
      noAccount: 'Kein Konto?',
      signUp: 'Registrieren',
      username: 'Dein Benutzername',
      usernameRequired: 'Bitte gib deinen Benutzernamen ein',
      usernameLength: 'Der Benutzername muss mindestens 3 Zeichen lang sein',
      enterUsername: 'Gib deinen Benutzernamen ein, um zu spielen',
      connecting: 'Verbinde...',
      play: 'Spielen',
      selectCharacter: 'Wähle deinen Charakter',
      characterDescription: 'Wähle einen Charakter, der dich im Spiel repräsentiert',
    },
    register: {
      title: 'Registrieren',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      submit: 'Registrieren',
      haveAccount: 'Bereits ein Konto?',
      login: 'Anmelden',
    },
  },

  // Profile
  profile: {
    title: 'Profil',
    edit: 'Bearbeiten',
    save: 'Speichern',
    cancel: 'Abbrechen',
    username: 'Benutzername',
    defaultUsername: 'Spieler',
    email: 'E-Mail',
    bio: 'Biografie',
    avatar: 'Profilbild',
    changeAvatar: 'Bild ändern',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    logoutError: 'Beim Abmelden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
    contact: 'Kontakt',
    contactEmail: 'Senden Sie uns eine E-Mail an support@cosmicquest.com',
    buyAssetsTitle: 'Assets kaufen',
    insufficientPoints: 'Nicht genügend Punkte',
    insufficientPointsMessage: 'Sie haben nicht genügend Punkte, um dieses Asset freizuschalten.',
    success: 'Erfolg',
    assetUnlocked: '{{asset}} wurde erfolgreich freigeschaltet!',
    unlockError: 'Beim Freischalten des Assets ist ein Fehler aufgetreten.',
    restorePurchases: 'Käufe wiederherstellen',
    restoring: 'Wiederherstellung...',
    restoreSuccess: 'Erfolg',
    restoreSuccessMessage: 'Ihre Käufe wurden erfolgreich wiederhergestellt',
    restoreError: 'Beim Wiederherstellen der Käufe ist ein Fehler aufgetreten',
    premium: {
      title: 'Premium-Pass',
      try: 'Premium testen',
      free: '3 Tage kostenlos',
      price: 'dann 3,99€/Woche',
      features: {
        unlock: 'Alle Modi freischalten',
        weekly: 'Wöchentlich neues Paket',
        friends: 'Kostenloser Zugang für Freunde',
        cancel: 'Jederzeit kündbar',
      },
    },
  },

  // Home
  home: {
    title: 'Start',
    welcome: 'Willkommen',
    createGame: 'Spiel erstellen',
    joinGame: 'Spiel beitreten',
    enterCode: 'Code eingeben',
    join: 'Beitreten',
    gameModes: {
      title: 'Spielmodi',
      classic: 'Klassisch',
      custom: 'Benutzerdefiniert',
      quick: 'Schnell',
    },
    errors: {
      noConnection: 'Keine Internetverbindung. Bitte überprüfe deine Verbindung und versuche es erneut.',
      loginRequired: 'Du musst angemeldet sein, um einen Spielraum zu erstellen.',
      invalidSession: 'Deine Benutzersitzung ist ungültig. Bitte melde dich erneut an.',
      roomCreationFailed: 'Raum konnte nicht erstellt werden',
      invalidCode: 'Ungültiger Spielcode',
      roomNotFound: 'Raum nicht gefunden',
      gameStarted: 'Dieses Spiel hat bereits begonnen',
      roomFull: 'Dieses Spiel ist voll',
      notAuthenticated: 'Benutzer nicht authentifiziert',
      alreadyInGame: 'Du bist bereits in diesem Spiel',
      serverTimeout: 'Server antwortet zu langsam. Bitte versuche es erneut.',
      networkError: 'Netzwerkfehler: Überprüfe deine Internetverbindung',
      permissionDenied: 'Zugriff verweigert: Überprüfe die Firestore-Sicherheitsregeln',
    },
    room: {
      create: 'Raum erstellen',
      join: 'Raum beitreten',
      code: 'Raumcode',
      players: 'Spieler',
      status: {
        waiting: 'Warten',
        playing: 'Spielen',
        finished: 'Beendet',
      },
    },
    codePlaceholder: "Spielcode eingeben",
    loading: "Verbinde mit dem Spiel...",
    categories: {
      nightly_modes: "WOCHEMPFEHLUNG",
      same_room: "IM GLEICHEN RAUM",
      online: "ONLINE"
    },
    subtitles: {
      same_room: "Spielt zusammen im selben Raum!",
      online: "Spielt auch wenn ihr nicht zusammen seid"
    },
    games: {
      "listen-but-don-t-judge": {
        name: "ZUHÖREN ABER NICHT URTEILEN",
        description: "Ein kostenloser Modus zum Spaß mit Freunden.",
        tag: "KOSTENLOS"
      },
      "truth-or-dare": {
        name: "WAHRHEIT ODER PFICHT",
        description: "Der Klassiker neu interpretiert mit exklusiven Herausforderungen.",
        tag: "PREMIUM"
      },
      "never-have-i-ever-hot": {
        name: "NOCH NIE 🔞",
        description: "Freche und pikante Fragen... Bereit zu gestehen?",
        tag: "PREMIUM"
      },
      "genius-or-liar": {
        name: "GENIE ODER LÜGNER",
        description: "Ein unterhaltsamer Modus, in dem du dein Wissen beweisen oder Herausforderungen meistern musst.",
        tag: "PREMIUM"
      },
      "the-hidden-village": {
        name: "DAS VERSTECKTE DORF",
        description: "Ein Bluff-, Strategie- und Diskussionsspiel... für alle, die es lieben, ihre Freunde zu beschuldigen 😈",
        tag: "PREMIUM"
      },
      "trap-answer": {
        name: "Fallen-Antwort",
        tag: "KOSTENLOS",
        description: "Ein Quiz, bei dem du bei jeder falschen Antwort Punkte verlierst... Kannst du die Fallen vermeiden?"
      },
      'avatar-dragon': {
        name: 'Drache',
        description: 'Ein majestätischer, feuerspeiender Drache'
      },
      'avatar-ourse': {
        name: 'Bär',
        description: 'Ein majestätischer Bär'
      },
      'avatar-phoenix': {
        name: 'Phönix',
      },
    },
    geniusOrLiar: {
      roundResults: 'Rundenergebnisse',
      correctAnswerLabel: 'Richtige Antwort: {{answer}}',
      givenAnswerLabel: 'Gegebene Antwort: {{answer}}',
      playerStatus: {
        dontKnow: 'Wusste es nicht',
        correctAnswer: 'Fand die richtige Antwort',
        correctButAccused: 'Fand die richtige Antwort, wurde aber beschuldigt',
        liarNotAccused: 'Log, ohne beschuldigt zu werden',
        liarAccused: 'Log und wurde beschuldigt',
        wrongAnswer: 'Falsche Antwort'
      },
      accuserStatus: {
        correctAccusation: 'Berechtigte Beschuldigung!',
        wrongAccusation: 'Falsche Beschuldigung!'
      },
      wasAccused: 'Wurde beschuldigt',
      nextRound: 'Nächste Runde',
      endGame: 'Spiel beenden',
      drinks: 'Strafen',
      chooseGameMode: 'Spielmodus wählen',
      pointsMode: 'Punkte-Modus',
      gagesMode: 'Strafen-Modus',
      modeSelectError: 'Spielmodus konnte nicht ausgewählt werden.',
      noQuestionAvailable: 'Keine Frage verfügbar.',
      incorrectQuestionFormat: 'Falsches Fragenformat für ID: {{id}}.',
      noQuestions: 'Keine Fragen geladen.',
      accuseTitle: 'Beschuldige einen Lügner',
      pretendKnows: 'Behauptet zu wissen',
      accusedBy: 'Beschuldigt von {{count}} Spieler(n)',
      accuseNoOne: 'Niemanden beschuldigen',
      waitingForPlayers: 'Warte auf andere Spieler...',
      answerPlaceholder: 'Gib deine Antwort hier ein...',
      validate: 'Bestätigen',
      know: 'Ich weiß',
      dontKnow: 'Ich weiß nicht',
      errorSubmit: 'Fehler beim Senden deiner Antwort oder deines Votes.'
    },
    neverHaveIEverHot: {
      never: "Ich habe noch nie",
      ever: "Ich habe schon",
      waiting: "Warten auf die Auswahl des Zielspielers...",
      prepare: "Mach dich bereit zu antworten!",
      submit: "Absenden",
      next: "Nächste Runde",
      endGame: "Spiel beenden",
      errorSubmit: "Antwort konnte nicht gesendet werden",
      endTitle: "Glückwunsch an alle!",
      endSubtitle: "Du hast das 'Ich habe noch nie' 🔞 Spiel beendet",
      home: "Zurück zum Start",
      readAloud: "Lies die Frage laut vor",
      targetReads: "{{name}} liest die Frage vor",
      noQuestions: "Keine Fragen verfügbar",
      errorNext: "Fehler beim Wechsel zur nächsten Runde",
      naughtyRanking: "Versautesten-Ranking",
      naughtyAnswers: "versauten Antworten",
      neverButton: "🙅‍♂️ Ich habe noch nie",
      everButton: "🔥 Ich habe schon",
    },
  },

  // Settings
  settings: {
    title: 'Einstellungen',
    language: 'Sprache',
    notifications: 'Benachrichtigungen',
    theme: 'Design',
    privacy: 'Datenschutz',
    about: 'Über',
    help: 'Hilfe',
    darkMode: 'Dunkelmodus',
    lightMode: 'Hellmodus',
    system: 'System',
    buyAssets: {
      title: 'Assets kaufen',
      available: 'Assets verfügbar',
      owned: 'Besitzt',
      cost: 'Kosten',
      points: 'Punkte',
      buy: 'Kaufen',
      confirm: 'Kauf bestätigen',
      cancel: 'Abbrechen',
      success: 'Asset erfolgreich gekauft!',
      error: 'Fehler beim Kauf',
      insufficientPoints: 'Nicht genügend Punkte',
      equip: 'Ausrüsten',
    },
  },

  // Game
  game: {
    start: 'Starten',
    join: 'Beitreten',
    leave: 'Verlassen',
    players: 'Spieler',
    waiting: 'Warten',
    yourTurn: 'Du bist dran',
    gameOver: 'Spiel beendet',
    winner: 'Gewinner',
    draw: 'Unentschieden',
    error: "Fehler",
    unknownMode: "Unbekannter Spielmodus: {{mode}}",
    notFound: "Kein Spieldokument für ID gefunden: {{id}}",
    noMode: "Kein Spielmodus im Spieldokument gefunden.",
    loading: "Laden...",
    results: {
      title: "Endergebnisse",
      subtitle: "Glückwunsch an alle!",
      bravo: "Glückwunsch {{name}}!",
      points: "Punkte",
      home: "Start",
      calculating: "Berechne Ergebnisse...",
      podium: {
        first: "1. Platz",
        second: "2. Platz",
        third: "3. Platz",
        others: "Weitere Spieler",
        title: "Podium-Rangliste",
      },
      rank: "Rang",
      score: "Punkte",
      player: "Spieler",
    },
    listenButDontJudge: {
      waiting: "Warten auf andere Spieler...",
      waitingVote: "Warten auf die Abstimmung des Zielspielers...",
      waitingForOthers: "Warten auf andere Abstimmungen...",
      submit: "Absenden",
      vote: "Abstimmen",
      next: "Nächste Runde",
      errorSubmit: "Antwort konnte nicht gesendet werden",
      errorVote: "Stimme konnte nicht abgegeben werden",
      errorNext: "Fehler beim Wechsel zur nächsten Runde",
      noQuestions: "Keine Fragen verfügbar",
      endTitle: "Spiel beendet!",
      endSubtitle: "Danke fürs Spielen!"
    },
    truthOrDare: {
      truth: "Wahrheit!",
      dare: "Pflicht!",
      submit: "Absenden",
      next: "Nächste Runde",
      errorSubmit: "Antwort konnte nicht gesendet werden",
      errorVote: "Stimme konnte nicht abgegeben werden",
      errorNext: "Fehler beim Wechsel zur nächsten Runde",
      endTitle: "Spiel beendet!",
      endSubtitle: "Danke fürs Spielen von Wahrheit oder Pflicht!"
    },
    neverHaveIEverHot: {
      never: "Ich habe noch nie",
      ever: "Ich habe schon",
      waiting: "Warten auf die Auswahl des Zielspielers...",
      prepare: "Mach dich bereit zu antworten!",
      submit: "Absenden",
      next: "Nächste Runde",
      endGame: "Spiel beenden",
      errorSubmit: "Antwort konnte nicht gesendet werden",
      endTitle: "Glückwunsch an alle!",
      endSubtitle: "Du hast das 'Ich habe noch nie' 🔞 Spiel beendet",
      home: "Zurück zum Start",
      readAloud: "Lies die Frage laut vor",
      targetReads: "{{name}} liest die Frage vor",
      noQuestions: "Keine Fragen verfügbar",
      errorNext: "Fehler beim Wechsel zur nächsten Runde",
      naughtyRanking: "Versautesten-Ranking",
      naughtyAnswers: "versauten Antworten",
      neverButton: "🙅‍♂️ Ich habe noch nie",
      everButton: "🔥 Ich habe schon",
    }
  },

  // Splash Screen
  splash: {
    title: 'Nightly',
    subtitle: 'Mach dich bereit zum Spielen',
    loading: 'Wird geladen...',
  },

  room: {
    loading: "Lade Raum...",
    notFound: "Raum nicht gefunden",
    codeLabel: "Raumcode",
    codeCopied: "Code in Zwischenablage kopiert",
    players: "{{count}} Spieler",
    players_plural: "{{count}} Spieler",
    host: "Gastgeber",
    ready: "Bereit",
    iAmReady: "Ich bin bereit",
    startGame: "Spiel starten",
    inviteTitle: "Tritt meinem Spiel bei",
    inviteMessage: "Tritt meinem Spiel auf Nightly bei! Code: {{code}}",
    error: "Fehler",
    errorLoading: "Raum konnte nicht geladen werden",
    errorStart: "Spiel konnte nicht gestartet werden",
    errorLeave: "Raum konnte nicht verlassen werden",
    errorReady: "Bereitschaft konnte nicht gesetzt werden",
    errorCopy: "Fehler beim Kopieren des Codes",
    errorShare: "Fehler beim Teilen",
    successCopy: "Code in Zwischenablage kopiert",
    minPlayers: "Mindestens 2 Spieler benötigt, um das Spiel zu starten.",
    allReady: "Alle Spieler sind bereit!",
    waiting: "Warte auf andere Spieler...",
    title: "Spielraum",
    rules: "Regeln",
    minPlayersRequired: "Mindestens {{count}} Spieler erforderlich",
    notEnoughPlayers: "Nicht genügend Spieler",
    rounds: "Runden",
  },

  paywall: {
    title: 'Nightly Premium',
    subtitle: 'UNBEGRENZTER ZUGANG',
    tagline: 'SPIELE OHNE GRENZEN',
    features: {
      unlimited: 'Unbegrenzter Zugang zu allen Modi',
      weekly: 'Neue Karten jede Woche',
      visuals: 'Exklusive visuelle Themes',
      characters: 'Charakteranpassung',
      updates: 'Prioritäts-Updates'
    },
    plans: {
      weekly: {
        badge: 'PASS',
        title: 'Nightly Pass',
        period: 'pro Woche',
        description: 'Perfekt für einen Abend oder ein Wochenende mit Freunden'
      },
      monthly: {
        badge: 'PARTY',
        title: 'Nightly Party',
        period: 'pro Monat',
        description: 'Für regelmäßige Spieler'
      },
      annual: {
        badge: 'ALL ACCESS',
        title: 'Nightly All Access',
        period: 'pro Jahr',
        description: 'Das ultimative Angebot für Fans'
      }
    },
    cta: 'Jetzt starten',
    footer: {
      restore: 'Käufe wiederherstellen',
      terms: 'Nutzungsbedingungen'
    },
    alerts: {
      productUnavailable: {
        title: 'Produkt nicht verfügbar',
        message: 'Das Abonnement ist derzeit nicht verfügbar. Bitte versuche es später erneut.'
      },
      success: {
        title: 'Erfolg',
        message: 'Vielen Dank für deinen Kauf!'
      },
      pending: {
        title: 'Information',
        message: 'Dein Abonnement wurde verarbeitet, ist aber noch nicht aktiv. Bitte starte die App neu.'
      },
      error: {
        title: 'Fehler',
        message: 'Der Kauf ist fehlgeschlagen. Bitte versuche es erneut oder wähle eine andere Zahlungsmethode.'
      },
      restoreSuccess: {
        title: 'Erfolg',
        message: 'Dein Kauf wurde wiederhergestellt!'
      },
      restoreError: {
        title: 'Fehler',
        message: 'Fehler beim Wiederherstellen der Käufe'
      },
      termsError: {
        title: 'Fehler',
        message: 'Nutzungsbedingungen können nicht geöffnet werden'
      }
    },
    prices: {
      weekly: '3,99',
      monthly: '7,99',
      annual: '29,99',
      currency: '€'
    },
    freeTrial: 'Kostenlos 3 Tage',
  },

  // Regeln
  rules: {
    title: 'SPIELREGELN',
    loading: 'Lade Regeln...',
    confirm: 'Ich habe die Regeln gelesen',
    confirmStart: 'Ich habe die Regeln gelesen, Spiel starten',
    general: {
      title: 'ALLGEMEINE REGELN',
      description: 'Ein Spieler wird in jeder Runde zufällig bestimmt.'
    },
    participation: {
      title: 'TEILNAHME',
      description: 'Alle Spieler müssen aktiv teilnehmen.'
    },
    scoring: {
      title: 'PUNKTEWERTUNG',
      description: 'Punkte werden nach den spezifischen Regeln des Spiels vergeben.'
    }
  },

  inviteModal: {
    title: "Freunde einladen",
    roomCode: "Raumcode",
    instruction: "Scanne den QR-Code oder teile diesen Code, um deine Freunde in den Raum einzuladen.",
    shareButton: "Teilen"
  },
}; 