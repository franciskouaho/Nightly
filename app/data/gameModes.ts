// Définition des interfaces
import HalloweenTheme from "@/constants/themes/Halloween";

export interface GameMode {
  id: string;
  nameKey?: string; // Clé de traduction pour le nom
  name?: string; // Fallback si pas de clé
  descriptionKey?: string; // Clé de traduction pour la description
  description?: string; // Fallback si pas de clé
  image: any;
  colors: string[];
  borderColor: string;
  shadowColor: string;
  tags: Array<{
    text: string;
    color: string;
  }>;
  premium: boolean;
  interactive?: "write" | "choice" | "action";
  fontFamily?: string;
  comingSoon?: boolean;
  isNew?: boolean;
}

export interface GameCategory {
  id: string;
  title: string;
  subtitle: string;
  games: GameMode[];
  cta?: {
    mainText: string;
    subText?: string;
  };
  icon?: string;
  categoryType: "free" | "premium" | "seasonal";
  dominantColor?: string;
}

export const gameCategories: GameCategory[] = [
  // SECTION 1 : Premiers pas – Accroche & découverte
  {
    id: "free_games",
    title: "PREMIERS PAS",
    subtitle: "Pour découvrir Nightly",
    categoryType: "free",
    dominantColor: "#4CAF50",
    icon: "🎲",
    cta: {
      mainText: "Commence ton aventure",
      subText: "Débloque tous les jeux",
    },
    games: [
      {
        id: "truth-or-dare",
        nameKey: "home.games.truth-or-dare.name",
        descriptionKey: "home.games.truth-or-dare.description",
        image: require("@/assets/jeux/action-verite.png"),
        colors: ["rgba(50, 90, 150, 0.8)", "rgba(80, 120, 200, 0.9)"],
        borderColor: "#3F51B5",
        shadowColor: "#3F51B5",
        fontFamily: "Righteous-Regular",
        tags: [
          {
            text: "home.games.truth-or-dare.tags.gratuit",
            color: "#4CAF50",
          },
          {
            text: "home.games.truth-or-dare.tags.fun",
            color: "#FFC107",
          },
          {
            text: "home.games.truth-or-dare.tags.porte_entree",
            color: "#2196F3",
          },
        ],
        premium: false,
        interactive: "action",
      },
      {
        id: "trap-answer",
        nameKey: "home.games.trap-answer.name",
        descriptionKey: "home.games.trap-answer.description",
        image: require("@/assets/jeux/trap-answer.png"),
        colors: ["#1A2A5B", "#7B24B1"],
        borderColor: "#2C2C2C",
        shadowColor: "#2C2C2C",
        fontFamily: "SigmarOne-Regular",
        tags: [
          {
            text: "home.games.trap-answer.tags.gratuit",
            color: "#4CAF50",
          },
          {
            text: "home.games.trap-answer.tags.quiz",
            color: "#8E24AA",
          },
          {
            text: "home.games.trap-answer.tags.logique",
            color: "#9C27B0",
          },
          {
            text: "home.games.trap-answer.tags.fun",
            color: "#FFC107",
          },
        ],
        premium: false,
        interactive: "choice",
      },
    ],
  },
  // SECTION 2 : Soirées entre potes (Premium)
  {
    id: "soirees",
    title: "SOIRÉES ENTRE POTES",
    subtitle: "Le cœur de Nightly",
    categoryType: "premium",
    dominantColor: "#FF9800",
    icon: "🍻",
    cta: {
      mainText: "Pour des soirées encore plus folles",
      subText: "Débloque le pack Soirée Premium",
    },
    games: [
      {
        id: "listen-but-don-t-judge",
        nameKey: "home.games.listen-but-don-t-judge.name",
        descriptionKey: "home.games.listen-but-don-t-judge.description",
        image: require("@/assets/jeux/listen-but-don-t-judge.png"),
        colors: ["rgba(17, 34, 78, 0.8)", "rgba(38, 56, 120, 0.9)"],
        borderColor: "#3B5FD9",
        shadowColor: "#3B5FD9",
        fontFamily: "PermanentMarker-Regular",
        tags: [
          {
            text: "home.games.listen-but-don-t-judge.tags.soiree",
            color: "#FF9800",
          },
          {
            text: "home.games.listen-but-don-t-judge.tags.histoire",
            color: "#3B5FD9",
          },
          {
            text: "home.games.listen-but-don-t-judge.tags.humour",
            color: "#FFC107",
          },
          {
            text: "home.games.listen-but-don-t-judge.tags.premium",
            color: "#D81B60",
          },
        ],
        premium: true,
        interactive: "write",
      },
      {
        id: "pile-ou-face",
        nameKey: "home.games.pile-ou-face.name",
        descriptionKey: "home.games.pile-ou-face.description",
        image: require("@/assets/jeux/pile-ou-face.png"),
        colors: ["rgba(100, 50, 150, 0.8)", "rgba(150, 100, 200, 0.9)"],
        borderColor: "#6432A0",
        shadowColor: "#6432A0",
        fontFamily: "Righteous-Regular",
        isNew: true, // 🆕 Nouveau jeu !
        tags: [
          {
            text: "home.games.pile-ou-face.tags.soiree",
            color: "#FF9800",
          },
          {
            text: "home.games.pile-ou-face.tags.hasard",
            color: "#FFC107",
          },
          {
            text: "home.games.pile-ou-face.tags.fun",
            color: "#4CAF50",
          },
          {
            text: "home.games.pile-ou-face.tags.revelations",
            color: "#F44336",
          },
        ],
        premium: false,
        interactive: "choice",
      },
    ],
  },
  // SECTION 3 : Événements & saisonniers
  {
    id: "events",
    title: "ÉVÉNEMENTS & SAISONNIERS",
    subtitle: "Édition limitée – disponible seulement quelques semaines !",
    categoryType: "seasonal",
    dominantColor: "#C41E3A",
    icon: "🎃",
    games: [
      {
        id: "quiz-halloween",
        nameKey: "home.games.quiz-halloween.name",
        descriptionKey: "home.games.quiz-halloween.description",
        image: require("@/assets/jeux/quiz-halloween.png"),
        colors: [
          HalloweenTheme.light?.primary || "#C41E3A",
          HalloweenTheme.light?.error || "#C41E3A",
        ],
        borderColor: HalloweenTheme.light?.primary || "#C41E3A",
        shadowColor: HalloweenTheme.light?.error || "#C41E3A",
        fontFamily: "Creepster-Regular",
        tags: [
          {
            text: "home.games.quiz-halloween.tags.saisonnier",
            color: HalloweenTheme.light?.primary || "#C41E3A",
          },
          {
            text: "home.games.quiz-halloween.tags.halloween",
            color: "#8B0000",
          },
          {
            text: "home.games.quiz-halloween.tags.exclu",
            color: "#C41E3A",
          },
          {
            text: "home.games.quiz-halloween.tags.premium",
            color: "#D81B60",
          },
        ],
        premium: true,
        interactive: "choice",
      },
      {
        id: "blindtest-generations",
        nameKey: "home.games.blindtest-generations.name",
        descriptionKey: "home.games.blindtest-generations.description",
        image: require("@/assets/jeux/blindtest-generations.png"),
        colors: ["#C41E3A", "#165B33"], // Rouge et vert de Noël
        borderColor: "#C41E3A",
        shadowColor: "#165B33",
        fontFamily: "Righteous-Regular",
        isNew: false,
        tags: [
          {
            text: "home.games.blindtest-generations.tags.saisonnier",
            color: "#C41E3A",
          },
          {
            text: "home.games.blindtest-generations.tags.noel",
            color: "#165B33",
          },
          {
            text: "home.games.blindtest-generations.tags.famille",
            color: "#FFD700",
          },
          {
            text: "home.games.blindtest-generations.tags.new",
            color: "#FF4757",
          },
        ],
        premium: true,
        interactive: "choice",
      },
    ],
  },
  // SECTION 4 : Couple 💋 (Premium)
  {
    id: "couple",
    title: "COUPLE",
    subtitle: "Faire rêver et convertir",
    categoryType: "premium",
    dominantColor: "#E91E63",
    icon: "💋",
    cta: {
      mainText: "Envie de pimenter vos soirées à deux ?",
      subText: "Débloque le pack Couple",
    },
    games: [
      {
        id: "double-dare",
        nameKey: "home.games.double-dare.name",
        descriptionKey: "home.games.double-dare.description",
        image: require("@/assets/jeux/double-dare.png"),
        colors: ["rgba(74, 26, 102, 0.9)", "rgba(123, 44, 191, 0.9)"],
        borderColor: "#4A1A66",
        shadowColor: "#7B2CBF",
        fontFamily: "RubikMoonrocks-Regular",
        tags: [
          {
            text: "home.games.double-dare.tags.couple",
            color: "#E91E63",
          },
          {
            text: "home.games.double-dare.tags.defis",
            color: "#7B2CBF",
          },
          {
            text: "home.games.double-dare.tags.extreme",
            color: "#FF6B35",
          },
          {
            text: "home.games.double-dare.tags.premium",
            color: "#D81B60",
          },
        ],
        premium: true,
        interactive: "action",
      },
      {
        id: "forbidden-desire",
        nameKey: "home.games.forbidden-desire.name",
        descriptionKey: "home.games.forbidden-desire.description",
        image: require("@/assets/jeux/forbidden-desire.png"),
        colors: ["rgba(139, 0, 0, 0.9)", "rgba(220, 20, 60, 0.9)"],
        borderColor: "#8B0000",
        shadowColor: "#DC143C",
        fontFamily: "Lobster-Regular",
        tags: [
          {
            text: "home.games.forbidden-desire.tags.couple",
            color: "#E91E63",
          },
          {
            text: "home.games.forbidden-desire.tags.extreme",
            color: "#8B0000",
          },
          {
            text: "home.games.forbidden-desire.tags.revelations",
            color: "#FF1744",
          },
          {
            text: "home.games.forbidden-desire.tags.premium",
            color: "#D81B60",
          },
        ],
        premium: true,
        interactive: "action",
      },
      {
        id: "never-have-i-ever-hot",
        nameKey: "home.games.never-have-i-ever-hot.name",
        descriptionKey: "home.games.never-have-i-ever-hot.description",
        image: require("@/assets/jeux/never-have-i-ever-hot.png"),
        colors: ["rgba(90, 10, 50, 0.8)", "rgba(130, 20, 80, 0.9)"],
        borderColor: "#D81B60",
        shadowColor: "#D81B60",
        fontFamily: "Pacifico-Regular",
        tags: [
          {
            text: "home.games.never-have-i-ever-hot.tags.couple",
            color: "#E91E63",
          },
          {
            text: "home.games.never-have-i-ever-hot.tags.spicy",
            color: "#F44336",
          },
          {
            text: "home.games.never-have-i-ever-hot.tags.premium",
            color: "#D81B60",
          },
        ],
        premium: true,
        interactive: "write",
      },
      {
        id: "never-have-i-ever-classic",
        nameKey: "home.games.never-have-i-ever-classic.name",
        descriptionKey: "home.games.never-have-i-ever-classic.description",
        image: require("@/assets/jeux/never-have-i-ever-classic.png"),
        colors: ["rgba(255, 152, 0, 0.8)", "rgba(255, 193, 7, 0.9)"],
        borderColor: "#FF9800",
        shadowColor: "#FF9800",
        fontFamily: "RockSalt-Regular",
        tags: [
          {
            text: "home.games.never-have-i-ever-classic.tags.couple",
            color: "#E91E63",
          },
          {
            text: "home.games.never-have-i-ever-classic.tags.drole",
            color: "#FFC107",
          },
          {
            text: "home.games.never-have-i-ever-classic.tags.gages",
            color: "#F44336",
          },
          {
            text: "home.games.never-have-i-ever-classic.tags.premium",
            color: "#D81B60",
          },
        ],
        premium: true,
        interactive: "write",
        comingSoon: true, // ⚠️ FIX: Jeu bientôt disponible
      },
      {
        id: "dare-or-strip",
        nameKey: "home.games.dare-or-strip.name",
        descriptionKey: "home.games.dare-or-strip.description",
        image: require("@/assets/jeux/dare-or-strip.png"), // Utilise l'image existante pour l'instant
        colors: ["#6B46C1", "#F472B6"],
        borderColor: "#6B46C1",
        shadowColor: "#F472B6",
        fontFamily: "Pacifico-Regular",
        tags: [
          {
            text: "home.games.dare-or-strip.tags.couple",
            color: "#E91E63",
          },
          {
            text: "home.games.dare-or-strip.tags.18plus",
            color: "#F472B6",
          },
          {
            text: "home.games.dare-or-strip.tags.premium",
            color: "#D81B60",
          },
        ],
        premium: true,
        interactive: "action",
      },
    ],
  },
  // SECTION 5 : À distance (Premium)
  {
    id: "distance",
    title: "À DISTANCE",
    subtitle: "Même à distance, la soirée continue",
    categoryType: "premium",
    dominantColor: "#2196F3",
    icon: "🌍",
    games: [
      {
        id: "genius-or-liar",
        nameKey: "home.games.genius-or-liar.name",
        descriptionKey: "home.games.genius-or-liar.description",
        image: require("@/assets/jeux/genius-or-liar.png"),
        colors: ["rgba(20, 20, 40, 0.8)", "rgba(40, 40, 80, 0.9)"],
        borderColor: "#212121",
        shadowColor: "#212121",
        fontFamily: "Tourney-Regular",
        tags: [
          {
            text: "home.games.genius-or-liar.tags.distance",
            color: "#2196F3",
          },
          {
            text: "home.games.genius-or-liar.tags.bluff",
            color: "#9C27B0",
          },
          {
            text: "home.games.genius-or-liar.tags.fun",
            color: "#FFC107",
          },
          {
            text: "home.games.genius-or-liar.tags.premium",
            color: "#D81B60",
          },
        ],
        premium: true,
        interactive: "write",
      },
      {
        id: "word-guessing",
        nameKey: "home.games.word-guessing.name",
        descriptionKey: "home.games.word-guessing.description",
        image: require("@/assets/jeux/word-guessing.png"),
        colors: ["rgba(40, 90, 120, 0.8)", "rgba(60, 120, 160, 0.9)"],
        borderColor: "#2C7A9C",
        shadowColor: "#2C7A9C",
        fontFamily: "Bangers-Regular",
        tags: [
          {
            text: "home.games.word-guessing.tags.distance",
            color: "#2196F3",
          },
          {
            text: "home.games.word-guessing.tags.rapidite",
            color: "#FF5722",
          },
          {
            text: "home.games.word-guessing.tags.creatif",
            color: "#9C27B0",
          },
          {
            text: "home.games.word-guessing.tags.premium",
            color: "#D81B60",
          },
        ],
        premium: true,
        interactive: "write",
      },
    ],
  },
];

export default gameCategories;
