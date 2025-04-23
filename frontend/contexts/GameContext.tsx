import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { GamePhase, GameState } from '../types/gameTypes';
import gameService from '../services/queries/game';
import SocketService from '../services/socketService';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';
import Toast from '@/components/common/Toast';
import { PhaseManager } from '@/utils/phaseManager';
import axios from 'axios';
import { API_URL } from '../config/axios';
import UserIdManager from '../utils/userIdManager';
import { GameEvent } from '../types/gameTypes';

type GameContextType = {
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  loadGame: (gameId: string) => Promise<void>;
  submitAnswer: (gameId: string, answer: string) => Promise<void>;
  submitVote: (gameId: string, answerId: string) => Promise<void>;
  nextRound: (gameId: string) => Promise<void>;
  setTimer: (timer: { duration: number; startTime: number }) => void;
  forceCheckPhase: (gameId: string) => Promise<boolean>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const determineEffectivePhase = (
  serverPhase: string, 
  isTarget: boolean, 
  hasAnswered: boolean, 
  hasVoted: boolean
): GamePhase => {
  console.log('🎮 Détermination phase:', { serverPhase, isTarget, hasAnswered, hasVoted });

  switch (serverPhase) {
    case 'question':
      return GamePhase.QUESTION;
      
    case 'answer':
      if (isTarget) {
        return GamePhase.WAITING;  
      }
      return hasAnswered ? GamePhase.WAITING : GamePhase.ANSWER;

    case 'vote':
      if (isTarget) {
        return hasVoted ? GamePhase.RESULTS : GamePhase.VOTE;
      }
      return hasAnswered ? GamePhase.VOTE : GamePhase.WAITING_FOR_VOTE;

    case 'results':
      return GamePhase.RESULTS;

    default:
      return GamePhase.WAITING;
  }
};

function gameStateReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'UPDATE_PHASE': {
      const phase = determineEffectivePhase(
        action.serverPhase,
        state.currentUserState?.isTargetPlayer || false,
        state.currentUserState?.hasAnswered || false,
        state.currentUserState?.hasVoted || false
      );
      
      console.log(`🔄 Mise à jour de phase: ${state.phase} → ${phase} (serveur: ${action.serverPhase})`);
      console.log(`👤 État utilisateur: isTarget=${state.currentUserState?.isTargetPlayer}, hasAnswered=${state.currentUserState?.hasAnswered}, hasVoted=${state.currentUserState?.hasVoted}`);
      
      const shouldUpdateTimer = action.timer && 
        (state.phase !== phase || !state.timer || 
        state.timer.startTime !== action.timer.startTime);

      return {
        ...state,
        phase,
        currentPhase: action.serverPhase,
        timer: shouldUpdateTimer ? action.timer : state.timer,
        currentUserState: {
          ...state.currentUserState,
          hasAnswered: action.serverPhase === 'results' ? false : state.currentUserState?.hasAnswered || false,
          hasVoted: action.serverPhase === 'results' ? false : state.currentUserState?.hasVoted || false,
        }
      };
    }
      
    case 'FORCE_REFRESH_GAME': {
      console.log(`🔄 Forçage du rafraîchissement de l'état du jeu`);
      return {
        ...state,
        lastRefreshed: Date.now()
      };
    }
      
    default:
      return state;
  }
}

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ visible: false, message: '', type: 'info' });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ visible: true, message, type });
  };

  const loadGame = async (gameId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log(`🎮 Chargement du jeu ${gameId}...`);
      const gameData = await gameService.getGameState(gameId);

      if (gameData.game.currentPhase === 'answer' && gameData.currentUserState?.isTargetPlayer) {
        console.log('👀 Utilisateur est la cible pendant la phase de réponse');
      }

      const shouldResetState = gameData.game.currentPhase !== gameState?.game?.currentPhase;

      const targetPlayer = gameData.currentQuestion?.targetPlayer 
        ? {
          id: gameData.currentQuestion.targetPlayer.id.toString(),
          name: gameData.currentQuestion.targetPlayer.displayName || gameData.currentQuestion.targetPlayer.username,
          avatar: gameData.currentQuestion.targetPlayer.avatar || null,
        } 
        : null;

      const currentQuestion = gameData.currentQuestion 
        ? {
          id: gameData.currentQuestion.id,
          text: gameData.currentQuestion.text,
          theme: gameData.game.gameMode,
          roundNumber: gameData.currentQuestion.roundNumber,
        }
        : null;

      const effectivePhase = PhaseManager.determineEffectivePhase(
        gameData.game.currentPhase,
        Boolean(gameData.currentUserState?.isTargetPlayer),
        Boolean(gameData.currentUserState?.hasAnswered),
        Boolean(gameData.currentUserState?.hasVoted)
      );

      console.log(`🔄 [GameContext] Transition de phase:
        - Phase serveur: ${gameData.game.currentPhase}
        - Phase effective: ${effectivePhase}
        - isTarget: ${Boolean(gameData.currentUserState?.isTargetPlayer)}
        - hasAnswered: ${Boolean(gameData.currentUserState?.hasAnswered)}
        - hasVoted: ${Boolean(gameData.currentUserState?.hasVoted)}
      `);

      if (effectivePhase === 'unknown' || !effectivePhase) {
        console.warn(`⚠️ [GameContext] Phase invalide détectée: ${effectivePhase}, utilisation de fallback`);
        const fallbackPhase = gameData.game.currentPhase === 'results' 
          ? GamePhase.RESULTS 
          : GamePhase.WAITING;
          
        console.log(`🔄 [GameContext] Utilisation de la phase de secours: ${fallbackPhase}`);
        
        const updatedGameState = {
          ...gameState,
          phase: fallbackPhase,
          currentRound: gameData.game.currentRound || 1,
          totalRounds: gameData.game.totalRounds || 5,
          targetPlayer: targetPlayer,
          currentQuestion: currentQuestion,
          answers: gameData.answers || [],
          players: gameData.players || [],
          scores: gameData.game.scores || {},
          theme: gameData.game.gameMode || 'standard',
          timer: gameData.timer || null,
          currentUserState: {
            ...gameData.currentUserState,
            hasAnswered: shouldResetState ? false : (gameState?.currentUserState?.hasAnswered || false),
            hasVoted: shouldResetState ? false : (gameState?.currentUserState?.hasVoted || false),
            isTargetPlayer: Boolean(gameData.currentUserState?.isTargetPlayer),
          },
          game: gameData.game,
        };

        setGameState(updatedGameState);
      } else {
        const updatedGameState = {
          ...gameState,
          phase: effectivePhase,
          currentRound: gameData.game.currentRound || 1,
          totalRounds: gameData.game.totalRounds || 5,
          targetPlayer: targetPlayer,
          currentQuestion: currentQuestion,
          answers: gameData.answers || [],
          players: gameData.players || [],
          scores: gameData.game.scores || {},
          theme: gameData.game.gameMode || 'standard',
          timer: gameData.timer || null,
          currentUserState: {
            ...gameData.currentUserState,
            hasAnswered: shouldResetState ? false : (gameState?.currentUserState?.hasAnswered || false),
            hasVoted: shouldResetState ? false : (gameState?.currentUserState?.hasVoted || false),
            isTargetPlayer: Boolean(gameData.currentUserState?.isTargetPlayer),
          },
          game: gameData.game,
        };

        setGameState(updatedGameState);
      }

      console.log('✅ GameContext: Jeu chargé avec succès');

      if (gameState.phase === GamePhase.QUESTION && gameState.currentUserState?.hasAnswered) {
        checkGameProgress();
      }

    } catch (error) {
      console.error('❌ GameContext: Erreur lors du chargement du jeu:', error);
      setError('Impossible de charger le jeu');
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (gameId: string, answer: string) => {
    if (!gameState?.currentQuestion?.id) {
      showToast("Question non disponible", "error");
      return;
    }

    setIsSubmitting(true);
    let success = false;

    try {
      console.log('🎮 GameContext: Soumission de réponse...');
      
      if (gameState.currentUserState?.isTargetPlayer) {
        showToast("Vous êtes la cible, vous ne pouvez pas répondre", "error");
        return;
      }

      await gameService.ensureSocketConnection(String(gameState.game.id));
      success = await gameService.submitAnswer(
        String(gameId),
        String(gameState.currentQuestion.id),
        answer
      );

      if (success) {
        setGameState(prev => {
          if (!prev) return prev;
          
          return {
            ...prev,
            currentUserState: {
              ...prev.currentUserState,
              hasAnswered: true
            },
            phase: GamePhase.WAITING,
            currentRound: prev.currentRound || 1,
            totalRounds: prev.totalRounds || 5
          };
        });
        
        showToast("Réponse soumise avec succès", "success");
        
        fetchGameData();
        
        try {
          const { checkPhaseAfterAnswer } = await import('@/utils/socketTester');
          checkPhaseAfterAnswer(String(gameState.game.id)).catch(console.error);
          fetchGameData();
        } catch (error) {
          console.error('❌ Erreur lors de la vérification post-réponse:', error);
        }
      }
    } catch (error) {
      console.error('❌ GameContext: Erreur lors de la soumission:', error);
      showToast("Impossible de soumettre votre réponse. Réessayez.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitVote = async (gameId: string, answerId: string) => {
    if (!gameState?.currentQuestion?.id) {
      setError('Question non disponible');
      return;
    }

    try {
      console.log('🎮 GameContext: Soumission du vote...');
      setIsSubmitting(true);
      
      showToast("Envoi de votre vote en cours...", "info");
      
      await gameService.submitVote(String(gameState.game.id), answerId);
      
      setGameState(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          currentUserState: {
            ...prev.currentUserState,
            hasVoted: true,
          },
          phase: GamePhase.WAITING,
          currentRound: prev.currentRound || 1,
          totalRounds: prev.totalRounds || 5
        };
      });
      
      showToast("Vote enregistré avec succès", "success");
      console.log('✅ GameContext: Vote soumis avec succès');
      
      fetchGameData();
    } catch (error) {
      console.error('❌ GameContext: Erreur lors de la soumission du vote:', error);
      setError('Erreur lors de la soumission du vote');
      showToast("Impossible d'enregistrer votre vote. Veuillez réessayer.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextRound = async (gameId: string) => {
    try {
      console.log("🎮 Tentative de passage au tour suivant...");
      setIsSubmitting(true);
      
      try {
        await gameService.nextRound(String(gameState.game.id));
        
        console.log("✅ Passage au tour suivant initié avec succès via HTTP");
        showToast("Tour suivant initié avec succès", "success");
        
        fetchGameData();
      } catch (error) {
        console.error("❌ Erreur lors du passage au tour suivant:", error);
        
        try {
          console.log("🔄 Nouvelle tentative via méthode alternative...");
          const userId = await UserIdManager.getUserId();
          
          const response = await axios.post(`${API_URL}/games/${String(gameState.game.id)}/next-round`, {
            user_id: userId,
            force_advance: true,
            retry: true
          }, {
            headers: { 'X-Emergency': 'true' }
          });
          
          if (response.data?.status === 'success') {
            console.log("✅ Passage au tour suivant réussi via méthode alternative");
            showToast("Tour suivant initié avec succès", "success");
            fetchGameData();
          } else {
            throw new Error("Échec de la tentative alternative");
          }
        } catch (retryError) {
          console.error("❌ Échec complet:", retryError);
          showToast("Impossible de passer au tour suivant", "error");
          Alert.alert(
            "Erreur",
            "Le passage au tour suivant a échoué. Veuillez réessayer.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (outerError) {
      console.error("❌ Erreur externe:", outerError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setTimer = (timer: { duration: number; startTime: number }) => {
    setGameState(prevState => {
      if (!prevState) return prevState;
      
      return {
        ...prevState,
        timer,
        currentRound: prevState.currentRound || 1,
        totalRounds: prevState.totalRounds || 5,
        phase: prevState.phase
      };
    });
  };

  useEffect(() => {
    if (!gameState?.game?.id) return;

    console.log(`🎮 Mise en place des écouteurs WebSocket pour le jeu ${gameState.game.id}...`);

    const setupSocketConnection = async () => {
      try {
        await gameService.ensureSocketConnection(String(gameState.game.id));
        
        const socket = await SocketService.getInstanceAsync();
        
        const handleGameUpdate = (data: GameEvent) => {
          console.log(`🎮 Mise à jour du jeu reçue:`, data.type);
          
          switch (data.type) {
            case 'phase_change':
              console.log(`🔄 Changement de phase: ${data.phase}`);
              
              if (data.phase === 'vote') {
                const userId = user?.id;
                const targetId = data.targetPlayerId;
                
                console.log(`🎯 Phase vote - Vérification cible: userId=${userId}, targetId=${targetId}`);
                
                const isUserTarget = userId && targetId && String(userId) === String(targetId);
                
                if (isUserTarget) {
                  console.log(`🎯 DÉTECTION CIBLE: L'utilisateur ${userId} est bien la cible du vote`);
                  
                  setGameState(prevState => {
                    if (!prevState) return prevState;
                    
                    console.log(`🔄 Transition forcée vers la phase VOTE pour la cible`);
                    
                    return {
                      ...prevState,
                      phase: GamePhase.VOTE,
                      game: {
                        ...prevState.game,
                        currentPhase: 'vote'
                      },
                      timer: data.timer || prevState.timer,
                      currentUserState: {
                        ...prevState.currentUserState,
                        isTargetPlayer: true,
                        hasVoted: false
                      }
                    };
                  });
                  
                  setTimeout(() => {
                    loadGame(String(gameState.game.id));
                  }, 500);
                  
                  return;
                }
              }
              
              setGameState(prevState => {
                if (!prevState) return prevState;
                
                if (data.phase === 'vote' && data.targetPlayerId && user?.id) {
                  const isTarget = String(data.targetPlayerId) === String(user.id);
                  if (isTarget) {
                    console.log("🎯 Utilisateur cible détecté, passage direct en phase de vote");
                    loadGame(String(gameState.game.id));
                    return {
                      ...prevState,
                      phase: GamePhase.VOTE,
                      game: {
                        ...prevState.game,
                        currentPhase: data.phase
                      },
                      timer: data.timer || prevState.timer,
                      currentUserState: {
                        ...prevState.currentUserState,
                        isTargetPlayer: true,
                        hasVoted: false
                      }
                    };
                  }
                }
                
                const effectivePhase = determineEffectivePhase(
                  data.phase,
                  prevState.currentUserState?.isTargetPlayer || false,
                  prevState.currentUserState?.hasAnswered || false,
                  prevState.currentUserState?.hasVoted || false
                );
                
                return {
                  ...prevState,
                  phase: effectivePhase,
                  game: {
                    ...prevState.game,
                    currentPhase: data.phase
                  },
                  timer: data.timer || prevState.timer
                };
              });
              
              if (data.phase === 'answer' && data.targetPlayerId && user?.id && 
                  String(data.targetPlayerId) === String(user.id)) {
                console.log("🎯 Cible détectée en phase answer, préparation pour phase vote...");
                setTimeout(async () => {
                  const needTransition = await gameService.forceVotePhaseForTarget(String(gameState.game.id));
                  if (needTransition) {
                    console.log("🎯 Transition vers phase vote forcée pour la cible");
                    loadGame(String(gameState.game.id));
                  }
                }, 1500);
              }
              
              loadGame(String(gameState.game.id));
              break;
            
            case 'target_player_vote':
              const userId = user?.id;
              console.log(`🎯 Notification de vote pour joueur cible reçue. UserId: ${userId}, TargetId: ${data.targetPlayerId}`);
              
              const isTarget = userId && data.targetPlayerId && String(userId) === String(data.targetPlayerId);
              
              if (isTarget) {
                console.log("✅ Utilisateur formellement identifié comme CIBLE, transition IMMÉDIATE vers écran de vote");
                
                setGameState(prevState => {
                  if (!prevState) return prevState;
                  
                  const updatedAnswers = data.answers || prevState.answers;
                  
                  return {
                    ...prevState,
                    phase: GamePhase.VOTE,
                    answers: updatedAnswers,
                    currentUserState: {
                      ...prevState.currentUserState,
                      isTargetPlayer: true,
                      hasVoted: false
                    }
                  };
                });
                
                setTimeout(() => loadGame(String(gameState.game.id)), 300);
              } else {
                console.log("🕒 Joueur standard: attente pendant que la cible vote");
                setGameState(prevState => {
                  if (!prevState) return prevState;
                  
                  return {
                    ...prevState,
                    phase: GamePhase.WAITING_FOR_VOTE,
                    currentUserState: {
                      ...prevState.currentUserState,
                      isTargetPlayer: false
                    }
                  };
                });
              }
              break;
              
            case 'new_answer':
              loadGame(String(gameState.game.id));
              break;
              
            case 'new_vote':
              console.log(`🗳️ Nouveau vote détecté, vérification des transitions possibles`);
              
              // Vérifier automatiquement si tous les joueurs ont voté
              setTimeout(async () => {
                try {
                  const gameData = await gameService.getGameState(String(gameState.game.id));
                  
                  if (gameData.allPlayersVoted) {
                    console.log(`🎯 Tous les votes sont enregistrés (y compris la cible), transition vers résultats`);
                    
                    // Forcer la transition vers la phase résultats
                    const transitionSuccess = await gameService.forcePhaseTransition(String(gameState.game.id), 'results');
                    
                    if (transitionSuccess) {
                      console.log(`✅ Transition vers résultats réussie après votes`);
                      loadGame(String(gameState.game.id));
                    } else {
                      console.warn(`⚠️ Échec de la transition automatique, tentative alternative...`);
                      // Tenter une mise à jour d'état locale en attendant la synchronisation
                      setGameState(prevState => {
                        if (!prevState) return prevState;
                        
                        return {
                          ...prevState,
                          phase: GamePhase.RESULTS,
                          currentRound: prevState.currentRound || 1,
                          totalRounds: prevState.totalRounds || 5,
                          game: {
                            ...prevState.game,
                            currentPhase: 'results'
                          }
                        };
                      });
                    }
                  } else {
                    loadGame(String(gameState.game.id)); // Rafraîchir les données sans forcer la transition
                  }
                } catch (error) {
                  console.error(`❌ Erreur lors de la vérification post-vote:`, error);
                  loadGame(String(gameState.game.id)); // Rafraîchir quand même les données en cas d'erreur
                }
              }, 1000);
              break;
              
            case 'new_round':
              console.log(`🎮 Nouveau tour: ${data.round}`);
              setGameState(prevState => {
                if (!prevState) return prevState;
                
                return {
                  ...prevState,
                  phase: GamePhase.QUESTION,
                  currentRound: data.round,
                  currentQuestion: data.question ? {
                    id: data.question.id,
                    text: data.question.text,
                    theme: prevState.theme,
                    roundNumber: data.round
                  } : prevState.currentQuestion,
                  targetPlayer: data.question?.targetPlayer ? {
                    id: String(data.question.targetPlayer.id),
                    name: data.question.targetPlayer.displayName || data.question.targetPlayer.username,
                    avatar: data.question.targetPlayer.avatar || null
                  } : prevState.targetPlayer,
                  timer: data.timer || prevState.timer,
                  currentUserState: {
                    ...prevState.currentUserState,
                    hasAnswered: false,
                    hasVoted: false,
                    isTargetPlayer: prevState.currentUserState?.isTargetPlayer && 
                      data.question?.targetPlayer ? 
                      String(data.question.targetPlayer.id) === String(user?.id) : 
                      prevState.currentUserState?.isTargetPlayer
                  }
                };
              });
              
              loadGame(String(gameState.game.id));
              break;
          }
        };
        
        socket.on('game:update', handleGameUpdate);
        
        return () => {
          socket.off('game:update', handleGameUpdate);
          console.log(`🔇 Écouteurs WebSocket nettoyés pour le jeu ${gameState.game.id}`);
        };
      } catch (error) {
        console.error('❌ Erreur lors de la mise en place de la connexion WebSocket:', error);
      }
    };
    
    const cleanup = setupSocketConnection();
    
    return () => {
      cleanup && typeof cleanup === 'function' && cleanup();
    };
  }, [gameState?.game?.id, user]);

  const forceCheckPhase = async (gameId: string) => {
    try {
      console.log(`🔄 Tentative de vérification forcée de phase pour le jeu ${gameId}`);
      
      // Récupérer l'état actuel du jeu pour analyse
      const currentGameState = await gameService.getGameState(gameId);
      const currentPhase = currentGameState?.game?.currentPhase;
      const userId = user?.id;
      const targetId = currentGameState?.currentQuestion?.targetPlayer?.id;
      
      // Vérifier si l'utilisateur est la cible et si nous sommes en phase de vote
      const isUserTarget = targetId && userId && String(targetId) === String(userId);
      
      console.log(`🔍 Vérification de phase - Phase: ${currentPhase}, UserId: ${userId}, TargetId: ${targetId}, isTarget: ${isUserTarget}`);
      
      // Si l'utilisateur est la cible et en phase vote, mais n'a pas l'écran de vote
      if (isUserTarget && currentPhase === 'vote' && currentGameState?.phase !== GamePhase.VOTE) {
        console.log(`🎯 Correction: l'utilisateur est la cible mais n'a pas l'écran de vote`);
        
        // Forcer la mise à jour de l'état pour afficher l'écran de vote
        setGameState(prevState => {
          if (!prevState) return prevState;
          
          return {
            ...prevState,
            phase: GamePhase.VOTE,
            currentRound: prevState.currentRound || 1,
            totalRounds: prevState.totalRounds || 5,
            currentUserState: {
              ...prevState?.currentUserState,
              isTargetPlayer: true,
              hasVoted: false
            }
          };
        });
        
        // Attendre un court instant et recharger les données complètes
        setTimeout(() => loadGame(String(gameState.game.id)), 300);
        
        return true;
      }
      
      // Si tous les joueurs ont voté mais on n'est pas encore en phase résultats
      if (currentPhase === 'vote' && currentGameState?.allPlayersVoted) {
        console.log(`🏁 Tous les joueurs ont voté, transition vers les résultats`);
        
        try {
          // Forcer la transition vers la phase résultats
          const success = await gameService.forcePhaseTransition(String(gameState.game.id), 'results');
          if (success) {
            console.log(`✅ Transition vers résultats forcée avec succès`);
            loadGame(String(gameState.game.id));
            return true;
          }
        } catch (error) {
          console.error(`❌ Erreur lors de la transition vers résultats:`, error);
        }
      }
      
      // Méthode standard de vérification de phase
      await SocketService.forcePhaseCheck(gameId);
      loadGame(String(gameState.game.id));
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification forcée de phase:', error);
      return false;
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        isLoading,
        error,
        loadGame,
        submitAnswer,
        submitVote,
        nextRound,
        setTimer,
        forceCheckPhase
      }}
    >
      {children}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      )}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
