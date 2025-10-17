const de = {
  // Allgemein
  app: {
    name: 'Nightly',
  },
  
  // Sprachbildschirm
  language: {
    title: 'Sprache',
    selectLanguage: 'Wählen Sie Ihre bevorzugte Sprache für die Anwendung',
    updated: 'Sprache aktualisiert',
    updatedMessage: 'Die Sprache der Anwendung wurde geändert.',
    error: 'Fehler',
    errorMessage: 'Die Sprache konnte nicht geändert werden.',
  },

  // Navigation
  navigation: {
    back: 'Zurück',
    home: 'Startseite',
    profile: 'Profil',
    settings: 'Einstellungen',
  },

  // Fehlermeldungen
  errors: {
    general: 'Ein Fehler ist aufgetreten',
    tryAgain: 'Bitte versuchen Sie es erneut',
    networkError: 'Netzwerkfehler',
    authError: 'Authentifizierungsfehler',
  },

  // Authentifizierung
  auth: {
    login: {
      title: 'Anmelden',
      email: 'E-Mail',
      password: 'Passwort',
      submit: 'Anmelden',
      forgotPassword: 'Passwort vergessen?',
      noAccount: 'Kein Konto?',
      signUp: 'Registrieren',
      username: 'Dein Spitzname',
      usernameRequired: 'Bitte geben Sie Ihren Spitznamen ein',
      usernameLength: 'Der Spitzname muss mindestens 3 Zeichen lang sein',
      enterUsername: 'Geben Sie Ihren Spitznamen ein, um zu spielen',
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
      haveAccount: 'Haben Sie bereits ein Konto?',
      login: 'Anmelden',
    },
  },

  // Profil
  profile: {
    title: 'Profil',
    edit: 'Bearbeiten',
    save: 'Speichern',
    cancel: 'Abbrechen',
    username: 'Benutzername',
    defaultUsername: 'Spieler',
    email: 'E-Mail',
    bio: 'Bio',
    avatar: 'Profilbild',
    changeAvatar: 'Bild ändern',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    logoutError: 'Beim Abmelden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
    contact: 'Kontaktieren Sie uns',
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
    avatarChanged: 'Ihr Profilbild wurde erfolgreich aktualisiert!',
    avatarChangeError: 'Beim Ändern Ihres Profilbilds ist ein Fehler aufgetreten.',
    premium: {
      title: 'Premium Pass',
      try: 'Premium ausprobieren',
      free: '3 Tage kostenlos',
      price: 'danach 3,99€ pro Woche',
      features: {
        unlock: 'Schalte alle Modi frei',
        weekly: 'Jede Woche ein neues Paket',
        friends: 'Kostenloser Zugang für deine Freunde',
        cancel: 'Jederzeit kündbar',
      },
    },
  },

  // Startseite
  home: {
    title: 'Startseite',
    welcome: 'Willkommen',
    createGame: 'Spiel erstellen',
    joinGame: 'Spiel beitreten',
    enterCode: 'Code eingeben',
    join: 'Beitreten',
    gameModes: {
      title: 'Spielmodi',
      classic: 'Klassisch',
      custom: 'Benutzerdefiniert',
      quick: 'Schnellspiel',
    },
    errors: {
      noConnection: 'Keine Internetverbindung. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
      loginRequired: 'Sie müssen angemeldet sein, um einen Spielraum zu erstellen.',
      invalidSession: 'Ihre Benutzersitzung ist ungültig. Bitte melden Sie sich erneut an.',
      roomCreationFailed: 'Der Raum konnte nicht erstellt werden',
      invalidCode: 'Ungültiger Spielcode',
      roomNotFound: 'Raum nicht gefunden',
      gameStarted: 'Dieses Spiel hat bereits begonnen',
      roomFull: 'Dieses Spiel ist voll',
      notAuthenticated: 'Benutzer nicht authentifiziert',
      alreadyInGame: 'Sie sind bereits in diesem Spiel',
      serverTimeout: 'Der Server antwortet zu langsam. Bitte versuchen Sie es erneut.',
      networkError: 'Netzwerkfehler: Überprüfen Sie Ihre Internetverbindung',
      permissionDenied: 'Zugriff verweigert: Überprüfen Sie die Firestore-Sicherheitsregeln',
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
    loading: "Verbindung zum Spiel wird hergestellt...",
    categories: {
      nightly_modes: "VORSCHLAG DER WOCHE",
      same_room: "IM SELBEN RAUM",
      online: "ONLINE"
    },
    subtitles: {
      same_room: "Spielt zusammen im selben Raum!",
      online: "Spielt auch, wenn ihr nicht zusammen seid"
    },
    games: {
      "listen-but-don-t-judge": {
        name: "WIR HÖREN ZU, ABER WIR URTEILEN NICHT",
        description: "Ein kostenloser Modus, um mit Freunden zu lachen.",
        tags: {
          free: "KOSTENLOS"
        }
      },
      "truth-or-dare": {
        name: "WAHRHEIT ODER PFLICHT",
        description: "Der Klassiker neu interpretiert mit exklusiven Herausforderungen.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "never-have-i-ever-hot": {
        name: "ICH HAB NOCH NIE 🔞",
        description: "Unanständige und unpassende Fragen... Seid ihr bereit, dazu zu stehen?",
        tags: {
          premium: "PREMIUM"
        }
      },
      "genius-or-liar": {
        name: "GENIE ODER LÜGNER",
        description: "Ein lustiger Modus, in dem du dein Wissen beweisen oder die Konsequenzen tragen musst.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "the-hidden-village": {
        name: "DAS VERBORGENE DORF",
        description: "Ein Spiel voller Bluff, Strategie und Diskussionen... für alle, die gerne ihre Freunde beschuldigen 😈",
        tags: {
          premium: "PREMIUM"
        }
      },
      "trap-answer": {
        name: "Fallenfrage",
        description: "Ein Quiz, bei dem du bei einer falschen Antwort Punkte verlierst... Kannst du den Fallen ausweichen?",
        tags: {
          free: "KOSTENLOS"
        }
      },
      "two-letters-one-word": {
        name: "2 Buchstaben 1 Wort",
        description: "Finde ein Wort, das die beiden gegebenen Buchstaben enthält und zum Thema passt.",
        tags: {
          free: "KOSTENLOS",
          "new": "NEU",
          "premium": "PREMIUM"
        },
        score: "Punktestand: {{score}}",
        theme: "Thema: {{theme}}",
        inputPlaceholder: "Gib dein Wort ein...",
        verifyButton: "Überprüfen",
        verifyingButton: "Wird überprüft...",
        validWord: "Gültiges Wort!",
        validWordMessage: "Du hast ein gültiges Wort gefunden!",
        invalidWord: "Ungültiges Wort",
        invalidWordMessage: "Dieses Wort entspricht nicht den geforderten Kriterien.",
        noWordError: "Bitte gib ein Wort ein",
        error: "Ein Fehler ist aufgetreten",
        howToPlay: "Finde ein Wort, das die beiden gegebenen Buchstaben enthält und zum gewählten Thema passt.",
        "theme.marque": "eine Marke",
        "theme.ville": "eine Stadt",
        "theme.prenom": "ein Vorname",
        "theme.pays": "ein Land",
        "theme.animal": "ein Tier",
        "theme.metier": "ein Beruf",
        "theme.sport": "eine Sportart",
        "theme.fruit": "eine Frucht",
        "theme.legume": "ein Gemüse",
        "theme.objet": "ein Gegenstand",
        "exampleWord": "Beispiel: {{word}}",
        "nextButton": "Nächste Runde",
        "playerCountError": "Das Spiel ist für 1 bis 4 Spieler.",
        "noExampleAvailable": "Kein Beispiel verfügbar",
      },
      'word-guessing': {
        name: 'WORTE RATEN',
        description: 'Lass jemanden ein Wort erraten, ohne die verbotenen Wörter zu benutzen... Ein Spiel mit Worten und Geschwindigkeit!',
        tags: {
          free: 'KOSTENLOS'
        },
      },
    }
  },

  // Allgemeine Übersetzungen
  common: {
    ok: 'OK',
    loading: 'Wird geladen...',
    lumicoins: 'Lumicoins',
  },

  // Einstellungen
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
      owned: 'Im Besitz',
      cost: 'Kosten',
      points: 'punkte',
      buy: 'Kaufen',
      confirm: 'Kauf bestätigen',
      cancel: 'Abbrechen',
      success: 'Asset erfolgreich gekauft!',
      error: 'Fehler beim Kauf',
      insufficientPoints: 'Nicht genügend Punkte',
      equip: 'Ausrüsten',
    },
  },

  // Spiel
  game: {
    round: 'Runde {{current}}/{{total}}',
    start: 'Start',
    join: 'Beitreten',
    leave: 'Spiel verlassen',
    players: 'Spieler',
    waiting: 'Warten',
    yourTurn: 'Du bist dran',
    gameOver: 'Spiel beendet',
    winner: 'Gewinner',
    draw: 'Unentschieden',
    error: "Fehler",
    unknownMode: "Unbekannter Spielmodus: {{mode}}",
    notFound: "Kein Spieldokument für die ID gefunden: {{id}}",
    noMode: "Kein Spielmodus im Spieldokument gefunden.",
    loading: "Wird geladen...",
    results: {
      title: "Endergebnisse",
      subtitle: "Glückwunsch an alle!",
      bravo: "Glückwunsch {{name}}!",
      points: "punkte",
      home: "Startseite",
      calculating: "Ergebnisse werden berechnet...",
      podium: {
        first: "1. Platz",
        second: "2. Platz",
        third: "3. Platz",
        others: "Andere Spieler",
        title: "Podiumsplätze",
      },
      rank: "Rang",
      score: "Punktestand",
      player: "Spieler",
      "two-letters-one-word": {
        title: "Spiel beendet!",
        subtitle: "Danke, dass du 2 Buchstaben 1 Wort gespielt hast!",
        totalWords: "Gefundene Wörter",
        bestWord: "Bestes Wort",
        averageScore: "Durchschnittliche Punktzahl",
        timePlayed: "Gespielte Zeit",
        newHighScore: "Neuer Highscore!",
        shareResults: "Ergebnisse teilen",
        playAgain: "Nochmal spielen"
      },
      "word-guessing": {
        title: "Wort Raten",
        timer: "Verbleibende Zeit",
        score: "Punktestand",
        forbiddenWords: "Verbotene Wörter",
        start: "Start",
        next: "Nächstes Wort",
        found: "Wort gefunden!",
        forbidden: "Verbotenes Wort benutzt!",
        timeUp: "Zeit abgelaufen!",
        finalScore: "Endstand",
        playAgain: "Nochmal spielen"
      },
      naughty: {
        title: 'Ranking der unartigsten Spieler',
      },
      yourCurrentRank: 'Dein aktueller Rang',
    },
    player: 'der Spieler',
    truthOrDare: {
      title: 'Wahrheit oder Pflicht',
      choice: 'Wahl',
      question: 'Frage',
      action: 'Pflicht',
      submitChoice: 'Wahl senden',
      submitAnswer: 'Antwort senden',
      next: 'Weiter',
      endGame: 'Spiel beenden',
      endTitle: 'Glückwunsch an alle!',
      endSubtitle: 'Du hast das Spiel Wahrheit oder Pflicht beendet',
      home: 'Zurück zur Startseite',
      readAloud: 'Laut vorlesen',
      targetChooses: '{{name}} wählt zwischen Wahrheit oder Pflicht!',
      targetAnswers: '{{name}} beantwortet die Wahrheit!',
      targetDoesDare: '{{name}} macht die Pflicht!',
      error: 'Ein Fehler ist aufgetreten',
      noQuestions: 'Keine Fragen verfügbar',
      errorNext: 'Beim Wechsel zur nächsten Runde ist ein Fehler aufgetreten',
      naughtyRanking: 'Unanständige Rangliste',
      truth: "Wahrheit",
      dare: "Pflicht",
      chooseTask: "Wähle: Wahrheit oder Pflicht?",
      isThinking: "denkt nach...",
      willChoose: "wird wählen",
      or: "oder",
      iAnswered: "Ich habe geantwortet",
      iRefuse: "Ich passe",
      voteInProgress: "Abstimmung läuft",
      otherPlayersDecide: "Die anderen Spieler entscheiden, ob",
      playedGame: "das Spiel gespielt hat",
      votes: "stimmen",
      vote: "Abstimmen",
      did: "Hat",
      thanksVote: "Danke für deine Stimme!",
      yes: "Ja",
      no: "Nein",
      round: "Runde",
      roundEnd: "Ende der Runde für",
      scores: "Punktestände",
      errorSelectingQuestion: "Fehler bei der Auswahl der Frage",
      noQuestionsAvailable: "Für diese Wahl sind keine Fragen verfügbar",
    },
    listenButDontJudge: {
      title: 'Wir Hören Zu, Aber Wir Urteilen Nicht',
      question: 'Frage',
      next: 'Weiter',
      endGame: 'Spiel beenden',
      endTitle: 'Glückwunsch an alle!',
      endSubtitle: 'Du hast das Spiel Wir Hören Zu, Aber Wir Urteilen Nicht beendet',
      home: 'Zurück zur Startseite',
      readAloud: 'Laut vorlesen',
      targetAnswers: '{{name}} antwortet!',
      error: 'Ein Fehler ist aufgetreten',
      noQuestions: 'Keine Fragen verfügbar',
      errorNext: 'Ein Fehler ist beim Wechsel zur nächsten Runde aufgetreten',
      waiting: 'Warten auf andere Spieler...',
      answered: 'Sie haben bereits geantwortet. Warten auf andere Spieler...',
      alreadyAnswered: 'Sie haben bereits auf diese Frage geantwortet',
      answerPlaceholder: 'Schreiben Sie Ihre Antwort hier...',
      submit: 'Absenden',
      errorSubmit: 'Fehler beim Absenden der Antwort',
      waitingForOthers: 'Warten auf andere Stimmen...',
      waitingVote: 'Warten auf die Stimme des Zielspielers...',
      voteTitle: 'Wählen Sie die beste Antwort',
    },
    neverHaveIEverHot: {
      never: "Ich habe noch nie",
      ever: "Ich habe schon",
      yes: "Ja",
      no: "Nein",
      waiting: "Warte auf die Wahl des Zielspielers...",
      prepare: "Mach dich bereit zu antworten!",
      submit: "Senden",
      next: "Nächste Runde",
      endGame: "Spiel beenden",
      errorSubmit: "Antwort konnte nicht gesendet werden",
      endTitle: "Glückwunsch an alle!",
      endSubtitle: "Du hast das Spiel Ich Hab Noch Nie 🔞 beendet",
      home: "Zurück zur Startseite",
      readAloud: "Lies die Frage laut vor",
      targetReads: "{{name}} liest die Frage",
      noQuestions: "Keine Fragen verfügbar",
      errorNext: "Beim Wechsel zur nächsten Runde ist ein Fehler aufgetreten",
      naughtyRanking: "Unanständige Rangliste"
    },
    geniusOrLiar: {
      // --- Haupt-UI-Schlüssel aus Screenshots ---
      accuseTitle: 'Wer ist der Lügner?',
      pretendKnows: 'behauptet zu wissen',
      accuseNoOne: 'Niemanden beschuldigen',
      roundResults: 'Ergebnisse der Runde',
      correctAnswerLabel: 'Die richtige Antwort war: {{answer}}',
      givenAnswerLabel: 'Deine Antwort: {{answer}}',
      drinks: 'Schlucke',
      
      // --- Spieler-Status ---
      playerStatus: {
        wrongAnswer: 'Falsche Antwort',
        dontKnow: 'Wusste die Antwort nicht',
        correctAnswer: 'Richtige Antwort!',
        correctButAccused: 'Genie, aber beschuldigt!',
        liarNotAccused: 'Die Lüge wurde geglaubt!',
        liarAccused: 'Lügner, und entlarvt!',
      },
      accuserStatus: {
        correctAccusation: 'Gut erkannt!',
        wrongAccusation: 'Falsche Anschuldigung!'
      },
      
      // --- Allgemeines Gameplay ---
      answerPlaceholder: 'Deine Antwort...',
      validate: 'Bestätigen',
      know: 'Ich weiß es',
      dontKnow: 'Ich weiß es nicht',
      accuse: 'Beschuldigen',
      nextRound: 'Nächste Runde',
      showResults: 'Ergebnisse anzeigen',
      endGame: 'Endergebnisse anzeigen',
      chooseGameMode: 'Wähle den Spielmodus',
      pointsMode: 'Punkte',
      forfeitsMode: 'Schlucke',
      points: 'punkte',
      forfeit: 'schluck',
      forfeits: 'schlucke',

      // --- Warte- / Info-Text ---
      yourAnswer: 'Deine Antwort',
      waitingForPlayers: 'Warte auf andere Spieler...',
      waitingForAnswers: 'Warte, bis andere Spieler geantwortet haben...',
      waitingForVotes: 'Warte, bis andere Spieler abgestimmt haben...',
      playersWhoKnow: 'Spieler, die behaupten, es zu wissen:',
      playersWhoDontKnow: 'Spieler, die es nicht wissen:',
      noOneKnows: 'Niemand kannte die Antwort!',
      allPlayersKnow: 'Alle kannten die Antwort!',
      wasAccused: 'Wurde beschuldigt',
      accusedBy: 'Beschuldigt von {{count}}',

      // --- Fehler / Sonderfälle ---
      errorSubmit: 'Fehler beim Senden der Antwort.',
      noQuestionAvailable: 'Für dieses Spiel sind keine Fragen verfügbar.',
      incorrectQuestionFormat: 'Falsches Fragenformat (ID: {{id}})',
      modeSelectError: 'Fehler bei der Auswahl des Spielmodus.',
      
      // --- Fragenkategorien ---
      questionTypes: {
        cultureG: 'Allgemeinwissen',
        cultureGHard: 'Allgemeinwissen (Schwer)',
        culturePop: 'Popkultur',
        cultureGeek: 'Geek-Kultur',
        cultureArt: 'Kunst',
        hard: 'Schwer',
        devinette: 'Rätsel',
        verite: 'Wahrheit'
      }
    },
    theHiddenVillage: {
      title: 'DAS VERBORGENE DORF',
      subtitle: 'Ein Spiel voller Bluff und Strategie',
      description: 'Ein Spiel voller Bluff, Strategie und Diskussionen... für alle, die gerne ihre Freunde beschuldigen 😈',
      principles: {
        title: '🌓 SPIELPRINZIP',
        list: [
          'Jede Nacht eliminiert ein "Verräter" einen anderen Spieler.',
          'Jeden Tag diskutieren und stimmen die Überlebenden ab, um den zu eliminieren, den sie verdächtigen.',
          'Ziel: den Schuldigen entlarven, bevor er alle eliminiert.'
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
          description: 'Errät, ob ein Spieler ein Dorfbewohner oder ein Verräter ist.'
        },
        protector: {
          name: 'Der Beschützer',
          description: 'Schützt jede Nacht einen Spieler.'
        },
        villager: {
          name: 'Der Dorfbewohner',
          description: 'Keine Macht. Stimmt weise ab.'
        },
        liar: {
          name: 'Der Lügner',
          description: 'Lustige Rolle. Streut Zweifel.'
        }
      },
      objectives: {
        title: '🎯 ZIELE',
        traitor: 'Verräter: alle anderen eliminieren, ohne erwischt zu werden.',
        village: 'Dorf: den Verräter entdecken, bevor er gewinnt.'
      }
    },
    trapAnswer: {
      title: "Fallenfrage",
      question: "Frage",
      next: "Weiter",
      endGame: "Spiel beenden",
      endTitle: "Glückwunsch an alle!",
      endSubtitle: "Du hast das Spiel Fallenfrage beendet",
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
      waitingForPlayers: "Warte auf andere Spieler...",
      playerAnswered: "{{count}} Spieler hat geantwortet",
      playerAnswered_plural: "{{count}} Spieler haben geantwortet",
      yourScore: "Dein Punktestand",
      playerScores: "Punktestände der Spieler"
    },
    twoLettersOneWord: {
      score: "Punktestand: {{score}}",
      theme: "Thema: {{theme}}",
      inputPlaceholder: "Gib dein Wort ein...",
      verifyButton: "Überprüfen",
      verifyingButton: "Wird überprüft...",
      validWord: "Gültiges Wort!",
      validWordMessage: "Du hast ein gültiges Wort gefunden!",
      invalidWord: "Ungültiges Wort",
      invalidWordMessage: "Dieses Wort entspricht nicht den geforderten Kriterien.",
      noWordError: "Bitte gib ein Wort ein",
      error: "Ein Fehler ist aufgetreten",
      howToPlay: "Finde ein Wort, das die beiden gegebenen Buchstaben enthält und zum gewählten Thema passt.",
      "theme.marque": "eine Marke",
      "theme.ville": "eine Stadt",
      "theme.prenom": "ein Vorname",
      "theme.pays": "ein Land",
      "theme.animal": "ein Tier",
      "theme.metier": "ein Beruf",
      "theme.sport": "eine Sportart",
      "theme.fruit": "eine Frucht",
      "theme.legume": "ein Gemüse",
      "theme.objet": "ein Gegenstand",
      "exampleWord": "Beispiel: {{word}}",
      "nextButton": "Nächste Runde",
      "noExampleAvailable": "Kein Beispiel verfügbar",
    },
    waitingForPlayersTitle: "Warte auf Spieler",
    waitingForPlayersMessage: "Bitte warte, bis alle Spieler ihr Wort eingereicht haben.",
    actionNotAllowedTitle: "Aktion nicht erlaubt",
    onlyHostCanAdvance: "Nur der Host kann zur nächsten Runde übergehen.",
    word_guessing: {
      targetPlayer: 'Lass {{player}} raten',
      forbiddenWords: 'Verbotene Wörter',
      guesserInstructions: 'Dein Freund versucht, dich ein Wort erraten zu lassen!',
      guesserInfo: 'Höre aufmerksam zu und versuche, das Wort zu finden, ohne dass er die verbotenen Wörter benutzt.',
      found: 'Wort gefunden!',
      forbidden: 'Verbotenes Wort!',
      nextWord: 'Nächstes Wort',
      categories: {
        lieux: 'Orte',
        aliments: 'Lebensmittel',
        transport: 'Transport',
        technologie: 'Technologie',
        sports: 'Sport',
        loisirs: 'Hobbys',
        nature: 'Natur',
        objets: 'Gegenstände',
        animaux: 'Tiere',
      },
    },
  },

  // Ladebildschirm
  splash: {
    title: 'Nightly',
    subtitle: 'Bereit zum Spielen',
    loading: 'Wird geladen...',
  },

  // Regeln
  rules: {
    title: 'SPIELREGELN',
    loading: 'Regeln werden geladen...',
    confirm: 'Ich habe die Regeln gelesen',
    confirmStart: 'Ich habe die Regeln gelesen, Spiel starten',
    general: {
      title: 'ALLGEMEINE REGELN',
      description: 'In jeder Runde wird ein Spieler zufällig ausgewählt.'
    },
    participation: {
      title: 'TEILNAHME',
      description: 'Alle Spieler müssen aktiv teilnehmen.'
    },
    scoring: {
      title: 'PUNKTWERTUNG',
      description: 'Punkte werden nach den spezifischen Regeln des Spiels vergeben.'
    }
  },

  room: {
    loading: "Raum wird geladen...",
    notFound: "Raum nicht gefunden",
    codeLabel: "Raumcode",
    codeCopied: "Code in die Zwischenablage kopiert",
    players: "{{count}} Spieler",
    players_plural: "{{count}} Spieler",
    host: "Host",
    ready: "Bereit",
    rules: "Regeln",
    rulesNotRead: "Bitte lies die Regeln, bevor du das Spiel startest.",
    iAmReady: "Ich bin bereit",
    startGame: "Spiel starten",
    inviteTitle: "Tritt meinem Spiel bei",
    inviteMessage: "Tritt meinem Spiel auf Nightly bei! Code: {{code}}",
    error: "Fehler",
    errorLoading: "Der Raum konnte nicht geladen werden",
    errorStart: "Das Spiel konnte nicht gestartet werden",
    errorLeave: "Der Raum konnte nicht verlassen werden",
    errorReady: "Konnte nicht auf 'Bereit' stellen",
    errorCopy: "Fehler beim Kopieren des Codes",
    errorShare: "Fehler beim Teilen",
    successCopy: "Code in die Zwischenablage kopiert",
    minPlayersRequired: "Mindestens {{count}} Spieler erforderlich",
    notEnoughPlayers: "Nicht genügend Spieler",
    rounds: "runden",
    title: "Spielraum"
  },

  topBar: {
    greeting: 'Hallo',
    notifications: {
      title: 'Benachrichtigungen',
      comingSoon: 'Diese Funktion kommt bald!'
    }
  },

  // Paywall
  paywall: {
    title: 'Nightly Premium',
    subtitle: 'UNBEGRENZTER ZUGANG',
    tagline: 'SPIELE OHNE LIMITS',
    features: {
      unlimited: 'Unbegrenzter Zugang zu allen Modi',
      weekly: 'Jede Woche neue Karten',
      visuals: 'Exklusive visuelle Designs',
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
        description: 'Für alle, die regelmäßig spielen'
      },
      annual: {
        badge: 'SPAREN',
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
        message: 'Das Abonnement ist im Moment nicht verfügbar. Bitte versuchen Sie es später erneut.'
      },
      success: {
        title: 'Erfolg',
        message: 'Danke für deinen Kauf!'
      },
      pending: {
        title: 'Information',
        message: 'Ihr Abonnement wurde bearbeitet, ist aber noch nicht aktiv. Bitte starten Sie die Anwendung neu.'
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
        message: 'Die Nutzungsbedingungen konnten nicht geöffnet werden'
      }
    },
    prices: {
      weekly: '3,99',
      monthly: '7,99',
      annual: '29,99',
      currency: '€'
    },
    freeTrial: '3 Tage kostenlos',
  },

  assets: {
    avatars: {
      'avatar-panda': {
        name: 'Panda',
        description: 'Ein niedlicher Panda für dein Profil'
      },
      'avatar-chat': {
        name: 'Katze',
        description: 'Eine süße und verspielte Katze'
      },
      'avatar-chat-rare': {
        name: 'Geheimnisvolle Katze',
        description: 'Eine geheimnisvolle Katze mit leuchtenden Augen'
      },
      'avatar-chat-rare-2':
      {
        name: 'Seltene Katze',
        description: 'Eine seltene Katze mit einzigartigem Design'
      },
      'avatar-crocodile': {
        name: 'Krokodil',
        description: 'Ein beeindruckendes Krokodil'
      },
      'avatar-hibou': {
        name: 'Eule',
        description: 'Eine weise und geheimnisvolle Eule'
      },
      'avatar-grenouille': {
        name: 'Frosch',
        description: 'Ein magischer und farbenfroher Frosch'
      },
      'avatar-oiseau': {
        name: 'Vogel',
        description: 'Ein Vogel mit leuchtenden Farben'
      },
      'avatar-renard': {
        name: 'Fuchs',
        description: 'Ein schlauer und eleganter Fuchs'
      },
      'avatar-dragon': {
        name: 'Drache',
        description: 'Ein majestätischer feuerspeiender Drache'
      },
      'avatar-ourse': {
        name: 'Bärin',
        description: 'Eine majestätische Bärin'
      },
      'avatar-loup-rare': {
        name: 'Seltener Wolf',
        description: 'Ein seltener und geheimnisvoller Wolf'
      },
      'avatar-dragon-rare': {
        name: 'Legendärer Drache',
        description: 'Ein majestätischer feuerspeiender Drache'
      },
      'avatar-licorne': {
        name: 'Einhorn',
        description: 'Ein legendäres Einhorn'
      },
      'avatar-phoenix': {
        name: 'Phönix',
        description: 'Ein legendärer Phönix, der aus seiner Asche aufsteigt'
      }
    }
  },

  inviteModal: {
    title: "Freunde einladen",
    roomCode: "Raumcode",
    instruction: "Scanne den QR-Code oder teile diesen Code, um deine Freunde in den Raum einzuladen.",
    shareButton: "Teilen"
  },

  ads: {
    title: 'Schau dir eine Werbung an und erhalte 3 weitere Runden!',
  },
};

export default de;