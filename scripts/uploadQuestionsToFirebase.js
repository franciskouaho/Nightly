import { initializeApp } from 'firebase/app';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

//node scripts/uploadQuestionsToFirebase.js

const firebaseConfig = {
  apiKey: 'AIzaSyCaXTVinkd4OIMqhGAXENme4tVvDUG4CzA',
  authDomain: 'drink-dare.firebaseapp.com',
  projectId: 'drink-dare',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const questions = {
  'on-ecoute-mais-on-ne-juge-pas': [
    'Si {playerName} devait confesser un péché mignon, lequel serait-ce ?',
    "Quelle est la pire habitude de {playerName} qu'il/elle n'admettra jamais publiquement ?",
    'Comment {playerName} réagirait face à un compliment sincère mais inattendu ?',
    'Quel secret {playerName} serait-il/elle prêt(e) à partager uniquement dans cette pièce ?',
    'Quelle émotion {playerName} a-t-il/elle le plus de mal à exprimer ?',
    "Dans quel domaine {playerName} aimerait-il/elle être meilleur(e) mais a peur d'essayer ?",
    'Si {playerName} devait écrire une lettre à son "moi" passé, quel conseil donnerait-il/elle ?',
    'Quelle situation fait le plus douter {playerName} de ses capacités ?',
  ],
  'action-verite': [
    // Questions de vérité
    { type: 'verite', text: 'Quelle est la chose la plus embarrassante que tu as faite en public ?' },
    { type: 'verite', text: "As-tu déjà menti à quelqu'un dans cette pièce ?" },
    { type: 'verite', text: 'Quel est ton plus grand regret ?' },
    { type: 'verite', text: 'Quelle est la chose la plus folle que tu aies faite par amour ?' },
    { type: 'verite', text: 'Quelle est ta plus grande peur ?' },
    { type: 'verite', text: 'Quel est ton pire rendez-vous amoureux ?' },
    { type: 'verite', text: 'Quelle est la chose la plus illégale que tu aies jamais faite ?' },
    { type: 'verite', text: 'Quel est ton rêve le plus récurrent ?' },
    { type: 'verite', text: "Quel secret n'as-tu jamais dit à personne ?" },
    { type: 'verite', text: 'Quelle est ta plus grande insécurité ?' },
    { type: 'verite', text: "As-tu déjà eu un coup de foudre pour quelqu'un que tu ne devrais pas ?" },
    { type: 'verite', text: 'Quelle est la chose la plus chère que tu aies volée ?' },
    { type: 'verite', text: 'Quelle est la chose la plus étrange que tu aies mangée ?' },
    { type: 'verite', text: 'Quelle est la chose la plus embarrassante dans ton historique de recherche ?' },
    { type: 'verite', text: 'Quel est le mensonge le plus important que tu aies dit ?' },

    // Actions
    { type: 'action', text: 'Imite un animal pendant 30 secondes' },
    { type: 'action', text: 'Envoie un message embarrassant à la dernière personne avec qui tu as parlé' },
    { type: 'action', text: 'Montre les 3 dernières photos de ta galerie' },
    { type: 'action', text: 'Fais 10 pompes' },
    { type: 'action', text: "Appelle quelqu'un et chante-lui joyeux anniversaire" },
    { type: 'action', text: 'Danse sans musique pendant 1 minute' },
    { type: 'action', text: 'Laisse les autres joueurs te dessiner sur le visage' },
    { type: 'action', text: "Mange un mélange d'aliments choisis par les autres joueurs" },
    { type: 'action', text: "Parle avec un accent étranger jusqu'à ton prochain tour" },
    { type: 'action', text: 'Fais le tour de la pièce en marchant sur les genoux' },
    { type: 'action', text: 'Raconte une blague et si personne ne rit, fais 5 squats' },
    { type: 'action', text: "Fais semblant d'être en colère contre la personne à ta gauche pendant 2 minutes" },
    { type: 'action', text: "Imite un autre joueur jusqu'à ce que quelqu'un devine qui c'est" },
    { type: 'action', text: 'Reste en position de planche pendant 1 minute' },
    { type: 'action', text: 'Fais un compliment à chaque personne dans la pièce' },
  ]
};

async function uploadQuestions() {
  for (const [gameId, questionsArray] of Object.entries(questions)) {
    await setDoc(doc(db, 'gameQuestions', gameId), {
      questions: questionsArray
    });
    console.log(`Questions uploaded for ${gameId}`);
  }
  process.exit(0);
}

uploadQuestions().catch(console.error); 