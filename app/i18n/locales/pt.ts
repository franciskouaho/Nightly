export default {
  // General
  app: {
    name: 'Nightly',
  },
  
  // Language screen
  language: {
    title: 'Idioma',
    selectLanguage: 'Selecione seu idioma preferido para o aplicativo',
    updated: 'Idioma atualizado',
    updatedMessage: 'O idioma do aplicativo foi alterado.',
    error: 'Erro',
    errorMessage: 'Não foi possível alterar o idioma.',
  },

  // Navigation
  navigation: {
    back: 'Voltar',
    home: 'Início',
    profile: 'Perfil',
    settings: 'Configurações',
  },

  // Error messages
  errors: {
    general: 'Ocorreu um erro',
    tryAgain: 'Por favor, tente novamente',
    networkError: 'Erro de rede',
    authError: 'Erro de autenticação',
  },

  // Authentication
  auth: {
    login: {
      title: 'Entrar',
      email: 'E-mail',
      password: 'Senha',
      submit: 'Entrar',
      forgotPassword: 'Esqueceu a senha?',
      noAccount: 'Não tem uma conta?',
      signUp: 'Cadastre-se',
      username: 'Seu nome de usuário',
      usernameRequired: 'Por favor, insira seu nome de usuário',
      usernameLength: 'O nome de usuário deve ter pelo menos 3 caracteres',
      enterUsername: 'Digite seu nome de usuário para jogar',
      connecting: 'Conectando...',
      play: 'Jogar',
    },
    register: {
      title: 'Cadastro',
      email: 'E-mail',
      password: 'Senha',
      confirmPassword: 'Confirmar senha',
      submit: 'Cadastrar',
      haveAccount: 'Já tem uma conta?',
      login: 'Entrar',
    },
  },

  // Profile
  profile: {
    title: 'Perfil',
    edit: 'Editar',
    save: 'Salvar',
    cancel: 'Cancelar',
    username: 'Nome de usuário',
    defaultUsername: 'Jogador',
    email: 'Email',
    bio: 'Biografia',
    avatar: 'Foto de perfil',
    changeAvatar: 'Alterar foto',
    settings: 'Configurações',
    logout: 'Sair',
    logoutError: 'Ocorreu um erro ao sair. Por favor, tente novamente.',
    contact: 'Contate-nos',
    contactEmail: 'Envie-nos um email para support@cosmicquest.com',
    buyAssetsTitle: 'Comprar assets',
    insufficientPoints: 'Pontos insuficientes',
    insufficientPointsMessage: 'Você não tem pontos suficientes para desbloquear este asset.',
    success: 'Sucesso',
    assetUnlocked: '{{asset}} foi desbloqueado com sucesso!',
    unlockError: 'Ocorreu um erro ao desbloquear o asset.',
    premium: {
      title: 'Passe Premium',
      try: 'Experimentar Premium',
      free: 'Grátis 3 dias',
      price: 'depois 3,99€/semana',
      features: {
        unlock: 'Desbloqueie todos os modos',
        weekly: 'Novo pacote toda semana',
        friends: 'Acesso gratuito para amigos',
        cancel: 'Cancele quando quiser',
      },
    },
  },

  // Home
  home: {
    title: 'Início',
    welcome: 'Bem-vindo',
    createGame: 'Criar partida',
    joinGame: 'Entrar em uma partida',
    enterCode: 'Inserir código',
    join: 'Entrar',
    gameModes: {
      title: 'Modos de jogo',
      classic: 'Clássico',
      custom: 'Personalizado',
      quick: 'Rápido',
    },
    errors: {
      noConnection: 'Sem conexão com a internet. Por favor, verifique sua conexão e tente novamente.',
      loginRequired: 'Você precisa estar logado para criar uma sala de jogo.',
      invalidSession: 'Sua sessão de usuário não é válida. Por favor, faça login novamente.',
      roomCreationFailed: 'Não foi possível criar a sala',
      invalidCode: 'Código de partida inválido',
      roomNotFound: 'Sala não encontrada',
      gameStarted: 'Esta partida já começou',
      roomFull: 'Esta partida está cheia',
      notAuthenticated: 'Usuário não autenticado',
      alreadyInGame: 'Você já está nesta partida',
      serverTimeout: 'O servidor está demorando muito para responder. Por favor, tente novamente.',
      networkError: 'Erro de rede: verifique sua conexão com a internet',
      permissionDenied: 'Acesso negado: verifique as regras de segurança do Firestore',
    },
    room: {
      create: 'Criar sala',
      join: 'Entrar na sala',
      code: 'Código da sala',
      players: 'Jogadores',
      status: {
        waiting: 'Aguardando',
        playing: 'Jogando',
        finished: 'Finalizada',
      },
    },
    codePlaceholder: "Digite o código da partida",
    loading: "Conectando à partida...",
    categories: {
      nightly_modes: "SUGESTÃO DA SEMANA",
      same_room: "NO MESMO LOCAL",
      online: "ONLINE"
    },
    subtitles: {
      same_room: "Jogue juntos no mesmo local!",
      online: "Jogue mesmo quando não estiverem juntos"
    },
    games: {
      "listen-but-don-t-judge": {
        name: "OUÇA MAS NÃO JULGUE",
        description: "Um modo gratuito para se divertir com amigos.",
        tag: "GRÁTIS"
      },
      "truth-or-dare": {
        name: "VERDADE OU DESAFIO",
        description: "O clássico revisado com desafios exclusivos.",
        tag: "PREMIUM"
      },
      "never-have-i-ever-hot": {
        name: "NUNCA NUNCA 🔞",
        description: "Perguntas picantes e ousadas... Pronto para confessar?",
        tag: "PREMIUM"
      },
      "genius-or-liar": {
        name: "GÊNIO OU MENTIROSO",
        description: "Um modo divertido onde você deve provar seus conhecimentos ou enfrentar desafios.",
        tag: "PREMIUM"
      },
      "the-hidden-village": {
        name: "A VILA OCULTA",
        description: "Um jogo de blefe, estratégia e discussões... para quem gosta de acusar os amigos 😈",
        tag: "PREMIUM"
      },
      "trap-answer": {
        name: "Resposta Armadilha",
        tag: "GRÁTIS",
        description: "Um quiz onde uma resposta errada te faz perder pontos... Consegues evitar as armadilhas?"
      },
    }
  },

  // Settings
  settings: {
    title: 'Configurações',
    language: 'Idioma',
    notifications: 'Notificações',
    theme: 'Tema',
    privacy: 'Privacidade',
    about: 'Sobre',
    help: 'Ajuda',
    darkMode: 'Modo escuro',
    lightMode: 'Modo claro',
    system: 'Sistema',
    buyAssets: {
      title: 'Comprar assets',
      available: 'Assets disponíveis',
      owned: 'Assets adquiridos',
      cost: 'Custo',
      points: 'pontos',
      buy: 'Comprar',
      confirm: 'Confirmar compra',
      cancel: 'Cancelar',
      success: 'Asset comprado com sucesso!',
      error: 'Erro durante a compra',
      insufficientPoints: 'Pontos insuficientes',
    },
  },

  // Game
  game: {
    start: 'Iniciar',
    join: 'Entrar',
    leave: 'Sair',
    players: 'Jogadores',
    waiting: 'Aguardando',
    yourTurn: 'Sua vez',
    gameOver: 'Fim de jogo',
    winner: 'Vencedor',
    draw: 'Empate',
    error: "Erro",
    unknownMode: "Modo de jogo desconhecido: {{mode}}",
    notFound: "Nenhum documento de jogo encontrado para o id: {{id}}",
    noMode: "Nenhum modo de jogo encontrado no documento games.",
    loading: "Carregando...",
    results: {
      title: "Resultados finais",
      subtitle: "Parabéns a todos!",
      bravo: "Parabéns {{name}}!",
      points: "pontos",
      home: "Início",
      calculating: "Calculando resultados...",
      podium: {
        first: "1º lugar",
        second: "2º lugar",
        third: "3º lugar",
        others: "Outros jogadores",
      },
      rank: "Posição",
      score: "Pontuação",
      player: "Jogador",
    },
    listenButDontJudge: {
      waiting: "Aguardando outros jogadores...",
      waitingVote: "Aguardando o voto do jogador alvo...",
      waitingForOthers: "Aguardando os outros votos...",
      submit: "Enviar",
      vote: "Votar",
      next: "Próxima rodada",
      errorSubmit: "Não foi possível enviar a resposta",
      errorVote: "Não foi possível enviar o voto",
      errorNext: "Erro ao passar para a próxima rodada",
      noQuestions: "Nenhuma pergunta disponível",
      endTitle: "Fim da partida!",
      endSubtitle: "Obrigado por jogar!"
    },
    truthOrDare: {
      truth: "Verdade!",
      dare: "Desafio!",
      submit: "Enviar",
      next: "Próxima rodada",
      errorSubmit: "Não foi possível enviar a resposta",
      errorVote: "Não foi possível enviar o voto",
      errorNext: "Erro ao passar para a próxima rodada",
      endTitle: "Fim da partida!",
      endSubtitle: "Obrigado por jogar Verdade ou Desafio!"
    },
    geniusOrLiar: {
      know: "Eu sei!",
      dontKnow: "Não sei",
      accuse: "Acusar",
      skip: "Pular",
      submit: "Enviar",
      next: "Próxima rodada",
      validate: "Validar",
      answerPlaceholder: "Escreva sua resposta aqui...",
      errorSubmit: "Falha ao enviar resposta",
      errorVote: "Falha ao enviar acusação",
      errorNext: "Ocorreu um erro ao passar para a próxima rodada",
      endTitle: "Fim de jogo!",
      endSubtitle: "Obrigado por jogar Gênio ou Mentiroso!",
      noQuestions: "Nenhuma pergunta disponível",
      allQuestionsUsed: "Todas as perguntas foram usadas",
      waitingForPlayers: "Aguardando outros jogadores...",
      chooseGameMode: "Escolha seu modo de jogo",
      pointsMode: "MODO PONTOS",
      gagesMode: "MODO PENALIDADES",
      accuseTitle: "Acuse alguém de mentir!",
      accuseNoOne: "Não quero acusar ninguém",
      pretendKnows: "Afirma saber",
      accusedBy: "Acusado por {{count}} jogador(es)",
      correctAnswer: "Resposta correta: {{answer}}",
      playerStatus: {
        dontKnow: "Não sabia",
        correctAnswer: "Resposta correta",
        correctButAccused: "Resposta correta mas acusado",
        liarNotAccused: "Mentiu sem ser acusado",
        liarAccused: "Mentiu e foi acusado"
      },
      accuserStatus: {
        correctAccusation: "Acusação correta",
        wrongAccusation: "Acusação errada",
        against: "contra {{name}}"
      }
    },
    neverHaveIEverHot: {
      never: "Eu nunca",
      ever: "Eu já",
      waiting: "Aguardando a escolha do jogador alvo...",
      prepare: "Prepare-se para responder!",
      submit: "Enviar",
      next: "Próxima rodada",
      endGame: "Terminar jogo",
      errorSubmit: "Não foi possível enviar a resposta",
      endTitle: "Parabéns a todos!",
      endSubtitle: "Vocês terminaram o jogo Eu Nunca 🔞",
      home: "Voltar para o início",
      readAloud: "Leia a pergunta em voz alta",
      targetReads: "{{name}} lê a pergunta",
      noQuestions: "Nenhuma pergunta disponível",
      errorNext: "Ocorreu um erro ao passar para a próxima rodada"
    },
    continue: 'Continuar',
    theHiddenVillage: {
      name: "A VILA OCULTA",
      description: "Um jogo de blefe, estratégia e discussões... para quem gosta de acusar os amigos 😈",
      tag: "PREMIUM"
    }
  },

  // Splash Screen
  splash: {
    title: 'Nightly',
    subtitle: 'Prepare-se para jogar',
    loading: 'Carregando...',
  },

  // Regras
  rules: {
    title: 'REGRAS DO JOGO',
    loading: 'Carregando regras...',
    confirm: 'Li as regras',
    confirmStart: 'Li as regras, iniciar o jogo',
    general: {
      title: 'REGRAS GERAIS',
      description: 'Um jogador é designado aleatoriamente a cada turno.'
    },
    participation: {
      title: 'PARTICIPAÇÃO',
      description: 'Todos os jogadores devem participar ativamente.'
    },
    scoring: {
      title: 'PONTUAÇÃO',
      description: 'Os pontos são atribuídos de acordo com as regras específicas do jogo.'
    }
  },

  room: {
    loading: "Carregando sala...",
    notFound: "Sala não encontrada",
    codeLabel: "Código da sala",
    codeCopied: "Código copiado para a área de transferência",
    players: "{{count}} jogador",
    players_plural: "{{count}} jogadores",
    host: "Anfitrião",
    ready: "Pronto",
    rules: "Regras",
    rulesNotRead: "Por favor, leia as regras antes de iniciar a partida.",
    iAmReady: "Estou pronto",
    startGame: "Iniciar jogo",
    inviteTitle: "Entre na minha partida",
    inviteMessage: "Entre na minha partida no Nightly! Código: {{code}}",
    error: "Erro",
    errorLoading: "Não foi possível carregar a sala",
    errorStart: "Não foi possível iniciar a partida",
    errorLeave: "Não foi possível sair da sala",
    errorReady: "Não foi possível definir como pronto",
    errorCopy: "Erro ao copiar o código",
    errorShare: "Erro ao compartilhar",
    successCopy: "Código copiado para a área de transferência",
    minPlayers: "São necessários pelo menos 2 jogadores para iniciar a partida.",
    allReady: "Todos os jogadores estão prontos!",
    waiting: "Aguardando outros jogadores...",
    title: "Sala de jogo",
    minPlayersRequired: "Mínimo de {{count}} jogadores necessários",
    notEnoughPlayers: "Jogadores insuficientes",
    rounds: "rodadas",
  },

  paywall: {
    title: 'Nightly Premium',
    subtitle: 'ACESSO ILIMITADO',
    tagline: 'JOGUE SEM LIMITES',
    features: {
      unlimited: 'Acesso ilimitado a todos os modos',
      weekly: 'Novas cartas toda semana',
      visuals: 'Temas visuais exclusivos',
      characters: 'Personalização de personagens',
      updates: 'Atualizações prioritárias'
    },
    plans: {
      weekly: {
        badge: 'PASS',
        title: 'Nightly Pass',
        period: 'por semana',
        description: 'Perfeito para uma noite ou fim de semana com amigos'
      },
      monthly: {
        badge: 'PARTY',
        title: 'Nightly Party',
        period: 'por mês',
        description: 'Para jogadores regulares'
      },
      annual: {
        badge: 'ALL ACCESS',
        title: 'Nightly All Access',
        period: 'por ano',
        description: 'A oferta definitiva para fãs'
      }
    },
    cta: 'Começar agora',
    footer: {
      restore: 'Restaurar compras',
      terms: 'Termos de uso'
    },
    alerts: {
      productUnavailable: {
        title: 'Produto não disponível',
        message: 'A assinatura não está disponível no momento. Por favor, tente novamente mais tarde.'
      },
      success: {
        title: 'Sucesso',
        message: 'Obrigado pela sua compra!'
      },
      pending: {
        title: 'Informação',
        message: 'Sua assinatura foi processada mas ainda não está ativa. Por favor, reinicie o aplicativo.'
      },
      error: {
        title: 'Erro',
        message: 'A compra falhou. Por favor, tente novamente ou escolha outro método de pagamento.'
      },
      restoreSuccess: {
        title: 'Sucesso',
        message: 'Sua compra foi restaurada!'
      },
      restoreError: {
        title: 'Erro',
        message: 'Erro ao restaurar as compras'
      },
      termsError: {
        title: 'Erro',
        message: 'Não foi possível abrir os termos de uso'
      }
    },
    prices: {
      weekly: '3,99',
      monthly: '7,99',
      annual: '29,99',
      currency: '€'
    },
    freeTrial: 'Grátis 3 dias',
  },
}; 