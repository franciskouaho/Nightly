import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, Easing, Platform } from 'react-native';

interface Player {
  id: string;
  name: string;
  avatar?: string;
  isAlive?: boolean;
}

interface Props {
  players: Player[];
  selectedId?: string | null;
  onSelect?: (player: Player) => void;
  centerContent?: React.ReactNode;
  disabledIds?: string[];
  mode?: "day" | "night";
}

const RADIUS = Math.min(Dimensions.get('window').width, Dimensions.get('window').height) / 2.2;
const AVATAR_SIZE = 64;

const BENCH_POSITIONS = [
  { x: 0.22, y: 0.72 }, // banc gauche
  { x: 0.41, y: 0.60 }, // banc centre-gauche
  { x: 0.59, y: 0.60 }, // banc centre-droit
  { x: 0.78, y: 0.72 }, // banc droit
];

export default function VillageTable({ players, selectedId, onSelect, centerContent, disabledIds = [], mode = "night" }: Props) {
  const window = Dimensions.get('window');
  const largeurEcran = window.width;
  const hauteurEcran = window.height;
  const nbBancs = BENCH_POSITIONS.length;

  // Animation feu de camp
  const campfireAnim = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(campfireAnim, { toValue: 1.12, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(campfireAnim, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    ).start();
  }, []);

  // Génère les positions pour tous les joueurs
  let positions = [];
  if (players.length <= nbBancs) {
    // Répartition centrée sur les bancs
    // Indices des bancs à utiliser selon le nombre de joueurs
    const bancsCentrage: Record<number, number[]> = {
      1: [1], // centre-gauche
      2: [1, 2], // centre-gauche, centre-droit
      3: [0, 1, 2], // gauche, centre-gauche, centre-droit
      4: [0, 1, 2, 3], // tous
    };
    const indices = bancsCentrage[players.length] || [0, 1, 2, 3];
    positions = players.map((_, i) => {
      const idx = indices[i];
      const pos = BENCH_POSITIONS[idx];
      if (!pos) {
        // fallback au centre si jamais
        return {
          x: largeurEcran / 2 - AVATAR_SIZE / 2,
          y: Platform.OS === 'android' ? hauteurEcran * 0.06 : hauteurEcran * 0.07,
        };
      }
      if (mode === "day") {
        return {
          x: pos.x * largeurEcran - AVATAR_SIZE / 2,
          y: Platform.OS === 'android' ? hauteurEcran * 0.06 : hauteurEcran * 0.07,
        };
      }
      return {
        x: pos.x * largeurEcran - AVATAR_SIZE / 2,
        y: Platform.OS === 'android' ? hauteurEcran * 0.06 : hauteurEcran * 0.07,
      };
    });
  } else {
    // Plus de 4 joueurs : interpolation sur l'arc passant par les bancs
    const arcStart = Math.atan2((BENCH_POSITIONS[0]?.y ?? 0.7) - 0.5, (BENCH_POSITIONS[0]?.x ?? 0.22) - 0.5);
    const arcEnd = Math.atan2((BENCH_POSITIONS[nbBancs-1]?.y ?? 0.7) - 0.5, (BENCH_POSITIONS[nbBancs-1]?.x ?? 0.78) - 0.5);
    const arc = arcEnd - arcStart;
    const radius = Math.min(largeurEcran, hauteurEcran) * 0.32;
    const centerX = largeurEcran / 2;
    const centerY = hauteurEcran * 0.62;
    positions = players.map((_, i) => {
      const t = i / (players.length - 1);
      const angle = arcStart + t * arc;
      if (mode === "day") {
        return {
          x: centerX + Math.cos(angle) * radius - AVATAR_SIZE / 2,
          y: Platform.OS === 'android' ? hauteurEcran * 0.06 : hauteurEcran * 0.07,
        };
      }
      return {
        x: centerX + Math.cos(angle) * radius - AVATAR_SIZE / 2,
        y: Platform.OS === 'android' ? hauteurEcran * 0.06 : hauteurEcran * 0.07,
      };
    });
  }

  return (
    <View style={[styles.container, { width: largeurEcran, height: hauteurEcran * 0.7 }]}> 
      {/* Centre de la place (feu de camp animé, logo, etc.) */}
      <Animated.View style={[styles.center, { left: largeurEcran / 2 - 36, top: hauteurEcran * 0.45 - 36, transform: [{ scale: campfireAnim }] }]}> 
        {centerContent ||
          (mode !== "day" ? (
            <View style={styles.campfireGlow}>
              <View style={styles.campfire}><Text style={{fontSize: 32}}>🔥</Text></View>
            </View>
          ) : null)
        }
      </Animated.View>
      {players.map((player, i) => {
        const pos = positions[i];
        if (!pos) return null;
        const { x, y } = pos;
        const isSelected = selectedId === player.id;
        const isDisabled = disabledIds.includes(player.id) || player.isAlive === false;
        // Animation de sélection
        const scaleAnim = useRef(new Animated.Value(1)).current;
        React.useEffect(() => {
          if (isSelected) {
            Animated.sequence([
              Animated.timing(scaleAnim, { toValue: 1.18, duration: 180, useNativeDriver: true }),
              Animated.timing(scaleAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
            ]).start();
          }
        }, [isSelected]);
        return (
          <Animated.View
            key={player.id}
            style={[styles.avatarContainer, { left: x, top: y, opacity: isDisabled ? 0.4 : 1, transform: [{ scale: isSelected ? scaleAnim : 1 }] }]}
          >
            {/* Ombre sous l'avatar */}
            <View style={styles.avatarShadow} />
            <TouchableOpacity
              onPress={() => onSelect && !isDisabled && onSelect(player)}
              activeOpacity={0.8}
              disabled={isDisabled}
            >
              <View style={[styles.avatarCircle, isSelected && styles.selectedAvatarCircle]}> 
                <Image
                  source={{ uri: player.avatar || 'https://via.placeholder.com/64' }}
                  style={styles.avatar}
                />
              </View>
              <Text style={[
                styles.playerName,
                mode === "day"
                  ? { color: '#3B220F', textShadowColor: '#fff', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4, fontSize: 16 }
                  : { color: '#fff', textShadowColor: '#000' }
              ]} numberOfLines={1}>{player.name}</Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  campfireGlow: {
    backgroundColor: 'rgba(255, 184, 28, 0.18)',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD166',
    shadowOpacity: 0.7,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 2 },
  },
  campfire: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 36,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E42',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 1,
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 6,
    shadowColor: '#A855F7',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  selectedAvatarCircle: {
    borderColor: '#FFD166',
    shadowColor: '#FFD166',
    shadowOpacity: 0.7,
    shadowRadius: 16,
  },
  avatar: {
    width: AVATAR_SIZE - 8,
    height: AVATAR_SIZE - 8,
    borderRadius: (AVATAR_SIZE - 8) / 2,
    resizeMode: 'cover',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 80,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatarShadow: {
    position: 'absolute',
    bottom: 8,
    left: AVATAR_SIZE / 2 - 18,
    width: 36,
    height: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.22)',
    opacity: 0.7,
    zIndex: 0,
  },
}); 