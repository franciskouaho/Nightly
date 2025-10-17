import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter, usePathname } from 'expo-router';
import RoundedButton from '@/components/RoundedButton';
import { useAuth } from '@/contexts/AuthContext';
import { getFirestore, doc, onSnapshot, updateDoc } from '@react-native-firebase/firestore';
import { usePoints } from '@/hooks/usePoints';
import { useTheHiddenVillageQuestions } from '@/hooks/the-hidden-village-questions';

interface Role {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  image: any;
}

interface TheHiddenVillageGameState {
  id: string;
  host: string;
  players: Array<{
    id: string;
    name: string;
    role: string;
    isAlive: boolean;
  }>;
  phase: 'night' | 'day' | 'end';
  status: string;
  currentRound: number;
  totalRounds: number;
  scores: Record<string, number>;
  gameMode: 'the-hidden-village';
}

const ROLE_CARDS: Role[] = [
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

export default function TheHiddenVillageGame() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { awardGamePoints } = usePoints();
  const [game, setGame] = useState<TheHiddenVillageGameState | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { getRandomQuestion, resetAskedQuestions } = useTheHiddenVillageQuestions();

  useEffect(() => {
    if (!id) return;
    const db = getFirestore();
    const gameRef = doc(db, 'games', String(id));
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      const data = doc.data();
      if (data) {
        const gameData = { ...data, id: doc.id } as TheHiddenVillageGameState;
        // S'assurer que le gameMode est défini
        if (!gameData.gameMode) {
          updateDoc(gameRef, {
            gameMode: 'the-hidden-village'
          }).catch(e => console.error("Error updating gameMode:", e));
        }
        setGame(gameData);
        if (data.status === 'roles') {
          router.replace(`/game/the-hidden-village/roles?id=${id}`);
        }
      }
    });
    return () => unsubscribe();
  }, [id, router]);

  useEffect(() => {
    if (game?.phase === 'end' && game.gameMode) {
      // Attribuer les points à la fin du jeu
      awardGamePoints(
        game.id,
        game.gameMode,
        game.players,
        game.scores
      );
    }
  }, [game?.phase, game?.gameMode, game?.id, game?.players, game?.scores, awardGamePoints]);

  useEffect(() => {
    if (!game) return;
    if (game.phase === 'night' && !pathname.includes('/night/')) {
      router.replace(`/game/the-hidden-village/night/${game.id}`);
    } else if (game.phase === 'day' && !pathname.includes('/day/')) {
      router.replace(`/game/the-hidden-village/day/${game.id}`);
    }
  }, [game, pathname]);

  const renderRoleCard = (role: Role) => (
    <TouchableOpacity
      key={role.id}
      style={[styles.roleCard, { borderColor: role.color }]}
      onPress={() => setSelectedRole(role)}
    >
      <LinearGradient
        colors={[`${role.color}20`, `${role.color}40`]}
        style={styles.roleCardGradient}
      >
        <Image
          source={role.image}
          style={styles.roleMascotte}
          resizeMode="contain"
        />
        <Text style={styles.roleEmoji}>{role.emoji}</Text>
        <Text style={[styles.roleName, { color: role.color }]}>{t(`game.theHiddenVillage.roles.${role.id}.name`)}</Text>
        <Text style={styles.roleDescription}>{t(`game.theHiddenVillage.roles.${role.id}.description`)}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  console.log('[DEBUG BUTTON]', { user: user?.uid, host: game?.host, game });

  // Récupère la liste des joueurs depuis game
  const players = game?.players || [];
  // Définis le nombre minimum de joueurs attendus (modifiable si besoin)
  const MIN_PLAYERS = 5;
  // Vérifie si tous les joueurs sont là
  const canContinue = players.length >= MIN_PLAYERS;

  if (!game) {
    return (
      <LinearGradient
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        style={styles.container}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18, marginBottom: 16 }}>
            Chargement de la partie...
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('game.theHiddenVillage.title')}</Text>
          <Text style={styles.subtitle}>{t('game.theHiddenVillage.subtitle')}</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            {t('game.theHiddenVillage.description')}
          </Text>
        </View>

        <View style={styles.principlesContainer}>
          <Text style={styles.sectionTitle}>{t('game.theHiddenVillage.principles.title')}</Text>
          <View style={styles.principlesList}>
            {(t('game.theHiddenVillage.principles.list', { returnObjects: true }) as string[]).map((principle: string, index: number) => (
              <Text key={index} style={styles.principleText}>• {principle}</Text>
            ))}
          </View>
        </View>

        <View style={styles.rolesContainer}>
          <Text style={styles.sectionTitle}>{t('game.theHiddenVillage.roles.title')}</Text>
          <View style={styles.rolesGrid}>
            {ROLE_CARDS.map(renderRoleCard)}
          </View>
        </View>

        <View style={styles.objectivesContainer}>
          <Text style={styles.sectionTitle}>{t('game.theHiddenVillage.objectives.title')}</Text>
          <View style={styles.objectivesList}>
            <View style={styles.objectiveItem}>
              <Text style={styles.objectiveEmoji}>🐺</Text>
              <Text style={styles.objectiveText}>{t('game.theHiddenVillage.objectives.traitor')}</Text>
            </View>
            <View style={styles.objectiveItem}>
              <Text style={styles.objectiveEmoji}>👥</Text>
              <Text style={styles.objectiveText}>{t('game.theHiddenVillage.objectives.village')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      {user && String(user.uid) === String(game.host) && canContinue && (
        <RoundedButton
          title="Continuer"
          onPress={async () => {
            if (id) {
              const db = getFirestore();
              await updateDoc(doc(db, 'games', String(id)), { status: 'roles' });
            }
          }}
          style={{
            paddingVertical: 18,
            borderRadius: 32,
            margin: 24,
            alignItems: 'center',
          }}
          textStyle={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}
        />
      )}
      {user && String(user.uid) === String(game.host) && !canContinue && (
        <Text style={{ color: '#fff', textAlign: 'center', margin: 16 }}>
          En attente que tous les joueurs rejoignent la partie...
        </Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#A855F7',
    textAlign: 'center',
  },
  descriptionContainer: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'center',
  },
  principlesContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  principlesList: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  principleText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 22,
  },
  rolesContainer: {
    marginBottom: 32,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
  },
  roleCardGradient: {
    padding: 16,
    alignItems: 'center',
  },
  roleEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  roleName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
  objectivesContainer: {
    marginBottom: 32,
  },
  objectivesList: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  objectiveEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  objectiveText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  roleMascotte: {
    width: 64,
    height: 64,
    marginBottom: 8,
  },
}); 

function setSelectedRole(role: Role): void {
  throw new Error('Function not implemented.');
}
