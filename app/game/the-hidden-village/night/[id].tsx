import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Animated, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getFirestore, doc, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import VillageTable from '@/components/VillageTable';
import * as ScreenOrientation from 'expo-screen-orientation';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  isAlive?: boolean;
}

export default function NightScreen() {
  const { t } = useTranslation();
  const { id: gameId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [myRole, setMyRole] = useState<string | null>(null);
  const [actionDone, setActionDone] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync && ScreenOrientation.unlockAsync();
    };
  }, []);

  useEffect(() => {
    if (!gameId || !user) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(gameId));
    
    const unsubscribe = onSnapshot(gameRef, async (doc) => {
      if (!doc.exists) return;
      const data = doc.data();
      if (!data) return;
      // Redirection fin de partie
      if (data.status === 'ended') {
        router.replace(`/game/the-hidden-village/end/${gameId}`);
        return;
      }
      setGame(data);

      // Trouver mon rôle
      const me = data.players?.find((p: Player) => String(p.id) === String(user.uid));
      if (me) {
        setMyRole(me.role);
      }

      // Redirection si la phase change
      if (data.phase === 'day') {
        router.replace(`/game/the-hidden-village/day/${gameId}`);
      }
      
      setLoading(false);

      // --- Logique tour par tour fidèle au jeu de société (corrigée) ---
      if (data.host && String(data.host) === String(user.uid) && data.phase === 'night') {
        const rolesOrder = ['traitor', 'protector', 'medium'];
        const actions = data.nightActions || {};
        const players = data.players || [];
        // Initialisation du nightTurn si absent
        if (!data.nightTurn) {
          // Cherche le premier rôle présent
          let firstTurn = null;
          for (const role of rolesOrder) {
            if (players.some((p: Player) => p.role === role && p.isAlive !== false)) {
              firstTurn = role;
              break;
            }
          }
          if (firstTurn) {
            await updateDoc(gameRef, { nightTurn: firstTurn, nightActions: {} });
          } else {
            // Aucun rôle spécial, on passe direct au jour
            await updateDoc(gameRef, { nightTurn: null, phase: 'day', nightActions: {} });
          }
          return;
        }
        // Cherche le prochain rôle à jouer
        let nextTurn = null;
        let allDone = true;
        let foundCurrent = false;
        for (let i = 0; i < rolesOrder.length; i++) {
          const role = rolesOrder[i];
          const hasRole = players.some((p: Player) => p.role === role && p.isAlive !== false);
          if (!hasRole) continue;
          if (!foundCurrent && data.nightTurn === role) {
            foundCurrent = true;
            // Si l'action n'est pas faite, on attend
            if (!actions[role === 'traitor' ? 'kill' : role === 'protector' ? 'protect' : 'investigate']) {
              allDone = false;
              break;
            }
            continue;
          }
          if (foundCurrent) {
            nextTurn = role;
            allDone = false;
            break;
          }
        }
        if (nextTurn) {
          await updateDoc(gameRef, { nightTurn: nextTurn });
          return;
        }
        // Si tout est fait, appliquer les actions et passer au jour
        if (allDone && data.nightTurn) {
          let updatedPlayers = [...players];
          let killedId = actions.kill;
          let protectedId = actions.protect;
          if (killedId && killedId !== protectedId) {
            updatedPlayers = updatedPlayers.map((p: Player) => p.id === killedId ? { ...p, isAlive: false } : p);
          }
          // Vérifier la victoire
          const traitorsAlive = updatedPlayers.filter((p: Player) => p.role === 'traitor' && p.isAlive !== false);
          const villagersAlive = updatedPlayers.filter((p: Player) => p.role !== 'traitor' && p.isAlive !== false);
          let winner = null;
          if (traitorsAlive.length === 0) winner = 'villagers';
          else if (traitorsAlive.length >= villagersAlive.length) winner = 'traitors';
          if (winner) {
            await updateDoc(gameRef, {
              status: 'ended',
              winner,
              endReason: winner === 'villagers' ? 'Tous les traîtres ont été éliminés.' : 'Les traîtres ont pris le contrôle du village.',
              players: updatedPlayers,
              nightActions: {},
              nightTurn: null,
            });
          } else {
            await updateDoc(gameRef, {
              phase: 'day',
              players: updatedPlayers,
              nightActions: {},
              nightTurn: null,
            });
          }
        }
      }
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();

    return () => {
      unsubscribe();
    };
  }, [gameId, user]);

  const handleAction = async () => {
    if (!selectedPlayer || !gameId || !user) return;
    
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(gameId));

    try {
      // Mise à jour selon le rôle
      if (myRole === 'traitor') {
        await updateDoc(gameRef, {
          'nightActions.kill': selectedPlayer.id
        });
      } else if (myRole === 'protector') {
        await updateDoc(gameRef, {
          'nightActions.protect': selectedPlayer.id
        });
      } else if (myRole === 'medium') {
        await updateDoc(gameRef, {
          'nightActions.investigate': selectedPlayer.id
        });
      }

      setActionDone(true);
    } catch (error) {
      console.error('Erreur lors de l\'action de nuit:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#A259FF" />
        <Text style={styles.loadingText}>{t('Chargement...')}</Text>
      </View>
    );
  }

  const getRoleAction = () => {
    switch (myRole) {
      case 'traitor':
        return t('Choisis qui éliminer cette nuit');
      case 'protector':
        return t('Choisis qui protéger cette nuit');
      case 'medium':
        return t('Choisis qui investiguer cette nuit');
      default:
        return t('La nuit tombe sur le village...');
    }
  };

  // Affichage conditionnel selon le nightTurn
  const isMyTurn = myRole && game?.nightTurn === myRole;

  return (
    <ImageBackground
      source={require('@/assets/thehiddenvillage/nuit.png')}
      style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
      resizeMode="cover"
    >
      {/* Bouton d'action en haut à droite de l'écran */}
      {!actionDone && selectedPlayer && (
        <View style={{ position: 'absolute', top: 24, right: 24, left: undefined, alignItems: 'flex-end', zIndex: 10 }}>
          <TouchableOpacity
            style={[styles.actionButton, { marginTop: 0 }]}
            onPress={handleAction}
          >
            <Text style={styles.actionButtonText}>
              {myRole === 'traitor' ? t('Éliminer') :
               myRole === 'protector' ? t('Protéger') :
               myRole === 'medium' ? t('Investiger') : t('Confirmer')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}> 
        <Text style={styles.title}>{t('Phase de Nuit')}</Text>
        <Text style={styles.subtitle}>{getRoleAction()}</Text>
      </Animated.View>
      <View style={styles.content}>
        {!actionDone && isMyTurn && ['traitor', 'protector', 'medium'].includes(myRole) && (
          <VillageTable
            players={game?.players?.filter((p: Player) => p.id !== user?.uid && p.isAlive !== false) || []}
            selectedId={selectedPlayer?.id}
            onSelect={setSelectedPlayer}
            mode="night"
          />
        )}

        {!actionDone && !isMyTurn && (
          <Text style={styles.waitingText}>
            {t("En attente de ton tour...")}
          </Text>
        )}

        {actionDone && (
          <Text style={styles.waitingText}>
            {t('En attente des autres joueurs...')}
          </Text>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  nightIconContainer: {
    backgroundColor: 'rgba(44, 37, 80, 0.7)',
    borderRadius: 32,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#fff',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  nightIcon: {
    fontSize: 40,
    textAlign: 'center',
    color: '#fff',
    textShadowColor: '#A855F7',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#A855F7',
    textAlign: 'center',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  playersList: {
    flex: 1,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedPlayerCard: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: '#A855F7',
    borderWidth: 2,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#FFD166',
    paddingVertical: 18,
    paddingHorizontal: 38,
    borderRadius: 22,
    alignItems: 'center',
    shadowColor: '#FFD166',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  actionButtonText: {
    color: '#3B1C5A',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
  },
  waitingText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
}); 