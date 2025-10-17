const it = {
  // Generale
  app: {
    name: 'Nightly',
  },
  
  // Schermata Lingua
  language: {
    title: 'Lingua',
    selectLanguage: 'Seleziona la tua lingua preferita per l\'applicazione',
    updated: 'Lingua aggiornata',
    updatedMessage: 'La lingua dell\'applicazione è stata cambiata.',
    error: 'Errore',
    errorMessage: 'Impossibile cambiare la lingua.',
  },

  // Navigazione
  navigation: {
    back: 'Indietro',
    home: 'Home',
    profile: 'Profilo',
    settings: 'Impostazioni',
  },

  // Messaggi di Errore
  errors: {
    general: 'Si è verificato un errore',
    tryAgain: 'Per favore, riprova',
    networkError: 'Errore di rete',
    authError: 'Errore di autenticazione',
  },

  // Autenticazione
  auth: {
    login: {
      title: 'Accesso',
      email: 'Email',
      password: 'Password',
      submit: 'Accedi',
      forgotPassword: 'Password dimenticata?',
      noAccount: 'Non hai un account?',
      signUp: 'Registrati',
      username: 'Il tuo soprannome',
      usernameRequired: 'Per favore, inserisci il tuo soprannome',
      usernameLength: 'Il soprannome deve contenere almeno 3 caratteri',
      enterUsername: 'Inserisci il tuo soprannome per giocare',
      connecting: 'Connessione in corso...',
      play: 'Gioca',
      selectCharacter: 'Scegli il tuo personaggio',
      characterDescription: 'Seleziona un personaggio che ti rappresenti per la partita',
    },
    register: {
      title: 'Registrazione',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Conferma Password',
      submit: 'Registrati',
      haveAccount: 'Hai già un account?',
      login: 'Accedi',
    },
  },

  // Profilo
  profile: {
    title: 'Profilo',
    edit: 'Modifica',
    save: 'Salva',
    cancel: 'Annulla',
    username: 'Nome utente',
    defaultUsername: 'Giocatore',
    email: 'Email',
    bio: 'Bio',
    avatar: 'Immagine del profilo',
    changeAvatar: 'Cambia immagine',
    settings: 'Impostazioni',
    logout: 'Esci',
    logoutError: 'Si è verificato un errore durante la disconnessione. Per favore, riprova.',
    contact: 'Contattaci',
    contactEmail: 'Inviaci un\'email a support@cosmicquest.com',
    buyAssetsTitle: 'Acquista asset',
    insufficientPoints: 'Punti insufficienti',
    insufficientPointsMessage: 'Non hai abbastanza punti per sbloccare questo asset.',
    success: 'Successo',
    assetUnlocked: '{{asset}} è stato sbloccato con successo!',
    unlockError: 'Si è verificato un errore durante lo sblocco dell\'asset.',
    restorePurchases: 'Ripristina acquisti',
    restoring: 'Ripristino in corso...',
    restoreSuccess: 'Successo',
    restoreSuccessMessage: 'I tuoi acquisti sono stati ripristinati con successo',
    restoreError: 'Si è verificato un errore durante il ripristino degli acquisti',
    avatarChanged: 'La tua immagine del profilo è stata aggiornata con successo!',
    avatarChangeError: 'Si è verificato un errore durante la modifica dell\'immagine del profilo.',
    premium: {
      title: 'Pass Premium',
      try: 'Prova premium',
      free: '3 giorni gratis',
      price: 'poi 3,99€ a settimana',
      features: {
        unlock: 'Sblocca tutte le modalità',
        weekly: 'Un nuovo pacchetto ogni settimana',
        friends: 'Accesso gratuito per i tuoi amici',
        cancel: 'Annulla quando vuoi',
      },
    },
  },

  // Home
  home: {
    title: 'Home',
    welcome: 'Benvenuto',
    createGame: 'Crea partita',
    joinGame: 'Unisciti a partita',
    enterCode: 'Inserisci codice',
    join: 'Unisciti',
    gameModes: {
      title: 'Modalità di gioco',
      classic: 'Classica',
      custom: 'Personalizzata',
      quick: 'Veloce',
    },
    errors: {
      noConnection: 'Nessuna connessione internet. Per favore, controlla la tua connessione e riprova.',
      loginRequired: 'Devi aver effettuato l\'accesso per creare una stanza di gioco.',
      invalidSession: 'La tua sessione utente non è valida. Per favore, accedi di nuovo.',
      roomCreationFailed: 'Impossibile creare la stanza',
      invalidCode: 'Codice partita non valido',
      roomNotFound: 'Stanza non trovata',
      gameStarted: 'Questa partita è già iniziata',
      roomFull: 'Questa partita è piena',
      notAuthenticated: 'Utente non autenticato',
      alreadyInGame: 'Sei già in questa partita',
      serverTimeout: 'Il server sta impiegando troppo tempo a rispondere. Per favore, riprova.',
      networkError: 'Errore di rete: controlla la tua connessione internet',
      permissionDenied: 'Accesso negato: controlla le regole di sicurezza di Firestore',
    },
    room: {
      create: 'Crea stanza',
      join: 'Unisciti a stanza',
      code: 'Codice stanza',
      players: 'Giocatori',
      status: {
        waiting: 'In attesa',
        playing: 'In gioco',
        finished: 'Terminata',
      },
    },
    codePlaceholder: "Inserisci il codice della partita",
    loading: "Connessione alla partita...",
    categories: {
      nightly_modes: "SUGGERIMENTO DELLA SETTIMANA",
      same_room: "NELLA STESSA STANZA",
      online: "A DISTANZA"
    },
    subtitles: {
      same_room: "Da giocare insieme nella stessa stanza!",
      online: "Per giocare anche quando non si è insieme"
    },
    games: {
      "listen-but-don-t-judge": {
        name: "ASCOLTIAMO MA NON GIUDICHIAMO",
        description: "Una modalità gratuita per farsi due risate con gli amici.",
        tags: {
          free: "GRATIS"
        }
      },
      "truth-or-dare": {
        name: "VERITÀ O OBBLIGO",
        description: "Il classico rivisitato con sfide esclusive.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "never-have-i-ever-hot": {
        name: "NON HO MAI 🔞",
        description: "Domande piccanti e inappropriate... Pronti a confessare?",
        tags: {
          premium: "PREMIUM"
        }
      },
      "genius-or-liar": {
        name: "GENIO O BUGIARDO",
        description: "Una modalità divertente in cui devi dimostrare le tue conoscenze o affrontare le penitenze.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "the-hidden-village": {
        name: "IL VILLAGGIO NASCOSTO",
        description: "Un gioco di bluff, strategia e discussioni... per chi ama accusare i propri amici 😈",
        tags: {
          premium: "PREMIUM"
        }
      },
      "trap-answer": {
        name: "Domanda a Trabocchetto",
        description: "Un quiz in cui una risposta sbagliata ti fa perdere punti... Riuscirai a evitare le trappole?",
        tags: {
          free: "GRATIS"
        }
      },
      "two-letters-one-word": {
        name: "2 Lettere 1 Parola",
        description: "Trova una parola che contenga le due lettere date e corrisponda al tema.",
        tags: {
          free: "GRATIS",
          "new": "NUOVO",
          "premium": "PREMIUM"
        },
        score: "Punteggio: {{score}}",
        theme: "Tema: {{theme}}",
        inputPlaceholder: "Inserisci la tua parola...",
        verifyButton: "Verifica",
        verifyingButton: "Verifica in corso...",
        validWord: "Parola valida!",
        validWordMessage: "Hai trovato una parola valida!",
        invalidWord: "Parola non valida",
        invalidWordMessage: "Questa parola non soddisfa i criteri richiesti.",
        noWordError: "Per favore, inserisci una parola",
        error: "Si è verificato un errore",
        howToPlay: "Trova una parola che contenga le due lettere date e corrisponda al tema scelto.",
        "theme.marque": "una marca",
        "theme.ville": "una città",
        "theme.prenom": "un nome",
        "theme.pays": "un paese",
        "theme.animal": "un animale",
        "theme.metier": "un mestiere",
        "theme.sport": "uno sport",
        "theme.fruit": "un frutto",
        "theme.legume": "una verdura",
        "theme.objet": "un oggetto",
        "exampleWord": "Esempio: {{word}}",
        "nextButton": "Prossimo round",
        "playerCountError": "Il gioco è per 1-4 giocatori.",
        "noExampleAvailable": "Nessun esempio disponibile",
      },
      'word-guessing': {
        name: 'INDOVINA LA PAROLA',
        description: 'Fai indovinare una parola a qualcuno senza usare le parole proibite... Un gioco di parole e velocità!',
        tags: {
          free: 'GRATIS'
        },
      },
    }
  },

  // Traduzioni comuni
  common: {
    ok: 'OK',
    loading: 'Caricamento...',
    lumicoins: 'Lumicoins',
  },

  // Impostazioni
  settings: {
    title: 'Impostazioni',
    language: 'Lingua',
    notifications: 'Notifiche',
    theme: 'Tema',
    privacy: 'Privacy',
    about: 'Informazioni',
    help: 'Aiuto',
    darkMode: 'Modalità scura',
    lightMode: 'Modalità chiara',
    system: 'Sistema',
    buyAssets: {
      title: 'Acquista asset',
      available: 'Asset disponibili',
      availableAssetsTitle: 'Asset disponibili',
      owned: 'Posseduti',
      cost: 'Costo',
      points: 'punti',
      buy: 'Acquista',
      confirm: 'Conferma acquisto',
      cancel: 'Annulla',
      success: 'Asset acquistato con successo!',
      error: 'Errore durante l\'acquisto',
      insufficientPoints: 'Punti insufficienti',
      equip: 'Equipaggia',
    },
  },

  // Gioco
  game: {
    round: 'Round {{current}}/{{total}}',
    start: 'Inizia',
    join: 'Unisciti',
    leave: 'Esci dalla partita',
    players: 'Giocatori',
    waiting: 'In attesa',
    yourTurn: 'È il tuo turno',
    gameOver: 'Fine della partita',
    winner: 'Vincitore',
    draw: 'Pareggio',
    error: "Errore",
    unknownMode: "Modalità di gioco sconosciuta: {{mode}}",
    notFound: "Nessun documento di gioco trovato per l'id: {{id}}",
    noMode: "Nessuna modalità di gioco trovata nel documento di gioco.",
    loading: "Caricamento...",
    results: {
      title: "Risultati Finali",
      subtitle: "Congratulazioni a tutti!",
      bravo: "Congratulazioni {{name}}!",
      points: "punti",
      home: "Home",
      calculating: "Calcolo dei risultati...",
      podium: {
        first: "1° posto",
        second: "2° posto",
        third: "3° posto",
        others: "Altri giocatori",
        title: "Classifica del Podio",
      },
      rank: "Classifica",
      score: "Punteggio",
      player: "Giocatore",
      "two-letters-one-word": {
        title: "Fine della partita!",
        subtitle: "Grazie per aver giocato a 2 Lettere 1 Parola!",
        totalWords: "Parole trovate",
        bestWord: "Miglior parola",
        averageScore: "Punteggio medio",
        timePlayed: "Tempo di gioco",
        newHighScore: "Nuovo record!",
        shareResults: "Condividi risultati",
        playAgain: "Gioca di nuovo"
      },
      "word-guessing": {
        title: "Indovina la Parola",
        timer: "Tempo rimanente",
        score: "Punteggio",
        forbiddenWords: "Parole proibite",
        start: "Inizia",
        next: "Prossima parola",
        found: "Parola trovata!",
        forbidden: "Parola proibita usata!",
        timeUp: "Tempo scaduto!",
        finalScore: "Punteggio finale",
        playAgain: "Gioca di nuovo"
      },
      naughty: {
        title: 'Classifica dei più birichini',
      },
      yourCurrentRank: 'Il tuo rango attuale',
    },
    player: 'il giocatore',
    truthOrDare: {
      title: 'Verità o Obbligo',
      choice: 'Scelta',
      question: 'Domanda',
      action: 'Obbligo',
      submitChoice: 'Invia scelta',
      submitAnswer: 'Invia risposta',
      next: 'Avanti',
      endGame: 'Fine della partita',
      endTitle: 'Congratulazioni a tutti!',
      endSubtitle: 'Hai finito il gioco Verità o Obbligo',
      home: 'Torna alla home',
      readAloud: 'Leggi ad alta voce',
      targetChooses: '{{name}} sceglie tra Verità o Obbligo!',
      targetAnswers: '{{name}} risponde alla verità!',
      targetDoesDare: '{{name}} fa l\'obbligo!',
      error: 'Si è verificato un errore',
      noQuestions: 'Nessuna domanda disponibile',
      errorNext: 'Si è verificato un errore durante il passaggio al round successivo',
      naughtyRanking: 'Classifica piccante',
      truth: "Verità",
      dare: "Obbligo",
      chooseTask: "Scegli: Verità o Obbligo?",
      isThinking: "sta pensando...",
      willChoose: "sceglierà",
      or: "o",
      iAnswered: "Ho risposto",
      iRefuse: "Passo",
      voteInProgress: "Votazione in corso",
      otherPlayersDecide: "Gli altri giocatori decidono se",
      playedGame: "ha giocato",
      votes: "voti",
      vote: "Vota",
      did: "Ha",
      thanksVote: "Grazie per il tuo voto!",
      yes: "Sì",
      no: "No",
      round: "Round",
      roundEnd: "Fine del round per",
      scores: "Punteggi",
      errorSelectingQuestion: "Errore nella selezione della domanda",
      noQuestionsAvailable: "Nessuna domanda disponibile per questa scelta",
    },
    listenButDontJudge: {
      title: 'Ascoltiamo Ma Non Giudichiamo',
      question: 'Domanda',
      next: 'Avanti',
      endGame: 'Fine della partita',
      endTitle: 'Congratulazioni a tutti!',
      endSubtitle: 'Hai finito il gioco Ascoltiamo Ma Non Giudichiamo',
      home: 'Torna alla home',
      readAloud: 'Leggi ad alta voce',
      targetAnswers: '{{name}} risponde!',
      error: 'Si è verificato un errore',
      noQuestions: 'Nessuna domanda disponibile',
      errorNext: 'Si è verificato un errore nel passare al turno successivo',
      waiting: 'In attesa degli altri giocatori...',
      answered: 'Hai già risposto. In attesa degli altri giocatori...',
      alreadyAnswered: 'Hai già risposto a questa domanda',
      answerPlaceholder: 'Scrivi la tua risposta qui...',
      submit: 'Invia',
      errorSubmit: 'Errore nell\'invio della risposta',
      waitingForOthers: 'In attesa degli altri voti...',
      waitingVote: 'In attesa del voto del giocatore bersaglio...',
      voteTitle: 'Scegli la migliore risposta',
    },
    neverHaveIEverHot: {
      never: "Non ho mai",
      ever: "Ho già",
      yes: "Sì",
      no: "No",
      waiting: "In attesa della scelta del giocatore bersaglio...",
      prepare: "Preparati a rispondere!",
      submit: "Invia",
      next: "Prossimo round",
      endGame: "Fine della partita",
      errorSubmit: "Impossibile inviare la risposta",
      endTitle: "Congratulazioni a tutti!",
      endSubtitle: "Hai finito il gioco Non Ho Mai 🔞",
      home: "Torna alla home",
      readAloud: "Leggi la domanda ad alta voce",
      targetReads: "{{name}} legge la domanda",
      noQuestions: "Nessuna domanda disponibile",
      errorNext: "Si è verificato un errore durante il passaggio al round successivo",
      naughtyRanking: "Classifica piccante"
    },
    geniusOrLiar: {
      // --- Chiavi UI principali dagli screenshot ---
      accuseTitle: 'Chi è il bugiardo?',
      pretendKnows: 'sostiene di sapere',
      accuseNoOne: 'Non accusare nessuno',
      roundResults: 'Risultati del round',
      correctAnswerLabel: 'La risposta corretta era: {{answer}}',
      givenAnswerLabel: 'La tua risposta: {{answer}}',
      drinks: 'sorsi',
      
      // --- Stati del giocatore ---
      playerStatus: {
        wrongAnswer: 'Risposta sbagliata',
        dontKnow: 'Non sapeva la risposta',
        correctAnswer: 'Risposta corretta!',
        correctButAccused: 'Genio, ma accusato!',
        liarNotAccused: 'La bugia è passata!',
        liarAccused: 'Bugiardo, e scoperto!',
      },
      accuserStatus: {
        correctAccusation: 'Ben visto!',
        wrongAccusation: 'Accusa falsa!'
      },
      
      // --- Gameplay generale ---
      answerPlaceholder: 'La tua risposta...',
      validate: 'Convalida',
      know: 'Lo so',
      dontKnow: 'Non lo so',
      accuse: 'Accusa',
      nextRound: 'Prossimo Round',
      showResults: 'Mostra Risultati',
      endGame: 'Mostra Risultati Finali',
      chooseGameMode: 'Scegli la modalità di gioco',
      pointsMode: 'Punti',
      forfeitsMode: 'Sorsi',
      points: 'punti',
      forfeit: 'sorso',
      forfeits: 'sorsi',

      // --- Testo di attesa / info ---
      yourAnswer: 'La tua risposta',
      waitingForPlayers: 'In attesa degli altri giocatori...',
      waitingForAnswers: 'In attesa che gli altri giocatori rispondano...',
      waitingForVotes: 'In attesa che gli altri giocatori votino...',
      playersWhoKnow: 'Giocatori che sostengono di sapere:',
      playersWhoDontKnow: 'Giocatori che non sanno:',
      noOneKnows: 'Nessuno sapeva la risposta!',
      allPlayersKnow: 'Tutti sapevano la risposta!',
      wasAccused: 'È stato accusato',
      accusedBy: 'Accusato da {{count}}',

      // --- Errori / Casi limite ---
      errorSubmit: 'Errore durante l\'invio della risposta.',
      noQuestionAvailable: 'Nessuna domanda disponibile per questo gioco.',
      incorrectQuestionFormat: 'Formato domanda errato (ID: {{id}})',
      modeSelectError: 'Errore nella selezione della modalità di gioco.',
      
      // --- Categorie di domande ---
      questionTypes: {
        cultureG: 'Cultura Generale',
        cultureGHard: 'Cultura Generale (Difficile)',
        culturePop: 'Cultura Pop',
        cultureGeek: 'Cultura Geek',
        cultureArt: 'Arte',
        hard: 'Difficile',
        devinette: 'Indovinello',
        verite: 'Verità'
      }
    },
    theHiddenVillage: {
      title: 'IL VILLAGGIO NASCOSTO',
      subtitle: 'Un gioco di bluff e strategia',
      description: 'Un gioco di bluff, strategia e discussioni... per chi ama accusare i propri amici 😈',
      principles: {
        title: '🌓 PRINCIPIO DEL GIOCO',
        list: [
          'Ogni notte, un giocatore "traditore" elimina un altro giocatore.',
          'Ogni giorno, i sopravvissuti discutono e votano per eliminare chi sospettano.',
          'Obiettivo: smascherare il colpevole prima che elimini tutti.'
        ]
      },
      roles: {
        title: '🎭 RUOLI',
        traitor: {
          name: 'Il Traditore',
          description: 'Elimina ogni notte. Deve sopravvivere.'
        },
        medium: {
          name: 'Il Medium',
          description: 'Indovina se un giocatore è un paesano o un traditore.'
        },
        protector: {
          name: 'Il Protettore',
          description: 'Protegge un giocatore ogni notte.'
        },
        villager: {
          name: 'Il Paesano',
          description: 'Senza poteri. Vota con saggezza.'
        },
        liar: {
          name: 'Il Bugiardo',
          description: 'Ruolo divertente. Semina il dubbio.'
        }
      },
      objectives: {
        title: '🎯 OBIETTIVI',
        traitor: 'Traditore: elimina tutti gli altri senza essere scoperto.',
        village: 'Villaggio: scopri il traditore prima che vinca.'
      }
    },
    trapAnswer: {
      title: "Domanda a Trabocchetto",
      question: "Domanda",
      next: "Avanti",
      endGame: "Fine della partita",
      endTitle: "Congratulazioni a tutti!",
      endSubtitle: "Hai finito il gioco Domanda a Trabocchetto",
      home: "Home",
      readAloud: "Leggi ad alta voce",
      targetAnswers: "{{name}} risponde!",
      error: "Si è verificato un errore",
      noQuestions: "Nessuna domanda disponibile",
      errorNext: "Si è verificato un errore durante il passaggio al round successivo",
      submit: "Invia",
      choices: "Scelte",
      correctAnswer: "Risposta corretta!",
      wrongAnswer: "Risposta sbagliata.",
      correct: "Corretto",
      wrong: "Sbagliato",
      waitingForPlayers: "In attesa degli altri giocatori...",
      playerAnswered: "{{count}} giocatore ha risposto",
      playerAnswered_plural: "{{count}} giocatori hanno risposto",
      yourScore: "Il tuo punteggio",
      playerScores: "Punteggi dei giocatori"
    },
    twoLettersOneWord: {
      score: "Punteggio: {{score}}",
      theme: "Tema: {{theme}}",
      inputPlaceholder: "Inserisci la tua parola...",
      verifyButton: "Verifica",
      verifyingButton: "Verifica in corso...",
      validWord: "Parola valida!",
      validWordMessage: "Hai trovato una parola valida!",
      invalidWord: "Parola non valida",
      invalidWordMessage: "Questa parola non soddisfa i criteri richiesti.",
      noWordError: "Per favore, inserisci una parola",
      error: "Si è verificato un errore",
      howToPlay: "Trova una parola che contenga le due lettere date e corrisponda al tema scelto.",
      "theme.marque": "una marca",
      "theme.ville": "una città",
      "theme.prenom": "un nome",
      "theme.pays": "un paese",
      "theme.animal": "un animale",
      "theme.metier": "un mestiere",
      "theme.sport": "uno sport",
      "theme.fruit": "un frutto",
      "theme.legume": "una verdura",
      "theme.objet": "un oggetto",
      "exampleWord": "Esempio: {{word}}",
      "nextButton": "Prossimo round",
      "noExampleAvailable": "Nessun esempio disponibile",
    },
    waitingForPlayersTitle: "In attesa dei giocatori",
    waitingForPlayersMessage: "Per favore, attendi che tutti i giocatori inviino la loro parola.",
    actionNotAllowedTitle: "Azione non consentita",
    onlyHostCanAdvance: "Solo l'host può passare al round successivo.",
    word_guessing: {
      targetPlayer: 'Fai indovinare a {{player}}',
      forbiddenWords: 'Parole proibite',
      guesserInstructions: 'Il tuo amico sta cercando di farti indovinare una parola!',
      guesserInfo: 'Ascolta attentamente e cerca di trovare la parola senza che usi le parole proibite.',
      found: 'Parola trovata!',
      forbidden: 'Parola proibita!',
      nextWord: 'Prossima parola',
      categories: {
        lieux: 'Luoghi',
        aliments: 'Alimenti',
        transport: 'Trasporti',
        technologie: 'Tecnologia',
        sports: 'Sport',
        loisirs: 'Hobby',
        nature: 'Natura',
        objets: 'Oggetti',
        animaux: 'Animali',
      },
    },
  },

  // Schermata Splash
  splash: {
    title: 'Nightly',
    subtitle: 'Pronto a giocare',
    loading: 'Caricamento...',
  },

  // Regole
  rules: {
    title: 'REGOLE DEL GIOCO',
    loading: 'Caricamento regole...',
    confirm: 'Ho letto le regole',
    confirmStart: 'Ho letto le regole, inizia la partita',
    general: {
      title: 'REGOLE GENERALI',
      description: 'Un giocatore viene designato casualmente ad ogni round.'
    },
    participation: {
      title: 'PARTECIPAZIONE',
      description: 'Tutti i giocatori devono partecipare attivamente.'
    },
    scoring: {
      title: 'PUNTEGGIO',
      description: 'I punti vengono assegnati in base alle regole specifiche del gioco.'
    }
  },

  room: {
    loading: "Caricamento della stanza...",
    notFound: "Stanza non trovata",
    codeLabel: "Codice stanza",
    codeCopied: "Codice copiato negli appunti",
    players: "{{count}} giocatore",
    players_plural: "{{count}} giocatori",
    host: "Host",
    ready: "Pronto",
    rules: "Regole",
    rulesNotRead: "Per favore, leggi le regole prima di iniziare la partita.",
    iAmReady: "Sono pronto",
    startGame: "Inizia partita",
    inviteTitle: "Unisciti alla mia partita",
    inviteMessage: "Unisciti alla mia partita su Nightly! Codice: {{code}}",
    error: "Errore",
    errorLoading: "Impossibile caricare la stanza",
    errorStart: "Impossibile iniziare la partita",
    errorLeave: "Impossibile lasciare la stanza",
    errorReady: "Impossibile impostare lo stato 'pronto'",
    errorCopy: "Errore durante la copia del codice",
    errorShare: "Errore durante la condivisione",
    successCopy: "Codice copiato negli appunti",
    minPlayersRequired: "Minimo {{count}} giocatori richiesti",
    notEnoughPlayers: "Non ci sono abbastanza giocatori",
    rounds: "round",
    title: "Stanza di gioco"
  },

  topBar: {
    greeting: 'Ciao',
    notifications: {
      title: 'Notifiche',
      comingSoon: 'Questa funzionalità sarà presto disponibile!'
    }
  },

  // Paywall
  paywall: {
    title: 'Nightly Premium',
    subtitle: 'ACCESSO ILLIMITATO',
    tagline: 'GIOCA SENZA LIMITI',
    features: {
      unlimited: 'Accesso illimitato a tutte le modalità',
      weekly: 'Nuove carte ogni settimana',
      visuals: 'Temi visivi esclusivi',
      characters: 'Personalizzazione dei personaggi',
      updates: 'Aggiornamenti prioritari'
    },
    plans: {
      weekly: {
        badge: 'PASS',
        title: 'Nightly Pass',
        period: 'a settimana',
        description: 'Perfetto per una serata o un weekend con gli amici'
      },
      monthly: {
        badge: 'PARTY',
        title: 'Nightly Party',
        period: 'al mese',
        description: 'Per chi gioca regolarmente'
      },
      annual: {
        badge: 'RISPARMIA',
        title: 'Nightly All Access',
        period: 'all\'anno',
        description: 'L\'offerta definitiva per i fan'
      }
    },
    cta: 'Inizia ora',
    footer: {
      restore: 'Ripristina acquisti',
      terms: 'Termini di servizio'
    },
    alerts: {
      productUnavailable: {
        title: 'Prodotto non disponibile',
        message: 'L\'abbonamento non è disponibile al momento. Per favore, riprova più tardi.'
      },
      success: {
        title: 'Successo',
        message: 'Grazie per il tuo acquisto!'
      },
      pending: {
        title: 'Informazione',
        message: 'Il tuo abbonamento è stato elaborato ma non è ancora attivo. Per favore, riavvia l\'applicazione.'
      },
      error: {
        title: 'Errore',
        message: 'L\'acquisto è fallito. Per favore, riprova o scegli un altro metodo di pagamento.'
      },
      restoreSuccess: {
        title: 'Successo',
        message: 'Il tuo acquisto è stato ripristinato!'
      },
      restoreError: {
        title: 'Errore',
        message: 'Ripristino degli acquisti fallito'
      },
      termsError: {
        title: 'Errore',
        message: 'Impossibile aprire i termini di servizio'
      }
    },
    prices: {
      weekly: '3,99',
      monthly: '7,99',
      annual: '29,99',
      currency: '€'
    },
    freeTrial: '3 giorni gratis',
  },

  assets: {
    avatars: {
      'avatar-panda': {
        name: 'Panda',
        description: 'Un adorabile panda per il tuo profilo'
      },
      'avatar-chat': {
        name: 'Gatto',
        description: 'Un gatto carino e giocherellone'
      },
      'avatar-chat-rare': {
        name: 'Gatto Misterioso',
        description: 'Un gatto misterioso con occhi brillanti'
      },
      'avatar-chat-rare-2':
      {
        name: 'Gatto Raro',
        description: 'Un gatto raro con un design unico'
      },
      'avatar-crocodile': {
        name: 'Coccodrillo',
        description: 'Un coccodrillo impressionante'
      },
      'avatar-hibou': {
        name: 'Gufo',
        description: 'Un gufo saggio e misterioso'
      },
      'avatar-grenouille': {
        name: 'Rana',
        description: 'Una rana magica e colorata'
      },
      'avatar-oiseau': {
        name: 'Uccello',
        description: 'Un uccello dai colori vivaci'
      },
      'avatar-renard': {
        name: 'Volpe',
        description: 'Una volpe astuta ed elegante'
      },
      'avatar-dragon': {
        name: 'Drago',
        description: 'Un maestoso drago sputafuoco'
      },
      'avatar-ourse': {
        name: 'Orsa',
        description: 'Un\'orsa maestosa'
      },
      'avatar-loup-rare': {
        name: 'Lupo Raro',
        description: 'Un lupo raro e misterioso'
      },
      'avatar-dragon-rare': {
        name: 'Drago Leggendario',
        description: 'Un maestoso drago sputafuoco'
      },
      'avatar-licorne': {
        name: 'Unicorno',
        description: 'Un unicorno leggendario'
      },
      'avatar-phoenix': {
        name: 'Fenice',
        description: 'Una fenice leggendaria che risorge dalle sue ceneri'
      }
    }
  },

  inviteModal: {
    title: "Invita amici",
    roomCode: "Codice stanza",
    instruction: "Scansiona il codice QR o condividi questo codice per invitare i tuoi amici nella stanza.",
    shareButton: "Condividi"
  },

  ads: {
    title: 'Guarda un annuncio per avere altri 3 round!',
  },
};

export default it; 