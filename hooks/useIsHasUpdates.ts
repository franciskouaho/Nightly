import { useEffect } from "react";
import * as Updates from "expo-updates";

// Ce hook est optionnel si "checkAutomatically": "ON_LOAD" est déjà configuré dans app.json
export function useIsHasUpdates(): void {
  useEffect(() => {
    async function update(): Promise<void> {
      try {
        const { isAvailable } = await Updates.checkForUpdateAsync();
        if (isAvailable) {
          await Updates.fetchUpdateAsync();
        }
      } catch {
        console.error("Erreur lors de la vérification des mises à jour");
      }
    }
    if (!__DEV__) {
      update();
    }
  }, []);
} 