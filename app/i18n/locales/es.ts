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
        description: "Un modo gratuito para divertirse con amigos.",
        tag: "GRATIS"
      },
      "truth-or-dare": {
        name: "VERDAD O RETO",
        description: "El clásico revisado con desafíos exclusivos.",
        tag: "PREMIUM"
      },
      "never-have-i-ever-hot": {
        name: "NUNCA NUNCA 🔞",
        description: "Preguntas picantes y atrevidas... ¿Listo para confesar?",
        tag: "PREMIUM"
      },
      "genius-or-liar": {
        name: "GENIO O MENTIROSO",
        description: "Un modo divertido donde debes demostrar tus conocimientos o enfrentar retos.",
        tag: "PREMIUM"
      },
      "the-hidden-village": {
        name: "EL PUEBLO ESCONDIDO",
        description: "Un juego de farol, estrategia y discusiones... para los que disfrutan acusando a sus amigos 😈",
        tag: "PREMIUM"
      },
      "trap-answer": {
        name: "Respuesta Trampa",
        tag: "GRATIS",
        description: "Un quiz donde una respuesta incorrecta te hace perder puntos... ¿Podrás evitar las trampas?"
      },
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
      owned: 'Assets adquiridos',
      cost: 'Costo',
      points: 'puntos',
      buy: 'Comprar',
      confirm: 'Confirmar compra',
      cancel: 'Cancelar',
      success: '¡Asset comprado con éxito!',
      error: 'Error durante la compra',
      insufficientPoints: 'Puntos insuficientes',
    },
  },

  // Game
  game: {
    start: 'Comenzar',
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
    noMode: "No se encontró ningún modo de juego en el documento games.",
    loading: "Cargando...",
    results: {
      title: "Resultados finales",
      subtitle: "¡Felicitaciones a todos!",
      bravo: "¡Felicidades {{name}}!",
      points: "puntos",
      home: "Inicio",
      calculating: "Calculando resultados...",
      podium: {
        first: "1ª posición",
        second: "2ª posición",
        third: "3ª posición",
        others: "Otros jugadores",
        title: "Clasificación del podio",
      },
      rank: "Puesto",
      score: "Puntuación",
      player: "Jugador",
    },
    listenButDontJudge: {
      waiting: "Esperando a otros jugadores...",
      waitingVote: "Esperando el voto del jugador objetivo...",
      waitingForOthers: "Esperando los otros votos...",
      submit: "Enviar",
      vote: "Votar",
      next: "Siguiente ronda",
      errorSubmit: "No se pudo enviar la respuesta",
      errorVote: "No se pudo enviar el voto",
      errorNext: "Ocurrió un error al pasar a la siguiente ronda",
      noQuestions: "No hay preguntas disponibles",
      endTitle: "¡Fin de la partida!",
      endSubtitle: "¡Gracias por jugar!"
    },
    truthOrDare: {
      truth: "¡Verdad!",
      dare: "¡Reto!",
      submit: "Enviar",
      next: "Siguiente ronda",
      errorSubmit: "No se pudo enviar la respuesta",
      errorVote: "No se pudo enviar el voto",
      errorNext: "Ocurrió un error al pasar a la siguiente ronda",
      endTitle: "¡Fin de la partida!",
      endSubtitle: "¡Gracias por jugar a Verdad o Reto!"
    },
    geniusOrLiar: {
      roundResults: 'Resultados de la Ronda',
      correctAnswerLabel: 'Respuesta Correcta: {{answer}}',
      givenAnswerLabel: 'Respuesta Dada: {{answer}}',
      playerStatus: {
        dontKnow: 'No sabía',
        correctAnswer: 'Encontró la respuesta correcta',
        correctButAccused: 'Encontró la respuesta correcta, pero fue acusado',
        liarNotAccused: 'Mintió sin ser acusado',
        liarAccused: 'Mintió y fue acusado',
        wrongAnswer: 'Respuesta incorrecta'
      },
      accuserStatus: {
        correctAccusation: '¡Acusación justificada!',
        wrongAccusation: '¡Acusación incorrecta!'
      },
      wasAccused: 'Fue acusado',
      nextRound: 'Siguiente Ronda',
      endGame: 'Terminar Juego',
      drinks: 'castigos',
      chooseGameMode: 'Elegir Modo de Juego',
      pointsMode: 'Modo Puntos',
      gagesMode: 'Modo Castigos',
      modeSelectError: 'No se pudo seleccionar el modo de juego.',
      noQuestionAvailable: 'No hay preguntas disponibles.',
      incorrectQuestionFormat: 'Formato de pregunta incorrecto para id: {{id}}.',
      noQuestions: 'No se cargaron preguntas.',
      accuseTitle: 'Acusar a un Mentiroso',
      pretendKnows: 'Pretende saber',
      accusedBy: 'Acusado por {{count}} jugador(es)',
      accuseNoOne: 'No acusar a nadie',
      waitingForPlayers: 'Esperando a otros jugadores...',
      answerPlaceholder: 'Introduce tu respuesta aquí...',
      validate: 'Validar',
      know: 'Lo sé',
      dontKnow: 'No lo sé',
      errorSubmit: 'Error al enviar tu respuesta o voto.'
    },
    neverHaveIEverHot: {
      never: "Nunca he...",
      ever: "Ya lo he hecho",
      waiting: "Esperando la elección del jugador objetivo...",
      prepare: "¡Prepárate para responder!",
      submit: "Enviar",
      next: "Siguiente ronda",
      endGame: "Terminar juego",
      errorSubmit: "No se pudo enviar la respuesta",
      endTitle: "¡Felicidades a todos!",
      endSubtitle: "Has terminado la partida de Nunca he... 🔞",
      home: "Volver al inicio",
      readAloud: "Lee la pregunta en voz alta",
      targetReads: "{{name}} lee la pregunta",
      noQuestions: "No hay preguntas disponibles",
      errorNext: "Ocurrió un error al pasar a la siguiente ronda",
      naughtyRanking: "Ranking más travieso",
      naughtyAnswers: "respuestas traviesas",
      neverButton: "🙅‍♂️ Nunca he...",
      everButton: "🔥 Ya lo he hecho",
    }
  },

  // Splash Screen
  splash: {
    title: 'Nightly',
    subtitle: 'Prepárate para jugar',
    loading: 'Cargando...',
  },

  // Reglas
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
    ready: "¡Listo!",
    rules: "reglas",
    rulesNotRead: "Por favor, lee las reglas antes de comenzar la partida.",
    iAmReady: "¡Estoy listo!",
    startGame: "Comenzar la partida",
    inviteTitle: "Únete a mi partida",
    inviteMessage: "¡Únete a mi partida en Nightly! Código: {{code}}",
    error: "Error",
    errorLoading: "No se pudo cargar la sala",
    errorStart: "No se pudo comenzar la partida",
    errorLeave: "No se pudo salir de la sala",
    errorReady: "No se pudo establecer como listo",
    errorCopy: "Error al copiar el código",
    errorShare: "Error al compartir",
    successCopy: "Código copiado al portapapeles",
    minPlayers: "Se necesitan al menos 2 jugadores para comenzar la partida.",
    allReady: "¡Todos los jugadores están listos!",
    waiting: "Esperando a otros jugadores...",
    title: "SALA DE JUEGO",
    minPlayersRequired: "Mínimo {{count}} jugadores requeridos",
    notEnoughPlayers: "No hay suficientes jugadores",
    rounds: "rondas",
  },

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
        description: 'Perfecto para una noche o fin de semana con amigos'
      },
      monthly: {
        badge: 'PARTY',
        title: 'Nightly Party',
        period: 'por mes',
        description: 'Para jugadores regulares'
      },
      annual: {
        badge: 'ALL ACCESS',
        title: 'Nightly All Access',
        period: 'por año',
        description: 'La oferta definitiva para fans'
      }
    },
    cta: 'Comenzar ahora',
    footer: {
      restore: 'Restaurar compras',
      terms: 'Términos de uso'
    },
    alerts: {
      productUnavailable: {
        title: 'Producto no disponible',
        message: 'La suscripción no está disponible en este momento. Por favor, inténtalo más tarde.'
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
        message: 'Error al restaurar las compras'
      },
      termsError: {
        title: 'Error',
        message: 'No se pueden abrir los términos de uso'
      }
    },
    prices: {
      weekly: '3,99',
      monthly: '7,99',
      annual: '29,99',
      currency: '€'
    },
    freeTrial: 'Gratis 3 días',
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
        name: 'Gato Raro',
        description: 'Un gato misterioso con ojos brillantes'
      },
      'avatar-chat-rare-2': {
        name: 'Gato Raro 2',
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
        description: 'Un dragón majestuoso que escupe fuego'
      },
      'avatar-ourse': {
        name: 'Osa',
        description: 'Una osa majestuosa'
      },
      'avatar-phoenix': {
        name: 'Fénix',
        description: 'Un legendario fénix que renace de sus cenizas'
      }
    }
  },
}; 