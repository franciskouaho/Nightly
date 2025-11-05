import { GamePhase, GameState } from "@/types/gameTypes";
import {
    doc,
    getDoc,
    getFirestore,
    onSnapshot,
    runTransaction,
    setDoc,
    updateDoc,
} from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";

export function useGame<T extends GameState = GameState>(gameId: string) {
  const [gameState, setGameState] = useState<T | null>(() => {
    // Initialiser avec un état par défaut pour éviter les flashes
    const defaultState: GameState = {
      phase: GamePhase.WAITING,
      currentRound: 0,
      totalRounds: 3,
      targetPlayer: null,
      currentQuestion: null,
      answers: [],
      players: [],
      scores: {},
      theme: "",
      timer: null,

    };
    return defaultState as T;
  });
  const db = getFirestore();

  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = onSnapshot(doc(db, "games", gameId), (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data() as T);
      }
    });

    return () => unsubscribe();
  }, [gameId]);

  const updateGameState = async (newState: Partial<T>) => {
    if (!gameId) {
      console.error("⚠️ updateGameState: gameId manquant");
      throw new Error("Game ID is required");
    }

    try {
      const gameRef = doc(db, "games", gameId);
      const snap = await getDoc(gameRef);

      if (!snap.exists()) {
        console.log("🎮 Création du document de jeu:", gameId);
        await setDoc(gameRef, {
          phase: "LOADING",
          currentRound: 0,
          totalRounds: 3,
          targetPlayer: null,
          currentQuestion: null,
          answers: [],
          players: [],
          scores: {},
          theme: "",
          timer: null,
          questions: [],
          askedQuestionIds: [],
          history: {},
          ...newState,
        });
        console.log("✅ Document de jeu créé avec succès");
      } else {
        // Fusionner les playerAnswers au lieu de les écraser
        const currentData = snap.data() as T;
        const mergedState = { ...newState };

        console.log("🔧 Fusion playerAnswers:", {
          newPlayerAnswers: (newState as any).playerAnswers,
          currentPlayerAnswers: (currentData as any).playerAnswers,
          hasNew: !!(newState as any).playerAnswers,
          hasCurrent: !!(currentData as any).playerAnswers,
        });

        if ((newState as any).playerAnswers !== undefined) {
          // Si playerAnswers est un objet vide {}, on le réinitialise complètement
          if (Object.keys((newState as any).playerAnswers).length === 0) {
            (mergedState as any).playerAnswers = {};
            console.log("🔧 Réinitialisation playerAnswers");
          } else {
            // Sinon, on fusionne normalement
            (mergedState as any).playerAnswers = {
              ...((currentData as any).playerAnswers || {}),
              ...(newState as any).playerAnswers,
            };
            console.log(
              "🔧 Résultat fusion:",
              (mergedState as any).playerAnswers,
            );
          }
        }

        await updateDoc(gameRef, mergedState as { [key: string]: any });
        console.log("✅ État du jeu mis à jour avec succès");
      }
    } catch (error: any) {
      console.error("❌ Erreur lors de la mise à jour du jeu:", {
        gameId,
        error: error.message,
        code: error.code,
        stack: error.stack,
      });

      // Relancer l'erreur pour que l'appelant puisse la gérer
      throw new Error(`Failed to update game state: ${error.message}`);
    }
  };

  // ⚠️ FIX: Fonction spéciale pour mettre à jour playerAnswers avec transaction atomique
  const updatePlayerAnswers = async (userId: string, answer: any) => {
    if (!gameId) {
      console.error("⚠️ updatePlayerAnswers: gameId manquant");
      throw new Error("Game ID is required");
    }

    if (!userId) {
      console.error("⚠️ updatePlayerAnswers: userId manquant");
      throw new Error("User ID is required");
    }

    try {
      const gameRef = doc(db, "games", gameId);

      await runTransaction(db, async (transaction) => {
        const gameSnap = await transaction.get(gameRef);

        if (!gameSnap.exists()) {
          console.error("⚠️ Le document de jeu n'existe pas:", gameId);
          throw new Error("Game document does not exist");
        }

        const currentData = gameSnap.data() as T;
        const currentPlayerAnswers = (currentData as any).playerAnswers || {};

        // Vérifier si le joueur a déjà répondu
        if (currentPlayerAnswers[userId]) {
          console.warn("⚠️ Le joueur a déjà répondu:", userId);
          // Ne pas écraser la réponse existante
          return;
        }

        // Ajouter la nouvelle réponse
        const updatedPlayerAnswers = {
          ...currentPlayerAnswers,
          [userId]: answer,
        };

        console.log("🔧 Transaction playerAnswers:", {
          userId,
          answer,
          currentPlayerAnswers,
          updatedPlayerAnswers,
          totalAnswers: Object.keys(updatedPlayerAnswers).length,
        });

        // Mettre à jour avec la transaction
        transaction.update(gameRef, {
          playerAnswers: updatedPlayerAnswers,
        });
      });

      console.log("✅ Transaction playerAnswers réussie");
    } catch (error: any) {
      console.error("❌ Erreur transaction playerAnswers:", {
        gameId,
        userId,
        error: error.message,
        code: error.code,
        stack: error.stack,
      });

      // Relancer l'erreur pour que l'appelant puisse la gérer
      throw new Error(`Failed to update player answers: ${error.message}`);
    }
  };

  return { gameState, updateGameState, updatePlayerAnswers };
}
