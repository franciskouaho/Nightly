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
      usernameLength: 'Benutzername muss mindestens 3 Zeichen lang sein',
      enterUsername: 'Gib deinen Benutzernamen ein, um zu spielen',
      connecting: 'Verbinde...',
      play: 'Spielen',
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
    logoutError: 'Beim Abmelden ist ein Fehler aufgetreten. Bitte versuche es erneut.',
    contact: 'Kontaktiere uns',
    contactEmail: 'Sende uns eine E-Mail an support@cosmicquest.com',
    premium: {
      title: 'Premium Pass',
      try: 'Premium testen',
      free: 'Kostenlos 3 Tage',
      price: 'dann 3,99€ pro Woche',
      features: {
        unlock: 'Schalte alle Modi frei',
        weekly: 'Neues Paket jede Woche',
        friends: 'Kostenloser Zugang für deine Freunde',
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
      }
    }
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
    darkMode: 'Dunkles Design',
    lightMode: 'Helles Design',
    system: 'System',
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
      calculating: "Berechne Ergebnisse..."
    },
    listenButDontJudge: {
      waiting: "Warte auf andere Spieler...",
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
    geniusOrLiar: {
      know: "Ich weiß es!",
      dontKnow: "Ich weiß es nicht",
      accuse: "Beschuldigen",
      skip: "Überspringen",
      submit: "Absenden",
      next: "Nächste Runde",
      validate: "Bestätigen",
      answerPlaceholder: "Schreibe deine Antwort hier...",
      errorSubmit: "Antwort konnte nicht gesendet werden",
      errorVote: "Anklage konnte nicht gesendet werden",
      errorNext: "Beim Wechsel zur nächsten Runde ist ein Fehler aufgetreten",
      endTitle: "Spiel beendet!",
      endSubtitle: "Danke fürs Spielen von Genie oder Lügner!",
      noQuestions: "Keine Fragen verfügbar",
      allQuestionsUsed: "Alle Fragen wurden bereits verwendet",
      waitingForPlayers: "Warten auf andere Spieler...",
      chooseGameMode: "Wähle deinen Spielmodus",
      pointsMode: "PUNKTE-MODUS",
      gagesMode: "PFAND-MODUS",
      accuseTitle: "Beschuldige jemanden zu lügen!",
      accuseNoOne: "Ich will niemanden beschuldigen",
      pretendKnows: "Behauptet es zu wissen",
      accusedBy: "Beschuldigt von {{count}} Spieler(n)",
      correctAnswer: "Richtige Antwort: {{answer}}",
      playerStatus: {
        dontKnow: "Wusste es nicht",
        correctAnswer: "Richtige Antwort",
        correctButAccused: "Richtige Antwort aber beschuldigt",
        liarNotAccused: "Hat gelogen ohne beschuldigt zu werden",
        liarAccused: "Hat gelogen und wurde beschuldigt"
      },
      accuserStatus: {
        correctAccusation: "Richtige Anklage",
        wrongAccusation: "Falsche Anklage",
        against: "gegen {{name}}"
      }
    },
    neverHaveIEverHot: {
      never: "Ich habe noch nie",
      ever: "Ich habe schon",
      waiting: "Warten auf die Wahl des Zielspielers...",
      prepare: "Mach dich bereit zu antworten!",
      submit: "Absenden",
      next: "Nächste Runde",
      endGame: "Spiel beenden",
      errorSubmit: "Antwort konnte nicht übermittelt werden",
      endTitle: "Glückwunsch an alle!",
      endSubtitle: "Ihr habt das 'Ich habe noch nie 🔞' Spiel beendet",
      home: "Zurück zum Hauptmenü",
      readAloud: "Lies die Frage laut vor",
      targetReads: "{{name}} liest die Frage",
      noQuestions: "Keine Fragen verfügbar",
      errorNext: "Beim Übergang zur nächsten Runde ist ein Fehler aufgetreten"
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
    players: "Spieler",
    host: "Gastgeber",
    ready: "Bereit!",
    rules: "Regeln",
    rulesNotRead: "Bitte lies die Regeln, bevor du das Spiel startest.",
    iAmReady: "Ich bin bereit!",
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
    waiting: "Warte auf andere Spieler..."
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
}; 