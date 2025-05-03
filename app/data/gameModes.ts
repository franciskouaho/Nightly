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
    id: 'insight_modes',
    title: 'INSIGHT MODES',
    subtitle: 'Plusieurs téléphones',
    games: [
      {
        id: 'on-ecoute-mais-on-ne-juge-pas',
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
        id: 'spicy',
        name: 'HOT',
        description: 'Questions coquines et déplacées... Prêts à assumer ?',
        image: require('@/assets/images/vache.png'),
        colors: ["rgba(90, 10, 50, 0.8)", "rgba(130, 20, 80, 0.9)"],
        borderColor: "#D81B60",
        shadowColor: "#D81B60",
        tag: 'PREMIUM',
        tagColor: "#D81B60",
        premium: true,
        interactive: 'write'
      },
      {
        id: 'soit-tu-sais-soit-tu-bois',
        name: 'SOIT TU SAIS SOIT TU BOIS',
        description: 'Un mode ludique avec un niveau de difficulté progressif.',
        image: require('@/assets/images/snake_vs_fox.png'),
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
    id: 'jeu_de_soiree',
    title: 'JEU DE SOIRÉE',
    subtitle: 'Plusieurs téléphones',
    games: [
      {
        id: 'connais-tu-vraiment',
        name: 'CONNAIS-TU VRAIMENT ?',
        description: 'Testez votre connaissance de vos amis.',
        image: require('@/assets/images/cochon.png'),
        colors: ["rgba(80, 20, 100, 0.8)", "rgba(120, 40, 160, 0.9)"],
        borderColor: "#9C27B0",
        shadowColor: "#9C27B0",
        tag: 'NEW !',
        tagColor: "#F06292",
        premium: false,
        interactive: 'choice'
      },
      {
        id: 'blind-test',
        name: 'BLIND TEST',
        description: 'Devinez des titres à partir d\'extraits musicaux.',
        image: require('@/assets/images/taupeTranspa.png'),
        colors: ["rgba(0, 100, 130, 0.8)", "rgba(0, 150, 180, 0.9)"],
        borderColor: "#0097A7",
        shadowColor: "#0097A7",
        tag: 'COMING SOON',
        tagColor: "#F06292",
        premium: true,
        interactive: 'choice'
      }
    ]
  },
  {
    id: 'packs',
    title: 'NOS PACKS LES PLUS JOUÉS',
    subtitle: '',
    games: [
      {
        id: 'action-verite',
        name: 'ACTION OU VÉRITÉ',
        description: 'Le classique revisité avec des défis exclusifs.',
        image: require('@/assets/images/snake_vs_fox.png'),
        colors: ["rgba(50, 90, 150, 0.8)", "rgba(80, 120, 200, 0.9)"],
        borderColor: "#3F51B5",
        shadowColor: "#3F51B5",
        tag: '',
        tagColor: "",
        premium: false,
        interactive: 'action'
      },
      {
        id: 'apero',
        name: 'APÉRO',
        description: 'Pour animer vos soirées entre amis.',
        image: require('@/assets/images/taupeTranspa.png'),
        colors: ["rgba(0, 100, 130, 0.8)", "rgba(0, 150, 180, 0.9)"],
        borderColor: "#0097A7",
        shadowColor: "#0097A7",
        tag: '',
        tagColor: "",
        premium: false,
        interactive: 'choice'
      }
    ]
  }
];

export default gameCategories;
