import { initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpkwiOl19wTGqD4YO0HEcTuqWyqaXnU5w",
  authDomain: "nightly-efa29.firebaseapp.com",
  projectId: "nightly-efa29",
};

const supportedLanguages = [
  { id: "fr", name: "Français", countryCode: "FR", rtl: false },
  { id: "en", name: "English", countryCode: "US", rtl: false },
  { id: "es", name: "Español", countryCode: "ES", rtl: false },
  { id: "de", name: "Deutsch", countryCode: "DE", rtl: false },
  { id: "it", name: "Italiano", countryCode: "IT", rtl: false },
  { id: "pt", name: "Português", countryCode: "PT", rtl: false },
  { id: "ar", name: "العربية", countryCode: "SA", rtl: true },
];

// Structure des règles du jeu pour chaque langue
const gameRules = {
  "listen-but-don-t-judge": {
    translations: {
      fr: {
        rules: [
          {
            title: "Écouter sans juger",
            description:
              "Chaque joueur doit répondre sincèrement et respectueusement aux questions posées.",
            emoji: "👂",
          },
          {
            title: "Pas de moqueries",
            description:
              "Les autres joueurs ne doivent pas se moquer des réponses, quelle que soit leur nature.",
            emoji: "🚫",
          },
          {
            title: "Confidentialité",
            description:
              "Ce qui est dit pendant le jeu reste entre les joueurs et ne doit pas être partagé.",
            emoji: "🤐",
          },
        ],
      },
      en: {
        rules: [
          {
            title: "Listen without judging",
            description:
              "Each player must respond honestly and respectfully to the questions asked.",
            emoji: "👂",
          },
          {
            title: "No mockery",
            description:
              "Other players must not mock the answers, regardless of their nature.",
            emoji: "🚫",
          },
          {
            title: "Confidentiality",
            description:
              "What is said during the game stays between players and should not be shared.",
            emoji: "🤐",
          },
        ],
      },
      es: {
        rules: [
          {
            title: "Escuchar sin juzgar",
            description:
              "Cada jugador debe responder sincera y respetuosamente a las preguntas planteadas.",
            emoji: "👂",
          },
          {
            title: "Sin burlas",
            description:
              "Los demás jugadores no deben burlarse de las respuestas, sea cual sea su naturaleza.",
            emoji: "🚫",
          },
          {
            title: "Confidencialidad",
            description:
              "Lo que se dice durante el juego queda entre los jugadores y no debe compartirse.",
            emoji: "🤐",
          },
        ],
      },
      de: {
        rules: [
          {
            title: "Zuhören ohne zu urteilen",
            description:
              "Jeder Spieler muss ehrlich und respektvoll auf die gestellten Fragen antworten.",
            emoji: "👂",
          },
          {
            title: "Kein Spott",
            description:
              "Andere Spieler dürfen sich nicht über die Antworten lustig machen, unabhängig von ihrer Art.",
            emoji: "🚫",
          },
          {
            title: "Vertraulichkeit",
            description:
              "Was während des Spiels gesagt wird, bleibt unter den Spielern und sollte nicht geteilt werden.",
            emoji: "🤐",
          },
        ],
      },
      it: {
        rules: [
          {
            title: "Ascoltare senza giudicare",
            description:
              "Ogni giocatore deve rispondere sinceramente e rispettosamente alle domande poste.",
            emoji: "👂",
          },
          {
            title: "Nessuna derisione",
            description:
              "Gli altri giocatori non devono deridere le risposte, qualunque sia la loro natura.",
            emoji: "🚫",
          },
          {
            title: "Riservatezza",
            description:
              "Ciò che viene detto durante il gioco rimane tra i giocatori e non deve essere condiviso.",
            emoji: "🤐",
          },
        ],
      },
      pt: {
        rules: [
          {
            title: "Ouvir sem julgar",
            description:
              "Cada jogador deve responder de forma sincera e respeitosa às perguntas feitas.",
            emoji: "👂",
          },
          {
            title: "Sem zombarias",
            description:
              "Os outros jogadores não devem zombar das respostas, independentemente da sua natureza.",
            emoji: "🚫",
          },
          {
            title: "Confidencialidade",
            description:
              "O que é dito durante o jogo fica entre os jogadores e não deve ser compartilhado.",
            emoji: "🤐",
          },
        ],
      },
      ar: {
        rules: [
          {
            title: "الاستماع دون الحكم",
            description:
              "يجب على كل لاعب الإجابة بصدق واحترام على الأسئلة المطروحة.",
            emoji: "👂",
          },
          {
            title: "لا سخرية",
            description:
              "يجب على اللاعبين الآخرين عدم السخرية من الإجابات، بغض النظر عن طبيعتها.",
            emoji: "🚫",
          },
          {
            title: "السرية",
            description:
              "ما يقال أثناء اللعبة يبقى بين اللاعبين ويجب عدم مشاركته.",
            emoji: "🤐",
          },
        ],
      },
    },
  },
  "truth-or-dare": {
    translations: {
      fr: {
        rules: [
          {
            title: "Vérité ou Défi",
            description:
              "À son tour, chaque joueur choisit entre 'Vérité' ou 'Action'.",
            emoji: "🔄",
          },
          {
            title: "Réponse honnête",
            description:
              "Si 'Vérité' est choisie, le joueur doit répondre honnêtement à la question posée.",
            emoji: "✅",
          },
          {
            title: "Action obligatoire",
            description:
              "Si 'Action' est choisie, le joueur doit effectuer le défi demandé.",
            emoji: "🏃‍♂️",
          },
        ],
      },
      en: {
        rules: [
          {
            title: "Truth or Dare",
            description:
              "On their turn, each player chooses between 'Truth' or 'Dare'.",
            emoji: "🔄",
          },
          {
            title: "Honest answer",
            description:
              "If 'Truth' is chosen, the player must answer the question honestly.",
            emoji: "✅",
          },
          {
            title: "Mandatory action",
            description:
              "If 'Dare' is chosen, the player must perform the requested challenge.",
            emoji: "🏃‍♂️",
          },
        ],
      },
      es: {
        rules: [
          {
            title: "Verdad o Reto",
            description:
              "En su turno, cada jugador elige entre 'Verdad' o 'Reto'.",
            emoji: "🔄",
          },
          {
            title: "Respuesta honesta",
            description:
              "Si se elige 'Verdad', el jugador debe responder honestamente a la pregunta.",
            emoji: "✅",
          },
          {
            title: "Acción obligatoria",
            description:
              "Si se elige 'Reto', el jugador debe realizar el desafío solicitado.",
            emoji: "🏃‍♂️",
          },
        ],
      },
      de: {
        rules: [
          {
            title: "Wahrheit oder Pflicht",
            description:
              "In seinem Zug wählt jeder Spieler zwischen 'Wahrheit' oder 'Pflicht'.",
            emoji: "🔄",
          },
          {
            title: "Ehrliche Antwort",
            description:
              "Wenn 'Wahrheit' gewählt wird, muss der Spieler die Frage ehrlich beantworten.",
            emoji: "✅",
          },
          {
            title: "Obligatorische Aktion",
            description:
              "Wenn 'Pflicht' gewählt wird, muss der Spieler die geforderte Herausforderung ausführen.",
            emoji: "🏃‍♂️",
          },
        ],
      },
      it: {
        rules: [
          {
            title: "Verità o Sfida",
            description:
              "Al proprio turno, ogni giocatore sceglie tra 'Verità' o 'Sfida'.",
            emoji: "🔄",
          },
          {
            title: "Risposta onesta",
            description:
              "Se viene scelta 'Verità', il giocatore deve rispondere onestamente alla domanda.",
            emoji: "✅",
          },
          {
            title: "Azione obbligatoria",
            description:
              "Se viene scelta 'Sfida', il giocatore deve eseguire la sfida richiesta.",
            emoji: "🏃‍♂️",
          },
        ],
      },
      pt: {
        rules: [
          {
            title: "Verdade ou Desafio",
            description:
              "Na sua vez, cada jogador escolhe entre 'Verdade' ou 'Desafio'.",
            emoji: "🔄",
          },
          {
            title: "Resposta honesta",
            description:
              "Se 'Verdade' for escolhida, o jogador deve responder honestamente à pergunta.",
            emoji: "✅",
          },
          {
            title: "Ação obrigatória",
            description:
              "Se 'Desafio' for escolhido, o jogador deve realizar o desafio solicitado.",
            emoji: "🏃‍♂️",
          },
        ],
      },
      ar: {
        rules: [
          {
            title: "حقيقة أم تحدي",
            description: "في دوره، يختار كل لاعب بين 'حقيقة' أو 'تحدي'.",
            emoji: "🔄",
          },
          {
            title: "إجابة صادقة",
            description:
              "إذا تم اختيار 'حقيقة'، يجب على اللاعب الإجابة بصدق على السؤال.",
            emoji: "✅",
          },
          {
            title: "إجراء إلزامي",
            description:
              "إذا تم اختيار 'تحدي'، يجب على اللاعب تنفيذ التحدي المطلوب.",
            emoji: "🏃‍♂️",
          },
        ],
      },
    },
  },
  "genius-or-liar": {
    translations: {
      fr: {
        rules: [
          {
            title: "Question de culture générale",
            description:
              "Chaque joueur reçoit une question de culture générale et doit indiquer s'il connaît la réponse.",
            emoji: "🧠",
          },
          {
            title: "Points pour les réponses",
            description:
              "Bonne réponse : +2 points. Mauvaise réponse : -1 point. Ne pas savoir : 0 point.",
            emoji: "📊",
          },
          {
            title: "Points pour les accusations",
            description:
              "Accusation juste : +1 point. Accusation fausse : -1 point. Accusé à tort : +1 point bonus.",
            emoji: "🎯",
          },
          {
            title: "Stratégie",
            description:
              "Choisissez judicieusement quand mentir et quand accuser pour maximiser vos points.",
            emoji: "🤔",
          },
        ],
      },
      en: {
        rules: [
          {
            title: "General knowledge question",
            description:
              "Each player receives a general knowledge question and must indicate if they know the answer.",
            emoji: "🧠",
          },
          {
            title: "Points for answers",
            description:
              "Correct answer: +2 points. Wrong answer: -1 point. Don't know: 0 points.",
            emoji: "📊",
          },
          {
            title: "Points for accusations",
            description:
              "Correct accusation: +1 point. Wrong accusation: -1 point. Wrongly accused: +1 bonus point.",
            emoji: "🎯",
          },
          {
            title: "Strategy",
            description:
              "Choose wisely when to lie and when to accuse to maximize your points.",
            emoji: "🤔",
          },
        ],
      },
      es: {
        rules: [
          {
            title: "Pregunta de cultura general",
            description:
              "Cada jugador recibe una pregunta de cultura general y debe indicar si conoce la respuesta.",
            emoji: "🧠",
          },
          {
            title: "Puntos por respuestas",
            description:
              "Respuesta correcta: +2 puntos. Respuesta incorrecta: -1 punto. No saber: 0 puntos.",
            emoji: "📊",
          },
          {
            title: "Puntos por acusaciones",
            description:
              "Acusación correcta: +1 punto. Acusación incorrecta: -1 punto. Acusado injustamente: +1 punto extra.",
            emoji: "🎯",
          },
          {
            title: "Estrategia",
            description:
              "Elige sabiamente cuándo mentir y cuándo acusar para maximizar tus puntos.",
            emoji: "🤔",
          },
        ],
      },
      de: {
        rules: [
          {
            title: "Allgemeinwissensfrage",
            description:
              "Jeder Spieler erhält eine Allgemeinwissensfrage und muss angeben, ob er die Antwort kennt.",
            emoji: "🧠",
          },
          {
            title: "Punkte für Antworten",
            description:
              "Richtige Antwort: +2 Punkte. Falsche Antwort: -1 Punkt. Nicht wissen: 0 Punkte.",
            emoji: "📊",
          },
          {
            title: "Punkte für Anklagen",
            description:
              "Richtige Anklage: +1 Punkt. Falsche Anklage: -1 Punkt. Falsch beschuldigt: +1 Bonuspunkt.",
            emoji: "🎯",
          },
          {
            title: "Strategie",
            description:
              "Wähle weise, wann du lügst und wann du anklagst, um deine Punkte zu maximieren.",
            emoji: "🤔",
          },
        ],
      },
      it: {
        rules: [
          {
            title: "Domanda di cultura generale",
            description:
              "Ogni giocatore riceve una domanda di cultura generale e deve indicare se conosce la risposta.",
            emoji: "🧠",
          },
          {
            title: "Punti per le risposte",
            description:
              "Risposta corretta: +2 punti. Risposta sbagliata: -1 punto. Non sapere: 0 punti.",
            emoji: "📊",
          },
          {
            title: "Punti per le accuse",
            description:
              "Accusa corretta: +1 punto. Accusa sbagliata: -1 punto. Accusato ingiustamente: +1 punto bonus.",
            emoji: "🎯",
          },
          {
            title: "Strategia",
            description:
              "Scegli saggiamente quando mentire e quando accusare per massimizzare i tuoi punti.",
            emoji: "🤔",
          },
        ],
      },
      pt: {
        rules: [
          {
            title: "Pergunta de cultura geral",
            description:
              "Cada jogador recebe uma pergunta de cultura geral e deve indicar se conhece a resposta.",
            emoji: "🧠",
          },
          {
            title: "Pontos por respostas",
            description:
              "Resposta correta: +2 pontos. Resposta errada: -1 ponto. Não saber: 0 pontos.",
            emoji: "📊",
          },
          {
            title: "Pontos por acusações",
            description:
              "Acusação correta: +1 ponto. Acusação errada: -1 ponto. Acusado injustamente: +1 ponto bônus.",
            emoji: "🎯",
          },
          {
            title: "Estratégia",
            description:
              "Escolha sabiamente quando mentir e quando acusar para maximizar seus pontos.",
            emoji: "🤔",
          },
        ],
      },
      ar: {
        rules: [
          {
            title: "سؤال معلومات عامة",
            description:
              "يتلقى كل لاعب سؤالاً عن المعلومات العامة ويجب أن يشير إلى ما إذا كان يعرف الإجابة.",
            emoji: "🧠",
          },
          {
            title: "النقاط للإجابات",
            description:
              "إجابة صحيحة: +2 نقطة. إجابة خاطئة: -1 نقطة. لا أعرف: 0 نقطة.",
            emoji: "📊",
          },
          {
            title: "النقاط للاتهامات",
            description:
              "اتهام صحيح: +1 نقطة. اتهام خاطئ: -1 نقطة. اتهام خاطئ: +1 نقطة إضافية.",
            emoji: "🎯",
          },
          {
            title: "الاستراتيجية",
            description: "اختر بحكمة متى تكذب ومتى تتهم لتعظيم نقاطك.",
            emoji: "🤔",
          },
        ],
      },
    },
  },
  "never-have-i-ever-hot": {
    translations: {
      fr: {
        rules: [
          {
            title: "Questions osées",
            description:
              "Les joueurs répondent à des questions sur des expériences intimes ou embarrassantes.",
            emoji: "🔥",
          },
          {
            title: "Jamais ou déjà",
            description:
              "Si vous avez déjà fait ce qui est demandé, vous devez l'admettre honnêtement.",
            emoji: "👍",
          },
          {
            title: "Détails optionnels",
            description:
              "Les joueurs peuvent choisir de partager plus de détails ou rester discrets.",
            emoji: "🤐",
          },
        ],
      },
      en: {
        rules: [
          {
            title: "Daring questions",
            description:
              "Players answer questions about intimate or embarrassing experiences.",
            emoji: "🔥",
          },
          {
            title: "Never or already",
            description:
              "If you have already done what is asked, you must honestly admit it.",
            emoji: "👍",
          },
          {
            title: "Optional details",
            description:
              "Players can choose to share more details or remain discreet.",
            emoji: "🤐",
          },
        ],
      },
      es: {
        rules: [
          {
            title: "Preguntas atrevidas",
            description:
              "Los jugadores responden a preguntas sobre experiencias íntimas o embarazosas.",
            emoji: "🔥",
          },
          {
            title: "Nunca o ya",
            description:
              "Si ya has hecho lo que se pide, debes admitirlo honestamente.",
            emoji: "👍",
          },
          {
            title: "Detalles opcionales",
            description:
              "Los jugadores pueden elegir compartir más detalles o permanecer discretos.",
            emoji: "🤐",
          },
        ],
      },
      de: {
        rules: [
          {
            title: "Gewagte Fragen",
            description:
              "Spieler beantworten Fragen über intime oder peinliche Erfahrungen.",
            emoji: "🔥",
          },
          {
            title: "Noch nie oder schon",
            description:
              "Wenn du bereits getan hast, was gefragt wird, musst du es ehrlich zugeben.",
            emoji: "👍",
          },
          {
            title: "Optionale Details",
            description:
              "Spieler können wählen, ob sie mehr Details teilen oder diskret bleiben.",
            emoji: "🤐",
          },
        ],
      },
      it: {
        rules: [
          {
            title: "Domande audaci",
            description:
              "I giocatori rispondono a domande su esperienze intime o imbarazzanti.",
            emoji: "🔥",
          },
          {
            title: "Mai o già",
            description:
              "Se hai già fatto ciò che viene chiesto, devi ammetterlo onestamente.",
            emoji: "👍",
          },
          {
            title: "Dettagli opzionali",
            description:
              "I giocatori possono scegliere di condividere più dettagli o rimanere discreti.",
            emoji: "🤐",
          },
        ],
      },
      pt: {
        rules: [
          {
            title: "Perguntas ousadas",
            description:
              "Os jogadores respondem a perguntas sobre experiências íntimas ou embaraçosas.",
            emoji: "🔥",
          },
          {
            title: "Nunca ou já",
            description:
              "Se você já fez o que é pedido, deve admitir honestamente.",
            emoji: "👍",
          },
          {
            title: "Detalhes opcionais",
            description:
              "Os jogadores podem escolher compartilhar mais detalhes ou permanecer discretos.",
            emoji: "🤐",
          },
        ],
      },
      ar: {
        rules: [
          {
            title: "أسئلة جريئة",
            description: "يجيب اللاعبون على أسئلة حول تجارب حميمة أو محرجة.",
            emoji: "🔥",
          },
          {
            title: "أبدًا أو بالفعل",
            description:
              "إذا كنت قد فعلت بالفعل ما هو مطلوب، يجب عليك الاعتراف بصدق.",
            emoji: "👍",
          },
          {
            title: "تفاصيل اختيارية",
            description:
              "يمكن للاعبين اختيار مشاركة المزيد من التفاصيل أو البقاء متحفظين.",
            emoji: "🤐",
          },
        ],
      },
    },
  },
  "trap-answer": {
    translations: {
      fr: {
        rules: [
          {
            title: "Répondez à la question",
            description:
              "Chaque joueur doit choisir une réponse à la question posée.",
            emoji: "🤔",
          },
          {
            title: "Bonne réponse",
            description:
              "Si vous choisissez la bonne réponse, vous gagnez des points.",
            emoji: "✅",
          },
          {
            title: "Attention aux pièges",
            description: "Si vous choisissez un piège, vous perdez des points.",
            emoji: "❌",
          },
          {
            title: "Objectif",
            description:
              "Le joueur avec le plus de points à la fin de la partie gagne.",
            emoji: "🏆",
          },
        ],
      },
      en: {
        rules: [
          {
            title: "Answer the question",
            description:
              "Each player must choose an answer to the question asked.",
            emoji: "🤔",
          },
          {
            title: "Correct answer",
            description: "If you choose the correct answer, you gain points.",
            emoji: "✅",
          },
          {
            title: "Beware of traps",
            description: "If you choose a trap, you lose points.",
            emoji: "❌",
          },
          {
            title: "Objective",
            description:
              "The player with the most points at the end of the game wins.",
            emoji: "🏆",
          },
        ],
      },
      es: {
        rules: [
          {
            title: "Responde a la pregunta",
            description:
              "Cada jugador debe elegir una respuesta a la pregunta planteada.",
            emoji: "🤔",
          },
          {
            title: "Respuesta correcta",
            description: "Si eliges la respuesta correcta, ganas puntos.",
            emoji: "✅",
          },
          {
            title: "Cuidado con las trampas",
            description: "Si eliges una trampa, pierdes puntos.",
            emoji: "❌",
          },
          {
            title: "Objetivo",
            description:
              "El jugador con más puntos al final de la partida gana.",
            emoji: "🏆",
          },
        ],
      },
      de: {
        rules: [
          {
            title: "Beantworte die Frage",
            description:
              "Jeder Spieler muss eine Antwort auf die gestellte Frage auswählen.",
            emoji: "🤔",
          },
          {
            title: "Richtige Antwort",
            description:
              "Wenn du die richtige Antwort wählst, erhältst du Punkte.",
            emoji: "✅",
          },
          {
            title: "Vorsicht vor Fallen",
            description: "Wenn du eine Falle wählst, verlierst du Punkte.",
            emoji: "❌",
          },
          {
            title: "Ziel",
            description:
              "Der Spieler mit den meisten Punkten am Ende des Spiels gewinnt.",
            emoji: "🏆",
          },
        ],
      },
      it: {
        rules: [
          {
            title: "Rispondi alla domanda",
            description:
              "Ogni giocatore deve scegliere una risposta alla domanda posta.",
            emoji: "🤔",
          },
          {
            title: "Risposta corretta",
            description: "Se scegli la risposta corretta, guadagni punti.",
            emoji: "✅",
          },
          {
            title: "Attenzione alle trappole",
            description: "Se scegli una trappola, perdi punti.",
            emoji: "❌",
          },
          {
            title: "Obiettivo",
            description:
              "Il giocatore con più punti alla fine della partita vince.",
            emoji: "🏆",
          },
        ],
      },
      pt: {
        rules: [
          {
            title: "Responda à pergunta",
            description:
              "Cada jogador deve escolher uma resposta para a pergunta feita.",
            emoji: "🤔",
          },
          {
            title: "Resposta correta",
            description: "Se você escolher a resposta correta, ganha pontos.",
            emoji: "✅",
          },
          {
            title: "Cuidado com as armadilhas",
            description: "Se você escolher uma armadilha, perde pontos.",
            emoji: "❌",
          },
          {
            title: "Objetivo",
            description: "O jogador com mais pontos no final do jogo vence.",
            emoji: "🏆",
          },
        ],
      },
      ar: {
        rules: [
          {
            title: "أجب عن السؤال",
            description: "يجب على كل لاعب اختيار إجابة للسؤال المطروح.",
            emoji: "🤔",
          },
          {
            title: "الإجابة الصحيحة",
            description: "إذا اخترت الإجابة الصحيحة، فستحصل على نقاط.",
            emoji: "✅",
          },
          {
            title: "احذر الفخاخ",
            description: "إذا اخترت فخًا، فستخسر نقاطًا.",
            emoji: "❌",
          },
          {
            title: "الهدف",
            description:
              "اللاعب الذي يحصل على أكبر عدد من النقاط في نهاية اللعبة يفوز.",
            emoji: "🏆",
          },
        ],
      },
    },
  },
  "two-letters-one-word": {
    translations: {
      fr: {
        rules: [
          {
            title: "Comment jouer",
            description:
              "Trouvez un mot qui commence par les deux lettres affichées et qui correspond au thème donné.",
            emoji: "🎯",
          },
          {
            title: "Exemple",
            description:
              "Si les lettres sont 'S' et 'H' et le thème est 'une marque', vous pouvez répondre 'Sephora'.",
            emoji: "💡",
          },
          {
            title: "Score",
            description: "Gagnez un point pour chaque mot valide trouvé !",
            emoji: "🏆",
          },
        ],
      },
      en: {
        rules: [
          {
            title: "How to play",
            description:
              "Find a word that starts with the two displayed letters and matches the given theme.",
            emoji: "🎯",
          },
          {
            title: "Example",
            description:
              "If the letters are 'S' and 'H' and the theme is 'a brand', you can answer 'Sephora'.",
            emoji: "💡",
          },
          {
            title: "Score",
            description: "Get one point for each valid word you find!",
            emoji: "🏆",
          },
        ],
      },
    },
  },
  "word-guessing": {
    translations: {
      fr: {
        rules: [
          {
            title: "Comment jouer",
            description:
              "Un joueur doit faire deviner un mot aux autres sans utiliser certains mots interdits.",
            emoji: "🎯",
          },
          {
            title: "Points",
            description:
              "+1 point si vous devinez le mot, -1 point si vous utilisez un mot interdit.",
            emoji: "⭐",
          },
          {
            title: "Temps",
            description: "Vous avez 30 secondes pour faire deviner le mot.",
            emoji: "⏱️",
          },
          {
            title: "Astuce",
            description:
              "Soyez créatif dans vos descriptions pour éviter les mots interdits !",
            emoji: "💡",
          },
        ],
      },
      en: {
        rules: [
          {
            title: "How to play",
            description:
              "One player must make others guess a word without using certain forbidden words.",
            emoji: "🎯",
          },
          {
            title: "Points",
            description:
              "+1 point if you guess the word, -1 point if you use a forbidden word.",
            emoji: "⭐",
          },
          {
            title: "Time",
            description: "You have 30 seconds to make others guess the word.",
            emoji: "⏱️",
          },
          {
            title: "Tip",
            description:
              "Be creative in your descriptions to avoid forbidden words!",
            emoji: "💡",
          },
        ],
      },
    },
  },
  "quiz-halloween": {
    translations: {
      fr: {
        rules: [
          {
            title: "🎃 Questions effrayantes",
            description:
              "Répondez aux questions sur Halloween et les créatures de la nuit. L'ambiance est sombre et mystérieuse !",
            emoji: "🎃",
            colors: {
              title: "#FF6F00",
              description: "#FFB347",
              background: "#1A1A2E",
            },
          },
          {
            title: "⚡ Une seule chance",
            description:
              "Vous n'avez qu'une seule tentative par question. Choisissez bien ou vous tomberez dans le piège !",
            emoji: "⚡",
            colors: {
              title: "#FFD700",
              description: "#FFB347",
              background: "#4B1E00",
            },
          },
          {
            title: "💀 Points et score",
            description:
              "Chaque bonne réponse vous rapporte 1 point. Attention aux pièges mortels !",
            emoji: "💀",
            colors: {
              title: "#DC143C",
              description: "#FF6F00",
              background: "#120F1C",
            },
          },
          {
            title: "🕷️ Thème Halloween",
            description:
              "Testez vos connaissances sur les films d'horreur, les traditions et les légendes d'Halloween. L'obscurité vous attend !",
            emoji: "🕷️",
            colors: {
              title: "#8B0000",
              description: "#DC143C",
              background: "#2D223A",
            },
          },
          {
            title: "👻 Ambiance effrayante",
            description:
              "Plongez dans l'atmosphère d'Halloween avec des toiles d'araignées et des décorations sombres !",
            emoji: "👻",
            colors: {
              title: "#FF6F00",
              description: "#FFD700",
              background: "#1A1A2E",
            },
          },
        ],
      },
      en: {
        rules: [
          {
            title: "🎃 Scary questions",
            description:
              "Answer questions about Halloween and creatures of the night. The atmosphere is dark and mysterious!",
            emoji: "🎃",
            colors: {
              title: "#FF6F00",
              description: "#FFB347",
              background: "#1A1A2E",
            },
          },
          {
            title: "⚡ One chance only",
            description:
              "You only have one attempt per question. Choose wisely or you'll fall into the trap!",
            emoji: "⚡",
            colors: {
              title: "#FFD700",
              description: "#FFB347",
              background: "#4B1E00",
            },
          },
          {
            title: "💀 Points and score",
            description:
              "Each correct answer earns you 1 point. Watch out for deadly traps!",
            emoji: "💀",
            colors: {
              title: "#DC143C",
              description: "#FF6F00",
              background: "#120F1C",
            },
          },
          {
            title: "🕷️ Halloween theme",
            description:
              "Test your knowledge of horror movies, traditions and Halloween legends. Darkness awaits you!",
            emoji: "🕷️",
            colors: {
              title: "#8B0000",
              description: "#DC143C",
              background: "#2D223A",
            },
          },
          {
            title: "👻 Spooky atmosphere",
            description:
              "Dive into the Halloween atmosphere with spider webs and dark decorations!",
            emoji: "👻",
            colors: {
              title: "#FF6F00",
              description: "#FFD700",
              background: "#1A1A2E",
            },
          },
        ],
      },
      es: {
        rules: [
          {
            title: "🎃 Preguntas espeluznantes",
            description:
              "Responde preguntas sobre Halloween y criaturas de la noche. ¡La atmósfera es oscura y misteriosa!",
            emoji: "🎃",
          },
          {
            title: "⚡ Solo una oportunidad",
            description:
              "Solo tienes un intento por pregunta. ¡Elige sabiamente o caerás en la trampa!",
            emoji: "⚡",
          },
          {
            title: "💀 Puntos y puntuación",
            description:
              "Cada respuesta correcta te da 1 punto. ¡Cuidado con las trampas mortales!",
            emoji: "💀",
          },
          {
            title: "🕷️ Tema de Halloween",
            description:
              "Pon a prueba tus conocimientos sobre películas de terror, tradiciones y leyendas de Halloween. ¡La oscuridad te espera!",
            emoji: "🕷️",
          },
          {
            title: "👻 Ambiente espeluznante",
            description:
              "¡Sumérgete en la atmósfera de Halloween con telarañas y decoraciones oscuras!",
            emoji: "👻",
          },
        ],
      },
      de: {
        rules: [
          {
            title: "Gruselige Fragen",
            description:
              "Beantworte Fragen über Halloween und Kreaturen der Nacht.",
            emoji: "🎃",
          },
          {
            title: "Nur eine Chance",
            description: "Du hast nur einen Versuch pro Frage. Wähle weise!",
            emoji: "⚡",
          },
          {
            title: "Punkte und Score",
            description:
              "Jede richtige Antwort bringt dir 1 Punkt. Achte auf Fallen!",
            emoji: "💀",
          },
          {
            title: "Halloween-Thema",
            description:
              "Teste dein Wissen über Horrorfilme, Traditionen und Halloween-Legenden.",
            emoji: "🕷️",
          },
        ],
      },
      it: {
        rules: [
          {
            title: "Domande spaventose",
            description:
              "Rispondi alle domande su Halloween e le creature della notte.",
            emoji: "🎃",
          },
          {
            title: "Solo una possibilità",
            description:
              "Hai solo un tentativo per domanda. Scegli saggiamente!",
            emoji: "⚡",
          },
          {
            title: "Punti e punteggio",
            description:
              "Ogni risposta corretta ti dà 1 punto. Attento alle trappole!",
            emoji: "💀",
          },
          {
            title: "Tema Halloween",
            description:
              "Metti alla prova le tue conoscenze sui film horror, tradizioni e leggende di Halloween.",
            emoji: "🕷️",
          },
        ],
      },
      pt: {
        rules: [
          {
            title: "Perguntas assustadoras",
            description:
              "Responda perguntas sobre Halloween e criaturas da noite.",
            emoji: "🎃",
          },
          {
            title: "Apenas uma chance",
            description:
              "Você só tem uma tentativa por pergunta. Escolha sabiamente!",
            emoji: "⚡",
          },
          {
            title: "Pontos e pontuação",
            description:
              "Cada resposta correta te dá 1 ponto. Cuidado com as armadilhas!",
            emoji: "💀",
          },
          {
            title: "Tema Halloween",
            description:
              "Teste seus conhecimentos sobre filmes de terror, tradições e lendas do Halloween.",
            emoji: "🕷️",
          },
        ],
      },
      ar: {
        rules: [
          {
            title: "أسئلة مرعبة",
            description: "أجب على الأسئلة حول الهالوين ومخلوقات الليل.",
            emoji: "🎃",
          },
          {
            title: "فرصة واحدة فقط",
            description: "لديك محاولة واحدة فقط لكل سؤال. اختر بحكمة!",
            emoji: "⚡",
          },
          {
            title: "النقاط والنتيجة",
            description: "كل إجابة صحيحة تحصل على نقطة واحدة. احذر من الفخاخ!",
            emoji: "💀",
          },
          {
            title: "موضوع الهالوين",
            description:
              "اختبر معرفتك بأفلام الرعب والتقاليد وأساطير الهالوين.",
            emoji: "🕷️",
          },
        ],
      },
    },
  },
  "forbidden-desire": {
    translations: {
      fr: {
        rules: [
          {
            title: "Choix d'intensité",
            description:
              "À son tour, le joueur choisit le niveau d'intensité : Soft 🔥, Tension 😳 ou Extrême 😈.",
            emoji: "🎯",
          },
          {
            title: "Répondre ou assumer",
            description:
              "Face à une question, vous pouvez choisir de répondre honnêtement OU de refuser (votre partenaire vous imposera alors un défi).",
            emoji: "🔥",
          },
          {
            title: "Confiance et respect",
            description:
              "Ce jeu teste vos limites. Respectez les choix de votre partenaire et créez un espace de confiance.",
            emoji: "💕",
          },
          {
            title: "Confidentialité absolue",
            description:
              "Ce qui est dit pendant le jeu reste strictement entre vous deux. Aucun jugement, aucun partage.",
            emoji: "🤐",
          },
          {
            title: "Objectif",
            description:
              "Approfondir votre relation en osant poser (et répondre) aux questions les plus intimes et révélatrices.",
            emoji: "🎭",
          },
        ],
      },
      en: {
        rules: [
          {
            title: "Choose intensity",
            description:
              "On their turn, the player chooses the intensity level: Soft 🔥, Tension 😳 or Extreme 😈.",
            emoji: "🎯",
          },
          {
            title: "Answer or face a challenge",
            description:
              "When faced with a question, you can choose to answer honestly OR refuse (your partner will then impose a dare on you).",
            emoji: "🔥",
          },
          {
            title: "Trust and respect",
            description:
              "This game tests your limits. Respect your partner's choices and create a space of trust.",
            emoji: "💕",
          },
          {
            title: "Absolute confidentiality",
            description:
              "What is said during the game stays strictly between you two. No judgment, no sharing.",
            emoji: "🤐",
          },
          {
            title: "Objective",
            description:
              "Deepen your relationship by daring to ask (and answer) the most intimate and revealing questions.",
            emoji: "🎭",
          },
        ],
      },
      es: {
        rules: [
          {
            title: "Elige intensidad",
            description:
              "En su turno, el jugador elige el nivel de intensidad: Suave 🔥, Tensión 😳 o Extremo 😈.",
            emoji: "🎯",
          },
          {
            title: "Responder o asumir",
            description:
              "Ante una pregunta, puedes elegir responder honestamente O rechazar (tu pareja te impondrá entonces un desafío).",
            emoji: "🔥",
          },
          {
            title: "Confianza y respeto",
            description:
              "Este juego prueba tus límites. Respeta las decisiones de tu pareja y crea un espacio de confianza.",
            emoji: "💕",
          },
          {
            title: "Confidencialidad absoluta",
            description:
              "Lo que se dice durante el juego queda estrictamente entre ustedes dos. Sin juicios, sin compartir.",
            emoji: "🤐",
          },
          {
            title: "Objetivo",
            description:
              "Profundizar su relación atreviéndose a hacer (y responder) las preguntas más íntimas y reveladoras.",
            emoji: "🎭",
          },
        ],
      },
      de: {
        rules: [
          {
            title: "Intensität wählen",
            description:
              "In seinem Zug wählt der Spieler die Intensitätsstufe: Sanft 🔥, Spannung 😳 oder Extrem 😈.",
            emoji: "🎯",
          },
          {
            title: "Antworten oder ablehnen",
            description:
              "Bei einer Frage können Sie wählen, ehrlich zu antworten ODER abzulehnen (Ihr Partner wird Ihnen dann eine Herausforderung auferlegen).",
            emoji: "🔥",
          },
          {
            title: "Vertrauen und Respekt",
            description:
              "Dieses Spiel testet Ihre Grenzen. Respektieren Sie die Entscheidungen Ihres Partners und schaffen Sie einen Raum des Vertrauens.",
            emoji: "💕",
          },
          {
            title: "Absolute Vertraulichkeit",
            description:
              "Was während des Spiels gesagt wird, bleibt streng zwischen Ihnen beiden. Kein Urteil, kein Teilen.",
            emoji: "🤐",
          },
          {
            title: "Ziel",
            description:
              "Vertiefen Sie Ihre Beziehung, indem Sie sich trauen, die intimsten und aufschlussreichsten Fragen zu stellen (und zu beantworten).",
            emoji: "🎭",
          },
        ],
      },
      it: {
        rules: [
          {
            title: "Scegli intensità",
            description:
              "Al proprio turno, il giocatore sceglie il livello di intensità: Soft 🔥, Tensione 😳 o Estremo 😈.",
            emoji: "🎯",
          },
          {
            title: "Rispondi o affronta",
            description:
              "Di fronte a una domanda, puoi scegliere di rispondere onestamente O rifiutare (il tuo partner ti imporrà una sfida).",
            emoji: "🔥",
          },
          {
            title: "Fiducia e rispetto",
            description:
              "Questo gioco mette alla prova i tuoi limiti. Rispetta le scelte del tuo partner e crea uno spazio di fiducia.",
            emoji: "💕",
          },
          {
            title: "Riservatezza assoluta",
            description:
              "Ciò che viene detto durante il gioco rimane strettamente tra voi due. Nessun giudizio, nessuna condivisione.",
            emoji: "🤐",
          },
          {
            title: "Obiettivo",
            description:
              "Approfondire la vostra relazione osando fare (e rispondere) alle domande più intime e rivelatrici.",
            emoji: "🎭",
          },
        ],
      },
      pt: {
        rules: [
          {
            title: "Escolha a intensidade",
            description:
              "Na sua vez, o jogador escolhe o nível de intensidade: Suave 🔥, Tensão 😳 ou Extremo 😈.",
            emoji: "🎯",
          },
          {
            title: "Responder ou assumir",
            description:
              "Diante de uma pergunta, você pode escolher responder honestamente OU recusar (seu parceiro imporá um desafio).",
            emoji: "🔥",
          },
          {
            title: "Confiança e respeito",
            description:
              "Este jogo testa seus limites. Respeite as escolhas do seu parceiro e crie um espaço de confiança.",
            emoji: "💕",
          },
          {
            title: "Confidencialidade absoluta",
            description:
              "O que é dito durante o jogo fica estritamente entre vocês dois. Sem julgamentos, sem compartilhar.",
            emoji: "🤐",
          },
          {
            title: "Objetivo",
            description:
              "Aprofundar seu relacionamento ousando fazer (e responder) as perguntas mais íntimas e reveladoras.",
            emoji: "🎭",
          },
        ],
      },
      ar: {
        rules: [
          {
            title: "اختر الشدة",
            description:
              "في دوره، يختار اللاعب مستوى الشدة: ناعم 🔥، توتر 😳 أو متطرف 😈.",
            emoji: "🎯",
          },
          {
            title: "الإجابة أو المواجهة",
            description:
              "عند مواجهة سؤال، يمكنك اختيار الإجابة بصدق أو الرفض (سيفرض عليك شريكك تحديًا).",
            emoji: "🔥",
          },
          {
            title: "الثقة والاحترام",
            description:
              "هذه اللعبة تختبر حدودك. احترم اختيارات شريكك وأنشئ مساحة من الثقة.",
            emoji: "💕",
          },
          {
            title: "السرية المطلقة",
            description:
              "ما يقال أثناء اللعبة يبقى بينكما فقط. لا حكم، لا مشاركة.",
            emoji: "🤐",
          },
          {
            title: "الهدف",
            description:
              "تعميق علاقتكما من خلال الجرأة على طرح (والإجابة) على الأسئلة الأكثر حميمية وكشفًا.",
            emoji: "🎭",
          },
        ],
      },
    },
  },
  "double-dare": {
    translations: {
      fr: {
        rules: [
          {
            title: "Choisis ton niveau",
            description:
              "À ton tour, sélectionne le niveau de défi : Hot 🔥 (sensuel), Extreme 😈 (sans limites) ou Chaos 💀 (total chaos).",
            emoji: "🎯",
          },
          {
            title: "Choisis ton mode",
            description:
              "Versus ⚔️ : Affrontez-vous (le perdant subit un gage). Fusion ❤️ : Défis à réaliser ensemble (plus sensuels).",
            emoji: "🎮",
          },
          {
            title: "Réalise le défi",
            description:
              "Tu dois accomplir le défi proposé. Si tu refuses, tu subis une conséquence choisie par ton/ta partenaire.",
            emoji: "💪",
          },
          {
            title: "Safe Word disponible",
            description:
              "Tu peux dire 'Safe Word' pour passer un défi si tu es vraiment mal à l'aise. Pas de jugement !",
            emoji: "⚠️",
          },
          {
            title: "Objectif",
            description:
              "Oser ensemble, se tester mutuellement, rire et créer des moments inoubliables. Zéro limite, total fun !",
            emoji: "🔥",
          },
        ],
      },
      en: {
        rules: [
          {
            title: "Choose your level",
            description:
              "On your turn, select the challenge level: Hot 🔥 (sensual), Extreme 😈 (no limits) or Chaos 💀 (total chaos).",
            emoji: "🎯",
          },
          {
            title: "Choose your mode",
            description:
              "Versus ⚔️: Face off (loser gets a penalty). Fusion ❤️: Challenges to do together (more sensual).",
            emoji: "🎮",
          },
          {
            title: "Complete the dare",
            description:
              "You must complete the proposed dare. If you refuse, you face a consequence chosen by your partner.",
            emoji: "💪",
          },
          {
            title: "Safe Word available",
            description:
              "You can say 'Safe Word' to skip a dare if you're really uncomfortable. No judgment!",
            emoji: "⚠️",
          },
          {
            title: "Objective",
            description:
              "Dare together, test each other, laugh and create unforgettable moments. Zero limits, total fun!",
            emoji: "🔥",
          },
        ],
      },
      es: {
        rules: [
          {
            title: "Elige tu nivel",
            description:
              "En tu turno, selecciona el nivel de desafío: Hot 🔥 (sensual), Extreme 😈 (sin límites) o Chaos 💀 (caos total).",
            emoji: "🎯",
          },
          {
            title: "Elige tu modo",
            description:
              "Versus ⚔️: Enfréntense (el perdedor recibe una penitencia). Fusion ❤️: Desafíos para hacer juntos (más sensuales).",
            emoji: "🎮",
          },
          {
            title: "Completa el desafío",
            description:
              "Debes completar el desafío propuesto. Si te niegas, enfrentas una consecuencia elegida por tu pareja.",
            emoji: "💪",
          },
          {
            title: "Safe Word disponible",
            description:
              "Puedes decir 'Safe Word' para saltar un desafío si realmente te sientes incómodo. ¡Sin juicios!",
            emoji: "⚠️",
          },
          {
            title: "Objetivo",
            description:
              "Atreverse juntos, probarse mutuamente, reír y crear momentos inolvidables. ¡Cero límites, diversión total!",
            emoji: "🔥",
          },
        ],
      },
      de: {
        rules: [
          {
            title: "Wähle dein Level",
            description:
              "Wähle in deinem Zug das Challenge-Level: Hot 🔥 (sinnlich), Extreme 😈 (keine Grenzen) oder Chaos 💀 (totales Chaos).",
            emoji: "🎯",
          },
          {
            title: "Wähle deinen Modus",
            description:
              "Versus ⚔️: Tretet gegeneinander an (Verlierer bekommt eine Strafe). Fusion ❤️: Gemeinsame Herausforderungen (sinnlicher).",
            emoji: "🎮",
          },
          {
            title: "Erfülle die Herausforderung",
            description:
              "Du musst die vorgeschlagene Herausforderung erfüllen. Wenn du dich weigerst, erwartet dich eine Konsequenz, die dein Partner wählt.",
            emoji: "💪",
          },
          {
            title: "Safe Word verfügbar",
            description:
              "Du kannst 'Safe Word' sagen, um eine Herausforderung zu überspringen, wenn du wirklich unwohl bist. Kein Urteil!",
            emoji: "⚠️",
          },
          {
            title: "Ziel",
            description:
              "Gemeinsam wagen, sich gegenseitig testen, lachen und unvergessliche Momente schaffen. Null Grenzen, totaler Spaß!",
            emoji: "🔥",
          },
        ],
      },
      it: {
        rules: [
          {
            title: "Scegli il tuo livello",
            description:
              "Nel tuo turno, seleziona il livello di sfida: Hot 🔥 (sensuale), Extreme 😈 (senza limiti) o Chaos 💀 (caos totale).",
            emoji: "🎯",
          },
          {
            title: "Scegli la tua modalità",
            description:
              "Versus ⚔️: Sfidate (il perdente riceve una penalità). Fusion ❤️: Sfide da fare insieme (più sensuali).",
            emoji: "🎮",
          },
          {
            title: "Completa la sfida",
            description:
              "Devi completare la sfida proposta. Se rifiuti, affronti una conseguenza scelta dal tuo partner.",
            emoji: "💪",
          },
          {
            title: "Safe Word disponibile",
            description:
              "Puoi dire 'Safe Word' per saltare una sfida se sei davvero a disagio. Nessun giudizio!",
            emoji: "⚠️",
          },
          {
            title: "Obiettivo",
            description:
              "Osare insieme, mettersi alla prova, ridere e creare momenti indimenticabili. Zero limiti, divertimento totale!",
            emoji: "🔥",
          },
        ],
      },
      pt: {
        rules: [
          {
            title: "Escolha seu nível",
            description:
              "No seu turno, selecione o nível de desafio: Hot 🔥 (sensual), Extreme 😈 (sem limites) ou Chaos 💀 (caos total).",
            emoji: "🎯",
          },
          {
            title: "Escolha seu modo",
            description:
              "Versus ⚔️: Enfrentem-se (o perdedor leva uma penalidade). Fusion ❤️: Desafios para fazer juntos (mais sensuais).",
            emoji: "🎮",
          },
          {
            title: "Complete o desafio",
            description:
              "Você deve completar o desafio proposto. Se recusar, enfrenta uma consequência escolhida pelo seu parceiro.",
            emoji: "💪",
          },
          {
            title: "Safe Word disponível",
            description:
              "Você pode dizer 'Safe Word' para pular um desafio se estiver realmente desconfortável. Sem julgamentos!",
            emoji: "⚠️",
          },
          {
            title: "Objetivo",
            description:
              "Ousar juntos, testar um ao outro, rir e criar momentos inesquecíveis. Zero limites, diversão total!",
            emoji: "🔥",
          },
        ],
      },
      ar: {
        rules: [
          {
            title: "اختر مستواك",
            description:
              "في دورك، اختر مستوى التحدي: Hot 🔥 (حسي)، Extreme 😈 (بلا حدود) أو Chaos 💀 (فوضى كاملة).",
            emoji: "🎯",
          },
          {
            title: "اختر وضعك",
            description:
              "Versus ⚔️: واجه بعضكما (الخاسر يتلقى عقوبة). Fusion ❤️: تحديات للقيام بها معًا (أكثر حسية).",
            emoji: "🎮",
          },
          {
            title: "أكمل التحدي",
            description:
              "يجب عليك إكمال التحدي المقترح. إذا رفضت، ستواجه عواقب يختارها شريكك.",
            emoji: "💪",
          },
          {
            title: "كلمة الأمان متاحة",
            description:
              "يمكنك قول 'Safe Word' لتخطي تحدٍ إذا كنت غير مرتاح حقًا. لا حكم!",
            emoji: "⚠️",
          },
          {
            title: "الهدف",
            description:
              "التجرؤ معًا، اختبار بعضكما، الضحك وخلق لحظات لا تُنسى. صفر حدود، متعة كاملة!",
            emoji: "🔥",
          },
        ],
      },
    },
  },
  "pile-ou-face": {
    translations: {
      fr: {
        rules: [
          {
            title: "Tourne la roue",
            description:
              "À ton tour, fais tourner la roue qui décidera de ton destin : Face 😇 ou Pile 😈.",
            emoji: "🎡",
          },
          {
            title: "Face : Question révélatrice",
            description:
              "Si la roue tombe sur Face, réponds honnêtement à une question personnelle qui va te mettre à nu.",
            emoji: "😇",
          },
          {
            title: "Pile : Défi osé",
            description:
              "Si la roue tombe sur Pile, accomplis le défi proposé, aussi fou soit-il !",
            emoji: "😈",
          },
          {
            title: "Pas de tricherie",
            description:
              "Le hasard décide ! Impossible de refuser ce que la roue te réserve.",
            emoji: "🎲",
          },
          {
            title: "Objectif",
            description:
              "Laisse le hasard décider de ton sort et découvre des secrets ou relève des défis hilarants !",
            emoji: "🎯",
          },
        ],
      },
      en: {
        rules: [
          {
            title: "Spin the wheel",
            description:
              "On your turn, spin the wheel that will decide your fate: Heads 😇 or Tails 😈.",
            emoji: "🎡",
          },
          {
            title: "Heads: Revealing question",
            description:
              "If the wheel lands on Heads, answer honestly a personal question that will reveal you.",
            emoji: "😇",
          },
          {
            title: "Tails: Bold dare",
            description:
              "If the wheel lands on Tails, complete the proposed dare, no matter how crazy!",
            emoji: "😈",
          },
          {
            title: "No cheating",
            description:
              "Chance decides! You can't refuse what the wheel has in store for you.",
            emoji: "🎲",
          },
          {
            title: "Objective",
            description:
              "Let chance decide your fate and discover secrets or take on hilarious dares!",
            emoji: "🎯",
          },
        ],
      },
      es: {
        rules: [
          {
            title: "Gira la rueda",
            description:
              "En tu turno, gira la rueda que decidirá tu destino: Cara 😇 o Cruz 😈.",
            emoji: "🎡",
          },
          {
            title: "Cara: Pregunta reveladora",
            description:
              "Si la rueda cae en Cara, responde honestamente una pregunta personal que te revelará.",
            emoji: "😇",
          },
          {
            title: "Cruz: Desafío atrevido",
            description:
              "Si la rueda cae en Cruz, completa el desafío propuesto, ¡por loco que sea!",
            emoji: "😈",
          },
          {
            title: "Sin trampas",
            description:
              "¡El azar decide! No puedes rechazar lo que la rueda te depara.",
            emoji: "🎲",
          },
          {
            title: "Objetivo",
            description:
              "¡Deja que el azar decida tu destino y descubre secretos o acepta desafíos hilarantes!",
            emoji: "🎯",
          },
        ],
      },
      de: {
        rules: [
          {
            title: "Drehe das Rad",
            description:
              "In deinem Zug drehst du das Rad, das dein Schicksal entscheidet: Kopf 😇 oder Zahl 😈.",
            emoji: "🎡",
          },
          {
            title: "Kopf: Enthüllende Frage",
            description:
              "Wenn das Rad auf Kopf landet, beantworte ehrlich eine persönliche Frage, die dich enthüllt.",
            emoji: "😇",
          },
          {
            title: "Zahl: Kühne Herausforderung",
            description:
              "Wenn das Rad auf Zahl landet, erfülle die vorgeschlagene Herausforderung, egal wie verrückt!",
            emoji: "😈",
          },
          {
            title: "Kein Schummeln",
            description:
              "Der Zufall entscheidet! Du kannst nicht ablehnen, was das Rad für dich bereithält.",
            emoji: "🎲",
          },
          {
            title: "Ziel",
            description:
              "Lass den Zufall dein Schicksal entscheiden und entdecke Geheimnisse oder nimm witzige Herausforderungen an!",
            emoji: "🎯",
          },
        ],
      },
      it: {
        rules: [
          {
            title: "Gira la ruota",
            description:
              "Nel tuo turno, gira la ruota che deciderà il tuo destino: Testa 😇 o Croce 😈.",
            emoji: "🎡",
          },
          {
            title: "Testa: Domanda rivelatrice",
            description:
              "Se la ruota cade su Testa, rispondi onestamente a una domanda personale che ti rivelerà.",
            emoji: "😇",
          },
          {
            title: "Croce: Sfida audace",
            description:
              "Se la ruota cade su Croce, completa la sfida proposta, per quanto folle!",
            emoji: "😈",
          },
          {
            title: "Niente imbrogli",
            description:
              "Il caso decide! Non puoi rifiutare ciò che la ruota ti riserva.",
            emoji: "🎲",
          },
          {
            title: "Obiettivo",
            description:
              "Lascia che il caso decida il tuo destino e scopri segreti o accetta sfide esilaranti!",
            emoji: "🎯",
          },
        ],
      },
      pt: {
        rules: [
          {
            title: "Gire a roda",
            description:
              "No seu turno, gire a roda que decidirá seu destino: Cara 😇 ou Coroa 😈.",
            emoji: "🎡",
          },
          {
            title: "Cara: Pergunta reveladora",
            description:
              "Se a roda cair em Cara, responda honestamente uma pergunta pessoal que vai te revelar.",
            emoji: "😇",
          },
          {
            title: "Coroa: Desafio ousado",
            description:
              "Se a roda cair em Coroa, complete o desafio proposto, por mais louco que seja!",
            emoji: "😈",
          },
          {
            title: "Sem trapaça",
            description:
              "O acaso decide! Você não pode recusar o que a roda tem reservado para você.",
            emoji: "🎲",
          },
          {
            title: "Objetivo",
            description:
              "Deixe o acaso decidir seu destino e descubra segredos ou aceite desafios hilários!",
            emoji: "🎯",
          },
        ],
      },
      ar: {
        rules: [
          {
            title: "أدر العجلة",
            description:
              "في دورك، أدر العجلة التي ستقرر مصيرك: وجه 😇 أو ظهر 😈.",
            emoji: "🎡",
          },
          {
            title: "وجه: سؤال كاشف",
            description:
              "إذا وقعت العجلة على الوجه، أجب بصدق على سؤال شخصي سيكشفك.",
            emoji: "😇",
          },
          {
            title: "ظهر: تحدٍ جريء",
            description:
              "إذا وقعت العجلة على الظهر، أكمل التحدي المقترح، مهما كان مجنونًا!",
            emoji: "😈",
          },
          {
            title: "لا غش",
            description: "الصدفة تقرر! لا يمكنك رفض ما تحتفظ به العجلة لك.",
            emoji: "🎲",
          },
          {
            title: "الهدف",
            description:
              "دع الصدفة تقرر مصيرك واكتشف الأسرار أو واجه تحديات مضحكة!",
            emoji: "🎯",
          },
        ],
      },
    },
  },
};

// Initialise Firebase et insère les règles du jeu dans Firestore
const initGameRules = async () => {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Sauvegarde la configuration des langues
    await setDoc(doc(db, "config", "languages"), {
      supportedLanguages,
    });

    // Sauvegarde les règles du jeu pour chaque mode
    for (const [gameId, content] of Object.entries(gameRules)) {
      await setDoc(doc(db, "rules", gameId), content);
      console.log(`Règles du jeu pour ${gameId} ajoutées avec succès!`);
    }

    console.log("Initialisation des règles terminée!");
  } catch (error) {
    console.error("Erreur lors de l'initialisation des règles:", error);
  }
};

// Lance l'initialisation
initGameRules(); 
