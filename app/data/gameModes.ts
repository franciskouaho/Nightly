// Définition des interfaces
export interface GameMode {
  id: string;
  name: string;
  description: string;
  image: any;
  colors: string[];
  borderColor: string;
  shadowColor: string;
  tag: string;
  tagColor: string;
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
    id: 'nightly_modes',
    title: 'NIGHTLY MODES',
    subtitle: 'Plusieurs téléphones',
    games: [
      {
        id: 'listen-but-don-t-judge',
        name: 'ON ÉCOUTE MAIS ON NE JUGE PAS',
        description: 'Un mode gratuit pour rigoler tranquillement entre potes.',
        image: require('@/assets/jeux/on-ecoute-mais-on-juge-pas.png'),
        colors: ["rgba(17, 34, 78, 0.8)", "rgba(38, 56, 120, 0.9)"],
        borderColor: "#3B5FD9",
        shadowColor: "#3B5FD9",
        tag: 'GRATUIT',
        tagColor: "#8E24AA",
        premium: false,
        interactive: 'write'
      },
      {
        id: 'never-have-i-ever-hot',
        name: 'Je n’ai jamais 🔞',
        description: 'Questions coquines et déplacées... Prêts à assumer ?',
        image: require('@/assets/jeux/hot.png'),
        colors: ["rgba(90, 10, 50, 0.8)", "rgba(130, 20, 80, 0.9)"],
        borderColor: "#D81B60",
        shadowColor: "#D81B60",
        tag: 'PREMIUM',
        tagColor: "#D81B60",
        premium: true,
        interactive: 'write'
      },
    ]
  },
  {
    id: 'jeu_de_soiree',
    title: 'JEU DE SOIRÉE',
    subtitle: 'Plusieurs téléphones',
    games: [
      {
        id: 'genius-or-liar',
        name: 'GENIE OU MENTEUR',
        description: 'Un mode ludique où vous devez prouver vos connaissances ou assumer vos gages.',
        image: require('@/assets/jeux/genius-or-liar.png'),
        colors: ["rgba(20, 20, 40, 0.8)", "rgba(40, 40, 80, 0.9)"],
        borderColor: "#212121",
        shadowColor: "#212121",
        tag: 'PREMIUM',
        tagColor: "#D81B60",
        premium: true,
        interactive: 'write'
      },
    ]
  },
  {
    id: 'packs',
    title: 'NOS PACKS LES PLUS JOUÉS',
    subtitle: '',
    games: [
      {
        id: 'truth-or-dare',
        name: 'ACTION OU VÉRITÉ',
        description: 'Le classique revisité avec des défis exclusifs.',
        image: require('@/assets/jeux/action-verite.png'),
        colors: ["rgba(50, 90, 150, 0.8)", "rgba(80, 120, 200, 0.9)"],
        borderColor: "#3F51B5",
        shadowColor: "#3F51B5",
        tag: '',
        tagColor: "",
        premium: false,
        interactive: 'action'
      },
    ]
  }
];

export default gameCategories;
