/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import Colors from "@/constants/Colors";
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // Vérification de sécurité pour éviter les erreurs
    const themeColors = Colors[theme];
    if (themeColors && themeColors[colorName]) {
      const color = themeColors[colorName];
      // Ensure we return a string color, not a gradient object
      if (typeof color === 'string') {
        return color;
      } else if (typeof color === 'object' && color !== null) {
        // If it's a gradient object, return the primary color instead
        return themeColors?.primary || '#C41E3A';
      }
      return color;
    }
    // Fallback vers une couleur par défaut
    return themeColors?.primary || '#C41E3A';
  }
}
