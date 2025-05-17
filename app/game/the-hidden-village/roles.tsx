import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { useTranslation } from 'react-i18next';

const ROLE_CARDS = [
  {
    id: 'traitor',
    name: 'Le Traître',
    emoji: '🐺',
    description: 'Élimine chaque nuit. Doit survivre.',
    color: '#EF4444',
    image: require('@/assets/thehiddenvillage/letraitre.png')
  },
  {
    id: 'medium',
    name: 'Le Médium',
    emoji: '🔮',
    description: 'Devine si un joueur est villageois ou traître.',
    color: '#8B5CF6',
    image: require('@/assets/thehiddenvillage/lemedium.png')
  },
  {
    id: 'protector',
    name: 'Le Protecteur',
    emoji: '🛡️',
    description: 'Protège un joueur chaque nuit.',
    color: '#3B82F6',
    image: require('@/assets/thehiddenvillage/leprotecteur.png')
  },
  {
    id: 'villager',
    name: 'Le Villageois',
    emoji: '👨‍🌾',
    description: 'Pas de pouvoir. Vote intelligemment.',
    color: '#10B981',
    image: require('@/assets/thehiddenvillage/levillageois.png')
  },
  {
    id: 'liar',
    name: 'Le Menteur',
    emoji: '🤥',
    description: 'Rôle fun. Sème le doute.',
    color: '#F59E0B',
    image: require('@/assets/thehiddenvillage/lementeur.png')
  }
];

// Typage pour un joueur
interface Player {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

function getRolesForPlayers(playerCount: number): string[] {
  if (playerCount < 5) {
    return ['traitor', 'medium', 'protector', ...Array(playerCount - 3).fill('villager')];
  }
  if (playerCount === 5) {
    return ['traitor', 'medium', 'protector', 'liar', 'villager'];
  }
  if (playerCount === 6) {
    return ['traitor', 'medium', 'protector', 'liar', 'villager', 'villager'];
  }
  if (playerCount === 7) {
    return ['traitor', 'medium', 'protector', 'liar', 'villager', 'villager', 'villager'];
  }
  return ['traitor', 'medium', 'protector', 'liar', ...Array(playerCount - 4).fill('villager')];
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export default function RolesAttributionScreen() {
  const { t } = useTranslation();
  const { id: gameId } = useLocalSearchParams();
  const { user }: { user: any } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<typeof ROLE_CARDS[0] | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!gameId || !user) return;
    const gameRef = firestore().collection('games').doc(String(gameId));
    gameRef.get().then(async (snap) => {
      if (!snap.exists) return;
      const data = snap.data() as { players: Player[], hostId: string };
      let playersList: Player[] = data.players || [];
      // Si les rôles ne sont pas encore attribués (aucun joueur n'a de champ 'role')
      if (!playersList.some((p: Player) => p.role)) {
        // Attribution par l'hôte uniquement
        if (data.hostId && String(data.hostId) === String(user.uid)) {
          const roles = shuffle(getRolesForPlayers(playersList.length));
          playersList = playersList.map((p: Player, idx: number) => ({ ...p, role: roles[idx] }));
          await gameRef.update({ players: playersList });
        } else {
          setTimeout(() => window.location.reload(), 1500);
          return;
        }
      }
      setPlayers(playersList);
      // Trouver le rôle du joueur courant
      const me = playersList.find((p: Player) => String(p.id) === String(user.uid));
      if (me && me.role) {
        const foundRole = ROLE_CARDS.find(r => r.id === me.role) || null;
        setRole(foundRole);
      }
      setLoading(false);
    });
  }, [gameId, user]);

  const handleReady = async () => {
    setReady(true);
    // Ici tu peux mettre à jour Firestore pour signaler que ce joueur est prêt
    // et router vers la suite du jeu si tout le monde est prêt
    setTimeout(() => {
      router.replace(`/game/the-hidden-village/${gameId}`);
    }, 1200);
  };

  if (loading || !role) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#A259FF" />
        <Text style={styles.waitingText}>{t('Chargement de ton rôle...')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('Découvre ton rôle')}</Text>
      <Image source={role.image} style={styles.roleMascotte} resizeMode="contain" />
      <Text style={[styles.roleName, { color: role.color }]}>{role.emoji} {role.name}</Text>
      <Text style={styles.roleDesc}>{role.description}</Text>
      <TouchableOpacity style={styles.readyButton} onPress={handleReady} disabled={ready}>
        <Text style={styles.readyButtonText}>{ready ? t('En attente des autres...') : t("J'ai vu mon rôle")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1033',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  roleMascotte: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  roleName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleDesc: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 32,
    textAlign: 'center',
  },
  readyButton: {
    backgroundColor: '#A259FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 16,
  },
  readyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 24,
    textAlign: 'center',
  },
}); 