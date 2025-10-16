const es = {
  // General
  app: {
    name: 'Nightly',
  },
  
  // Language Screen
  language: {
    title: 'Idioma',
    selectLanguage: 'Selecciona tu idioma preferido para la aplicación',
    updated: 'Idioma actualizado',
    updatedMessage: 'El idioma de la aplicación ha sido cambiado.',
    error: 'Error',
    errorMessage: 'No se pudo cambiar el idioma.',
  },

  // Navigation
  navigation: {
    back: 'Volver',
    home: 'Inicio',
    profile: 'Perfil',
    settings: 'Ajustes',
  },

  // Error Messages
  errors: {
    general: 'Ocurrió un error',
    tryAgain: 'Por favor, inténtalo de nuevo',
    networkError: 'Error de red',
    authError: 'Error de autenticación',
  },

  // Authentication
  auth: {
    login: {
      title: 'Iniciar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      submit: 'Iniciar sesión',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta?',
      signUp: 'Regístrate',
      username: 'Tu apodo',
      usernameRequired: 'Por favor, introduce tu apodo',
      usernameLength: 'El apodo debe tener al menos 3 caracteres',
      enterUsername: 'Introduce tu apodo para jugar',
      connecting: 'Conectando...',
      play: 'Jugar',
      selectCharacter: 'Elige tu personaje',
      characterDescription: 'Selecciona un personaje que te represente en el juego',
    },
    register: {
      title: 'Registrarse',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      submit: 'Registrarse',
      haveAccount: '¿Ya tienes una cuenta?',
      login: 'Iniciar sesión',
    },
  },

  // Profile
  profile: {
    title: 'Perfil',
    edit: 'Editar',
    save: 'Guardar',
    cancel: 'Cancelar',
    username: 'Nombre de usuario',
    defaultUsername: 'Jugador',
    email: 'Correo electrónico',
    bio: 'Biografía',
    avatar: 'Foto de perfil',
    changeAvatar: 'Cambiar foto',
    settings: 'Ajustes',
    logout: 'Cerrar sesión',
    logoutError: 'Ocurrió un error al cerrar la sesión. Por favor, inténtalo de nuevo.',
    contact: 'Contáctanos',
    contactEmail: 'Envíanos un correo a support@cosmicquest.com',
    buyAssetsTitle: 'Comprar assets',
    insufficientPoints: 'Puntos insuficientes',
    insufficientPointsMessage: 'No tienes suficientes puntos para desbloquear este asset.',
    success: 'Éxito',
    assetUnlocked: '¡{{asset}} ha sido desbloqueado con éxito!',
    unlockError: 'Ocurrió un error al desbloquear el asset.',
    restorePurchases: 'Restaurar compras',
    restoring: 'Restaurando...',
    restoreSuccess: 'Éxito',
    restoreSuccessMessage: 'Tus compras han sido restauradas con éxito',
    restoreError: 'Ocurrió un error al restaurar las compras',
    avatarChanged: '¡Tu foto de perfil ha sido actualizada con éxito!',
    avatarChangeError: 'Ocurrió un error al cambiar tu foto de perfil.',
    premium: {
      title: 'Pase Premium',
      try: 'Probar premium',
      free: '3 días gratis',
      price: 'luego 3,99€ por semana',
      features: {
        unlock: 'Desbloquea todos los modos',
        weekly: 'Un nuevo pack cada semana',
        friends: 'Acceso gratuito para tus amigos',
        cancel: 'Cancela en cualquier momento',
      },
    },
  },

  // Home
  home: {
    title: 'Inicio',
    welcome: 'Bienvenido',
    createGame: 'Crear partida',
    joinGame: 'Unirse a partida',
    enterCode: 'Introducir código',
    join: 'Unirse',
    gameModes: {
      title: 'Modos de juego',
      classic: 'Clásico',
      custom: 'Personalizado',
      quick: 'Rápido',
    },
    errors: {
      noConnection: 'No hay conexión a internet. Por favor, comprueba tu conexión e inténtalo de nuevo.',
      loginRequired: 'Debes iniciar sesión para crear una sala de juego.',
      invalidSession: 'Tu sesión de usuario no es válida. Por favor, inicia sesión de nuevo.',
      roomCreationFailed: 'No se pudo crear la sala',
      invalidCode: 'Código de partida inválido',
      roomNotFound: 'Sala no encontrada',
      gameStarted: 'Esta partida ya ha comenzado',
      roomFull: 'Esta partida está llena',
      notAuthenticated: 'Usuario no autenticado',
      alreadyInGame: 'Ya estás en esta partida',
      serverTimeout: 'El servidor está tardando demasiado en responder. Por favor, inténtalo de nuevo.',
      networkError: 'Error de red: comprueba tu conexión a internet',
      permissionDenied: 'Acceso denegado: comprueba las reglas de seguridad de Firestore',
    },
    room: {
      create: 'Crear sala',
      join: 'Unirse a sala',
      code: 'Código de la sala',
      players: 'Jugadores',
      status: {
        waiting: 'Esperando',
        playing: 'Jugando',
        finished: 'Terminada',
      },
    },
    codePlaceholder: "Introduce el código de la partida",
    loading: "Conectando a la partida...",
    categories: {
      nightly_modes: "SUGERENCIA DE LA SEMANA",
      same_room: "EN LA MISMA HABITACIÓN",
      online: "A DISTANCIA"
    },
    subtitles: {
      same_room: "¡Para jugar juntos en la misma habitación!",
      online: "Para jugar incluso cuando no estáis juntos"
    },
    games: {
      "listen-but-don-t-judge": {
        name: "ESCUCHAMOS PERO NO JUZGAMOS",
        description: "Un modo gratuito para echarse unas risas con los amigos.",
        tags: {
          free: "GRATIS"
        }
      },
      "truth-or-dare": {
        name: "VERDAD O RETO",
        description: "El clásico reinventado con desafíos exclusivos.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "never-have-i-ever-hot": {
        name: "YO NUNCA NUNCA 🔞",
        description: "Preguntas picantes e inapropiadas... ¿Listos para asumirlo?",
        tags: {
          premium: "PREMIUM"
        }
      },
      "genius-or-liar": {
        name: "GENIO O MENTIROSO",
        description: "Un modo divertido donde tienes que demostrar tus conocimientos o afrontar las consecuencias.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "the-hidden-village": {
        name: "EL PUEBLO OCULTO",
        description: "Un juego de faroles, estrategia y discusión... para los que les gusta acusar a sus amigos 😈",
        tags: {
          premium: "PREMIUM"
        }
      },
      "trap-answer": {
        name: "Pregunta Trampa",
        description: "Un quiz donde una respuesta incorrecta te hace perder puntos... ¿Podrás evitar las trampas?",
        tags: {
          free: "GRATIS"
        }
      },
      "two-letters-one-word": {
        name: "2 Letras 1 Palabra",
        description: "Encuentra una palabra que contenga las dos letras dadas y corresponda al tema.",
        tags: {
          free: "GRATIS",
          "new": "NUEVO",
          "premium": "PREMIUM"
        },
        score: "Puntuación: {{score}}",
        theme: "Tema: {{theme}}",
        inputPlaceholder: "Introduce tu palabra...",
        verifyButton: "Verificar",
        verifyingButton: "Verificando...",
        validWord: "¡Palabra válida!",
        validWordMessage: "¡Has encontrado una palabra válida!",
        invalidWord: "Palabra inválida",
        invalidWordMessage: "Esta palabra no cumple los criterios solicitados.",
        noWordError: "Por favor, introduce una palabra",
        error: "Ocurrió un error",
        howToPlay: "Encuentra una palabra que contenga las dos letras dadas y corresponda al tema elegido.",
        "theme.marque": "una marca",
        "theme.ville": "una ciudad",
        "theme.prenom": "un nombre",
        "theme.pays": "un país",
        "theme.animal": "un animal",
        "theme.metier": "un oficio",
        "theme.sport": "un deporte",
        "theme.fruit": "una fruta",
        "theme.legume": "una verdura",
        "theme.objet": "un objeto",
        "exampleWord": "Ejemplo: {{word}}",
        "nextButton": "Siguiente ronda",
        "playerCountError": "El juego es para 1 a 4 jugadores.",
        "noExampleAvailable": "No hay ejemplos disponibles",
      },
      'word-guessing': {
        name: 'ADIVINA LA PALABRA',
        description: 'Haz que alguien adivine una palabra sin usar las palabras prohibidas... ¡Un juego de palabras y rapidez!',
        tags: {
          free: 'GRATIS'
        },
      },
    }
  },

  // Common translations
  common: {
    ok: 'OK',
    loading: 'Cargando...',
    lumicoins: 'Lumicoins',
  },

  // Settings
  settings: {
    title: 'Ajustes',
    language: 'Idioma',
    notifications: 'Notificaciones',
    theme: 'Tema',
    privacy: 'Privacidad',
    about: 'Acerca de',
    help: 'Ayuda',
    darkMode: 'Modo oscuro',
    lightMode: 'Modo claro',
    system: 'Sistema',
    buyAssets: {
      title: 'Comprar assets',
      available: 'Assets disponibles',
      availableAssetsTitle: 'Assets disponibles',
      owned: 'Poseídos',
      cost: 'Coste',
      points: 'puntos',
      buy: 'Comprar',
      confirm: 'Confirmar compra',
      cancel: 'Cancelar',
      success: '¡Asset comprado con éxito!',
      error: 'Error durante la compra',
      insufficientPoints: 'Puntos insuficientes',
      equip: 'Equipar',
    },
  },

  // Game
  game: {
    round: 'Ronda {{current}}/{{total}}',
    start: 'Empezar',
    join: 'Unirse',
    leave: 'Salir de la partida',
    players: 'Jugadores',
    waiting: 'Esperando',
    yourTurn: 'Tu turno',
    gameOver: 'Fin de la partida',
    winner: 'Ganador',
    draw: 'Empate',
    error: "Error",
    unknownMode: "Modo de juego desconocido: {{mode}}",
    notFound: "No se encontró ningún documento de partida para el id: {{id}}",
    noMode: "No se encontró ningún modo de juego en el documento de partidas.",
    loading: "Cargando...",
    results: {
      title: "Resultados Finales",
      subtitle: "¡Felicidades a todos!",
      bravo: "¡Felicidades {{name}}!",
      points: "puntos",
      home: "Inicio",
      calculating: "Calculando resultados...",
      podium: {
        first: "1er puesto",
        second: "2º puesto",
        third: "3er puesto",
        others: "Otros jugadores",
        title: "Clasificación del Podio",
      },
      rank: "Clasificación",
      score: "Puntuación",
      player: "Jugador",
      "two-letters-one-word": {
        title: "¡Fin de la partida!",
        subtitle: "¡Gracias por jugar a 2 Letras 1 Palabra!",
        totalWords: "Palabras encontradas",
        bestWord: "Mejor palabra",
        averageScore: "Puntuación media",
        timePlayed: "Tiempo jugado",
        newHighScore: "¡Nuevo récord!",
        shareResults: "Compartir resultados",
        playAgain: "Jugar de nuevo"
      },
      "word-guessing": {
        title: "Adivina la Palabra",
        timer: "Tiempo restante",
        score: "Puntuación",
        forbiddenWords: "Palabras prohibidas",
        start: "Empezar",
        next: "Siguiente palabra",
        found: "¡Palabra encontrada!",
        forbidden: "¡Palabra prohibida usada!",
        timeUp: "¡Se acabó el tiempo!",
        finalScore: "Puntuación final",
        playAgain: "Jugar de nuevo"
      },
      naughty: {
        title: 'Ranking de los más traviesos',
      },
      yourCurrentRank: 'Tu rango actual',
    },
    player: 'el jugador',
    truthOrDare: {
      title: 'Verdad o Reto',
      choice: 'Elección',
      question: 'Pregunta',
      action: 'Reto',
      submitChoice: 'Enviar elección',
      submitAnswer: 'Enviar respuesta',
      next: 'Siguiente',
      endGame: 'Fin de la partida',
      endTitle: '¡Felicidades a todos!',
      endSubtitle: 'Has terminado el juego de Verdad o Reto',
      home: 'Volver al inicio',
      readAloud: 'Leer en voz alta',
      targetChooses: '¡{{name}} elige entre Verdad o Reto!',
      targetAnswers: '¡{{name}} responde a la verdad!',
      targetDoesDare: '¡{{name}} hace el reto!',
      error: 'Ocurrió un error',
      noQuestions: 'No hay preguntas disponibles',
      errorNext: 'Ocurrió un error al pasar a la siguiente ronda',
      naughtyRanking: 'Clasificación picante',
      truth: "Verdad",
      dare: "Reto",
      chooseTask: "¿Elige: Verdad o Reto?",
      isThinking: "está pensando...",
      willChoose: "va a elegir",
      or: "o",
      iAnswered: "He respondido",
      iRefuse: "Paso",
      voteInProgress: "Votación en curso",
      otherPlayersDecide: "Los otros jugadores deciden si",
      playedGame: "ha jugado el juego",
      votes: "votos",
      vote: "Votar",
      did: "¿Hizo",
      thanksVote: "¡Gracias por tu voto!",
      yes: "Sí",
      no: "No",
      round: "Ronda",
      roundEnd: "Fin de la ronda para",
      scores: "Puntuaciones",
      errorSelectingQuestion: "Error al seleccionar la pregunta",
      noQuestionsAvailable: "No hay preguntas disponibles para esta elección",
    },
    listenButDontJudge: {
      title: 'Escuchamos Pero No Juzgamos',
      question: 'Pregunta',
      next: 'Siguiente',
      endGame: 'Fin de la partida',
      endTitle: '¡Felicidades a todos!',
      endSubtitle: 'Has terminado el juego de Escuchamos Pero No Juzgamos',
      home: 'Volver al inicio',
      readAloud: 'Leer en voz alta',
      targetAnswers: '¡{{name}} responde!',
      error: 'Ocurrió un error',
      noQuestions: 'No hay preguntas disponibles',
      errorNext: 'Ocurrió un error al pasar a la siguiente ronda',
      waiting: 'Esperando a otros jugadores...',
      answerPlaceholder: 'Escribe tu respuesta aquí...',
      submit: 'Enviar',
      errorSubmit: 'Error al enviar la respuesta',
      waitingForOthers: 'Esperando otros votos...',
      waitingVote: 'Esperando el voto del jugador objetivo...',
      voteTitle: 'Elige la mejor respuesta',
    },
    neverHaveIEverHot: {
      never: "Yo nunca he",
      ever: "Yo ya he",
      waiting: "Esperando la elección del jugador objetivo...",
      prepare: "¡Prepárate para responder!",
      submit: "Enviar",
      next: "Siguiente ronda",
      endGame: "Fin de la partida",
      errorSubmit: "No se pudo enviar la respuesta",
      endTitle: "¡Felicidades a todos!",
      endSubtitle: "Has terminado el juego de Yo Nunca Nunca 🔞",
      home: "Volver al inicio",
      readAloud: "Lee la pregunta en voz alta",
      targetReads: "{{name}} lee la pregunta",
      noQuestions: "No hay preguntas disponibles",
      errorNext: "Ocurrió un error al pasar a la siguiente ronda",
      naughtyRanking: "Clasificación picante"
    },
    geniusOrLiar: {
      // --- Main UI Keys from screenshots ---
      accuseTitle: '¿Quién es el mentiroso?',
      pretendKnows: 'dice que sabe',
      accuseNoOne: 'No acusar a nadie',
      roundResults: 'Resultados de la ronda',
      correctAnswerLabel: 'La respuesta correcta era: {{answer}}',
      givenAnswerLabel: 'Tu respuesta: {{answer}}',
      drinks: 'sorbos',
      
      // --- Player Statuses ---
      playerStatus: {
        wrongAnswer: 'Respuesta incorrecta',
        dontKnow: 'No sabía la respuesta',
        correctAnswer: '¡Respuesta correcta!',
        correctButAccused: '¡Genio, pero acusado!',
        liarNotAccused: '¡La mentira ha colado!',
        liarAccused: '¡Mentiroso, y descubierto!',
      },
      accuserStatus: {
        correctAccusation: '¡Bien visto!',
        wrongAccusation: '¡Acusación falsa!'
      },
      
      // --- General Gameplay ---
      answerPlaceholder: 'Tu respuesta...',
      validate: 'Validar',
      know: 'Lo sé',
      dontKnow: 'No lo sé',
      accuse: 'Acusar',
      nextRound: 'Siguiente Ronda',
      showResults: 'Mostrar Resultados',
      endGame: 'Mostrar Resultados Finales',
      chooseGameMode: 'Elige el modo de juego',
      pointsMode: 'Puntos',
      forfeitsMode: 'Sorbos',
      points: 'puntos',
      forfeit: 'sorbo',
      forfeits: 'sorbos',

      // --- Waiting / Info Text ---
      yourAnswer: 'Tu respuesta',
      waitingForPlayers: 'Esperando a los demás jugadores...',
      waitingForAnswers: 'Esperando a que los demás jugadores respondan...',
      waitingForVotes: 'Esperando a que los demás jugadores voten...',
      playersWhoKnow: 'Jugadores que dicen saber:',
      playersWhoDontKnow: 'Jugadores que no saben:',
      noOneKnows: '¡Nadie sabía la respuesta!',
      allPlayersKnow: '¡Todos sabían la respuesta!',
      wasAccused: 'Fue acusado',
      accusedBy: 'Acusado por {{count}}',

      // --- Error / Edge Cases ---
      errorSubmit: 'Error al enviar la respuesta.',
      noQuestionAvailable: 'No hay preguntas disponibles para este juego.',
      incorrectQuestionFormat: 'Formato de pregunta incorrecto (ID: {{id}})',
      modeSelectError: 'Error al seleccionar el modo de juego.',
      
      // --- Question Categories ---
      questionTypes: {
        cultureG: 'Cultura General',
        cultureGHard: 'Cultura General (Difícil)',
        culturePop: 'Cultura Pop',
        cultureGeek: 'Cultura Geek',
        cultureArt: 'Arte',
        hard: 'Difícil',
        devinette: 'Adivinanza',
        verite: 'Verdad'
      }
    },
    theHiddenVillage: {
      title: 'EL PUEBLO OCULTO',
      subtitle: 'Un juego de faroles y estrategia',
      description: 'Un juego de faroles, estrategia y discusión... para los que les gusta acusar a sus amigos 😈',
      principles: {
        title: '🌓 PRINCIPIO DEL JUEGO',
        list: [
          'Cada noche, un jugador "traidor" elimina a otro jugador.',
          'Cada día, los supervivientes debaten y votan para eliminar a quien sospechan.',
          'Objetivo: desenmascarar al culpable antes de que elimine a todos.'
        ]
      },
      roles: {
        title: '🎭 ROLES',
        traitor: {
          name: 'El Traidor',
          description: 'Elimina cada noche. Debe sobrevivir.'
        },
        medium: {
          name: 'El Médium',
          description: 'Adivina si un jugador es un aldeano o un traidor.'
        },
        protector: {
          name: 'El Protector',
          description: 'Protege a un jugador cada noche.'
        },
        villager: {
          name: 'El Aldeano',
          description: 'Sin poder. Vota con sabiduría.'
        },
        liar: {
          name: 'El Mentiroso',
          description: 'Rol divertido. Siembra la duda.'
        }
      },
      objectives: {
        title: '🎯 OBJETIVOS',
        traitor: 'Traidor: eliminar a todos los demás sin ser descubierto.',
        village: 'Pueblo: descubrir al traidor antes de que gane.'
      }
    },
    trapAnswer: {
      title: "Pregunta Trampa",
      question: "Pregunta",
      next: "Siguiente",
      endGame: "Fin de la partida",
      endTitle: "¡Felicidades a todos!",
      endSubtitle: "Has terminado el juego de Pregunta Trampa",
      home: "Inicio",
      readAloud: "Leer en voz alta",
      targetAnswers: "¡{{name}} responde!",
      error: "Ocurrió un error",
      noQuestions: "No hay preguntas disponibles",
      errorNext: "Ocurrió un error al pasar a la siguiente ronda",
      submit: "Enviar",
      choices: "Opciones",
      correctAnswer: "¡Respuesta correcta!",
      wrongAnswer: "Respuesta incorrecta.",
      correct: "Correcto",
      wrong: "Incorrecto",
      waitingForPlayers: "Esperando a los demás jugadores...",
      playerAnswered: "{{count}} jugador ha respondido",
      playerAnswered_plural: "{{count}} jugadores han respondido",
      yourScore: "Tu puntuación",
      playerScores: "Puntuaciones de los jugadores"
    },
    twoLettersOneWord: {
      score: "Puntuación: {{score}}",
      theme: "Tema: {{theme}}",
      inputPlaceholder: "Introduce tu palabra...",
      verifyButton: "Verificar",
      verifyingButton: "Verificando...",
      validWord: "¡Palabra válida!",
      validWordMessage: "¡Has encontrado una palabra válida!",
      invalidWord: "Palabra inválida",
      invalidWordMessage: "Esta palabra no cumple los criterios solicitados.",
      noWordError: "Por favor, introduce una palabra",
      error: "Ocurrió un error",
      howToPlay: "Encuentra una palabra que contenga las dos letras dadas y corresponda al tema elegido.",
      "theme.marque": "una marca",
      "theme.ville": "una ciudad",
      "theme.prenom": "un nombre",
      "theme.pays": "un país",
      "theme.animal": "un animal",
      "theme.metier": "un oficio",
      "theme.sport": "un deporte",
      "theme.fruit": "una fruta",
      "theme.legume": "una verdura",
      "theme.objet": "un objeto",
      "exampleWord": "Ejemplo: {{word}}",
      "nextButton": "Siguiente ronda",
      "noExampleAvailable": "No hay ejemplos disponibles",
    },
    waitingForPlayersTitle: "Esperando a los jugadores",
    waitingForPlayersMessage: "Por favor, espera a que todos los jugadores envíen su palabra.",
    actionNotAllowedTitle: "Acción no permitida",
    onlyHostCanAdvance: "Solo el anfitrión puede pasar a la siguiente ronda.",
    word_guessing: {
      targetPlayer: 'Haz que {{player}} adivine',
      forbiddenWords: 'Palabras prohibidas',
      guesserInstructions: '¡Tu amigo está intentando que adivines una palabra!',
      guesserInfo: 'Escucha atentamente e intenta encontrar la palabra sin que use las palabras prohibidas.',
      found: '¡Palabra encontrada!',
      forbidden: '¡Palabra prohibida!',
      nextWord: 'Siguiente palabra',
      categories: {
        lieux: 'Lugares',
        aliments: 'Alimentos',
        transport: 'Transporte',
        technologie: 'Tecnología',
        sports: 'Deportes',
        loisirs: 'Aficiones',
        nature: 'Naturaleza',
        objets: 'Objetos',
        animaux: 'Animales',
      },
    },
  },

  // Splash Screen
  splash: {
    title: 'Nightly',
    subtitle: 'Listo para jugar',
    loading: 'Cargando...',
  },

  // Rules
  rules: {
    title: 'REGLAS DEL JUEGO',
    loading: 'Cargando reglas...',
    confirm: 'He leído las reglas',
    confirmStart: 'He leído las reglas, empezar la partida',
    general: {
      title: 'REGLAS GENERALES',
      description: 'Se designa un jugador al azar en cada ronda.'
    },
    participation: {
      title: 'PARTICIPACIÓN',
      description: 'Todos los jugadores deben participar activamente.'
    },
    scoring: {
      title: 'PUNTUACIÓN',
      description: 'Los puntos se otorgan según las reglas específicas del juego.'
    }
  },

  room: {
    loading: "Cargando la sala...",
    notFound: "Sala no encontrada",
    codeLabel: "Código de la sala",
    codeCopied: "Código copiado al portapapeles",
    players: "{{count}} jugador",
    players_plural: "{{count}} jugadores",
    host: "Anfitrión",
    ready: "Listo",
    rules: "Reglas",
    rulesNotRead: "Por favor, lee las reglas antes de empezar la partida.",
    iAmReady: "Estoy listo",
    startGame: "Empezar partida",
    inviteTitle: "Únete a mi partida",
    inviteMessage: "¡Únete a mi partida en Nightly! Código: {{code}}",
    error: "Error",
    errorLoading: "No se pudo cargar la sala",
    errorStart: "No se pudo empezar la partida",
    errorLeave: "No se pudo salir de la sala",
    errorReady: "No se pudo establecer como listo",
    errorCopy: "Error al copiar el código",
    errorShare: "Error al compartir",
    successCopy: "Código copiado al portapapeles",
    minPlayersRequired: "Mínimo {{count}} jugadores requeridos",
    notEnoughPlayers: "No hay suficientes jugadores",
    rounds: "rondas",
    title: "Sala de juego"
  },

  topBar: {
    greeting: 'Hola',
    notifications: {
      title: 'Notificaciones',
      comingSoon: '¡Esta función llegará pronto!'
    }
  },

  // Paywall
  paywall: {
    title: 'Nightly Premium',
    subtitle: 'ACCESO ILIMITADO',
    tagline: 'JUEGA SIN LÍMITES',
    features: {
      unlimited: 'Acceso ilimitado a todos los modos',
      weekly: 'Nuevas cartas cada semana',
      visuals: 'Temas visuales exclusivos',
      characters: 'Personalización de personajes',
      updates: 'Actualizaciones prioritarias'
    },
    plans: {
      weekly: {
        badge: 'PASE',
        title: 'Pase Nightly',
        period: 'por semana',
        description: 'Perfecto para una noche o un fin de semana con amigos'
      },
      monthly: {
        badge: 'FIESTA',
        title: 'Fiesta Nightly',
        period: 'por mes',
        description: 'Para los que juegan regularmente'
      },
      annual: {
        badge: 'ACCESO TOTAL',
        title: 'Acceso Total Nightly',
        period: 'por año',
        description: 'La oferta definitiva para los fans'
      }
    },
    cta: 'Empezar ahora',
    footer: {
      restore: 'Restaurar compras',
      terms: 'Términos de servicio'
    },
    alerts: {
      productUnavailable: {
        title: 'Producto no disponible',
        message: 'La suscripción no está disponible en este momento. Por favor, inténtalo de nuevo más tarde.'
      },
      success: {
        title: 'Éxito',
        message: '¡Gracias por tu compra!'
      },
      pending: {
        title: 'Información',
        message: 'Tu suscripción ha sido procesada pero aún no está activa. Por favor, reinicia la aplicación.'
      },
      error: {
        title: 'Error',
        message: 'La compra ha fallado. Por favor, inténtalo de nuevo o elige otro método de pago.'
      },
      restoreSuccess: {
        title: 'Éxito',
        message: '¡Tu compra ha sido restaurada!'
      },
      restoreError: {
        title: 'Error',
        message: 'Falló la restauración de las compras'
      },
      termsError: {
        title: 'Error',
        message: 'No se pudieron abrir los términos de servicio'
      }
    },
    prices: {
      weekly: '3,99',
      monthly: '7,99',
      annual: '29,99',
      currency: '€'
    },
    freeTrial: '3 días gratis',
  },

  assets: {
    avatars: {
      'avatar-panda': {
        name: 'Panda',
        description: 'Un adorable panda para tu perfil'
      },
      'avatar-chat': {
        name: 'Gato',
        description: 'Un gato lindo y juguetón'
      },
      'avatar-chat-rare': {
        name: 'Gato Misterioso',
        description: 'Un gato misterioso con ojos brillantes'
      },
      'avatar-chat-rare-2':
      {
        name: 'Gato Raro',
        description: 'Un gato raro con un diseño único'
      },
      'avatar-crocodile': {
        name: 'Cocodrilo',
        description: 'Un cocodrilo impresionante'
      },
      'avatar-hibou': {
        name: 'Búho',
        description: 'Un búho sabio y misterioso'
      },
      'avatar-grenouille': {
        name: 'Rana',
        description: 'Una rana mágica y colorida'
      },
      'avatar-oiseau': {
        name: 'Pájaro',
        description: 'Un pájaro con colores vivos'
      },
      'avatar-renard': {
        name: 'Zorro',
        description: 'Un zorro astuto y elegante'
      },
      'avatar-dragon': {
        name: 'Dragón',
        description: 'Un majestuoso dragón que escupe fuego'
      },
      'avatar-ourse': {
        name: 'Osa',
        description: 'Una osa majestuosa'
      },
      'avatar-loup-rare': {
        name: 'Lobo Raro',
        description: 'Un lobo raro y misterioso'
      },
      'avatar-dragon-rare': {
        name: 'Dragón Legendario',
        description: 'Un majestuoso dragón que escupe fuego'
      },
      'avatar-licorne': {
        name: 'Unicornio',
        description: 'Un unicornio legendario'
      },
      'avatar-phoenix': {
        name: 'Fénix',
        description: 'Un fénix legendario que renace de sus cenizas'
      }
    }
  },

  inviteModal: {
    title: "Invitar amigos",
    roomCode: "Código de la sala",
    instruction: "Escanea el código QR o comparte este código para invitar a tus amigos a la sala.",
    shareButton: "Compartir"
  },

  ads: {
    title: '¡Mira un anuncio para tener 3 rondas más!',
  },
};

export default es; 