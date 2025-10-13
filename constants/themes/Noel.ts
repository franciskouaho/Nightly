const tintColorNoel = "#E53935";

const NoelTheme = {
  primary: "#E53935", // Rouge vif
  secondary: "#43A047", // Vert sapin
  tertiary: "#FFFFFF", // Blanc neige
  background: "#F8F8F8", // Fond très clair
  backgroundDarker: "#C62828", // Rouge foncé
  backgroundLighter: "#FFFDE7", // Jaune très pâle (lumière)
  card: "#FFFFFF",
  text: "#2E7D32", // Vert foncé
  textSecondary: "#B71C1C", // Rouge foncé
  border: "#BDBDBD",
  success: "#43A047",
  error: "#E53935",
  tint: tintColorNoel,
  tabIconDefault: "#ccc",
  tabIconSelected: tintColorNoel,
  gradient: {
    noel: {
      from: "#E53935", // Rouge
      to: "#43A047", // Vert
      middle: "#FFFDE7", // Lumière dorée
    },
    snow: {
      from: "#FFFDE7", // Jaune pâle
      to: "#FFFFFF", // Blanc
    },
    pine: {
      from: "#43A047", // Vert sapin
      to: "#2E7D32", // Vert foncé
    },
    candy: {
      from: "#E53935", // Rouge
      to: "#FFFDE7", // Blanc
    },
  },
};

export default NoelTheme;
