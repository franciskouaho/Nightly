import { BaseSeeder } from '@adonisjs/lucid/seeders'
import QuestionBank from '#models/question_bank'

export default class QuestionBankSeeder extends BaseSeeder {
  async run() {
    // Banque de questions par thème (reprendre les questions du frontend)
    const questionsByTheme = {
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
        'VÉRITÉ: Quelle est la chose la plus embarrassante que tu as faite en public ?',
        "VÉRITÉ: As-tu déjà menti à quelqu'un dans cette pièce ?",
        'VÉRITÉ: Quel est ton plus grand regret ?',
        'VÉRITÉ: Quelle est la chose la plus folle que tu aies faite par amour ?',
        'VÉRITÉ: Quelle est ta plus grande peur ?',
        'VÉRITÉ: Quel est ton pire rendez-vous amoureux ?',
        'VÉRITÉ: Quelle est la chose la plus illégale que tu aies jamais faite ?',
        'VÉRITÉ: Quel est ton rêve le plus récurrent ?',
        "VÉRITÉ: Quel secret n'as-tu jamais dit à personne ?",
        'VÉRITÉ: Quelle est ta plus grande insécurité ?',
        "VÉRITÉ: As-tu déjà eu un coup de foudre pour quelqu'un que tu ne devrais pas ?",
        'VÉRITÉ: Quelle est la chose la plus chère que tu aies volée ?',
        'VÉRITÉ: Quelle est la chose la plus étrange que tu aies mangée ?',
        'VÉRITÉ: Quelle est la chose la plus embarrassante dans ton historique de recherche ?',
        'VÉRITÉ: Quel est le mensonge le plus important que tu aies dit ?',

        // Actions
        'ACTION: Imite un animal pendant 30 secondes',
        'ACTION: Envoie un message embarrassant à la dernière personne avec qui tu as parlé',
        'ACTION: Montre les 3 dernières photos de ta galerie',
        'ACTION: Fais 10 pompes',
        "ACTION: Appelle quelqu'un et chante-lui joyeux anniversaire",
        'ACTION: Danse sans musique pendant 1 minute',
        'ACTION: Laisse les autres joueurs te dessiner sur le visage',
        "ACTION: Mange un mélange d'aliments choisis par les autres joueurs",
        "ACTION: Parle avec un accent étranger jusqu'à ton prochain tour",
        'ACTION: Fais le tour de la pièce en marchant sur les genoux',
        'ACTION: Raconte une blague et si personne ne rit, fais 5 squats',
        "ACTION: Fais semblant d'être en colère contre la personne à ta gauche pendant 2 minutes",
        "ACTION: Imite un autre joueur jusqu'à ce que quelqu'un devine qui c'est",
        'ACTION: Reste en position de planche pendant 1 minute',
        'ACTION: Fais un compliment à chaque personne dans la pièce',
      ],
    }

    // Convertir toutes les questions en objets pour insertion
    const questionsToInsert = []

    for (const [theme, questions] of Object.entries(questionsByTheme)) {
      for (const text of questions) {
        questionsToInsert.push({
          text,
          theme,
          isActive: true,
          usageCount: 0,
        })
      }
    }

    // Insérer toutes les questions d'un coup
    await QuestionBank.createMany(questionsToInsert)
  }
}
