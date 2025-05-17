import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCaXTVinkd4OIMqhGAXENme4tVvDUG4CzA',
  authDomain: 'drink-dare.firebaseapp.com',
  projectId: 'drink-dare',
};

const supportedLanguages = [
  { id: 'fr', name: 'Français', countryCode: 'FR', rtl: false },
  { id: 'en', name: 'English', countryCode: 'US', rtl: false },
  { id: 'es', name: 'Español', countryCode: 'ES', rtl: false },
  { id: 'de', name: 'Deutsch', countryCode: 'DE', rtl: false },
  { id: 'it', name: 'Italiano', countryCode: 'IT', rtl: false },
  { id: 'pt', name: 'Português', countryCode: 'PT', rtl: false },
  { id: 'ar', name: 'العربية', countryCode: 'SA', rtl: true },
];

// Structure des règles du jeu pour chaque langue
const gameRules = {
  "listen-but-don-t-judge": {
    translations: {
      fr: {
        rules: [
          {
            title: "Écouter sans juger",
            description: "Chaque joueur doit répondre sincèrement et respectueusement aux questions posées.",
            emoji: "👂"
          },
          {
            title: "Pas de moqueries",
            description: "Les autres joueurs ne doivent pas se moquer des réponses, quelle que soit leur nature.",
            emoji: "🚫"
          },
          {
            title: "Confidentialité",
            description: "Ce qui est dit pendant le jeu reste entre les joueurs et ne doit pas être partagé.",
            emoji: "🤐"
          },
        ]
      },
      en: {
        rules: [
          {
            title: "Listen without judging",
            description: "Each player must respond honestly and respectfully to the questions asked.",
            emoji: "👂"
          },
          {
            title: "No mockery",
            description: "Other players must not mock the answers, regardless of their nature.",
            emoji: "🚫"
          },
          {
            title: "Confidentiality",
            description: "What is said during the game stays between players and should not be shared.",
            emoji: "🤐"
          },
        ]
      },
      es: {
        rules: [
          {
            title: "Escuchar sin juzgar",
            description: "Cada jugador debe responder sincera y respetuosamente a las preguntas planteadas.",
            emoji: "👂"
          },
          {
            title: "Sin burlas",
            description: "Los demás jugadores no deben burlarse de las respuestas, sea cual sea su naturaleza.",
            emoji: "🚫"
          },
          {
            title: "Confidencialidad",
            description: "Lo que se dice durante el juego queda entre los jugadores y no debe compartirse.",
            emoji: "🤐"
          },
        ]
      },
      de: {
        rules: [
          {
            title: "Zuhören ohne zu urteilen",
            description: "Jeder Spieler muss ehrlich und respektvoll auf die gestellten Fragen antworten.",
            emoji: "👂"
          },
          {
            title: "Kein Spott",
            description: "Andere Spieler dürfen sich nicht über die Antworten lustig machen, unabhängig von ihrer Art.",
            emoji: "🚫"
          },
          {
            title: "Vertraulichkeit",
            description: "Was während des Spiels gesagt wird, bleibt unter den Spielern und sollte nicht geteilt werden.",
            emoji: "🤐"
          },
        ]
      },
      it: {
        rules: [
          {
            title: "Ascoltare senza giudicare",
            description: "Ogni giocatore deve rispondere sinceramente e rispettosamente alle domande poste.",
            emoji: "👂"
          },
          {
            title: "Nessuna derisione",
            description: "Gli altri giocatori non devono deridere le risposte, qualunque sia la loro natura.",
            emoji: "🚫"
          },
          {
            title: "Riservatezza",
            description: "Ciò che viene detto durante il gioco rimane tra i giocatori e non deve essere condiviso.",
            emoji: "🤐"
          },
        ]
      },
      pt: {
        rules: [
          {
            title: "Ouvir sem julgar",
            description: "Cada jogador deve responder de forma sincera e respeitosa às perguntas feitas.",
            emoji: "👂"
          },
          {
            title: "Sem zombarias",
            description: "Os outros jogadores não devem zombar das respostas, independentemente da sua natureza.",
            emoji: "🚫"
          },
          {
            title: "Confidencialidade",
            description: "O que é dito durante o jogo fica entre os jogadores e não deve ser compartilhado.",
            emoji: "🤐"
          },
        ]
      },
      ar: {
        rules: [
          {
            title: "الاستماع دون الحكم",
            description: "يجب على كل لاعب الإجابة بصدق واحترام على الأسئلة المطروحة.",
            emoji: "👂"
          },
          {
            title: "لا سخرية",
            description: "يجب على اللاعبين الآخرين عدم السخرية من الإجابات، بغض النظر عن طبيعتها.",
            emoji: "🚫"
          },
          {
            title: "السرية",
            description: "ما يقال أثناء اللعبة يبقى بين اللاعبين ويجب عدم مشاركته.",
            emoji: "🤐"
          },
        ]
      }
    }
  },
  "truth-or-dare": {
    translations: {
      fr: {
        rules: [
          {
            title: "Vérité ou Défi",
            description: "À son tour, chaque joueur choisit entre 'Vérité' ou 'Action'.",
            emoji: "🔄"
          },
          {
            title: "Réponse honnête",
            description: "Si 'Vérité' est choisie, le joueur doit répondre honnêtement à la question posée.",
            emoji: "✅"
          },
          {
            title: "Action obligatoire",
            description: "Si 'Action' est choisie, le joueur doit effectuer le défi demandé.",
            emoji: "🏃‍♂️"
          },
        ]
      },
      en: {
        rules: [
          {
            title: "Truth or Dare",
            description: "On their turn, each player chooses between 'Truth' or 'Dare'.",
            emoji: "🔄"
          },
          {
            title: "Honest answer",
            description: "If 'Truth' is chosen, the player must answer the question honestly.",
            emoji: "✅"
          },
          {
            title: "Mandatory action",
            description: "If 'Dare' is chosen, the player must perform the requested challenge.",
            emoji: "🏃‍♂️"
          },
        ]
      },
      es: {
        rules: [
          {
            title: "Verdad o Reto",
            description: "En su turno, cada jugador elige entre 'Verdad' o 'Reto'.",
            emoji: "🔄"
          },
          {
            title: "Respuesta honesta",
            description: "Si se elige 'Verdad', el jugador debe responder honestamente a la pregunta.",
            emoji: "✅"
          },
          {
            title: "Acción obligatoria",
            description: "Si se elige 'Reto', el jugador debe realizar el desafío solicitado.",
            emoji: "🏃‍♂️"
          },
        ]
      },
      de: {
        rules: [
          {
            title: "Wahrheit oder Pflicht",
            description: "In seinem Zug wählt jeder Spieler zwischen 'Wahrheit' oder 'Pflicht'.",
            emoji: "🔄"
          },
          {
            title: "Ehrliche Antwort",
            description: "Wenn 'Wahrheit' gewählt wird, muss der Spieler die Frage ehrlich beantworten.",
            emoji: "✅"
          },
          {
            title: "Obligatorische Aktion",
            description: "Wenn 'Pflicht' gewählt wird, muss der Spieler die geforderte Herausforderung ausführen.",
            emoji: "🏃‍♂️"
          },
        ]
      },
      it: {
        rules: [
          {
            title: "Verità o Sfida",
            description: "Al proprio turno, ogni giocatore sceglie tra 'Verità' o 'Sfida'.",
            emoji: "🔄"
          },
          {
            title: "Risposta onesta",
            description: "Se viene scelta 'Verità', il giocatore deve rispondere onestamente alla domanda.",
            emoji: "✅"
          },
          {
            title: "Azione obbligatoria",
            description: "Se viene scelta 'Sfida', il giocatore deve eseguire la sfida richiesta.",
            emoji: "🏃‍♂️"
          },
        ]
      },
      pt: {
        rules: [
          {
            title: "Verdade ou Desafio",
            description: "Na sua vez, cada jogador escolhe entre 'Verdade' ou 'Desafio'.",
            emoji: "🔄"
          },
          {
            title: "Resposta honesta",
            description: "Se 'Verdade' for escolhida, o jogador deve responder honestamente à pergunta.",
            emoji: "✅"
          },
          {
            title: "Ação obrigatória",
            description: "Se 'Desafio' for escolhido, o jogador deve realizar o desafio solicitado.",
            emoji: "🏃‍♂️"
          },
        ]
      },
      ar: {
        rules: [
          {
            title: "حقيقة أم تحدي",
            description: "في دوره، يختار كل لاعب بين 'حقيقة' أو 'تحدي'.",
            emoji: "🔄"
          },
          {
            title: "إجابة صادقة",
            description: "إذا تم اختيار 'حقيقة'، يجب على اللاعب الإجابة بصدق على السؤال.",
            emoji: "✅"
          },
          {
            title: "إجراء إلزامي",
            description: "إذا تم اختيار 'تحدي'، يجب على اللاعب تنفيذ التحدي المطلوب.",
            emoji: "🏃‍♂️"
          },
        ]
      }
    }
  },
  "genius-or-liar": {
    translations: {
      fr: {
        rules: [
          {
            title: "Question de culture générale",
            description: "Chaque joueur reçoit une question de culture générale et doit indiquer s'il connaît la réponse.",
            emoji: "🧠"
          },
          {
            title: "Mentir ou dire la vérité",
            description: "Les joueurs peuvent mentir sur leur connaissance de la réponse pour gagner des points.",
            emoji: "🤥"
          },
          {
            title: "Accusation",
            description: "Les autres joueurs peuvent accuser quelqu'un de mentir. Si l'accusation est correcte, ils gagnent des points.",
            emoji: "👉"
          },
        ]
      },
      en: {
        rules: [
          {
            title: "General knowledge question",
            description: "Each player receives a general knowledge question and must indicate if they know the answer.",
            emoji: "🧠"
          },
          {
            title: "Lie or tell the truth",
            description: "Players can lie about their knowledge of the answer to gain points.",
            emoji: "🤥"
          },
          {
            title: "Accusation",
            description: "Other players can accuse someone of lying. If the accusation is correct, they gain points.",
            emoji: "👉"
          },
        ]
      },
      es: {
        rules: [
          {
            title: "Pregunta de cultura general",
            description: "Cada jugador recibe una pregunta de cultura general y debe indicar si conoce la respuesta.",
            emoji: "🧠"
          },
          {
            title: "Mentir o decir la verdad",
            description: "Los jugadores pueden mentir sobre su conocimiento de la respuesta para ganar puntos.",
            emoji: "🤥"
          },
          {
            title: "Acusación",
            description: "Los otros jugadores pueden acusar a alguien de mentir. Si la acusación es correcta, ganan puntos.",
            emoji: "👉"
          },
        ]
      },
      de: {
        rules: [
          {
            title: "Allgemeinwissensfrage",
            description: "Jeder Spieler erhält eine Allgemeinwissensfrage und muss angeben, ob er die Antwort kennt.",
            emoji: "🧠"
          },
          {
            title: "Lügen oder die Wahrheit sagen",
            description: "Spieler können über ihr Wissen zur Antwort lügen, um Punkte zu gewinnen.",
            emoji: "🤥"
          },
          {
            title: "Anklage",
            description: "Andere Spieler können jemanden beschuldigen zu lügen. Wenn die Anklage korrekt ist, bekommen sie Punkte.",
            emoji: "👉"
          },
        ]
      },
      it: {
        rules: [
          {
            title: "Domanda di cultura generale",
            description: "Ogni giocatore riceve una domanda di cultura generale e deve indicare se conosce la risposta.",
            emoji: "🧠"
          },
          {
            title: "Mentire o dire la verità",
            description: "I giocatori possono mentire sulla loro conoscenza della risposta per ottenere punti.",
            emoji: "🤥"
          },
          {
            title: "Accusa",
            description: "Gli altri giocatori possono accusare qualcuno di mentire. Se l'accusa è corretta, guadagnano punti.",
            emoji: "👉"
          },
        ]
      },
      pt: {
        rules: [
          {
            title: "Pergunta de cultura geral",
            description: "Cada jogador recebe uma pergunta de cultura geral e deve indicar se conhece a resposta.",
            emoji: "🧠"
          },
          {
            title: "Mentir ou dizer a verdade",
            description: "Os jogadores podem mentir sobre seu conhecimento da resposta para ganhar pontos.",
            emoji: "🤥"
          },
          {
            title: "Acusação",
            description: "Os outros jogadores podem acusar alguém de mentir. Se a acusação estiver correta, eles ganham pontos.",
            emoji: "👉"
          },
        ]
      },
      ar: {
        rules: [
          {
            title: "سؤال معلومات عامة",
            description: "يتلقى كل لاعب سؤالاً عن المعلومات العامة ويجب أن يشير إلى ما إذا كان يعرف الإجابة.",
            emoji: "🧠"
          },
          {
            title: "الكذب أو قول الحقيقة",
            description: "يمكن للاعبين الكذب بشأن معرفتهم بالإجابة لكسب النقاط.",
            emoji: "🤥"
          },
          {
            title: "اتهام",
            description: "يمكن للاعبين الآخرين اتهام شخص ما بالكذب. إذا كان الاتهام صحيحًا، فإنهم يكسبون نقاطًا.",
            emoji: "👉"
          },
        ]
      }
    }
  },
  "never-have-i-ever-hot": {
    translations: {
      fr: {
        rules: [
          {
            title: "Questions osées",
            description: "Les joueurs répondent à des questions sur des expériences intimes ou embarrassantes.",
            emoji: "🔥"
          },
          {
            title: "Jamais ou déjà",
            description: "Si vous avez déjà fait ce qui est demandé, vous devez l'admettre honnêtement.",
            emoji: "👍"
          },
          {
            title: "Détails optionnels",
            description: "Les joueurs peuvent choisir de partager plus de détails ou rester discrets.",
            emoji: "🤐"
          },
        ]
      },
      en: {
        rules: [
          {
            title: "Daring questions",
            description: "Players answer questions about intimate or embarrassing experiences.",
            emoji: "🔥"
          },
          {
            title: "Never or already",
            description: "If you have already done what is asked, you must honestly admit it.",
            emoji: "👍"
          },
          {
            title: "Optional details",
            description: "Players can choose to share more details or remain discreet.",
            emoji: "🤐"
          },
        ]
      },
      es: {
        rules: [
          {
            title: "Preguntas atrevidas",
            description: "Los jugadores responden a preguntas sobre experiencias íntimas o embarazosas.",
            emoji: "🔥"
          },
          {
            title: "Nunca o ya",
            description: "Si ya has hecho lo que se pide, debes admitirlo honestamente.",
            emoji: "👍"
          },
          {
            title: "Detalles opcionales",
            description: "Los jugadores pueden elegir compartir más detalles o permanecer discretos.",
            emoji: "🤐"
          },
        ]
      },
      de: {
        rules: [
          {
            title: "Gewagte Fragen",
            description: "Spieler beantworten Fragen über intime oder peinliche Erfahrungen.",
            emoji: "🔥"
          },
          {
            title: "Noch nie oder schon",
            description: "Wenn du bereits getan hast, was gefragt wird, musst du es ehrlich zugeben.",
            emoji: "👍"
          },
          {
            title: "Optionale Details",
            description: "Spieler können wählen, ob sie mehr Details teilen oder diskret bleiben.",
            emoji: "🤐"
          },
        ]
      },
      it: {
        rules: [
          {
            title: "Domande audaci",
            description: "I giocatori rispondono a domande su esperienze intime o imbarazzanti.",
            emoji: "🔥"
          },
          {
            title: "Mai o già",
            description: "Se hai già fatto ciò che viene chiesto, devi ammetterlo onestamente.",
            emoji: "👍"
          },
          {
            title: "Dettagli opzionali",
            description: "I giocatori possono scegliere di condividere più dettagli o rimanere discreti.",
            emoji: "🤐"
          },
        ]
      },
      pt: {
        rules: [
          {
            title: "Perguntas ousadas",
            description: "Os jogadores respondem a perguntas sobre experiências íntimas ou embaraçosas.",
            emoji: "🔥"
          },
          {
            title: "Nunca ou já",
            description: "Se você já fez o que é pedido, deve admitir honestamente.",
            emoji: "👍"
          },
          {
            title: "Detalhes opcionais",
            description: "Os jogadores podem escolher compartilhar mais detalhes ou permanecer discretos.",
            emoji: "🤐"
          },
        ]
      },
      ar: {
        rules: [
          {
            title: "أسئلة جريئة",
            description: "يجيب اللاعبون على أسئلة حول تجارب حميمة أو محرجة.",
            emoji: "🔥"
          },
          {
            title: "أبدًا أو بالفعل",
            description: "إذا كنت قد فعلت بالفعل ما هو مطلوب، يجب عليك الاعتراف بصدق.",
            emoji: "👍"
          },
          {
            title: "تفاصيل اختيارية",
            description: "يمكن للاعبين اختيار مشاركة المزيد من التفاصيل أو البقاء متحفظين.",
            emoji: "🤐"
          },
        ]
      }
    }
  },
  "the-hidden-village": {
    translations: {
      fr: {
        rules: [
          {
            title: "But du jeu",
            description: "Démasquez le traître caché parmi les villageois avant qu'il ne vous élimine tous.",
            emoji: "🕵️"
          },
          {
            title: "Nuit",
            description: "Chaque nuit, le traître élimine un joueur. Le protecteur peut sauver quelqu'un. Le médium peut sonder un joueur.",
            emoji: "🌙"
          },
          {
            title: "Jour",
            description: "Les survivants débattent et votent pour éliminer un suspect. Attention au menteur qui sème le doute !",
            emoji: "☀️"
          },
          {
            title: "Fin de partie",
            description: "Le traître gagne s'il reste seul. Le village gagne s'il découvre le traître.",
            emoji: "🏆"
          }
        ]
      },
      en: {
        rules: [
          {
            title: "Goal",
            description: "Unmask the hidden traitor among the villagers before they eliminate everyone.",
            emoji: "🕵️"
          },
          {
            title: "Night",
            description: "Each night, the traitor eliminates a player. The protector can save someone. The medium can investigate a player.",
            emoji: "🌙"
          },
          {
            title: "Day",
            description: "Survivors debate and vote to eliminate a suspect. Beware of the liar who sows doubt!",
            emoji: "☀️"
          },
          {
            title: "End of game",
            description: "The traitor wins if they are the last one standing. The village wins if they find the traitor.",
            emoji: "🏆"
          }
        ]
      },
      es: {
        rules: [
          {
            title: "Objetivo",
            description: "Descubre al traidor oculto entre los aldeanos antes de que los elimine a todos.",
            emoji: "🕵️"
          },
          {
            title: "Noche",
            description: "Cada noche, el traidor elimina a un jugador. El protector puede salvar a alguien. El médium puede investigar a un jugador.",
            emoji: "🌙"
          },
          {
            title: "Día",
            description: "Los supervivientes debaten y votan para eliminar a un sospechoso. ¡Cuidado con el mentiroso que siembra dudas!",
            emoji: "☀️"
          },
          {
            title: "Fin del juego",
            description: "El traidor gana si queda solo. El pueblo gana si descubre al traidor.",
            emoji: "🏆"
          }
        ]
      },
      de: {
        rules: [
          {
            title: "Ziel",
            description: "Enttarne den versteckten Verräter unter den Dorfbewohnern, bevor er alle eliminiert.",
            emoji: "🕵️"
          },
          {
            title: "Nacht",
            description: "Jede Nacht eliminiert der Verräter einen Spieler. Der Beschützer kann jemanden retten. Das Medium kann einen Spieler untersuchen.",
            emoji: "🌙"
          },
          {
            title: "Tag",
            description: "Die Überlebenden diskutieren und stimmen ab, um einen Verdächtigen zu eliminieren. Vorsicht vor dem Lügner, der Zweifel sät!",
            emoji: "☀️"
          },
          {
            title: "Spielende",
            description: "Der Verräter gewinnt, wenn er allein übrig bleibt. Das Dorf gewinnt, wenn es den Verräter enttarnt.",
            emoji: "🏆"
          }
        ]
      },
      it: {
        rules: [
          {
            title: "Obiettivo",
            description: "Smaschera il traditore nascosto tra i paesani prima che elimini tutti.",
            emoji: "🕵️"
          },
          {
            title: "Notte",
            description: "Ogni notte il traditore elimina un giocatore. Il protettore può salvare qualcuno. Il medium può indagare su un giocatore.",
            emoji: "🌙"
          },
          {
            title: "Giorno",
            description: "I sopravvissuti discutono e votano per eliminare un sospetto. Attenzione al bugiardo che semina dubbi!",
            emoji: "☀️"
          },
          {
            title: "Fine partita",
            description: "Il traditore vince se resta solo. Il villaggio vince se scopre il traditore.",
            emoji: "🏆"
          }
        ]
      },
      pt: {
        rules: [
          {
            title: "Objetivo",
            description: "Desmascare o traidor escondido entre os aldeões antes que ele elimine todos.",
            emoji: "🕵️"
          },
          {
            title: "Noite",
            description: "A cada noite, o traidor elimina um jogador. O protetor pode salvar alguém. O médium pode investigar um jogador.",
            emoji: "🌙"
          },
          {
            title: "Dia",
            description: "Os sobreviventes debatem e votam para eliminar um suspeito. Cuidado com o mentiroso que espalha dúvidas!",
            emoji: "☀️"
          },
          {
            title: "Fim de jogo",
            description: "O traidor vence se restar sozinho. A vila vence se descobrir o traidor.",
            emoji: "🏆"
          }
        ]
      },
      ar: {
        rules: [
          {
            title: "الهدف",
            description: "اكشف الخائن المخفي بين القرويين قبل أن يقضي على الجميع.",
            emoji: "🕵️"
          },
          {
            title: "الليل",
            description: "كل ليلة، يقضي الخائن على لاعب. يمكن للحامي إنقاذ شخص ما. يمكن للوسيط التحقيق مع لاعب.",
            emoji: "🌙"
          },
          {
            title: "النهار",
            description: "يناقش الناجون ويصوتون لإقصاء مشتبه به. احذر من الكاذب الذي يزرع الشك!",
            emoji: "☀️"
          },
          {
            title: "نهاية اللعبة",
            description: "يفوز الخائن إذا بقي وحده. يفوز القرويون إذا اكتشفوا الخائن.",
            emoji: "🏆"
          }
        ]
      }
    }
  }
};

// Initialise Firebase et insère les règles du jeu dans Firestore
const initGameRules = async () => {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Sauvegarde la configuration des langues
    await setDoc(doc(db, 'config', 'languages'), {
      supportedLanguages
    });

    // Sauvegarde les règles du jeu pour chaque mode
    for (const [gameId, content] of Object.entries(gameRules)) {
      await setDoc(doc(db, 'rules', gameId), content);
      console.log(`Règles du jeu pour ${gameId} ajoutées avec succès!`);
    }

    console.log('Initialisation des règles terminée!');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des règles:', error);
  }
};

// Lance l'initialisation
initGameRules(); 