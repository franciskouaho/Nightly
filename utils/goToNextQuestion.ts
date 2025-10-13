import { doc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebase";


export async function goToNextQuestion(gameId: string, gameState: any, newQuestion: any) {
  const ref = doc(db, "games", gameId);

  console.log("[goToNextQuestion] Appelée avec:", {
    gameId,
    currentRound: gameState.currentRound,
    totalRounds: gameState.totalRounds,
    newQuestion,
    gameState,
  });

  const nextRound = gameState.currentRound + 1;
  console.log(`[goToNextQuestion] Calcul nextRound: ${nextRound}`);

  if (nextRound > gameState.totalRounds) {
    // Fin de partie atteinte, ne pas aller plus loin
    console.log(`[goToNextQuestion] Fin de partie atteinte: round ${nextRound} / ${gameState.totalRounds}`);
    return;
  }

  const nextRoundState = {
    ...gameState,
    currentRound: nextRound,
    currentQuestion: newQuestion,
    playerAnswers: {},
    _allAnswered: false,
  };

  console.log("[goToNextQuestion] Mise à jour du gameState avec:", nextRoundState);

  await setDoc(ref, nextRoundState, { merge: false });

  console.log(`[goToNextQuestion] setDoc terminé pour round ${nextRound}`);
}
