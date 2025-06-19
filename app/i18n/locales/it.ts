export default {
  // General
  app: {
    name: 'Nightly',
  },
  
  // Language screen
  language: {
    title: 'Lingua',
    selectLanguage: 'Seleziona la tua lingua preferita per l\'app',
    updated: 'Lingua aggiornata',
    updatedMessage: 'La lingua dell\'app è stata modificata.',
    error: 'Errore',
    errorMessage: 'Impossibile cambiare la lingua.',
  },

  // Navigation
  navigation: {
    back: 'Indietro',
    home: 'Home',
    profile: 'Profilo',
    settings: 'Impostazioni',
  },

  // Error messages
  errors: {
    general: 'Si è verificato un errore',
    tryAgain: 'Per favore riprova',
    networkError: 'Errore di rete',
    authError: 'Errore di autenticazione',
  },

  // Authentication
  auth: {
    login: {
      title: 'Accedi',
      email: 'Email',
      password: 'Password',
      submit: 'Accedi',
      forgotPassword: 'Password dimenticata?',
      noAccount: 'Non hai un account?',
      signUp: 'Registrati',
      username: 'Il tuo nome utente',
      usernameRequired: 'Per favore inserisci il tuo nome utente',
      usernameLength: 'Il nome utente deve contenere almeno 3 caratteri',
      enterUsername: 'Inserisci il tuo nome utente per giocare',
      connecting: 'Connessione...',
      play: 'Gioca',
      selectCharacter: 'Scegli il tuo personaggio',
      characterDescription: 'Seleziona un personaggio che ti rappresenti per la partita',
    },
    register: {
      title: 'Registrazione',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Conferma password',
      submit: 'Registrati',
      haveAccount: 'Hai già un account?',
      login: 'Accedi',
    },
  },

  // Profile
  profile: {
    title: 'Profilo',
    edit: 'Modifica',
    save: 'Salva',
    cancel: 'Annulla',
    username: 'Nome utente',
    defaultUsername: 'Giocatore',
    email: 'Email',
    bio: 'Biografia',
    avatar: 'Foto profilo',
    changeAvatar: 'Cambia foto',
    settings: 'Impostazioni',
    logout: 'Esci',
    logoutError: 'Si è verificato un errore durante il logout. Riprova.',
    contact: 'Contattaci',
    contactEmail: 'Inviaci una email a support@cosmicquest.com',
    buyAssetsTitle: 'Acquista assets',
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
    premium: {
      title: 'Pass Premium',
      try: 'Prova Premium',
      free: 'Gratis 3 giorni',
      price: 'poi 3,99€/settimana',
      features: {
        unlock: 'Sblocca tutte le modalità',
        weekly: 'Nuovo pacchetto ogni settimana',
        friends: 'Accesso gratuito per gli amici',
        cancel: 'Annulla quando vuoi',
      },
    },
  },

  // Home
  home: {
    title: 'Home',
    welcome: 'Benvenuto',
    createGame: 'Crea partita',
    joinGame: 'Unisciti a una partita',
    enterCode: 'Inserisci codice',
    join: 'Unisciti',
    gameModes: {
      title: 'Modalità di gioco',
      classic: 'Classica',
      custom: 'Personalizzata',
      quick: 'Rapida',
    },
    errors: {
      noConnection: 'Nessuna connessione internet. Per favore verifica la tua connessione e riprova.',
      loginRequired: 'Devi effettuare l\'accesso per creare una stanza di gioco.',
      invalidSession: 'La tua sessione utente non è valida. Per favore effettua nuovamente l\'accesso.',
      roomCreationFailed: 'Impossibile creare la stanza',
      invalidCode: 'Codice partita non valido',
      roomNotFound: 'Stanza non trovata',
      gameStarted: 'Questa partita è già iniziata',
      roomFull: 'Questa partita è piena',
      notAuthenticated: 'Utente non autenticato',
      alreadyInGame: 'Sei già in questa partita',
      serverTimeout: 'Il server sta impiegando troppo tempo a rispondere. Per favore riprova.',
      networkError: 'Errore di rete: verifica la tua connessione internet',
      permissionDenied: 'Accesso negato: verifica le regole di sicurezza di Firestore',
    },
    room: {
      create: 'Crea stanza',
      join: 'Unisciti alla stanza',
      code: 'Codice stanza',
      players: 'Giocatori',
      status: {
        waiting: 'In attesa',
        playing: 'In gioco',
        finished: 'Terminata',
      },
    },
    codePlaceholder: "Inserisci il codice della partita",
    loading: "Connessione alla partita in corso...",
    categories: {
      nightly_modes: "SUGGERIMENTO DELLA SETTIMANA",
      same_room: "NELLA STESSA STANZA",
      online: "A DISTANZA"
    },
    subtitles: {
      same_room: "Gioca insieme nella stessa stanza!",
      online: "Gioca anche quando non siete insieme"
    },
    games: {
      "listen-but-don-t-judge": {
        name: "ASCOLTA MA NON GIUDICARE",
        description: "Una modalità gratuita per divertirsi con gli amici.",
        tags: {
          free: "GRATIS"
        }
      },
      "truth-or-dare": {
        name: "VERITÀ O SFOIDA",
        description: "Il classico rivisitato con sfide esclusive.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "never-have-i-ever-hot": {
        name: "NON HO MAI 🔞",
        description: "Domande piccanti e inappropriate... Pronto a confessare?",
        tags: {
          premium: "PREMIUM"
        }
      },
      "genius-or-liar": {
        name: "GENIO O BUGIARDO",
        description: "Una modalità divertente dove devi dimostrare le tue conoscenze o affrontare le conseguenze.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "the-hidden-village": {
        name: "IL VILLAGGIO NASCOSTO",
        description: "Un gioco di bluff, strategia e discussioni... per chi ama accusare gli amici 😈",
        tags: {
          premium: "PREMIUM"
        }
      },
      "trap-answer": {
        name: "Risposta Trappola",
        description: "Un quiz dove una risposta sbagliata ti fa perdere punti... Riuscirai a evitare le trappole?",
        tags: {
          free: "GRATIS"
        }
      },
      "two-letters-one-word": {
        name: "2 Lettere 1 Parola",
        description: "Trova una parola che contiene le due lettere date e corrisponde al tema.",
        tags: {
          free: "GRATIS",
          "new": "NUOVO",
          "premium": "PREMIUM"
        },
        score: "Punteggio: {{score}}",
        theme: "Tema: {{theme}}",
        inputPlaceholder: "Inserisci la tua parola...",
        verifyButton: "Verifica",
        verifyingButton: "Verifica...",
        validWord: "Parola valida!",
        validWordMessage: "Hai trovato una parola valida!",
        invalidWord: "Parola non valida",
        invalidWordMessage: "Questa parola non corrisponde ai criteri richiesti.",
        noWordError: "Si prega di inserire una parola",
        error: "Si è verificato un errore",
        howToPlay: "Trova una parola che contiene le due lettere date e corrisponde al tema scelto.",
        // Traduzioni dei temi
        "theme.marque": "un marchio",
        "theme.ville": "una città",
        "theme.prenom": "un nome",
        "theme.pays": "un paese",
        "theme.animal": "un animale",
        "theme.metier": "un lavoro",
        "theme.sport": "uno sport",
        "theme.fruit": "un frutto",
        "theme.legume": "una verdura",
        "theme.objet": "un oggetto",
        "exampleWord": "Esempio: {{word}}",
        "nextButton": "Prossimo turno",
        "noExampleAvailable": "Nessun esempio disponibile",
      },
    }
  },

  // Common translations
  common: {
    ok: 'OK',
    loading: 'Caricamento...',
  },

  // Settings
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
      title: 'Acquista assets',
      available: 'Assets disponibili',
      availableAssetsTitle: 'Assets disponibili',
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

  // Game
  game: {
    start: 'Inizia',
    join: 'Unisciti',
    leave: 'Esci',
    players: 'Giocatori',
    waiting: 'In attesa',
    yourTurn: 'Il tuo turno',
    gameOver: 'Fine del gioco',
    winner: 'Vincitore',
    draw: 'Parità',
    error: "Errore",
    unknownMode: "Modalità di gioco sconosciuta: {{mode}}",
    notFound: "Nessun documento di gioco trovato per ID: {{id}}",
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
        title: "Fine del gioco!",
        subtitle: "Grazie per aver giocato a 2 Lettere 1 Parola!",
        totalWords: "Parole trovate",
        bestWord: "Miglior parola",
        averageScore: "Punteggio medio",
        timePlayed: "Tempo giocato",
        newHighScore: "Nuovo record!",
        shareResults: "Condividi risultati",
        playAgain: "Gioca di nuovo"
      },
      "word-guessing": {
        title: "Indovina la Parola",
        timer: "Tempo rimanente",
        score: "Punteggio",
        forbiddenWords: "Parole proibite",
        start: "Avvia",
        next: "Prossima parola",
        found: "Parola trovata!",
        forbidden: "Parola proibita usata!",
        timeUp: "Tempo scaduto!",
        finalScore: "Punteggio finale",
        playAgain: "Gioca di nuovo"
      }
    },
    player: 'il giocatore',
    round: "Turno {{current}}/{{total}}",
    truthOrDare: {
      title: 'Verità o Sfida',
      choice: 'Scelta',
      question: 'Domanda',
      action: 'Sfida',
      submitChoice: 'Invia scelta',
      submitAnswer: 'Invia risposta',
      next: 'Avanti',
      endGame: 'Fine del gioco',
      endTitle: 'Congratulazioni a tutti!',
      endSubtitle: 'Hai finito il gioco Verità o Sfida',
      home: 'Torna alla home',
      readAloud: 'Leggi ad alta voce',
      targetChooses: '{{name}} sceglie tra Verità o Sfida!',
      targetAnswers: '{{name}} risponde alla verità!',
      targetDoesDare: '{{name}} fa la sfida!',
      error: 'Si è verificato un errore',
      noQuestions: 'Nessuna domanda disponibile',
      errorNext: 'Si è verificato un errore nel passaggio al turno successivo',
      naughtyRanking: 'Classifica più sfacciata',
      truth: "Verità",
      dare: "Sfida",
      chooseTask: "Scegli: Verità o Sfida?",
      isThinking: "sta pensando...",
      willChoose: "sceglierà",
      or: "o",
      iAnswered: "Ho risposto",
      iRefuse: "Salto il turno",
      voteInProgress: "Votazione in corso",
      otherPlayersDecide: "Gli altri decidono se",
      playedGame: "ha giocato",
      votes: "voti",
      vote: "Vota",
      did: "Ha",
      thanksVote: "Grazie per il tuo voto!",
      yes: "Sì",
      no: "No",
      round: "Turno",
      roundEnd: "Fine del turno per",
      scores: "Punteggi",
      errorSelectingQuestion: "Errore nella selezione della domanda",
      noQuestionsAvailable: "Nessuna domanda disponibile per questa scelta",
    },
    listenButDontJudge: {
      title: 'Ascolta ma non Giudicare',
      question: 'Domanda',
      next: 'Avanti',
      endGame: 'Fine del gioco',
      endTitle: 'Congratulazioni a tutti!',
      endSubtitle: 'Hai finito il gioco Ascolta ma non Giudicare',
      home: 'Torna alla home',
      readAloud: 'Leggi ad alta voce',
      targetAnswers: '{{name}} risponde!',
      error: 'Si è verificato un errore',
      noQuestions: 'Nessuna domanda disponibile',
      errorNext: 'Si è verificato un errore nel passaggio al turno successivo'
    },
    neverHaveIEverHot: {
      never: "Non ho mai",
      ever: "Ho già",
      waiting: "In attesa della scelta del giocatore obiettivo...",
      prepare: "Preparati a rispondere!",
      submit: "Invia",
      next: "Prossimo turno",
      endGame: "Fine del gioco",
      errorSubmit: "Impossibile inviare la risposta",
      endTitle: "Congratulazioni a tutti!",
      endSubtitle: "Hai finito il gioco Non Ho Mai 🔞",
      home: "Torna alla home",
      readAloud: "Leggi la domanda ad alta voce",
      targetReads: "{{name}} legge la domanda",
      noQuestions: "Nessuna domanda disponibile",
      errorNext: "Si è verificato un errore nel passaggio al turno successivo",
      naughtyRanking: "Classifica più sfacciata"
    },
    geniusOrLiar: {
      title: 'Genio o Bugiardo',
      question: 'Domanda',
      know: 'Lo so',
      dontKnow: 'Non lo so',
      accuse: 'Accusa',
      submitAnswer: 'Invia risposta',
      next: 'Prossimo turno',
      endGame: 'Fine del gioco',
      endTitle: 'Congratulazioni a tutti!',
      endSubtitle: 'Hai finito il gioco Genio o Bugiardo',
      home: 'Torna alla home',
      readAloud: 'Leggi ad alta voce',
      targetAnswers: '{{name}} risponde!',
      error: 'Si è verificato un errore',
      noQuestions: 'Nessuna domanda disponibile',
      errorNext: 'Si è verificato un errore nel passaggio al turno successivo',
      errorSubmit: 'Errore nell\'invio della tua risposta o voto.'
    },
    theHiddenVillage: {
      title: 'IL VILLAGGIO NASCOSTO',
      subtitle: 'Un gioco di bluff e strategia',
      description: 'Un gioco di bluff, strategia e discussioni... per chi ama accusare gli amici 😈',
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
          description: 'Nessun potere. Vota saggiamente.'
        },
        liar: {
          name: 'Il Bugiardo',
          description: 'Ruolo divertente. Semina il dubbio.'
        }
      },
      objectives: {
        title: '🎯 OBIETTIVI',
        traitor: 'Traditore: eliminare tutti gli altri senza essere scoperto.',
        village: 'Villaggio: scoprire il traditore prima che vinca.'
      }
    },
    trapAnswer: {
      title: "Risposta Trappola",
      question: "Domanda",
      next: "Prossima",
      endGame: "Fine del gioco",
      endTitle: "Congratulazioni a tutti!",
      endSubtitle: "Hai finito il gioco Risposta Trappola",
      home: "Torna alla home",
      readAloud: "Leggi ad alta voce",
      targetAnswers: "{{name}} risponde!",
      error: "Si è verificato un errore",
      noQuestions: "Nessuna domanda disponibile",
      errorNext: "Si è verificato un errore nel passaggio al turno successivo",
      submit: "Invia",
      choices: "Scelte",
      correctAnswer: "Risposta corretta!",
      wrongAnswer: "Risposta sbagliata.",
      correct: "Corretto",
      wrong: "Sbagliato",
      waitingForPlayers: "In attesa di altri giocatori...",
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
      verifyingButton: "Verifica...",
      validWord: "Parola valida!",
      validWordMessage: "Hai trovato una parola valida!",
      invalidWord: "Parola non valida",
      invalidWordMessage: "Questa parola non corrisponde ai criteri richiesti.",
      noWordError: "Si prega di inserire una parola",
      error: "Si è verificato un errore",
      howToPlay: "Trova una parola che contiene le due lettere date e corrisponde al tema scelto.",
      "theme.marque": "un marchio",
      "theme.ville": "una città",
      "theme.prenom": "un nome",
      "theme.pays": "un paese",
      "theme.animal": "un animale",
      "theme.metier": "un lavoro",
      "theme.sport": "uno sport",
      "theme.fruit": "un frutto",
      "theme.legume": "una verdura",
      "theme.objet": "un oggetto",
      "exampleWord": "Esempio: {{word}}",
      "nextButton": "Prossimo turno",
      "noExampleAvailable": "Nessun esempio disponibile",
    },
    word_guessing: {
      targetPlayer: 'Fai indovinare a {{player}}',
      forbiddenWords: 'Parole proibite',
      found: 'Parola trovata!',
      forbidden: 'Parola proibita!',
      nextWord: 'Prossima parola',
      categories: {
        lieux: 'Luoghi',
        aliments: 'Cibo',
        transport: 'Trasporto',
        technologie: 'Tecnologia',
        sports: 'Sport',
        loisirs: 'Hobby',
        nature: 'Natura',
        objets: 'Oggetti',
        animaux: 'Animali',
      },
      guesserInstructions: 'Il tuo amico sta cercando di farti indovinare una parola!',
      guesserInfo: 'Ascolta attentamente e cerca di trovare la parola senza che usino le parole proibite.',
    },
  },

  // Splash Screen
  splash: {
    title: 'Nightly',
    subtitle: 'Preparati a giocare',
    loading: 'Caricamento...',
  },

  // Regole
  rules: {
    title: 'REGOLE DEL GIOCO',
    loading: 'Caricamento delle regole...',
    confirm: 'Ho letto le regole',
    confirmStart: 'Ho letto le regole, inizia il gioco',
    general: {
      title: 'REGOLE GENERALI',
      description: 'Un giocatore viene designato casualmente ad ogni turno.'
    },
    participation: {
      title: 'PARTECIPAZIONE',
      description: 'Tutti i giocatori devono partecipare attivamente.'
    },
    scoring: {
      title: 'PUNTEGGIO',
      description: 'I punti vengono assegnati secondo le regole specifiche del gioco.'
    }
  },

  room: {
    title: 'Sala di gioco',
    codeLabel: 'Codice sala',
    players: '{{count}} giocatore',
    players_plural: '{{count}} giocatori',
    rules: 'Regole',
    host: 'Ospite',
    ready: 'Pronto',
    iAmReady: 'Sono pronto',
    startGame: 'Inizia partita',
    loading: 'Caricamento...',
    minPlayersRequired: 'Minimo {{count}} giocatori richiesti',
    notEnoughPlayers: 'Non ci sono abbastanza giocatori',
    rounds: 'round',
    inviteTitle: "Unisciti alla mia partita",
    inviteMessage: "Unisciti alla mia partita su Nightly! Codice: {{code}}",
    error: "Errore",
    errorLoading: "Impossibile caricare la stanza",
    errorStart: "Impossibile iniziare la partita",
    errorLeave: "Impossibile lasciare la stanza",
    errorReady: "Impossibile impostare come pronto",
    errorCopy: "Errore nel copiare il codice",
    errorShare: "Errore nella condivisione",
    successCopy: "Codice copiato negli appunti",
    allReady: "Tutti i giocatori sono pronti!",
    waiting: "In attesa di altri giocatori...",
  },

  paywall: {
    title: 'Nightly Premium',
    subtitle: 'ACCESSO ILLIMITATO',
    tagline: 'GIOCA SENZA LIMITI',
    features: {
      unlimited: 'Accesso illimitato a tutte le modalità',
      weekly: 'Nuove carte ogni settimana',
      visuals: 'Temi visivi esclusivi',
      characters: 'Personalizzazione personaggi',
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
        description: 'Per giocatori regolari'
      },
      annual: {
        badge: 'ALL ACCESS',
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
        message: 'L\'abbonamento non è disponibile al momento. Riprova più tardi.'
      },
      success: {
        title: 'Successo',
        message: 'Grazie per il tuo acquisto!'
      },
      pending: {
        title: 'Informazioni',
        message: 'Il tuo abbonamento è stato elaborato ma non è ancora attivo. Riavvia l\'app.'
      },
      error: {
        title: 'Errore',
        message: 'Acquisto fallito. Riprova o scegli un altro metodo di pagamento.'
      },
      restoreSuccess: {
        title: 'Successo',
        message: 'Il tuo acquisto è stato ripristinato!'
      },
      restoreError: {
        title: 'Errore',
        message: 'Ripristino acquisti fallito'
      },
      termsError: {
        title: 'Errore',
        message: 'Impossibile aprire i Termini di servizio'
      }
    },
    prices: {
      weekly: '3,99',
      monthly: '7,99',
      annual: '29,99',
      currency: '€'
    },
    freeTrial: 'Prova gratuita di 3 giorni',
  },

  inviteModal: {
    title: "Invita amici",
    roomCode: "Codice della stanza",
    instruction: "Scansiona il codice QR o condividi questo codice per invitare i tuoi amici nella stanza.",
    shareButton: "Condividi"
  },

  // Asset e Avatar
  assets: {
    avatars: {
      'avatar-panda': {
        name: 'Panda',
        description: 'Un adorabile panda per il tuo profilo'
      },
      'avatar-chat': {
        name: 'Gatto',
        description: 'Un gatto carino e giocoso'
      },
      'avatar-chat-rare': {
        name: 'Gatto Misterioso',
        description: 'Un gatto misterioso con occhi luminosi'
      },
      'avatar-chat-rare-2': {
        name: 'Gatto Raro',
        description: 'Un gatto raro con un design unico'
      },
      'avatar-crocodile': {
        name: 'Coccodrillo',
        description: 'Un impressionante coccodrillo'
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
        description: 'Un uccello con colori vivaci'
      },
      'avatar-renard': {
        name: 'Volpe',
        description: 'Una volpe astuta ed elegante'
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
        description: 'Un leggendario unicorno'
      },
      'avatar-phoenix': {
        name: 'Fenice',
        description: 'Una leggendaria fenice che rinasce dalle sue ceneri'
      }
    }
  },
}; 