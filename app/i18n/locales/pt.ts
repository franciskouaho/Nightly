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
      selectCharacter: 'Escolha seu personagem',
      characterDescription: 'Selecione um personagem que te represente para a partida',
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
    contact: 'Contato',
    contactEmail: 'Envie-nos um email para support@cosmicquest.com',
    buyAssetsTitle: 'Comprar assets',
    insufficientPoints: 'Pontos insuficientes',
    insufficientPointsMessage: 'Você não tem pontos suficientes para desbloquear este asset.',
    success: 'Sucesso',
    assetUnlocked: '{{asset}} foi desbloqueado com sucesso!',
    unlockError: 'Ocorreu um erro ao desbloquear o asset.',
    restorePurchases: 'Restaurar compras',
    restoring: 'Restaurando...',
    restoreSuccess: 'Sucesso',
    restoreSuccessMessage: 'Suas compras foram restauradas com sucesso',
    restoreError: 'Ocorreu um erro ao restaurar as compras',
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
        tags: {
          free: "GRÁTIS"
        }
      },
      "truth-or-dare": {
        name: "VERDADE OU DESAFIO",
        description: "O clássico revisitado com desafios exclusivos.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "never-have-i-ever-hot": {
        name: "NUNCA NUNCA 🔞",
        description: "Perguntas picantes e inapropriadas... Pronto para confessar?",
        tags: {
          premium: "PREMIUM"
        }
      },
      "genius-or-liar": {
        name: "GÊNIO OU MENTIROSO",
        description: "Um modo divertido onde você deve provar seus conhecimentos ou enfrentar as consequências.",
        tags: {
          premium: "PREMIUM"
        }
      },
      "the-hidden-village": {
        name: "A VILA OCULTA",
        description: "Um jogo de blefe, estratégia e discussões... para quem ama acusar os amigos 😈",
        tags: {
          premium: "PREMIUM"
        }
      },
      "trap-answer": {
        name: "Resposta Armadilha",
        description: "Um quiz onde uma resposta errada faz você perder pontos... Você conseguirá evitar as armadilhas?",
        tags: {
          free: "GRÁTIS"
        }
      },
      'avatar-dragon': {
        name: 'Dragão',
        description: 'Um majestoso dragão que cospe fogo'
      },
      'avatar-ourse': {
        name: 'Urso',
        description: 'Um urso majestoso'
      },
      'avatar-phoenix': {
        name: 'Fênix',
      },
      "two-letters-one-word": {
        name: "2 Letras 1 Palavra",
        description: "Encontre uma palavra que contenha as duas letras dadas e corresponda ao tema.",
        tags: {
          free: "GRÁTIS",
          "new": "NOVO",
          "premium": "PREMIUM"
        },
        score: "Pontuação: {{score}}",
        theme: "Tema: {{theme}}",
        inputPlaceholder: "Digite sua palavra...",
        verifyButton: "Verificar",
        verifyingButton: "Verificando...",
        validWord: "Palavra válida!",
        validWordMessage: "Você encontrou uma palavra válida!",
        invalidWord: "Palavra inválida",
        invalidWordMessage: "Esta palavra não corresponde aos critérios solicitados.",
        noWordError: "Por favor, digite uma palavra",
        error: "Ocorreu um erro",
        howToPlay: "Encontre uma palavra que contenha as duas letras dadas e corresponda ao tema escolhido.",
        // Traduções de temas
        "theme.marque": "uma marca",
        "theme.ville": "uma cidade",
        "theme.prenom": "um nome",
        "theme.pays": "um país",
        "theme.animal": "um animal",
        "theme.metier": "um emprego",
        "theme.sport": "um esporte",
        "theme.fruit": "uma fruta",
        "theme.legume": "um vegetal",
        "theme.objet": "um objeto",
        "exampleWord": "Exemplo: {{word}}",
        "nextButton": "Próxima rodada",
        "noExampleAvailable": "Nenhum exemplo disponível",
      },
      'word-guessing': {
        name: 'ADIVINHE A PALAVRA',
        description: 'Faça os outros adivinharem uma palavra sem usar palavras proibidas... Um jogo de palavras e velocidade!',
        tags: {
          free: 'GRÁTIS'
        }
      },
    },
    round: "Rodada",
  },

  // Common translations
  common: {
    ok: 'OK',
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
    darkMode: 'Modo Escuro',
    lightMode: 'Modo Claro',
    system: 'Sistema',
    buyAssets: {
      title: 'Comprar assets',
      available: 'Assets disponíveis',
      availableAssetsTitle: 'Assets disponíveis',
      owned: 'Possuídos',
      cost: 'Custo',
      points: 'pontos',
      buy: 'Comprar',
      confirm: 'Confirmar compra',
      cancel: 'Cancelar',
      success: 'Asset comprado com sucesso!',
      error: 'Erro durante a compra',
      insufficientPoints: 'Pontos insuficientes',
      equip: 'Equipar',
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
    gameOver: 'Fim do jogo',
    winner: 'Vencedor',
    draw: 'Empate',
    error: "Erro",
    unknownMode: "Modo de jogo desconhecido: {{mode}}",
    notFound: "Nenhum documento de jogo encontrado para o ID: {{id}}",
    noMode: "Nenhum modo de jogo encontrado no documento de jogos.",
    loading: "Carregando...",
    results: {
      title: "Resultados Finais",
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
        title: "Classificação do Pódio",
      },
      rank: "Classificação",
      score: "Pontuação",
      player: "Jogador",
      "two-letters-one-word": {
        title: "Fim do jogo!",
        subtitle: "Obrigado por jogar 2 Letras 1 Palavra!",
        totalWords: "Palavras encontradas",
        bestWord: "Melhor palavra",
        averageScore: "Pontuação média",
        timePlayed: "Tempo jogado",
        newHighScore: "Novo recorde!",
        shareResults: "Compartilhar resultados",
        playAgain: "Jogar novamente"
      },
      "word-guessing": {
        title: "Adivinhe a Palavra",
        timer: "Tempo restante",
        score: "Pontuação",
        forbiddenWords: "Palavras proibidas",
        start: "Iniciar",
        next: "Próxima palavra",
        found: "Palavra encontrada!",
        forbidden: "Palavra proibida usada!",
        timeUp: "Tempo esgotado!",
        finalScore: "Pontuação final",
        playAgain: "Jogar novamente"
      }
    },
    player: 'o jogador',
    round: 'Rodada {{current}}/{{total}}',
    truthOrDare: {
      title: 'Verdade ou Desafio',
      choice: 'Escolha',
      question: 'Pergunta',
      action: 'Desafio',
      submitChoice: 'Enviar escolha',
      submitAnswer: 'Enviar resposta',
      next: 'Próximo',
      endGame: 'Fim do jogo',
      endTitle: 'Parabéns a todos!',
      endSubtitle: 'Você terminou o jogo Verdade ou Desafio',
      home: 'Voltar para o início',
      readAloud: 'Ler em voz alta',
      targetChooses: '{{name}} escolhe entre Verdade ou Desafio!',
      targetAnswers: '{{name}} responde a verdade!',
      targetDoesDare: '{{name}} faz o desafio!',
      error: 'Ocorreu um erro',
      noQuestions: 'Nenhuma pergunta disponível',
      errorNext: 'Ocorreu um erro ao avançar para a próxima rodada',
      naughtyRanking: 'Ranking mais atrevido'
    },
    listenButDontJudge: {
      title: 'Ouça mas não Julgue',
      question: 'Pergunta',
      next: 'Próximo',
      endGame: 'Fim do jogo',
      endTitle: 'Parabéns a todos!',
      endSubtitle: 'Você terminou o jogo Ouça mas não Julgue',
      home: 'Voltar para o início',
      readAloud: 'Ler em voz alta',
      targetAnswers: '{{name}} responde!',
      error: 'Ocorreu um erro',
      noQuestions: 'Nenhuma pergunta disponível',
      errorNext: 'Ocorreu um erro ao avançar para a próxima rodada'
    },
    neverHaveIEverHot: {
      never: "Nunca nunca",
      ever: "Eu já",
      waiting: "Aguardando a escolha do jogador alvo...",
      prepare: "Prepare-se para responder!",
      submit: "Enviar",
      next: "Próxima rodada",
      endGame: "Fim do jogo",
      errorSubmit: "Não foi possível enviar a resposta",
      endTitle: "Parabéns a todos!",
      endSubtitle: "Você terminou o jogo Nunca Nunca 🔞",
      home: "Voltar para o início",
      readAloud: "Ler a pergunta em voz alta",
      targetReads: "{{name}} lê a pergunta",
      noQuestions: "Nenhuma pergunta disponível",
      errorNext: "Ocorreu um erro ao avançar para a próxima rodada",
      naughtyRanking: "Ranking mais atrevido"
    },
    geniusOrLiar: {
      title: 'Gênio ou Mentiroso',
      question: 'Pergunta',
      know: 'Eu sei',
      dontKnow: 'Não sei',
      accuse: 'Acusar',
      submitAnswer: 'Enviar resposta',
      next: 'Próxima rodada',
      endGame: 'Fim do jogo',
      endTitle: 'Parabéns a todos!',
      endSubtitle: 'Você terminou o jogo Gênio ou Mentiroso',
      home: 'Voltar para o início',
      readAloud: 'Ler em voz alta',
      targetAnswers: '{{name}} responde!',
      error: 'Ocorreu um erro',
      noQuestions: 'Nenhuma pergunta disponível',
      errorNext: 'Ocorreu um erro ao avançar para a próxima rodada',
      errorSubmit: 'Erro ao enviar sua resposta ou voto.'
    },
    theHiddenVillage: {
      title: 'A VILA OCULTA',
      subtitle: 'Um jogo de blefe e estratégia',
      description: 'Um jogo de blefe, estratégia e discussões... para quem ama acusar os amigos 😈',
      principles: {
        title: '🌓 PRINCÍPIO DO JOGO',
        list: [
          'A cada noite, um jogador "traidor" elimina outro jogador.',
          'A cada dia, os sobreviventes discutem e votam para eliminar quem eles suspeitam.',
          'Objetivo: desmascarar o culpado antes que ele elimine todos.'
        ]
      },
      roles: {
        title: '🎭 FUNÇÕES',
        traitor: {
          name: 'O Traidor',
          description: 'Elimina a cada noite. Deve sobreviver.'
        },
        medium: {
          name: 'O Médium',
          description: 'Adivinha se um jogador é um aldeão ou traidor.'
        },
        protector: {
          name: 'O Protetor',
          description: 'Protege um jogador a cada noite.'
        },
        villager: {
          name: 'O Aldeão',
          description: 'Nenhum poder. Vota sabiamente.'
        },
        liar: {
          name: 'O Mentiroso',
          description: 'Papel divertido. Semeia a dúvida.'
        }
      },
      objectives: {
        title: '🎯 OBJETIVOS',
        traitor: 'Traidor: eliminar todos os outros sem ser pego.',
        village: 'Aldeia: descobrir o traidor antes que ele vença.'
      }
    },
    trapAnswer: {
      title: "Resposta Armadilha",
      question: "Pergunta",
      next: "Próxima",
      endGame: "Fim do jogo",
      endTitle: "Parabéns a todos!",
      endSubtitle: "Você terminou o jogo Resposta Armadilha",
      home: "Início",
      readAloud: "Ler em voz alta",
      targetAnswers: "{{name}} responde!",
      error: "Ocorreu um erro",
      noQuestions: "Nenhuma pergunta disponível",
      errorNext: "Ocorreu um erro ao avançar para a próxima rodada",
      submit: "Enviar",
      choices: "Escolhas",
      correctAnswer: "Resposta correta!",
      wrongAnswer: "Resposta errada.",
      correct: "Correto",
      wrong: "Errado",
      waitingForPlayers: "Aguardando outros jogadores...",
      playerAnswered: "{{count}} jogador respondeu",
      playerAnswered_plural: "{{count}} jogadores responderam",
      yourScore: "Sua pontuação",
      playerScores: "Pontuações dos jogadores"
    },
    twoLettersOneWord: {
      score: "Pontuação: {{score}}",
      theme: "Tema: {{theme}}",
      inputPlaceholder: "Digite sua palavra...",
      verifyButton: "Verificar",
      verifyingButton: "Verificando...",
      validWord: "Palavra válida!",
      validWordMessage: "Você encontrou uma palavra válida!",
      invalidWord: "Palavra inválida",
      invalidWordMessage: "Esta palavra não corresponde aos critérios solicitados.",
      noWordError: "Por favor, digite uma palavra",
      error: "Ocorreu um erro",
      howToPlay: "Encontre uma palavra que contenha as duas letras dadas e corresponda ao tema escolhido.",
      "theme.marque": "uma marca",
      "theme.ville": "uma cidade",
      "theme.prenom": "um nome",
      "theme.pays": "um país",
      "theme.animal": "um animal",
      "theme.metier": "um emprego",
      "theme.sport": "um esporte",
      "theme.fruit": "uma fruta",
      "theme.legume": "um vegetal",
      "theme.objet": "um objeto",
      "exampleWord": "Exemplo: {{word}}",
      "nextButton": "Próxima rodada",
      "noExampleAvailable": "Nenhum exemplo disponível",
    },
    word_guessing: {
      targetPlayer: 'Faça {{player}} adivinhar',
      forbiddenWords: 'Palavras proibidas',
      found: 'Palavra encontrada!',
      forbidden: 'Palavra proibida!',
      nextWord: 'Próxima palavra',
      categories: {
        lieux: 'Lugares',
        aliments: 'Alimentos',
        transport: 'Transporte',
        technologie: 'Tecnologia',
        sports: 'Esportes',
        loisirs: 'Hobbies',
        nature: 'Natureza',
        objets: 'Objetos',
        animaux: 'Animais',
      },
      guesserInstructions: 'Seu amigo está tentando fazer você adivinhar uma palavra!',
      guesserInfo: 'Ouça com atenção e tente encontrar a palavra sem que eles usem as palavras proibidas.',
    },
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

  // Paywall
  paywall: {
    title: 'Nightly Premium',
    subtitle: 'ACESSO ILIMITADO',
    tagline: 'JOGUE SEM LIMITES',
    features: {
      unlimited: 'Acesso ilimitado a todos os modos',
      weekly: 'Novas cartas todas as semanas',
      visuals: 'Temas visuais exclusivos',
      characters: 'Personalização de personagens',
      updates: 'Atualizações prioritárias'
    },
    plans: {
      weekly: {
        badge: 'PASS',
        title: 'Nightly Pass',
        period: 'por semana',
        description: 'Perfeito para uma noite ou um fim de semana com amigos'
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
      terms: 'Termos de Uso'
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
        message: 'Sua assinatura foi processada, mas ainda não está ativa. Por favor, reinicie o aplicativo.'
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
        message: 'A restauração de compras falhou'
      },
      termsError: {
        title: 'Erro',
        message: 'Não foi possível abrir os Termos de Uso'
      }
    },
    prices: {
      weekly: '3,99',
      monthly: '7,99',
      annual: '29,99',
      currency: '€'
    },
    freeTrial: 'Teste gratuito de 3 dias',
  },

  inviteModal: {
    title: "Convidar amigos",
    roomCode: "Código da sala",
    instruction: "Escaneie o código QR ou compartilhe este código para convidar seus amigos para a sala.",
    shareButton: "Compartilhar"
  },

  // Assets e Avatares
  assets: {
    avatars: {
      'avatar-panda': {
        name: 'Panda',
        description: 'Um adorável panda para o seu perfil'
      },
      'avatar-chat-rare': {
        name: 'Gato Misterioso',
        description: 'Um gato misterioso com olhos brilhantes'
      },
      'avatar-chat-rare-2': {
        name: 'Gato Raro',
        description: 'Um gato raro com um design único'
      },
      'avatar-crocodile': {
        name: 'Crocodilo',
        description: 'Um impressionante crocodilo'
      },
      'avatar-hibou': {
        name: 'Coruja',
        description: 'Uma sábia e misteriosa coruja'
      },
      'avatar-dragon': {
        name: 'Dragão',
        description: 'Um majestoso dragão cuspidor de fogo'
      },
      'avatar-ourse': {
        name: 'Urso',
        description: 'Uma majestosa ursa'
      },
      'avatar-loup-rare': {
        name: 'Lobo Raro',
        description: 'Um lobo raro e misterioso'
      },
      'avatar-dragon-rare': {
        name: 'Dragão Lendário',
        description: 'Um majestoso dragão cuspidor de fogo'
      },
      'avatar-licorne': {
        name: 'Unicórnio',
        description: 'Um lendário unicórnio'
      },
      'avatar-phoenix': {
        name: 'Fênix',
        description: 'Uma lendária fênix que renasce das suas cinzas'
      }
    }
  },
}; 