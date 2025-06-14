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
      "listen-but-dont-judge": {
        name: "ZUHÖREN ABER NICHT URTEILEN",
        description: "Ein kostenloser Modus zum Spaß haben mit Freunden.",
        tags: {
          free: "KOSTENLOS"
        }
      },
      "truth-or-dare": {
        name: "WAHRHEIT ODER PFICHT",
        description: "Der Klassiker neu interpretiert mit exklusiven Herausforderungen.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "never-have-i-ever-hot": {
        name: "ICH HABE NOCH NIE 🔞",
        description: "Freche und unangemessene Fragen... Bereit zu gestehen?",
        tags: {
          premium: "PREMIUM"
        }
      },
      "genius-or-liar": {
        name: "GENIE ODER LÜGNER",
        description: "Ein unterhaltsamer Modus, in dem du dein Wissen beweisen oder die Konsequenzen tragen musst.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "the-hidden-village": {
        name: "DAS VERSTECKTE DORF",
        description: "Ein Spiel aus Bluff, Strategie und Diskussionen... für diejenigen, die gerne ihre Freunde beschuldigen 😈",
        tags: {
          premium: "PREMIUM"
        }
      },
      "trap-answer": {
        name: "Fallen-Antwort",
        description: "Ein Quiz, bei dem eine falsche Antwort Punkte kostet... Kannst du den Fallen entgehen?",
        tags: {
          free: "KOSTENLOS"
        }
      },
      "two-letters-one-word": {
        name: "2 Buchstaben 1 Wort",
        description: "Finden Sie ein Wort, das die beiden vorgegebenen Buchstaben enthält und zum Thema passt.",
        tags: {
          free: "KOSTENLOS",
          "new": "NEU",
          "premium": "PREMIUM"
        },
        score: "Punktzahl: {{score}}",
        theme: "Thema: {{theme}}",
        inputPlaceholder: "Geben Sie Ihr Wort ein...",
        verifyButton: "Überprüfen",
        verifyingButton: "Überprüfe...",
        validWord: "Gültiges Wort!",
        validWordMessage: "Du hast ein gültiges Wort gefunden!",
        invalidWord: "Ungültiges Wort",
        invalidWordMessage: "Dieses Wort entspricht nicht den angeforderten Kriterien.",
        noWordError: "Bitte geben Sie ein Wort ein",
        error: "Ein Fehler ist aufgetreten",
        howToPlay: "Finden Sie ein Wort, das die beiden vorgegebenen Buchstaben enthält und zum gewählten Thema passt.",
        "theme.marque": "eine Marke",
        "theme.ville": "eine Stadt",
        "theme.prenom": "ein Vorname",
        "theme.pays": "ein Land",
        "theme.animal": "ein Tier",
        "theme.metier": "ein Beruf",
        "theme.sport": "ein Sport",
        "theme.fruit": "eine Frucht",
        "theme.legume": "ein Gemüse",
        "theme.objet": "ein Objekt",
        "exampleWord": "Beispiel: {{word}}",
        "nextButton": "Nächste Runde",
        "noExampleAvailable": "Kein Beispiel verfügbar",
      },
    },
    waitingForPlayersTitle: "Warte auf Spieler",
    waitingForPlayersMessage: "Bitte warten Sie, bis alle Spieler ihr Wort eingegeben haben.",
    actionNotAllowedTitle: "Aktion nicht erlaubt",
    onlyHostCanAdvance: "Nur der Host kann zur nächsten Runde wechseln.",
  },

  // Game
  game: {
    start: 'Start',
    join: 'Beitreten',
    leave: 'Verlassen',
    players: 'Spieler',
    waiting: 'Warten',
    yourTurn: 'Dein Zug',
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
      home: "Startseite",
      calculating: "Ergebnisse berechnen...",
      podium: {
        first: "1. Platz",
        second: "2. Platz",
        third: "3. Platz",
        others: "Andere Spieler",
        title: "Podiums-Rangliste",
      },
      rank: "Rang",
      score: "Punktzahl",
      player: "Spieler",
      "two-letters-one-word": {
        title: "Spiel vorbei!",
        subtitle: "Danke fürs Spielen von 2 Buchstaben 1 Wort!",
        totalWords: "Gefundene Wörter",
        bestWord: "Bestes Wort",
        averageScore: "Durchschnittliche Punktzahl",
        timePlayed: "Spielzeit",
        newHighScore: "Neuer Highscore!",
        shareResults: "Ergebnisse teilen",
        playAgain: "Erneut spielen"
      },
      "word-guessing": {
        title: "Rate das Wort",
        timer: "Verbleibende Zeit",
        score: "Punktzahl",
        forbiddenWords: "Verbotene Wörter",
        start: "Start",
        next: "Nächstes Wort",
        found: "Wort gefunden!",
        forbidden: "Verbotenes Wort benutzt!",
        timeUp: "Zeit abgelaufen!",
        finalScore: "Endergebnis",
        playAgain: "Erneut spielen"
      }
    },
    player: 'der Spieler',
    round: 'Runde {{count}}',
    truthOrDare: {
      title: 'Wahrheit oder Pflicht',
      choice: 'Wahl',
      question: 'Frage',
      action: 'Pflicht',
      submitChoice: 'Auswahl senden',
      submitAnswer: 'Antwort senden',
      next: 'Weiter',
      endGame: 'Spiel beenden',
      endTitle: 'Glückwunsch an alle!',
      endSubtitle: 'Du hast das Wahrheit oder Pflicht Spiel beendet',
      home: 'Zur Startseite',
      readAloud: 'Laut vorlesen',
      targetChooses: '{{name}} wählt zwischen Wahrheit oder Pflicht!',
      targetAnswers: '{{name}} antwortet ehrlich!',
      targetDoesDare: '{{name}} erfüllt die Pflicht!',
      error: 'Ein Fehler ist aufgetreten',
      noQuestions: 'Keine Fragen verfügbar',
      errorNext: 'Beim Wechsel zur nächsten Runde ist ein Fehler aufgetreten',
      naughtyRanking: 'Unartigstes Ranking'
    },
    listenButDontJudge: {
      title: 'Zuhören aber nicht urteilen',
      question: 'Frage',
      next: 'Weiter',
      endGame: 'Spiel beenden',
      endTitle: 'Glückwunsch an alle!',
      endSubtitle: 'Du hast das Zuhören aber nicht urteilen Spiel beendet',
      home: 'Zur Startseite',
      readAloud: 'Laut vorlesen',
      targetAnswers: '{{name}} antwortet!',
      error: 'Ein Fehler ist aufgetreten',
      noQuestions: 'Keine Fragen verfügbar',
      errorNext: 'Beim Wechsel zur nächsten Runde ist ein Fehler aufgetreten'
    },
    neverHaveIEverHot: {
      never: "Ich habe noch nie",
      ever: "Ich habe schon",
      waiting: "Warten auf die Wahl des Zielspielers...",
      prepare: "Mach dich bereit zu antworten!",
      submit: "Senden",
      next: "Nächste Runde",
      endGame: "Spiel beenden",
      errorSubmit: "Antwort konnte nicht gesendet werden",
      endTitle: "Glückwunsch an alle!",
      endSubtitle: "Du hast das Ich habe noch nie 🔞 Spiel beendet",
      home: "Zur Startseite",
      readAloud: "Frage laut vorlesen",
      targetReads: "{{name}} liest die Frage vor",
      noQuestions: "Keine Fragen verfügbar",
      errorNext: "Beim Wechsel zur nächsten Runde ist ein Fehler aufgetreten",
      naughtyRanking: "Unartigstes Ranking"
    },
    geniusOrLiar: {
      title: 'Genie oder Lügner',
      question: 'Frage',
      know: 'Ich weiß',
      dontKnow: 'Ich weiß nicht',
      accuse: 'Beschuldigen',
      submitAnswer: 'Antwort senden',
      next: 'Nächste Runde',
      endGame: 'Spiel beenden',
      endTitle: 'Glückwunsch an alle!',
      endSubtitle: 'Du hast das Genie oder Lügner Spiel beendet',
      home: 'Zur Startseite',
      readAloud: 'Laut vorlesen',
      targetAnswers: '{{name}} antwortet!',
      error: 'Ein Fehler ist aufgetreten',
      noQuestions: 'Keine Fragen verfügbar',
      errorNext: 'Beim Wechsel zur nächsten Runde ist ein Fehler aufgetreten',
      errorSubmit: 'Fehler beim Senden deiner Antwort oder Stimme.'
    },
    theHiddenVillage: {
      title: 'DAS VERSTECKTE DORF',
      subtitle: 'Ein Spiel aus Bluff und Strategie',
      description: 'Ein Spiel aus Bluff, Strategie und Diskussionen... für diejenigen, die gerne ihre Freunde beschuldigen 😈',
      principles: {
        title: '🌓 SPIELPRINZIP',
        list: [
          'Jede Nacht eliminiert ein "Verräter" einen anderen Spieler.',
          'Jeden Tag diskutieren und stimmen die Überlebenden ab, um den Verdächtigen zu eliminieren.',
          'Ziel: Entlarve den Täter, bevor er alle eliminiert.'
        ]
      },
      roles: {
        title: '🎭 ROLLEN',
        traitor: {
          name: 'Der Verräter',
          description: 'Eliminiert jede Nacht. Muss überleben.'
        },
        medium: {
          name: 'Das Medium',
          description: 'Erkennt, ob ein Spieler ein Dorfbewohner oder Verräter ist.'
        },
        protector: {
          name: 'Der Beschützer',
          description: 'Schützt jede Nacht einen Spieler.'
        },
        villager: {
          name: 'Der Dorfbewohner',
          description: 'Keine Kraft. Stimmt weise ab.'
        },
        liar: {
          name: 'Der Lügner',
          description: 'Lustige Rolle. Sät Zweifel.'
        }
      },
      objectives: {
        title: '🎯 ZIELE',
        traitor: 'Verräter: Eliminiere alle anderen, ohne gefasst zu werden.',
        village: 'Dorf: Entdecke den Verräter, bevor er gewinnt.'
      }
    },
    trapAnswer: {
      title: "Fallen-Antwort",
      question: "Frage",
      next: "Nächste",
      endGame: "Spiel beenden",
      endTitle: "Glückwunsch an alle!",
      endSubtitle: "Du hast das Fallen-Antwort Spiel beendet",
      home: "Startseite",
      readAloud: "Laut vorlesen",
      targetAnswers: "{{name}} antwortet!",
      error: "Ein Fehler ist aufgetreten",
      noQuestions: "Keine Fragen verfügbar",
      errorNext: "Beim Wechsel zur nächsten Runde ist ein Fehler aufgetreten",
      submit: "Senden",
      choices: "Auswahlmöglichkeiten",
      correctAnswer: "Richtige Antwort!",
      wrongAnswer: "Falsche Antwort.",
      correct: "Richtig",
      wrong: "Falsch",
      waitingForPlayers: "Warten auf andere Spieler...",
      playerAnswered: "{{count}} Spieler hat geantwortet",
      playerAnswered_plural: "{{count}} Spieler haben geantwortet",
      yourScore: "Deine Punktzahl",
      playerScores: "Spieler-Punktzahlen"
    },
    twoLettersOneWord: {
      score: "Punktzahl: {{score}}",
      theme: "Thema: {{theme}}",
      inputPlaceholder: "Geben Sie Ihr Wort ein...",
      verifyButton: "Überprüfen",
      verifyingButton: "Überprüfe...",
      validWord: "Gültiges Wort!",
      validWordMessage: "Du hast ein gültiges Wort gefunden!",
      invalidWord: "Ungültiges Wort",
      invalidWordMessage: "Dieses Wort entspricht nicht den angeforderten Kriterien.",
      noWordError: "Bitte geben Sie ein Wort ein",
      error: "Ein Fehler ist aufgetreten",
      howToPlay: "Finden Sie ein Wort, das die beiden vorgegebenen Buchstaben enthält und zum gewählten Thema passt.",
      "theme.marque": "eine Marke",
      "theme.ville": "eine Stadt",
      "theme.prenom": "ein Vorname",
      "theme.pays": "ein Land",
      "theme.animal": "ein Tier",
      "theme.metier": "ein Beruf",
      "theme.sport": "ein Sport",
      "theme.fruit": "eine Frucht",
      "theme.legume": "ein Gemüse",
      "theme.objet": "ein Objekt",
      "exampleWord": "Beispiel: {{word}}",
      "nextButton": "Nächste Runde",
      "noExampleAvailable": "Kein Beispiel verfügbar",
    },
    word_guessing: {
      targetPlayer: 'Lass {{player}} erraten',
      forbiddenWords: 'Verbotene Wörter',
      found: 'Wort gefunden!',
      forbidden: 'Verbotenes Wort!',
      nextWord: 'Nächstes Wort',
      categories: {
        lieux: 'Orte',
        aliments: 'Essen',
        transport: 'Transport',
        technologie: 'Technologie',
        sports: 'Sport',
        loisirs: 'Hobbies',
        nature: 'Natur',
        objets: 'Objekte',
        animaux: 'Tiere',
      },
      guesserInstructions: 'Dein Freund versucht, dich ein Wort erraten zu lassen!',
      guesserInfo: 'Höre aufmerksam zu und versuche, das Wort zu finden, ohne dass verbotene Wörter verwendet werden.',
    },
  },

  // Settings
  settings: {
    title: 'Einstellungen',
    language: 'Sprache',
    notifications: 'Benachrichtigungen',
    theme: 'Thema',
    privacy: 'Datenschutz',
    about: 'Über',
    help: 'Hilfe',
    darkMode: 'Dunkler Modus',
    lightMode: 'Heller Modus',
    system: 'System',
    buyAssets: {
      title: 'Assets kaufen',
      available: 'Verfügbare Assets',
      availableAssetsTitle: 'Verfügbare Assets',
      owned: 'Besessen',
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

  // Splash Screen
  splash: {
    title: 'Nightly',
    subtitle: 'Bereit zum Spielen',
    loading: 'Laden...',
  },

  // Rules translations
  rules: {
    title: 'SPIELREGELN',
    loading: 'Regeln laden...',
    confirm: 'Ich habe die Regeln gelesen',
    confirmStart: 'Ich habe die Regeln gelesen, Spiel starten',
    general: {
      title: 'ALLGEMEINE REGELN',
      description: 'Ein Spieler wird jede Runde zufällig bestimmt.'
    },
    participation: {
      title: 'TEILNAHME',
      description: 'Alle Spieler müssen aktiv teilnehmen.'
    },
    scoring: {
      title: 'PUNKTEVERGABE',
      description: 'Punkte werden gemäß den spezifischen Spielregeln vergeben.'
    }
  },

  room: {
    loading: "Raum laden...",
    notFound: "Raum nicht gefunden",
    codeLabel: "Raumcode",
    codeCopied: "Code in Zwischenablage kopiert",
    players: "{{count}} Spieler",
    players_plural: "{{count}} Spieler",
    host: "Host",
    ready: "Bereit",
    rules: "Regeln",
    rulesNotRead: "Bitte lesen Sie die Regeln, bevor Sie das Spiel starten.",
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
    minPlayersRequired: "Mindestens {{count}} Spieler erforderlich",
    notEnoughPlayers: "Nicht genug Spieler",
    rounds: "Runden",
    title: "Spielraum"
  },

  topBar: {
    greeting: 'Hallo',
    notifications: {
      title: 'Benachrichtigungen',
      comingSoon: 'Diese Funktion ist bald verfügbar!'
    }
  },

  // Paywall
  paywall: {
    title: 'Nightly Premium',
    subtitle: 'UNBEGRENZTER ZUGRIFF',
    tagline: 'SPIELE OHNE GRENZEN',
    features: {
      unlimited: 'Unbegrenzter Zugang zu allen Modi',
      weekly: 'Neue Karten jede Woche',
      visuals: 'Exklusive visuelle Themen',
      characters: 'Charakteranpassung',
      updates: 'Priorisierte Updates'
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
        message: 'Das Abonnement ist zurzeit nicht verfügbar. Bitte versuchen Sie es später noch einmal.'
      },
      success: {
        title: 'Erfolg',
        message: 'Vielen Dank für Ihren Kauf!'
      },
      pending: {
        title: 'Information',
        message: 'Ihr Abonnement wurde verarbeitet, ist aber noch nicht aktiv. Bitte starten Sie die App neu.'
      },
      error: {
        title: 'Fehler',
        message: 'Der Kauf ist fehlgeschlagen. Bitte versuchen Sie es erneut oder wählen Sie eine andere Zahlungsmethode.'
      },
      restoreSuccess: {
        title: 'Erfolg',
        message: 'Ihr Kauf wurde wiederhergestellt!'
      },
      restoreError: {
        title: 'Fehler',
        message: 'Die Wiederherstellung der Käufe ist fehlgeschlagen'
      },
      termsError: {
        title: 'Fehler',
        message: 'Nutzungsbedingungen konnten nicht geöffnet werden'
      }
    },
    prices: {
      weekly: '3,99',
      monthly: '7,99',
      annual: '29,99',
      currency: '€'
    },
    freeTrial: '3-Tage-Gratistest',
  },

  assets: {
    avatars: {
      'avatar-panda': {
        name: 'Panda',
        description: 'Ein entzückender Panda für dein Profil'
      },
      'avatar-chat': {
        name: 'Katze',
        description: 'Eine süße und verspielte Katze'
      },
      'avatar-chat-rare': {
        name: 'Mysteriöse Katze',
        description: 'Eine mysteriöse Katze mit leuchtenden Augen'
      },
      'avatar-chat-rare-2': {
        name: 'Seltene Katze',
        description: 'Eine seltene Katze mit einzigartigem Design'
      },
      'avatar-crocodile': {
        name: 'Krokodil',
        description: 'Ein beeindruckendes Krokodil'
      },
      'avatar-hibou': {
        name: 'Eule',
        description: 'Eine weise und mysteriöse Eule'
      },
      'avatar-grenouille': {
        name: 'Frosch',
        description: 'Ein magischer und farbenfroher Frosch'
      },
      'avatar-oiseau': {
        name: 'Vogel',
        description: 'Ein Vogel mit lebendigen Farben'
      },
      'avatar-renard': {
        name: 'Fuchs',
        description: 'Ein schlauer und eleganter Fuchs'
      },
      'avatar-dragon': {
        name: 'Drache',
        description: 'Ein majestätischer, feuerspeiender Drache'
      },
      'avatar-ourse': {
        name: 'Bär',
        description: 'Ein majestätischer Bär'
      },
      'avatar-loup-rare': {
        name: 'Seltener Wolf',
        description: 'Ein seltener und mysteriöser Wolf'
      },
      'avatar-dragon-rare': {
        name: 'Legendärer Drache',
        description: 'Ein majestätischer, feuerspeiender Drache'
      },
      'avatar-licorne': {
        name: 'Einhorn',
        description: 'Ein legendäres Einhorn'
      },
      'avatar-phoenix': {
        name: 'Phönix',
        description: 'Ein legendärer Phönix, der aus seiner Asche steigt'
      }
    }
  },

  inviteModal: {
    title: "Freunde einladen",
    roomCode: "Raumcode",
    instruction: "Scannen Sie den QR-Code oder teilen Sie diesen Code, um Ihre Freunde in den Raum einzuladen.",
    shareButton: "Teilen"
  },

  // Common translations
  common: {
    ok: 'OK',
  },
};