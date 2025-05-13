import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCaXTVinkd4OIMqhGAXENme4tVvDUG4CzA',
  authDomain: 'drink-dare.firebaseapp.com',
  projectId: 'drink-dare',
};

//node scripts/uploadQuestionsToFirebase.js

const questions = {
  'listen-but-don-t-judge': {
    translations: {
      fr: [
        'Si {playerName} devait confesser un péché mignon, lequel serait-ce ?',
        'Quelle est la pire habitude de {playerName} qu\'il/elle n\'admettra jamais publiquement ?',
        'Comment {playerName} réagirait face à un compliment sincère mais inattendu ?',
        'Quel secret {playerName} serait-il/elle prêt(e) à partager avec nous aujourd\'hui ?',
        'Qu\'est-ce qui rend {playerName} vraiment unique selon vous ?',
        'Quelle qualité admirez-vous le plus chez {playerName} ?',
        'Si {playerName} était un personnage de film ou de série, lequel serait-il/elle et pourquoi ?',
        'Quelle est la plus grande peur de {playerName} d\'après vous ?',
        'Comment imaginez-vous la vie de {playerName} dans 10 ans ?',
        'Quelle est la chose la plus gentille que {playerName} ait jamais faite pour quelqu\'un ?',
        'Si {playerName} pouvait changer une chose dans sa vie, quelle serait-elle selon vous ?',
        'Quelle situation fait le plus douter {playerName} de ses capacités ?',
      ],
      en: [
        'If {playerName} had to confess a cute sin, what would it be?',
        'What is {playerName}\'s worst habit that they would never publicly admit?',
        'How would {playerName} react to a sincere but unexpected compliment?',
        'What secret would {playerName} be willing to share with us today?',
        'What makes {playerName} truly unique in your opinion?',
        'What quality do you admire most about {playerName}?',
        'If {playerName} were a movie or TV series character, which one would they be and why?',
        'What do you think is {playerName}\'s biggest fear?',
        'How do you imagine {playerName}\'s life in 10 years?',
        'What is the kindest thing {playerName} has ever done for someone?',
        'If {playerName} could change one thing in their life, what do you think it would be?',
        'What situation makes {playerName} doubt their abilities the most?',
      ],
      es: [
        'Si {playerName} tuviera que confesar un pecado adorable, ¿cuál sería?',
        '¿Cuál es el peor hábito de {playerName} que nunca admitiría públicamente?',
        '¿Cómo reaccionaría {playerName} ante un cumplido sincero pero inesperado?',
        '¿Qué secreto estaría {playerName} dispuesto/a a compartir con nosotros hoy?',
        '¿Qué hace que {playerName} sea verdaderamente único/a en tu opinión?',
        '¿Qué cualidad admiras más de {playerName}?',
        'Si {playerName} fuera un personaje de película o serie, ¿cuál sería y por qué?',
        '¿Cuál crees que es el mayor miedo de {playerName}?',
        '¿Cómo imaginas la vida de {playerName} en 10 años?',
        '¿Cuál es la cosa más amable que {playerName} ha hecho por alguien?',
        'Si {playerName} pudiera cambiar una cosa en su vida, ¿qué crees que sería?',
        '¿Qué situación hace que {playerName} dude más de sus capacidades?',
      ],
      de: [
        'Wenn {playerName} eine niedliche Sünde gestehen müsste, welche wäre das?',
        'Was ist die schlimmste Angewohnheit von {playerName}, die er/sie nie öffentlich zugeben würde?',
        'Wie würde {playerName} auf ein aufrichtiges, aber unerwartetes Kompliment reagieren?',
        'Welches Geheimnis wäre {playerName} bereit, heute mit uns zu teilen?',
        'Was macht {playerName} deiner Meinung nach wirklich einzigartig?',
        'Welche Eigenschaft bewunderst du am meisten an {playerName}?',
        'Wenn {playerName} eine Film- oder Fernsehfigur wäre, welche wäre es und warum?',
        'Was ist deiner Meinung nach die größte Angst von {playerName}?',
        'Wie stellst du dir das Leben von {playerName} in 10 Jahren vor?',
        'Was ist das Netteste, was {playerName} jemals für jemanden getan hat?',
        'Wenn {playerName} eine Sache in seinem/ihrem Leben ändern könnte, was wäre es deiner Meinung nach?',
        'Welche Situation lässt {playerName} am meisten an seinen/ihren Fähigkeiten zweifeln?',
      ],
      it: [
        'Se {playerName} dovesse confessare un piccolo peccato, quale sarebbe?',
        'Qual è la peggiore abitudine di {playerName} che non ammetterebbe mai pubblicamente?',
        'Come reagirebbe {playerName} a un complimento sincero ma inaspettato?',
        'Quale segreto {playerName} sarebbe disposto/a a condividere con noi oggi?',
        'Cosa rende {playerName} veramente unico/a secondo te?',
        'Quale qualità ammiri di più in {playerName}?',
        'Se {playerName} fosse un personaggio di un film o di una serie TV, quale sarebbe e perché?',
        'Qual è secondo te la più grande paura di {playerName}?',
        'Come immagini la vita di {playerName} tra 10 anni?',
        'Qual è la cosa più gentile che {playerName} abbia mai fatto per qualcuno?',
        'Se {playerName} potesse cambiare una cosa nella sua vita, quale pensi che sarebbe?',
        'Quale situazione fa dubitare maggiormente {playerName} delle proprie capacità?',
      ],
      pt: [
        'Se {playerName} tivesse que confessar um pecado fofo, qual seria?',
        'Qual é o pior hábito de {playerName} que ele/ela nunca admitiria publicamente?',
        'Como {playerName} reagiria a um elogio sincero, mas inesperado?',
        'Que segredo {playerName} estaria disposto/a a compartilhar conosco hoje?',
        'O que torna {playerName} verdadeiramente único/a na sua opinião?',
        'Que qualidade você mais admira em {playerName}?',
        'Se {playerName} fosse um personagem de filme ou série, qual seria e por quê?',
        'Qual você acha que é o maior medo de {playerName}?',
        'Como você imagina a vida de {playerName} daqui a 10 anos?',
        'Qual é a coisa mais gentil que {playerName} já fez por alguém?',
        'Se {playerName} pudesse mudar uma coisa em sua vida, o que você acha que seria?',
        'Que situação faz {playerName} duvidar mais de suas habilidades?',
      ],
      ar: [
        'إذا كان على {playerName} الاعتراف بخطيئة لطيفة، فماذا ستكون؟',
        'ما هي أسوأ عادة لدى {playerName} لن يعترف بها أبدًا علنًا؟',
        'كيف سيتفاعل {playerName} مع مجاملة صادقة ولكنها غير متوقعة؟',
        'ما هو السر الذي سيكون {playerName} على استعداد لمشاركته معنا اليوم؟',
        'ما الذي يجعل {playerName} فريدًا حقًا في رأيك؟',
        'ما هي الصفة التي تعجبك أكثر في {playerName}؟',
        'إذا كان {playerName} شخصية في فيلم أو مسلسل تلفزيوني، فأي شخصية سيكون ولماذا؟',
        'ما هو برأيك أكبر خوف لدى {playerName}؟',
        'كيف تتخيل حياة {playerName} بعد 10 سنوات؟',
        'ما هو ألطف شيء قام به {playerName} لشخص ما؟',
        'إذا كان بإمكان {playerName} تغيير شيء واحد في حياته، ما الذي تعتقد أنه سيكون؟',
        'ما هو الموقف الذي يجعل {playerName} يشك في قدراته أكثر؟',
      ]
    }
  },
  'truth-or-dare': {
    translations: {
      fr: [
        {
          type: "action",
          text: "Danse collé-serré pendant 30 secondes… avec un coussin. Regarde quelqu'un du groupe droit dans les yeux pendant toute la danse."
        },
        {
          type: "verite",
          text: "Quelle est la dernière chose que tu as faite en secret et que personne ici ne soupçonnerait ?"
        },
      ],
      en: [
        {
          type: "dare",
          text: "Slow dance for 30 seconds... with a pillow. Look someone in the group directly in the eyes during the entire dance."
        },
        {
          type: "truth",
          text: "What's the last thing you did in secret that no one here would suspect?"
        },
      ],
      es: [
        {
          type: "reto",
          text: "Baila pegado durante 30 segundos... con un cojín. Mira a alguien del grupo directamente a los ojos durante todo el baile."
        },
        {
          type: "verdad",
          text: "¿Cuál es la última cosa que hiciste en secreto y que nadie aquí sospecharía?"
        },
      ],
      de: [
        {
          type: "pflicht",
          text: "Tanze 30 Sekunden lang eng... mit einem Kissen. Schaue jemandem aus der Gruppe während des gesamten Tanzes direkt in die Augen."
        },
        {
          type: "wahrheit",
          text: "Was ist das Letzte, was du heimlich getan hast und von dem niemand hier vermuten würde?"
        },
      ],
      it: [
        {
          type: "sfida",
          text: "Balla lentamente per 30 secondi... con un cuscino. Guarda qualcuno nel gruppo direttamente negli occhi durante tutta la danza."
        },
        {
          type: "verità",
          text: "Qual è l'ultima cosa che hai fatto in segreto e che nessuno qui sospetterebbe?"
        },
      ],
      pt: [
        {
          type: "desafio",
          text: "Dance coladinho por 30 segundos... com um travesseiro. Olhe alguém do grupo diretamente nos olhos durante toda a dança."
        },
        {
          type: "verdade",
          text: "Qual foi a última coisa que você fez em segredo e que ninguém aqui suspeitaria?"
        },
      ],
      ar: [
        {
          type: "تحدي",
          text: "ارقص ببطء لمدة 30 ثانية... مع وسادة. انظر إلى شخص في المجموعة مباشرة في العينين خلال الرقصة بأكملها."
        },
        {
          type: "حقيقة",
          text: "ما هو آخر شيء فعلته سراً ولا أحد هنا يشك فيه؟"
        },
      ]
    }
  },
  'genius-or-liar': {
    translations: {
      fr: [
        { type: "cultureG", question: "Quel est le plus long fleuve du monde ?", answer: "Le Nil" },
        { type: "cultureG", question: "Quelle est la monnaie utilisée au Royaume-Uni ?", answer: "La livre sterling" },
        { type: "cultureGHard", question: "Quel est le seul pays au monde situé sur deux continents ?", answer: "La Turquie" },
        { type: "culturePop", question: "Quel film a popularisé la réplique 'Je suis ton père' ?", answer: "Star Wars" },
      ],
      en: [
        { type: "generalKnowledge", question: "What is the longest river in the world?", answer: "The Nile" },
        { type: "generalKnowledge", question: "What currency is used in the United Kingdom?", answer: "The pound sterling" },
        { type: "hardGeneralKnowledge", question: "What is the only country in the world located on two continents?", answer: "Turkey" },
        { type: "popCulture", question: "Which movie popularized the line 'I am your father'?", answer: "Star Wars" },
      ],
      es: [
        { type: "culturaGeneral", question: "¿Cuál es el río más largo del mundo?", answer: "El Nilo" },
        { type: "culturaGeneral", question: "¿Qué moneda se utiliza en el Reino Unido?", answer: "La libra esterlina" },
        { type: "culturaGeneralDificil", question: "¿Cuál es el único país del mundo situado en dos continentes?", answer: "Turquía" },
        { type: "culturaPop", question: "¿Qué película popularizó la frase 'Yo soy tu padre'?", answer: "Star Wars" },
      ],
      de: [
        { type: "allgemeinwissen", question: "Welcher ist der längste Fluss der Welt?", answer: "Der Nil" },
        { type: "allgemeinwissen", question: "Welche Währung wird im Vereinigten Königreich verwendet?", answer: "Das Pfund Sterling" },
        { type: "schwerAllgemeinwissen", question: "Welches ist das einzige Land der Welt, das auf zwei Kontinenten liegt?", answer: "Die Türkei" },
        { type: "popkultur", question: "Welcher Film hat die Zeile 'Ich bin dein Vater' populär gemacht?", answer: "Star Wars" },
      ],
      it: [
        { type: "culturaGenerale", question: "Qual è il fiume più lungo del mondo?", answer: "Il Nilo" },
        { type: "culturaGenerale", question: "Quale valuta è utilizzata nel Regno Unito?", answer: "La sterlina" },
        { type: "culturaGeneraleDifficile", question: "Qual è l'unico paese al mondo situato su due continenti?", answer: "La Turchia" },
        { type: "culturaPop", question: "Quale film ha reso popolare la frase 'Io sono tuo padre'?", answer: "Star Wars" },
      ],
      pt: [
        { type: "culturGeral", question: "Qual é o rio mais longo do mundo?", answer: "O Nilo" },
        { type: "culturGeral", question: "Qual é a moeda utilizada no Reino Unido?", answer: "A libra esterlina" },
        { type: "culturGeralDificil", question: "Qual é o único país do mundo situado em dois continentes?", answer: "A Turquia" },
        { type: "culturaPop", question: "Que filme popularizou a frase 'Eu sou seu pai'?", answer: "Star Wars" },
      ],
      ar: [
        { type: "ثقافةعامة", question: "ما هو أطول نهر في العالم؟", answer: "النيل" },
        { type: "ثقافةعامة", question: "ما هي العملة المستخدمة في المملكة المتحدة؟", answer: "الجنيه الإسترليني" },
        { type: "ثقافةعامةصعبة", question: "ما هي الدولة الوحيدة في العالم التي تقع على قارتين؟", answer: "تركيا" },
        { type: "ثقافةشعبية", question: "أي فيلم جعل عبارة 'أنا أبوك' شهيرة؟", answer: "حرب النجوم" },
      ]
    }
  },
  'never-have-i-ever-hot': {
    translations: {
      fr: [
        {
          "text": "Je n'ai jamais envoyé de messages coquins à la mauvaise personne",
          "type": "sage"
        },
      ],
      en: [
        {
          "text": "I've never sent flirty messages to the wrong person",
          "type": "mild"
        },
      ],
      es: [
        {
          "text": "Nunca he enviado mensajes coquetos a la persona equivocada",
          "type": "suave"
        },
      ],
      de: [
        {
          "text": "Ich habe noch nie verführerische Nachrichten an die falsche Person geschickt",
          "type": "mild"
        },
      ],
      it: [
        {
          "text": "Non ho mai inviato messaggi provocanti alla persona sbagliata",
          "type": "moderato"
        },
      ],
      pt: [
        {
          "text": "Eu nunca enviei mensagens provocantes para a pessoa errada",
          "type": "suave"
        },
      ],
      ar: [
        {
          "text": "لم أرسل أبدًا رسائل مغازلة إلى الشخص الخطأ",
          "type": "خفيف"
        },
      ]
    }
  }
};

// Initialisation de Firebase et envoi des données
const uploadQuestionsToFirebase = async () => {
  try {
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Pour chaque jeu, uploadez les questions
    for (const [gameId, content] of Object.entries(questions)) {
      await setDoc(doc(db, 'gameQuestions', gameId), {
        translations: content.translations
      });
      console.log(`Questions pour ${gameId} ajoutées avec succès!`);
    }

    console.log('Upload des questions terminé avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'upload des questions:', error);
  }
};

// Exécution de la fonction
uploadQuestionsToFirebase();