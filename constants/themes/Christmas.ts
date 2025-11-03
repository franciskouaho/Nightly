// Christmas Theme for Nightly

const tintColor = "#C41E3A"; // Glamour red (deep burgundy)

// Structure compatible with useThemeColor
const christmasTheme = {
  primary: "#C41E3A", // Glamour red (deep burgundy)
  secondary: "#8B1538", // Dark burgundy
  tertiary: "#FFD700", // Gold
  background: "#1A1A2E", // Dark blue night
  backgroundDarker: "#0D0D1A", // Very dark
  backgroundLighter: "#2D223A", // Lighter dark
  card: "#2D223A", // Card background
  text: "#FFFAF0", // Ivory
  textSecondary: "#E8B4B8", // Soft rose
  border: "#C41E3A", // Glamour red border
  success: "#C41E3A", // Glamour red success
  error: "#C41E3A", // Glamour red error
  tint: tintColor,
  tabIconDefault: "#E8B4B8",
  tabIconSelected: tintColor,
  // Properties required by useThemeColor
  foreground: "#FFFAF0", // Ivory
  muted: "#E8B4B8", // Soft rose
  accent: "#FFD700", // Gold
  gradient: {
    christmas: {
      from: "#C41E3A",
      to: "#8B1538",
    },
    snow: {
      from: "#FFFDE7",
      to: "#FFFFFF",
    },
    glamour: {
      from: "#C41E3A",
      to: "#8B1538",
    },
    midnight: {
      from: "#1A1A2E",
      to: "#0D0D1A",
      middle: "#C41E3A",
    },
    festive: {
      from: "#FFFAF0",
      to: "#FFD700",
    },
    elegant: {
      from: "#C41E3A",
      to: "#A01D2E",
    },
    luxury: {
      from: "#1A1A2E",
      to: "#C41E3A",
      middle: "#8B1538",
    },
  },
  // Add specific icons or assets here if needed
};

// Export with the structure expected by useThemeColor
export default {
  light: christmasTheme,
  dark: christmasTheme,
};

