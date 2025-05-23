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
      usernameLength: 'Il nome utente deve essere di almeno 3 caratteri',
      enterUsername: 'Inserisci il tuo nome utente per giocare',
      connecting: 'Connessione in corso...',
      play: 'Gioca',
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
        tag: "GRATIS"
      },
      "truth-or-dare": {
        name: "VERITÀ O SFOIDA",
        description: "Il classico rivisitato con sfide esclusive.",
        tag: "PREMIUM"
      },
      "never-have-i-ever-hot": {
        name: "MAI MAI 🔞",
        description: "Domande piccanti e audaci... Pronto a confessare?",
        tag: "PREMIUM"
      },
      "genius-or-liar": {
        name: "GENIO O BUGIARDO",
        description: "Una modalità divertente in cui devi dimostrare le tue conoscenze o affrontare sfide.",
        tag: "PREMIUM"
      },
      "the-hidden-village": {
        name: "IL VILLAGGIO NASCOSTO",
        description: "Un gioco di bluff, strategia e discussioni... per chi ama accusare gli amici 😈",
        tag: "PREMIUM"
      },
      "trap-answer": {
        name: "Risposta Trappola",
        tag: "GRATIS",
        description: "Un quiz in cui una risposta sbagliata ti fa perdere punti... Riuscirai a evitare le trappole?"
      },
    }
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
      owned: 'Assets posseduti',
      cost: 'Costo',
      points: 'punti',
      buy: 'Acquista',
      confirm: 'Conferma acquisto',
      cancel: 'Annulla',
      success: 'Asset acquistato con successo!',
      error: 'Errore durante l\'acquisto',
      insufficientPoints: 'Punti insufficienti',
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
    draw: 'Pareggio',
    error: "Errore",
    unknownMode: "Modalità di gioco sconosciuta: {{mode}}",
    notFound: "Nessun documento di gioco trovato per l'id: {{id}}",
    noMode: "Nessuna modalità di gioco trovata nel documento games.",
    loading: "Caricamento...",
    results: {
      title: "Risultati finali",
      subtitle: "Congratulazioni a tutti!",
      bravo: "Congratulazioni {{name}}!",
      points: "punti",
      home: "Home",
      calculating: "Calcolo risultati...",
      podium: {
        first: "1° posto",
        second: "2° posto",
        third: "3° posto",
        others: "Altri giocatori",
      },
      rank: "Posizione",
      score: "Punteggio",
      player: "Giocatore",
    },
    listenButDontJudge: {
      waiting: "In attesa degli altri giocatori...",
      waitingVote: "In attesa del voto del giocatore obiettivo...",
      waitingForOthers: "In attesa degli altri voti...",
      submit: "Invia",
      vote: "Vota",
      next: "Prossimo round",
      errorSubmit: "Impossibile inviare la risposta",
      errorVote: "Impossibile inviare il voto",
      errorNext: "Errore nel passare al round successivo",
      noQuestions: "Nessuna domanda disponibile",
      endTitle: "Fine della partita!",
      endSubtitle: "Grazie per aver giocato!"
    },
    truthOrDare: {
      truth: "Verità!",
      dare: "Sfida!",
      submit: "Invia",
      next: "Prossimo round",
      errorSubmit: "Impossibile inviare la risposta",
      errorVote: "Impossibile inviare il voto",
      errorNext: "Errore nel passare al round successivo",
      endTitle: "Fine della partita!",
      endSubtitle: "Grazie per aver giocato a Verità o Sfida!"
    },
    geniusOrLiar: {
      know: "Lo so!",
      dontKnow: "Non lo so",
      accuse: "Accusare",
      skip: "Salta",
      submit: "Invia",
      next: "Prossimo turno",
      validate: "Conferma",
      answerPlaceholder: "Scrivi la tua risposta qui...",
      errorSubmit: "Impossibile inviare la risposta",
      errorVote: "Impossibile inviare l'accusa",
      errorNext: "Si è verificato un errore durante il passaggio al turno successivo",
      endTitle: "Fine del gioco!",
      endSubtitle: "Grazie per aver giocato a Genio o Bugiardo!",
      noQuestions: "Nessuna domanda disponibile",
      allQuestionsUsed: "Tutte le domande sono state utilizzate",
      waitingForPlayers: "In attesa degli altri giocatori...",
      chooseGameMode: "Scegli la modalità di gioco",
      pointsMode: "MODALITÀ PUNTI",
      gagesMode: "MODALITÀ PENITENZE",
      accuseTitle: "Accusa qualcuno di mentire!",
      accuseNoOne: "Non voglio accusare nessuno",
      pretendKnows: "Afferma di sapere",
      accusedBy: "Accusato da {{count}} giocatore/i",
      correctAnswer: "Risposta corretta: {{answer}}",
      playerStatus: {
        dontKnow: "Non lo sapeva",
        correctAnswer: "Risposta corretta",
        correctButAccused: "Risposta corretta ma accusato",
        liarNotAccused: "Ha mentito senza essere accusato",
        liarAccused: "Ha mentito ed è stato accusato"
      },
      accuserStatus: {
        correctAccusation: "Accusa corretta",
        wrongAccusation: "Accusa sbagliata",
        against: "contro {{name}}"
      },
      continue: 'Continua',
    },
    neverHaveIEverHot: {
      never: "Non ho mai",
      ever: "Ho già",
      waiting: "In attesa della scelta del giocatore bersaglio...",
      prepare: "Preparati a rispondere!",
      submit: "Invia",
      next: "Prossimo turno",
      endGame: "Termina il gioco",
      errorSubmit: "Impossibile inviare la risposta",
      endTitle: "Congratulazioni a tutti!",
      endSubtitle: "Avete terminato la partita di 'Non ho mai 🔞'",
      home: "Torna alla home",
      readAloud: "Leggi la domanda ad alta voce",
      targetReads: "{{name}} legge la domanda",
      noQuestions: "Nessuna domanda disponibile",
      errorNext: "Si è verificato un errore durante il passaggio al turno successivo",
      continue: 'Continua',
    }
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
      terms: 'Termini di utilizzo'
    },
    alerts: {
      productUnavailable: {
        title: 'Prodotto non disponibile',
        message: 'L\'abbonamento non è disponibile al momento. Per favore riprova più tardi.'
      },
      success: {
        title: 'Successo',
        message: 'Grazie per il tuo acquisto!'
      },
      pending: {
        title: 'Informazione',
        message: 'Il tuo abbonamento è stato elaborato ma non è ancora attivo. Per favore riavvia l\'app.'
      },
      error: {
        title: 'Errore',
        message: 'L\'acquisto è fallito. Per favore riprova o scegli un altro metodo di pagamento.'
      },
      restoreSuccess: {
        title: 'Successo',
        message: 'Il tuo acquisto è stato ripristinato!'
      },
      restoreError: {
        title: 'Errore',
        message: 'Errore nel ripristinare gli acquisti'
      },
      termsError: {
        title: 'Errore',
        message: 'Impossibile aprire i termini di utilizzo'
      }
    },
    prices: {
      weekly: '3,99',
      monthly: '7,99',
      annual: '29,99',
      currency: '€'
    },
    freeTrial: 'Gratis 3 giorni',
  },
}; 