export default {
  // General
  app: {
    name: 'Nightly',
  },
  
  // Language screen
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
    back: 'Atrás',
    home: 'Inicio',
    profile: 'Perfil',
    settings: 'Ajustes',
  },

  // Error messages
  errors: {
    general: 'Ha ocurrido un error',
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
      username: 'Tu nombre de usuario',
      usernameRequired: 'Por favor, introduce tu nombre de usuario',
      usernameLength: 'El nombre de usuario debe tener al menos 3 caracteres',
      enterUsername: 'Ingresa tu nombre de usuario para jugar',
      connecting: 'Conectando...',
      play: 'Jugar',
      selectCharacter: 'Elige tu personaje',
      characterDescription: 'Selecciona un personaje que te represente para la partida',
    },
    register: {
      title: 'Registro',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      submit: 'Registrarse',
      haveAccount: '¿Ya tienes cuenta?',
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
    logoutError: 'Ocurrió un error al cerrar sesión. Por favor, inténtalo de nuevo.',
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
    premium: {
      title: 'Pase Premium',
      try: 'Probar Premium',
      free: 'Gratis 3 días',
      price: 'luego 3,99€/semana',
      features: {
        unlock: 'Desbloquea todos los modos',
        weekly: 'Nuevo pack cada semana',
        friends: 'Acceso gratis para amigos',
        cancel: 'Cancela cuando quieras',
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
      noConnection: 'Sin conexión a internet. Por favor, verifica tu conexión e inténtalo de nuevo.',
      loginRequired: 'Debes iniciar sesión para crear una sala de juego.',
      invalidSession: 'Tu sesión de usuario no es válida. Por favor, vuelve a iniciar sesión.',
      roomCreationFailed: 'No se pudo crear la sala',
      invalidCode: 'Código de partida inválido',
      roomNotFound: 'Sala no encontrada',
      gameStarted: 'Esta partida ya ha comenzado',
      roomFull: 'Esta partida está llena',
      notAuthenticated: 'Usuario no autenticado',
      alreadyInGame: 'Ya estás en esta partida',
      serverTimeout: 'El servidor está tardando demasiado en responder. Por favor, inténtalo de nuevo.',
      networkError: 'Error de red: verifica tu conexión a internet',
      permissionDenied: 'Acceso denegado: verifica las reglas de seguridad de Firestore',
    },
    room: {
      create: 'Crear sala',
      join: 'Unirse a sala',
      code: 'Código de sala',
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
      same_room: "¡Juega juntos en la misma habitación!",
      online: "Juega incluso cuando no estéis juntos"
    },
    games: {
      "listen-but-don-t-judge": {
        name: "ESCUCHA PERO NO JUZGUES",
        description: "Un modo gratuito para reírte con amigos.",
        tags: {
          free: "GRATIS"
        }
      },
      "truth-or-dare": {
        name: "VERDAD O RETO",
        description: "El clásico revisado con desafíos exclusivos.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "never-have-i-ever-hot": {
        name: "NUNCA NUNCA 🔞",
        description: "Preguntas picantes e inapropiadas... ¿Listo para confesar?",
        tags: {
          premium: "PREMIUM"
        }
      },
      "genius-or-liar": {
        name: "GENIO O MENTIROSO",
        description: "Un modo divertido donde debes demostrar tus conocimientos o enfrentar las consecuencias.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "the-hidden-village": {
        name: "EL PUEBLO OCULTO",
        description: "Un juego de engaño, estrategia y discusiones... para los que aman acusar a sus amigos 😈",
        tags: {
          premium: "PREMIUM"
        }
      },
      "trap-answer": {
        name: "Respuesta Trampa",
        description: "Un quiz donde una respuesta incorrecta te hace perder puntos... ¿Podrás evitar las trampas?",
        tags: {
          free: "GRATIS"
        }
      },
      "two-letters-one-word": {
        name: "2 Letras 1 Palabra",
        description: "Encuentra una palabra que contenga las dos letras dadas y coincida con el tema.",
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
        invalidWordMessage: "Esta palabra no coincide con los criterios solicitados.",
        noWordError: "Por favor, introduce una palabra",
        error: "Ha ocurrido un error",
        howToPlay: "Encuentra una palabra que contenga las dos letras dadas y coincida con el tema elegido.",
        title: "¡Fin del juego!",
        subtitle: "¡Gracias por jugar 2 Letras 1 Palabra!",
        totalWords: "Palabras encontradas",
        bestWord: "Mejor palabra",
        averageScore: "Puntuación media",
        timePlayed: "Tiempo de juego",
        newHighScore: "¡Nuevo récord!",
        shareResults: "Compartir resultados",
        playAgain: "Jugar de nuevo",
        "theme.marque": "una marca",
        "theme.ville": "una ciudad",
        "theme.prenom": "un nombre",
        "theme.pays": "un país",
        "theme.animal": "un animal",
        "theme.metier": "un trabajo",
        "theme.sport": "un deporte",
        "theme.fruit": "una fruta",
        "theme.legume": "una verdura",
        "theme.objet": "un objeto",
        "exampleWord": "Ejemplo: {{word}}",
        "nextButton": "Siguiente ronda",
        "noExampleAvailable": "No hay ejemplo disponible",
      },
      "word-guessing": {
        name: "ADIVINA LA PALABRA",
        description: "Haz que otros adivinen una palabra sin usar palabras prohibidas... ¡Un juego de palabras y velocidad!",
        tags: {
          free: "GRATIS"
        }
      },
      // Traducciones de temas
      "theme.marque": "una marca",
      "theme.ville": "una ciudad",
      "theme.prenom": "un nombre",
      "theme.pays": "un país",
      "theme.animal": "un animal",
      "theme.metier": "un trabajo",
      "theme.sport": "un deporte",
      "theme.fruit": "una fruta",
      "theme.legume": "una verdura",
      "theme.objet": "un objeto",
    }
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
      cost: 'Costo',
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
    start: 'Iniciar',
    join: 'Unirse',
    leave: 'Salir',
    players: 'Jugadores',
    waiting: 'Esperando',
    yourTurn: 'Tu turno',
    gameOver: 'Fin del juego',
    winner: 'Ganador',
    draw: 'Empate',
    error: "Error",
    unknownMode: "Modo de juego desconocido: {{mode}}",
    notFound: "No se encontró ningún documento de juego para el id: {{id}}",
    noMode: "No se encontró ningún modo de juego en el documento de juegos.",
    loading: "Cargando...",
    results: {
      title: "Resultados Finales",
      subtitle: "¡Felicidades a todos!",
      bravo: "¡Felicidades {{name}}!",
      points: "puntos",
      home: "Inicio",
      calculating: "Calculando resultados...",
      podium: {
        first: "1er lugar",
        second: "2do lugar",
        third: "3er lugar",
        others: "Otros jugadores",
        title: "Clasificación del Podio",
      },
      rank: "Clasificación",
      score: "Puntuación",
      player: "Jugador",
      "two-letters-one-word": {
        title: "¡Fin del juego!",
        subtitle: "¡Gracias por jugar 2 Letras 1 Palabra!",
        totalWords: "Palabras encontradas",
        bestWord: "Mejor palabra",
        averageScore: "Puntuación media",
        timePlayed: "Tiempo de juego",
        newHighScore: "¡Nuevo récord!",
        shareResults: "Compartir resultados",
        playAgain: "Jugar de nuevo",
        "theme.marque": "una marca",
        "theme.ville": "una ciudad",
        "theme.prenom": "un nombre",
        "theme.pays": "un país",
        "theme.animal": "un animal",
        "theme.metier": "un trabajo",
        "theme.sport": "un deporte",
        "theme.fruit": "una fruta",
        "theme.legume": "una verdura",
        "theme.objet": "un objeto"
      },
      "word-guessing": {
        title: "Adivina la palabra",
        timer: "Tiempo restante",
        score: "Puntuación",
        forbiddenWords: "Palabras prohibidas",
        start: "Comenzar",
        next: "Siguiente palabra",
        found: "¡Palabra encontrada!",
        forbidden: "¡Palabra prohibida usada!",
        timeUp: "¡Se acabó el tiempo!",
        finalScore: "Puntuación final",
        playAgain: "Jugar de nuevo"
      }
    },
    player: 'el jugador',
    round: "Ronda {{current}}/{{total}}",
    truthOrDare: {
      title: 'Verdad o Reto',
      choice: 'Elección',
      question: 'Pregunta',
      action: 'Reto',
      submitChoice: 'Enviar elección',
      submitAnswer: 'Enviar respuesta',
      next: 'Siguiente',
      endGame: 'Fin del juego',
      endTitle: '¡Felicidades a todos!',
      endSubtitle: 'Terminaste el juego de Verdad o Reto',
      home: 'Volver al inicio',
      readAloud: 'Leer en voz alta',
      targetChooses: '¡{{name}} elige entre Verdad o Reto!',
      targetAnswers: '¡{{name}} responde la verdad!',
      targetDoesDare: '¡{{name}} hace el reto!',
      error: 'Ha ocurrido un error',
      noQuestions: 'No hay preguntas disponibles',
      errorNext: 'Ha ocurrido un error al pasar a la siguiente ronda',
      naughtyRanking: 'Ranking de picardía',
      truth: "Verdad",
      dare: "Reto",
      chooseTask: "Elige: ¿Verdad o Reto?",
      isThinking: "está pensando...",
      willChoose: "va a elegir",
      or: "o",
      iAnswered: "He respondido",
      iRefuse: "Paso turno",
      voteInProgress: "Votación en curso",
      otherPlayersDecide: "Los demás deciden si",
      playedGame: "jugó el juego",
      votes: "votos",
      vote: "Votar",
      did: "¿",
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
      title: 'Escucha pero no Juzgues',
      question: 'Pregunta',
      next: 'Siguiente',
      endGame: 'Fin del juego',
      endTitle: '¡Felicidades a todos!',
      endSubtitle: 'Terminaste el juego de Escucha pero no Juzgues',
      home: 'Volver al inicio',
      readAloud: 'Leer en voz alta',
      targetAnswers: '¡{{name}} responde!',
      error: 'Ha ocurrido un error',
      noQuestions: 'No hay preguntas disponibles',
      errorNext: 'Ha ocurrido un error al pasar a la siguiente ronda'
    },
    neverHaveIEverHot: {
      never: "Nunca nunca",
      ever: "Ya he",
      waiting: "Esperando la elección del jugador objetivo...",
      prepare: "¡Prepárate para responder!",
      submit: "Enviar",
      next: "Siguiente ronda",
      endGame: "Fin del juego",
      errorSubmit: "No se pudo enviar la respuesta",
      endTitle: "¡Felicidades a todos!",
      endSubtitle: "Terminaste el juego de Nunca Nunca 🔞",
      home: "Volver al inicio",
      readAloud: "Lee la pregunta en voz alta",
      targetReads: "{{name}} lee la pregunta",
      noQuestions: "No hay preguntas disponibles",
      errorNext: "Ha ocurrido un error al pasar a la siguiente ronda",
      naughtyRanking: "Ranking de picardía"
    },
    geniusOrLiar: {
      title: 'Genio o Mentirosos',
      question: 'Pregunta',
      know: 'Lo sé',
      dontKnow: 'No lo sé',
      accuse: 'Acusar',
      submitAnswer: 'Enviar respuesta',
      next: 'Siguiente ronda',
      endGame: 'Fin del juego',
      endTitle: '¡Felicidades a todos!',
      endSubtitle: 'Terminaste el juego de Genio o Mentirosos',
      home: 'Volver al inicio',
      readAloud: 'Leer en voz alta',
      targetAnswers: '¡{{name}} responde!',
      error: 'Ha ocurrido un error',
      noQuestions: 'No hay preguntas disponibles',
      errorNext: 'Ha ocurrido un error al pasar a la siguiente ronda',
      errorSubmit: 'Error al enviar tu respuesta o voto.'
    },
    theHiddenVillage: {
      title: 'EL PUEBLO OCULTO',
      subtitle: 'Un juego de engaño y estrategia',
      description: 'Un juego de engaño, estrategia y discusiones... para los que aman acusar a sus amigos 😈',
      principles: {
        title: '🌓 PRINCIPIO DEL JUEGO',
        list: [
          'Cada noche, un jugador "traidor" elimina a otro jugador.',
          'Cada día, los supervivientes discuten y votan para eliminar al que sospechan.',
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
          description: 'Sin poder. Vota sabiamente.'
        },
        liar: {
          name: 'El Mentirosos',
          description: 'Rol divertido. Siembra dudas.'
        }
      },
      objectives: {
        title: '🎯 OBJETIVOS',
        traitor: 'Traidor: eliminar a todos los demás sin ser atrapado.',
        village: 'Aldea: descubrir al traidor antes de que gane.'
      }
    },
    trapAnswer: {
      title: "Respuesta Trampa",
      question: "Pregunta",
      next: "Siguiente",
      endGame: "Fin del juego",
      endTitle: "¡Felicidades a todos!",
      endSubtitle: "Terminaste el juego de Respuesta Trampa",
      home: "Volver al inicio",
      readAloud: "Leer en voz alta",
      targetAnswers: "¡{{name}} responde!",
      error: "Ha ocurrido un error",
      noQuestions: "No hay preguntas disponibles",
      errorNext: "Ha ocurrido un error al pasar a la siguiente ronda",
      submit: "Enviar",
      choices: "Opciones",
      correctAnswer: "¡Respuesta correcta!",
      wrongAnswer: "Respuesta incorrecta.",
      correct: "Correcto",
      wrong: "Incorrecto",
      waitingForPlayers: "Esperando a otros jugadores...",
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
      invalidWordMessage: "Esta palabra no coincide con los criterios solicitados.",
      noWordError: "Por favor, introduce una palabra",
      error: "Ha ocurrido un error",
      howToPlay: "Encuentra una palabra que contenga las dos letras dadas y coincida con el tema elegido.",
      "theme.marque": "una marca",
      "theme.ville": "una ciudad",
      "theme.prenom": "un nombre",
      "theme.pays": "un país",
      "theme.animal": "un animal",
      "theme.metier": "un trabajo",
      "theme.sport": "un deporte",
      "theme.fruit": "una fruta",
      "theme.legume": "una verdura",
      "theme.objet": "un objeto",
      "exampleWord": "Ejemplo: {{word}}",
      "nextButton": "Siguiente ronda",
      "noExampleAvailable": "No hay ejemplo disponible",
    },
    word_guessing: {
      targetPlayer: 'Haz que {{player}} adivine',
      forbiddenWords: 'Palabras prohibidas',
      found: '¡Palabra encontrada!',
      forbidden: '¡Palabra prohibida!',
      nextWord: 'Siguiente palabra',
      categories: {
        lieux: 'Lugares',
        aliments: 'Alimentos',
        transport: 'Transporte',
        technologie: 'Tecnología',
        sports: 'Deportes',
        loisirs: 'Hobbies',
        nature: 'Naturaleza',
        objets: 'Objetos',
        animaux: 'Animales',
      },
      guesserInstructions: '¡Tu amigo está intentando que adivines una palabra!',
      guesserInfo: 'Escucha atentamente e intenta encontrar la palabra sin que usen las palabras prohibidas.',
    },
    waitingForPlayersTitle: "Esperando jugadores",
    waitingForPlayersMessage: "Por favor, espera a que todos los jugadores envíen su palabra.",
    actionNotAllowedTitle: "Acción no permitida",
    onlyHostCanAdvance: "Solo el anfitrión puede avanzar a la siguiente ronda.",
  },

  // Splash Screen
  splash: {
    title: 'Nightly',
    subtitle: 'Prepárate para jugar',
    loading: 'Cargando...',
  },

  // Rules translations
  rules: {
    title: 'REGLAS DEL JUEGO',
    loading: 'Cargando reglas...',
    confirm: 'He leído las reglas',
    confirmStart: 'He leído las reglas, iniciar el juego',
    general: {
      title: 'REGLAS GENERALES',
      description: 'Un jugador es designado aleatoriamente en cada turno.'
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
    loading: "Cargando sala...",
    notFound: "Sala no encontrada",
    codeLabel: "Código de sala",
    codeCopied: "Código copiado al portapapeles",
    players: "{{count}} jugador",
    players_plural: "{{count}} jugadores",
    host: "Anfitrión",
    ready: "Listo",
    rules: "Reglas",
    rulesNotRead: "Por favor, lee las reglas antes de iniciar el juego.",
    iAmReady: "Estoy listo",
    startGame: "Iniciar Juego",
    inviteTitle: "Únete a mi partida",
    inviteMessage: "¡Únete a mi partida en Nightly! Código: {{code}}",
    error: "Error",
    errorLoading: "No se pudo cargar la sala",
    errorStart: "No se pudo iniciar el juego",
    errorLeave: "No se pudo salir de la sala",
    errorReady: "No se pudo establecer como listo",
    errorCopy: "Error al copiar el código",
    errorShare: "Error al compartir",
    successCopy: "Código copiado al portapapeles",
    minPlayersRequired: "Mínimo {{count}} jugadores requeridos",
    notEnoughPlayers: "No hay suficientes jugadores",
    rounds: "rondas",
    title: "Sala de Juego"
  },

  topBar: {
    greeting: 'Hola',
    notifications: {
      title: 'Notificaciones',
      comingSoon: '¡Esta función estará disponible pronto!'
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
        badge: 'PASS',
        title: 'Nightly Pass',
        period: 'por semana',
        description: 'Perfecto para una noche o un fin de semana con amigos'
      },
      monthly: {
        badge: 'PARTY',
        title: 'Nightly Party',
        period: 'por mes',
        description: 'Para jugadores habituales'
      },
      annual: {
        badge: 'ALL ACCESS',
        title: 'Nightly All Access',
        period: 'por año',
        description: 'La oferta definitiva para los fans'
      }
    },
    cta: 'Empezar ahora',
    footer: {
      restore: 'Restaurar compras',
      terms: 'Términos de uso'
    },
    alerts: {
      productUnavailable: {
        title: 'Producto no disponible',
        message: 'La suscripción no está disponible en este momento. Por favor, inténtelo de nuevo más tarde.'
      },
      success: {
        title: 'Éxito',
        message: '¡Gracias por tu compra!'
      },
      pending: {
        title: 'Información',
        message: 'Su suscripción ha sido procesada pero aún no está activa. Por favor, reinicie la aplicación.'
      },
      error: {
        title: 'Error',
        message: 'La compra falló. Por favor, inténtelo de nuevo o elija otro método de pago.'
      },
      restoreSuccess: {
        title: 'Éxito',
        message: '¡Tu compra ha sido restaurada!'
      },
      restoreError: {
        title: 'Error',
        message: 'La restauración de las compras falló'
      },
      termsError: {
        title: 'Error',
        message: 'No se pudieron abrir los Términos de uso'
      }
    },
    prices: {
      weekly: '3,99',
      monthly: '7,99',
      annual: '29,99',
      currency: '€'
    },
    freeTrial: 'Prueba gratuita de 3 días',
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
      'avatar-chat-rare-2': {
        name: 'Gato Raro',
        description: 'Un gato raro con un diseño único'
      },
      'avatar-crocodile': {
        name: 'Cocodrilo',
        description: 'Un impresionante cocodrilo'
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
        description: 'Un pájaro con colores vibrantes'
      },
      'avatar-renard': {
        name: 'Zorro',
        description: 'Un zorro astuto y elegante'
      },
      'avatar-dragon': {
        name: 'Dragón',
        description: 'Un majestuoso dragón escupefuego'
      },
      'avatar-ourse': {
        name: 'Osa',
        description: 'Una majestuosa osa'
      },
      'avatar-loup-rare': {
        name: 'Lobo Raro',
        description: 'Un lobo raro y misterioso'
      },
      'avatar-dragon-rare': {
        name: 'Dragón Legendario',
        description: 'Un majestuoso dragón escupefuego'
      },
      'avatar-licorne': {
        name: 'Unicornio',
        description: 'Un legendario unicornio'
      },
      'avatar-phoenix': {
        name: 'Fénix',
        description: 'Un legendario fénix que renace de sus cenizas'
      }
    }
  },

  inviteModal: {
    title: "Invitar amigos",
    roomCode: "Código de la sala",
    instruction: "Escanea el código QR o comparte este código para invitar a tus amigos a la sala.",
    shareButton: "Compartir"
  },

  // Common translations
  common: {
    ok: 'OK',
    loading: 'Cargando...',
  },
}; 