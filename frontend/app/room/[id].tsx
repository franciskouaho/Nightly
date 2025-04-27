import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert, Clipboard, Share } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import InviteModal from '@/components/room/InviteModal';
import RulesDrawer from '@/components/room/RulesDrawer';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import { useRoom, useToggleReadyStatus, useLeaveRoom, useStartGame } from '@/hooks/useRooms';
import { useUser } from '@/hooks/useAuth';
import api from '@/config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SocketService from '@/services/socketService';
import NetInfo from '@react-native-community/netinfo';

// Type pour l'utilisateur
interface User {
  id: string | number;
  username: string;
  displayName?: string;
  avatar?: string;
  level?: number;
  isHost?: boolean;
}

// Type local pour Player qui correspond à ce que nous utilisons dans ce composant
interface Player {
  id: string;
  username: string;
  displayName?: string;
  name: string; // Pour la rétrocompatibilité avec le code existant
  isHost: boolean;
  isReady: boolean;
  avatar: string;
  level: number;
}

// Type pour les données de salle
interface PlayerData {
  id: string | number;
  username: string;
  displayName?: string;
  isHost?: boolean;
  isReady?: boolean;
  avatar?: string;
  level?: number;
}

interface RoomData {
  id: string | number;
  code: string;
  name: string;
  host: {
    id: string | number;
    username: string;
    displayName?: string;
    avatar?: string;
    level?: number;
  };
  players?: PlayerData[];
  maxPlayers: number;
  gameMode?: string;
  totalRounds?: number;
  status?: string;
}

