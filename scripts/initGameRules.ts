import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCaXTVinkd4OIMqhGAXENme4tVvDUG4CzA',
  authDomain: 'drink-dare.firebaseapp.com',
  projectId: 'drink-dare',
};

const gameRules = {
  'genius-or-liar': {
    rules: [
      {
        title: "OBJECTIF DU JEU",
        description: "Déterminez si le joueur désigné est un génie ou un menteur !",
        emoji: "🎯"
      },
      {
        title: "DÉROULEMENT",
        description: "Un joueur reçoit une question et doit y répondre. Les autres joueurs doivent deviner s'il dit la vérité ou ment.",
        emoji: "🎲"
      },
      {
        title: "VOTATION",
        description: "Chaque joueur vote pour 'Génie' ou 'Menteur'. Le joueur désigné révèle ensuite la vérité.",
        emoji: "🗳️"
      },
      {
        title: "POINTS",
        description: "Le joueur désigné gagne 2 points s'il trompe tout le monde. Les joueurs qui devinent correctement gagnent 1 point.",
        emoji: "🏆"
      }
    ]
  },
  'listen-but-don-t-judge': {
    rules: [
      {
        title: "OBJECTIF DU JEU",
        description: "Écoutez et répondez aux questions sans juger les autres joueurs.",
        emoji: "🎯"
      },
      {
        title: "DÉROULEMENT",
        description: "Un joueur est désigné et reçoit une question personnelle. Les autres joueurs répondent anonymement.",
        emoji: "🎲"
      },
      {
        title: "RÉPONSES",
        description: "Chaque joueur doit répondre sincèrement et respectueusement aux questions posées.",
        emoji: "✍️"
      },
      {
        title: "VOTATION",
        description: "Le joueur désigné lit toutes les réponses et choisit celle qui lui parle le plus.",
        emoji: "🗳️"
      },
      {
        title: "POINTS",
        description: "Le joueur dont la réponse est choisie gagne 1 point.",
        emoji: "🏆"
      }
    ]
  },
  'never-have-i-ever-hot': {
    rules: [
      {
        title: "OBJECTIF DU JEU",
        description: "Découvrez les expériences coquines de vos amis !",
        emoji: "🎯"
      },
      {
        title: "DÉROULEMENT",
        description: "Un joueur est désigné et reçoit une question 'Jamais je n'ai...'. Les autres joueurs répondent anonymement.",
        emoji: "🎲"
      },
      {
        title: "RÉPONSES",
        description: "Les joueurs doivent répondre honnêtement s'ils ont déjà fait l'expérience mentionnée.",
        emoji: "✍️"
      },
      {
        title: "VOTATION",
        description: "Le joueur désigné lit toutes les réponses et choisit celle qui l'intrigue le plus.",
        emoji: "🗳️"
      },
      {
        title: "POINTS",
        description: "Le joueur dont la réponse est choisie gagne 1 point.",
        emoji: "🏆"
      }
    ]
  },
  'truth-or-dare': {
    rules: [
      {
        title: "OBJECTIF DU JEU",
        description: "Choisissez entre vérité et action à chaque tour !",
        emoji: "🎯"
      },
      {
        title: "DÉROULEMENT",
        description: "Un joueur est désigné et doit choisir entre 'Vérité' ou 'Action'.",
        emoji: "🎲"
      },
      {
        title: "VÉRITÉ",
        description: "Le joueur doit répondre honnêtement à une question personnelle.",
        emoji: "💭"
      },
      {
        title: "ACTION",
        description: "Le joueur doit réaliser un défi amusant.",
        emoji: "🎭"
      },
      {
        title: "POINTS",
        description: "Le joueur gagne 1 point s'il complète son défi ou répond honnêtement.",
        emoji: "🏆"
      }
    ]
  }
};

const initGameRules = async () => {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    for (const [gameId, data] of Object.entries(gameRules)) {
      await setDoc(doc(db, 'rules', gameId), data);
      console.log(`✅ Règles initialisées pour ${gameId}`);
    }
    
    console.log('🎮 Toutes les règles ont été initialisées avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des règles:', error);
  }
};

initGameRules(); 