// Définition des interfaces
import HalloweenTheme from '@/constants/themes/Halloween';

export interface GameMode {
    id: string;
    name: string;
    description: string;
    image: any;
    colors: string[];
    borderColor: string;
    shadowColor: string;
    tags: Array<{
        text: string;
        color: string;
    }>;
    premium: boolean;
    interactive?: 'write' | 'choice' | 'action';
}

export interface GameCategory {
    id: string;
    title: string;
    subtitle: string;
    games: GameMode[];
}

// Configuration des catégories de jeu
export const gameCategories: GameCategory[] = [
    {
        id: 'events',
        title: 'ÉVÉNEMENTS',
        subtitle: 'Jeux spéciaux pour les occasions particulières',
        games: [
            {
                id: 'quiz-halloween',
                name: 'QUIZ HALLOWEEN 🎃',
                description: 'Testez vos connaissances sur Halloween avec des questions effrayantes !',
                image: require('@/assets/jeux/quiz-halloween.png'),
                colors: [HalloweenTheme.primary, HalloweenTheme.error], // Couleurs Halloween du thème
                borderColor: HalloweenTheme.primary,
                shadowColor: HalloweenTheme.error,
                tags: [{
                    text: 'home.games.quiz-halloween.tags.halloween',
                    color: HalloweenTheme.primary
                }, {
                    text: 'home.games.quiz-halloween.tags.premium',
                    color: '#D81B60'
                }],
                premium: true,
                interactive: 'choice'
            }
        ]
    },
    {
        id: 'nightly_modes',
        title: 'SUGGESTION DE LA SEMAINE',
        subtitle: '',
        games: [
            {
                id: 'trap-answer',
                name: "TRAP ANSWER",
                description: "Un quiz où une mauvaise réponse vous fait perdre des points... Saurez-vous l'éviter ?",
                image: require('@/assets/jeux/trap-answer.png'),
                colors: ["#1A2A5B", "#7B24B1"],
                borderColor: "#2C2C2C",
                shadowColor: "#2C2C2C",
                tags: [{
                    text: 'home.games.trap-answer.tags.free',
                    color: "#8E24AA"
                }],
                premium: false,
                interactive: 'choice'
            },
            {
                id: 'listen-but-don-t-judge',
                name: 'ON ÉCOUTE MAIS ON NE JUGE PAS',
                description: 'Un mode premium pour rigoler tranquillement entre potes.',
                image: require('@/assets/jeux/on-ecoute-mais-on-juge-pas.png'),
                colors: ["rgba(17, 34, 78, 0.8)", "rgba(38, 56, 120, 0.9)"],
                borderColor: "#3B5FD9",
                shadowColor: "#3B5FD9",
                tags: [{
                    text: 'home.games.listen-but-don-t-judge.tags.premium',
                    color: "#D81B60"
                }],
                premium: true,
                interactive: 'write'
            },
            {
                id: 'two-letters-one-word',
                name: '2 LETTRES 1 MOT',
                description: 'Trouvez un mot qui commence par les deux lettres données et correspond au thème.',
                image: require('@/assets/jeux/two-letters-one-word.png'),
                colors: ["rgba(50, 90, 150, 0.8)", "rgba(80, 120, 200, 0.9)"], // Bleu plus clair et visible
                borderColor: "#1a1a2e",
                shadowColor: "#0f3460",
                tags: [{
                    text: 'home.games.two-letters-one-word.tags.new',
                    color: '#2196F3'
                }, {
                    text: 'home.games.two-letters-one-word.tags.premium',
                    color: '#D81B60'
                }],
                premium: true,
                interactive: 'write'
            }
        ]
    },
    {
        id: 'same_room',
        title: 'DANS LA MÊME PIÈCE',
        subtitle: 'À jouer dans la même pièce, ensemble !',
        games: [
            {
                id: 'truth-or-dare',
                name: 'ACTION OU VÉRITÉ',
                description: 'Le classique revisité avec des défis exclusifs.',
                image: require('@/assets/jeux/action-verite.png'),
                colors: ["rgba(50, 90, 150, 0.8)", "rgba(80, 120, 200, 0.9)"],
                borderColor: "#3F51B5",
                shadowColor: "#3F51B5",
                tags: [{
                    text: 'home.games.truth-or-dare.tags.premium',
                    color: '#D81B60'
                }],
                premium: true,
                interactive: 'action'
            },
            {
                id: 'never-have-i-ever-hot',
                name: "JE N'AI JAMAIS 🔞",
                description: 'Questions coquines et déplacées... Prêts à assumer ?',
                image: require('@/assets/jeux/hot.png'),
                colors: ["rgba(90, 10, 50, 0.8)", "rgba(130, 20, 80, 0.9)"],
                borderColor: "#D81B60",
                shadowColor: "#D81B60",
                tags: [{
                    text: 'home.games.never-have-i-ever-hot.tags.premium',
                    color: "#D81B60"
                }],
                premium: true,
                interactive: 'write'
            },
            {
                id: 'word-guessing',
                name: 'DEVINE LE MOT',
                description: 'Faites deviner un mot sans utiliser les mots interdits... Un jeu de mots et de rapidité !',
                image: require('@/assets/jeux/word-guessing.png'),
                colors: ["rgba(40, 90, 120, 0.8)", "rgba(60, 120, 160, 0.9)"],
                borderColor: "#2C7A9C",
                shadowColor: "#2C7A9C",
                tags: [{
                    text: 'home.games.word-guessing.tags.premium',
                    color: "#D81B60"
                }],
                premium: true,
                interactive: 'write'
            }
        ]
    },
    {
        id: 'online',
        title: 'À DISTANCE',
        subtitle: 'Pour jouer même quand on n\'est pas ensemble',
        games: [
            {
                id: 'genius-or-liar',
                name: 'GENIE OU MENTEUR',
                description: 'Un mode ludique où vous devez prouver vos connaissances ou assumer vos gages.',
                image: require('@/assets/jeux/genius-or-liar.png'),
                colors: ["rgba(20, 20, 40, 0.8)", "rgba(40, 40, 80, 0.9)"],
                borderColor: "#212121",
                shadowColor: "#212121",
                tags: [{
                    text: 'home.games.genius-or-liar.tags.premium',
                    color: "#D81B60"
                }],
                premium: true,
                interactive: 'write'
            },
            {
                id: 'the-hidden-village',
                name: "LE VILLAGE CACHÉ",
                description: 'Un jeu de bluff, de stratégie et de discussions... pour ceux qui aiment accuser leurs potes 😈',
                image: require('@/assets/jeux/levillagecache.png'),
                colors: ["rgba(147, 51, 234, 0.8)", "rgba(192, 38, 211, 0.9)"],
                borderColor: "#A855F7",
                shadowColor: "#A855F7",
                tags: [{
                    text: 'home.games.the-hidden-village.tags.premium',
                    color: "#D81B60"
                }],
                premium: true,
                interactive: 'choice'
            },
        ]
    }
];

export default gameCategories;