export default function Room() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: user } = useUser();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Utiliser le hook pour récupérer les détails de la salle avec le type approprié
  const { data: roomData, isLoading: isLoadingRoom, error: roomError } = useRoom(id as string) as {
    data: RoomData | undefined;
    isLoading: boolean;
    error: Error | null;
  };

  // Utiliser les hooks de mutation
  const { mutate: toggleReady, isPending: isTogglingReady } = useToggleReadyStatus();
  const { mutate: leaveRoom, isPending: isLeavingRoom } = useLeaveRoom();
  const { mutate: startGame, isPending: isStartingGame } = useStartGame();

  const [roomName, setRoomName] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [rulesVisible, setRulesVisible] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Chargement de la salle...');
  const [redirectingToGame, setRedirectingToGame] = useState<string | null>(null);

  // Mettre à jour l'utilisateur actuel lorsque les données sont disponibles
  useEffect(() => {
    if (user) {
      setCurrentUser(user as User);
    }
  }, [user]);

  // Mettre à jour les états en fonction des données récupérées
  useEffect(() => {
    if (roomData) {
      setRoomName(roomData.name);
      setMaxPlayers(roomData.maxPlayers);
      
      // Correction: assurer que players est toujours traité correctement
      let formattedPlayers: Player[] = [];
      
      // Log détaillé pour débogage
      console.log('📊 Données room reçues:', JSON.stringify({
        id: roomData.id,
        code: roomData.code,
        playersLength: roomData.players?.length || 0,
        hostId: roomData.host?.id
      }));

      // S'assurer que players existe et est un tableau
      if (roomData.players && Array.isArray(roomData.players) && roomData.players.length > 0) {
        console.log('👥 Players data:', roomData.players.map(p => ({id: p.id, name: p.displayName || p.username})));
        
        // Convertir les joueurs au format requis
        formattedPlayers = roomData.players.map(player => ({
          id: String(player.id), 
          username: player.username || '',
          displayName: player.displayName || '',
          name: player.displayName || player.username,
          isHost: player.id === roomData.host.id,
          isReady: Boolean(player.isHost || player.isReady), 
          avatar: player.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
          level: player.level || 1
        }));
      } else {
        console.log('⚠️ Aucun joueur trouvé ou format inattendu dans roomData');
        
        // Si la liste est vide mais que nous avons l'hôte, s'assurer que l'hôte est ajouté
        if (roomData.host) {
          formattedPlayers = [{
            id: String(roomData.host.id),
            username: roomData.host.username || '',
            displayName: roomData.host.displayName || '',
            name: roomData.host.displayName || roomData.host.username,
            isHost: true,
            isReady: true,
            avatar: roomData.host.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
            level: roomData.host.level || 1
          }];
          console.log('🔄 Ajout manuel de l\'hôte à la liste des joueurs:', formattedPlayers);
        }
      }
      
      // Vérification: s'assurer que l'hôte est toujours dans la liste
      const hostInList = formattedPlayers.some(p => p.id === String(roomData.host.id));
      if (!hostInList && roomData.host) {
        formattedPlayers.push({
          id: String(roomData.host.id),
          username: roomData.host.username || '',
          displayName: roomData.host.displayName || '',
          name: roomData.host.displayName || roomData.host.username,
          isHost: true,
          isReady: true,
          avatar: roomData.host.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
          level: roomData.host.level || 1
        });
        console.log('🔄 Hôte ajouté à la liste des joueurs car il n\'y était pas');
      }
      
      // Si la liste est toujours vide et que l'utilisateur actuel est l'hôte, l'ajouter
      if (formattedPlayers.length === 0 && currentUser && roomData.host && currentUser.id === roomData.host.id) {
        formattedPlayers = [{
          id: String(currentUser.id),
          username: currentUser.username || '',
          displayName: currentUser.displayName || '',
          name: currentUser.displayName || currentUser.username || 'Hôte',
          isHost: true,
          isReady: true,
          avatar: currentUser.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
          level: currentUser.level || 1
        }];
        console.log('🔄 Utilisateur courant (hôte) ajouté manuellement à la liste vide');
      }
      
      console.log(`👥 Liste finale des joueurs: ${formattedPlayers.length} joueurs`);
      setPlayers(formattedPlayers);
      
      // Vérifier si l'utilisateur actuel est l'hôte
      if (currentUser && currentUser.id && roomData.host) {
        // Utiliser l'ID de l'hôte depuis roomData.host
        console.log(`🔍 Vérification hôte: user ID=${currentUser.id} (${typeof currentUser.id}), host ID=${roomData.host.id} (${typeof roomData.host.id})`);
        // Convertir les deux en string pour une comparaison correcte
        const currentUserId = String(currentUser.id);
        const hostId = String(roomData.host.id);
        console.log(`🔍 IDs convertis en string: user=${currentUserId}, host=${hostId}`);
        
        const isUserHost = currentUserId === hostId;
        setIsHost(isUserHost);
        console.log(`👑 Utilisateur est hôte: ${isUserHost}`);
        
        // Trouver le statut "prêt" de l'utilisateur actuel
        if (roomData.players && Array.isArray(roomData.players)) {
          const player = roomData.players.find(player => player.id === currentUser.id);
          if (player) {
            // Si l'utilisateur est l'hôte, il est toujours prêt
            setIsReady(isUserHost || Boolean(player.isReady));
          } else {
            // Si l'utilisateur est l'hôte mais n'est pas dans la liste des joueurs, le marquer comme prêt
            if (isUserHost) {
              setIsReady(true);
            }
          }
        } else if (isUserHost) {
          // Si pas de joueurs mais utilisateur est hôte
          setIsReady(true);
        }
      }
    }
  }, [roomData, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      // Définir l'ID utilisateur dans les headers API
      api.defaults.headers.userId = currentUser.id;
      console.log(`👤 ID utilisateur ${currentUser.id} défini dans les headers API`);
      
      // Sauvegarder l'ID utilisateur dans AsyncStorage pour y accéder ailleurs
      AsyncStorage.setItem('@current_user_id', String(currentUser.id))
        .then(() => console.log('✅ ID utilisateur sauvegardé dans AsyncStorage'))
        .catch(err => console.error('❌ Erreur lors de la sauvegarde de l\'ID utilisateur:', err));
    }
  }, [currentUser]);

  useEffect(() => {
    if (id) {
      // Initialiser une fonction asynchrone pour gérer la connexion WebSocket
      const setupWebSocket = async () => {
        try {
          console.log(`🔌 Configuration de la connexion WebSocket pour la salle ${id}`);
          
          // Vérifier la connexion internet
          const netInfo = await NetInfo.fetch();
          if (!netInfo.isConnected) {
            console.error('❌ Pas de connexion internet disponible');
            return;
          }
          
          // Activer l'initialisation automatique des sockets pour la durée de la salle
          SocketService.setAutoInit(true);
          
          // Forcer l'initialisation du socket pour la salle
          let socket;
          try {
            socket = await SocketService.getInstanceAsync(true);
            console.log(`✅ Socket initialisé avec succès pour la salle ${id}`);
            
            // Rafraîchir les données après 1 seconde pour s'assurer que tout est synchronisé
            setTimeout(() => refreshRoomData(false), 1000);
          } catch (socketError) {
            console.error(`❌ Erreur lors de l'initialisation du socket:`, socketError);
            return;
          }
          
          // Essayer de rejoindre la salle avec des nouvelles tentatives automatiques
          try {
            console.log(`🔌 Tentative de rejoindre la salle ${id} via WebSocket`);
            
            // Forcer l'initialisation du socket et activer l'autoInit 
            // pour permettre la reconnexion automatique en cas de déconnexion
            SocketService.setAutoInit(true);
            
            // Utiliser joinRoom avec une tentative d'initialisation forcée
            const joinSuccess = await SocketService.joinRoom(id as string);
            
            if (joinSuccess) {
              console.log(`✅ Salle ${id} rejointe avec succès via WebSocket`);
              // Rafraîchir les données après avoir rejoint
              setTimeout(() => refreshRoomData(false), 500);
            } else {
              console.warn(`⚠️ Impossible de rejoindre la salle ${id} via WebSocket, mais continuons`);
              // Un nouvel essai sera fait automatiquement grâce à setAutoInit(true)
            }
          } catch (joinError) {
            console.warn(`⚠️ Erreur lors de la tentative de rejoindre la salle ${id}:`, joinError);
            // Continuer quand même pour permettre le fonctionnement via API REST
          }
          
          // Écouter les événements de la salle
          socket.on('room:update', async (data) => {
            console.log(`🔌 Événement room:update reçu:`, data.type, data);
            
            switch (data.type) {
              case 'player_joined':
                // Si on reçoit une liste complète des joueurs, l'utiliser directement
                if (data.players && Array.isArray(data.players)) {
                  console.log(`📊 Liste de joueurs reçue via WebSocket: ${data.players.length} joueurs`);
                  
                  const updatedPlayers = data.players.map((player: any) => ({
                    id: String(player.id),
                    username: player.username || '',
                    displayName: player.displayName || '',
                    name: player.displayName || player.username,
                    isHost: player.isHost || false,
                    isReady: Boolean(player.isReady),
                    avatar: player.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
                    level: player.level || 1
                  }));
                  
                  console.log(`👥 Liste des joueurs mise à jour via WebSocket:`, updatedPlayers);
                  setPlayers(updatedPlayers);
                } 
                // Sinon, ajouter le joueur individuellement comme avant
                else if (data.player) {
                  console.log(`👤 Ajout individuel d'un joueur via WebSocket`);
                  setPlayers(prev => [...prev, {
                    id: String(data.player.id || ''),
                    username: data.player.username || '',
                    displayName: data.player.displayName || '',
                    name: data.player.displayName || data.player.username || '',
                    isHost: Boolean(data.player.isHost),
                    isReady: Boolean(data.player.isReady),
                    avatar: data.player.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
                    level: data.player.level || 1
                  }]);
                }
                
                // Forcer un rafraîchissement complet pour s'assurer de la synchronisation
                setTimeout(() => refreshRoomData(false), 1000);
                break;
              
              case 'player_left':
                // Retirer le joueur de la liste
                if (data.playerId) {
                  setPlayers(prev => prev.filter(p => p.id !== data.playerId));
                }
                break;
              
              case 'player_ready_status':
                // Mettre à jour le statut d'un joueur
                if (data.playerId) {
                  setPlayers(prev => prev.map(p => 
                    p.id === data.playerId 
                      ? { ...p, isReady: Boolean(data.isReady) }
                      : p
                  ));
                  
                  // Mettre à jour l'état local si c'est l'utilisateur actuel
                  if (currentUser && currentUser.id && data.playerId === currentUser.id) {
                    setIsReady(Boolean(data.isReady));
                  }
                }
                break;
                
              case 'game_started':
                // Éviter les redirections multiples
                if (data.gameId && redirectingToGame !== data.gameId) {
                  setRedirectingToGame(data.gameId);
                  
                  console.log(`🎮 Jeu démarré! Redirection vers /game/${data.gameId}`);
                  
                  // S'assurer que les headers d'API sont corrects avant la redirection
                  if (currentUser && currentUser.id) {
                    api.defaults.headers.userId = currentUser.id;
                    await AsyncStorage.setItem('@current_user_id', String(currentUser.id));
                    console.log(`👤 ID utilisateur ${currentUser.id} défini avant redirection`);
                  }
                  
                  // Redirection immédiate
                  router.push(`/game/${data.gameId}`);
                }
                break;
            }
          });
          
          // Ajouter un écouteur spécifique pour game:started
          socket.on('game:started', async (data) => {
            if (!data || !data.gameId) return;
            
            console.log(`🎮 Événement game:started reçu directement:`, data);
            
            // Éviter les redirections multiples
            if (redirectingToGame !== data.gameId) {
              setRedirectingToGame(data.gameId);
              
              console.log(`🎮 Jeu démarré! Redirection vers /game/${data.gameId}`);
              
              // S'assurer que les headers d'API sont corrects avant la redirection
              if (currentUser && currentUser.id) {
                api.defaults.headers.userId = currentUser.id;
                await AsyncStorage.setItem('@current_user_id', String(currentUser.id));
                console.log(`👤 ID utilisateur ${currentUser.id} défini avant redirection`);
              }
              
              // Rejoindre le canal du jeu avant de naviguer
              try {
                await SocketService.joinGame(data.gameId);
                console.log(`✅ Canal game:${data.gameId} rejoint avec succès`);
              } catch (error) {
                console.warn(`⚠️ Impossible de rejoindre le canal du jeu:`, error);
                // Continuer malgré tout
              }
              
              // Redirection immédiate
              router.replace(`/game/${data.gameId}`);
            }
          });

          // Ajouter un écouteur encore plus spécifique qui écoute TOUS les événements
          socket.onAny((eventName, ...args) => {
            console.log(`🎯 Événement [${eventName}] reçu:`, args);
            
            // Si c'est un événement lié au démarrage d'un jeu (game.started ou autre variante)
            if (eventName.includes('game') && eventName.includes('start')) {
              const data = args[0] || {};
              const gameId = data?.gameId;
              
              if (gameId && redirectingToGame !== gameId) {
                console.log(`🎮 Événement de démarrage de jeu détecté: ${eventName}`);
                setRedirectingToGame(gameId);
                
                // Redirection urgente pour éviter les problèmes
                setTimeout(async () => {
                  try {
                    // Définir l'ID utilisateur avant la redirection
                    if (currentUser && currentUser.id) {
                      api.defaults.headers.userId = currentUser.id;
                      await AsyncStorage.setItem('@current_user_id', String(currentUser.id));
                    }
                    
                    // Tenter de rejoindre le canal du jeu
                    try {
                      await SocketService.joinGame(gameId);
                    } catch {}
                    
                    // Redirection vers le jeu
                    router.replace(`/game/${gameId}`);
                  } catch (error) {
                    console.error('❌ Erreur lors de la redirection d\'urgence:', error);
                  }
                }, 100);
              }
            }
          });
        } catch (error) {
          console.error(`❌ Erreur lors de la configuration WebSocket:`, error);
        }
      };
      
      // Exécuter la fonction
      setupWebSocket();

      // Nettoyage lors du démontage
      return () => {
        console.log(`🔌 Nettoyage de la connexion WebSocket pour la salle ${id}`);
        
        // Utiliser une IIFE pour permettre l'utilisation d'async/await dans la fonction de nettoyage
        (async () => {
          try {
            // Tenter de quitter la salle
            await SocketService.leaveRoom(id as string);
            console.log(`✅ Déconnexion propre de la salle ${id}`);
            
            // Désactiver l'initialisation automatique des sockets après avoir quitté la salle
            SocketService.setAutoInit(false);
            
            // Nettoyer complètement le socket quand on quitte la salle
            await SocketService.cleanup();
          } catch (err) {
            console.error(`❌ Erreur lors de la déconnexion de la salle ${id}:`, err);
            // Nous pouvons ignorer cette erreur car nous nettoyons de toute façon
            // Désactiver l'initialisation automatique des sockets même en cas d'erreur
            SocketService.setAutoInit(false);
          }
        })();
      };
    }
  }, [id, currentUser, router, redirectingToGame]);

  // Ajout d'un rafraîchissement automatique périodique
  useEffect(() => {
    if (id) {
      console.log('⏱️ Configuration du rafraîchissement automatique de la salle');
      
      // Rafraîchir une première fois au montage du composant
      refreshRoomData();
      
      // Mettre en place un interval pour rafraîchir périodiquement
      // Augmenter l'intervalle à 10 secondes pour réduire les appels API
      const refreshInterval = setInterval(() => {
        refreshRoomData();
      }, 10000); // Toutes les 10 secondes au lieu de 5
      
      // Nettoyer l'interval au démontage
      return () => {
        console.log('⏱️ Nettoyage du rafraîchissement automatique');
        clearInterval(refreshInterval);
      };
    }
  }, [id]); // Ne s'exécute qu'au changement de l'ID de salle
  
  // Modifier la fonction refreshRoomData pour être plus silencieuse lors des rafraîchissements automatiques
  const refreshRoomData = (showLoading = false) => {
    if (id) {
      // Réduire les logs
      if (showLoading) {
        console.log('🔄 Rafraîchissement des données de la salle');
        setLoadingMessage('Actualisation des données...');
      }
      
      api.get(`/rooms/${id}`)
        .then(response => {
          if (showLoading) {
            console.log('✅ Données rafraîchies:', response.data.data.players?.length || 0, 'joueurs');
          }
          
          // Mettre à jour la liste des joueurs
          if (response.data.data.players && Array.isArray(response.data.data.players)) {
            const refreshedPlayers = response.data.data.players.map((player: any) => ({
              id: String(player.id),
              username: player.username || '',
              displayName: player.displayName || '',
              name: player.displayName || player.username,
              isHost: player.isHost || false,
              isReady: Boolean(player.isReady),
              avatar: player.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
              level: player.level || 1
            }));
            setPlayers(refreshedPlayers);
          }
        })
        .catch(error => {
          console.error('❌ Erreur lors du rafraîchissement:', error);
          // N'affiche l'alerte que si le rafraîchissement a été demandé explicitement
          if (showLoading) {
            Alert.alert('Erreur', 'Impossible de rafraîchir les données de la salle');
          }
        })
        .finally(() => {
          if (showLoading) {
            setLoadingMessage('Chargement de la salle...');
          }
        });
    }
  };

  const handleToggleReady = () => {
    if (id) {
      console.log(`🎮 handleToggleReady: Changement du statut pour ${!isReady ? 'prêt' : 'pas prêt'}`);
      toggleReady({ roomCode: id as string, isReady: !isReady });
      
      // Rafraîchir les données de la salle après un court délai pour s'assurer que le serveur a bien pris en compte le changement
      setTimeout(() => {
        console.log('🔄 Rafraîchissement forcé après changement de statut');
        refreshRoomData(true);
      }, 500);
    }
  };

  const handleStartGame = () => {
    if (id) {
      // Double vérification de l'état hôte
      if (!isHost) {
        Alert.alert(
          "Erreur",
          "Seul l'hôte peut démarrer la partie.",
          [{ text: "OK" }]
        );
        return;
      }
      
      // Vérifier si tous les joueurs non-hôtes sont prêts
      const nonHostPlayers = players.filter(player => !player.isHost);
      const nonReadyPlayers = nonHostPlayers.filter(player => !player.isReady);
      
      console.log(`===== 🔴 IMPORTANT: ${nonHostPlayers.length} joueurs non-hôtes, ${nonReadyPlayers.length} joueurs non prêts =====`);
      
      if (nonReadyPlayers.length > 0) {
        Alert.alert(
          "Attention",
          `Tous les joueurs ne sont pas prêts (${nonReadyPlayers.length} en attente). Veuillez attendre que tout le monde soit prêt avant de démarrer.`,
          [{ text: "OK" }]
        );
        
        // Rafraîchir les données pour s'assurer que nous avons les statuts les plus à jour
        setTimeout(() => {
          refreshRoomData(true);
        }, 500);
        
        return;
      }

      console.log(`Francis ${id}`);
      
      // Tout est bon, on peut démarrer
      startGame(id as string);
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'Quitter la salle',
      'Êtes-vous sûr de vouloir quitter cette salle ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Quitter',
          style: 'destructive',
          onPress: () => {
            if (id) {
              leaveRoom(id as string);
            }
          },
        },
      ]
    );
  };

  const handleInviteFriend = () => {
    setInviteModalVisible(true);
  };

  const handleCopyCode = () => {
    Clipboard.setString(id as string);
    Alert.alert('Code copié', 'Le code de la salle a été copié dans le presse-papiers');
  };

  const handleShareCode = async () => {
    try {
      const result = await Share.share({
        message: `Rejoins-moi dans Cosmic Quest ! Utilise ce code pour me rejoindre: ${id}`,
        url: `cosmic-quest://room/${id}`,
        title: 'Invitation Cosmic Quest',
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type of', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
      setInviteModalVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite lors du partage');
    }
  };

  // Afficher le loading pendant chargement ou opérations
  const isLoading = isLoadingRoom || isTogglingReady || isLeavingRoom || isStartingGame;

  // Si erreur lors de la récupération des données
  if (roomError) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <StatusBar style="light" />
        <LinearGradient colors={['#1a0933', '#321a5e']} style={styles.background} />
        <Text style={styles.errorText}>Salle non trouvée ou inaccessible</Text>
        <TouchableOpacity style={styles.backToHomeButton} onPress={() => router.replace("/")}>
          <Text style={styles.backToHomeText}>Retourner à l'accueil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const showRules = () => {
    setRulesVisible(true);
  };

  const hideRules = () => {
    setRulesVisible(false);
  };

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <LinearGradient
        colors={item.isReady ? ['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.05)'] : ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.playerCardGradient}
      >
        <Image 
          source={{ uri: item.avatar }} 
          style={styles.playerAvatar} 
        />
        
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>
            {item.name} 
            {item.isHost && <Text style={styles.hostTag}> (Hôte)</Text>}
          </Text>
          <Text style={styles.playerLevel}>Niveau {item.level}</Text>
        </View>
        
        <View style={[styles.statusIndicator, item.isReady ? styles.readyStatus : styles.notReadyStatus]}>
          <Text style={styles.statusText}>{item.isReady ? 'Prêt' : 'En attente'}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#1a0933', '#321a5e']}
        style={styles.background}
      />
      
      {/* Notre composant de loading pour les opérations */}
      {isLoading && <LoadingOverlay message={loadingMessage} />}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleLeaveRoom}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{roomName}</Text>
          <View style={styles.roomInfoDetails}>
            <View style={styles.playersCount}>
              <FontAwesome5 name="user-astronaut" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.playersCountText}>{players.length}/{maxPlayers}</Text>
            </View>
            
            <TouchableOpacity style={styles.roomCodeBadge} onPress={handleCopyCode}>
              <Text style={styles.roomCodeText}>Code: {id}</Text>
              <MaterialCommunityIcons name="content-copy" size={16} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.inviteButton} onPress={handleInviteFriend}>
            <Ionicons name="qr-code" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Room content */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Joueurs</Text>
          <TouchableOpacity style={styles.helpButton} onPress={showRules}>
            <Ionicons name="help-circle" size={22} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={players}
          renderItem={renderPlayerItem}
          keyExtractor={item => item.id}
          style={styles.playersList}
          contentContainerStyle={styles.playersListContent}
        />
        
        {/* Room actions */}
        <View style={styles.actionsContainer}>
          {isHost ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.startGameButton]}
              onPress={handleStartGame}
              disabled={isLoading}
            >
              <MaterialCommunityIcons name="rocket-launch" size={24} color="white" />
              <Text style={styles.actionButtonText}>Lancer la partie</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, isReady ? styles.notReadyButton : styles.readyButton]}
              onPress={handleToggleReady}
              disabled={isLoading}
            >
              {isReady ? (
                <>
                  <MaterialCommunityIcons name="close-circle" size={24} color="white" />
                  <Text style={styles.actionButtonText}>Annuler</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={24} color="white" />
                  <Text style={styles.actionButtonText}>Je suis prêt</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Modal d'invitation */}
      <InviteModal 
        visible={inviteModalVisible}
        roomId={id as string}
        onClose={() => setInviteModalVisible(false)}
        onCopyCode={handleCopyCode}
        onShareCode={handleShareCode}
      />
      
      {/* Drawer des règles */}
      <RulesDrawer 
        visible={rulesVisible}
        onClose={hideRules}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomInfo: {
    flex: 1,
    alignItems: 'center',
  },
  roomName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  roomInfoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  playersCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  playersCountText: {
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 5,
    fontSize: 12,
  },
  roomCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(93, 109, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginLeft: 8,
  },
  roomCodeText: {
    color: 'rgba(255,255,255,0.8)',
    marginRight: 5,
    fontSize: 12,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inviteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(93, 109, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  helpButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playersList: {
    flex: 1,
  },
  playersListContent: {
    paddingBottom: 20,
  },
  playerCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(93, 109, 255, 0.3)',
  },
  playerCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  hostTag: {
    color: '#FFC107',
    fontWeight: 'normal',
  },
  playerLevel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 10,
  },
  readyStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  notReadyStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  actionsContainer: {
    paddingVertical: 20,
    marginBottom: 70, // Espace pour la BottomTabBar
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
  },
  readyButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  notReadyButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  startGameButton: {
    backgroundColor: 'rgba(93, 109, 255, 0.8)',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backToHomeButton: {
    backgroundColor: 'rgba(93, 109, 255, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backToHomeText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
