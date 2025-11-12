import ChristmasTheme from "@/constants/themes/Christmas";
import { Player } from "@/types/gameTypes";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(width * 0.8, 350);

interface SpinningWheelProps {
  players: Player[];
  selectedPlayer: Player | null;
  isSpinning: boolean;
  onSpinComplete?: () => void;
}

export const SpinningWheel: React.FC<SpinningWheelProps> = ({
  players,
  selectedPlayer,
  isSpinning,
  onSpinComplete,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isSpinning && selectedPlayer) {
      // Calculer l'angle final basé sur le joueur sélectionné
      const playerIndex = players.findIndex((p) => p.id === selectedPlayer.id);
      const segmentAngle = 360 / players.length;
      const targetAngle = 360 * 5 + playerIndex * segmentAngle; // 5 tours complets + position du joueur

      // Animation de la roue qui tourne
      Animated.sequence([
        // Effet de pulse au début
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.parallel([
          // Rotation avec ralentissement progressif
          Animated.timing(rotateAnim, {
            toValue: targetAngle,
            duration: 4000,
            useNativeDriver: true,
          }),
          // Retour à la taille normale
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Petit rebond à la fin
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (onSpinComplete) {
          setTimeout(onSpinComplete, 500);
        }
      });
    }
  }, [isSpinning, selectedPlayer]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  // Générer les segments de la roue
  const renderSegments = () => {
    const segmentAngle = 360 / players.length;

    return players.map((player, index) => {
      const rotation = index * segmentAngle;
      const isEven = index % 2 === 0;

      return (
        <View
          key={player.id}
          style={[
            styles.segment,
            {
              transform: [{ rotate: `${rotation}deg` }],
            },
          ]}
        >
          <LinearGradient
            colors={isEven ? ["#6432A0", "#9B59D0"] : ["#4A0E78", "#6432A0"]}
            style={styles.segmentGradient}
          >
            <View style={styles.segmentContent}>
              <Text style={styles.playerName} numberOfLines={1}>
                {player.name}
              </Text>
            </View>
          </LinearGradient>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Pointer/Arrow au-dessus de la roue */}
      <View style={styles.pointerContainer}>
        <View style={styles.pointer}>
          <Text style={styles.pointerText}>▼</Text>
        </View>
      </View>

      {/* La roue animée */}
      <Animated.View
        style={[
          styles.wheel,
          {
            transform: [{ rotate: spin }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Bordure extérieure dorée */}
        <View style={styles.wheelBorder}>
          <LinearGradient
            colors={["#FFD700", "#FFA500", "#FFD700"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wheelBorderGradient}
          >
            {/* Segments de la roue */}
            <View style={styles.segmentsContainer}>{renderSegments()}</View>

            {/* Centre de la roue */}
            <View style={styles.center}>
              <LinearGradient
                colors={["#6432A0", "#9B59D0"]}
                style={styles.centerGradient}
              >
                <Text style={styles.centerIcon}>🪙</Text>
              </LinearGradient>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Effets d'éclairs */}
      {isSpinning && (
        <>
          <View style={[styles.lightning, styles.lightningLeft]}>
            <Text style={styles.lightningText}>⚡</Text>
          </View>
          <View style={[styles.lightning, styles.lightningRight]}>
            <Text style={styles.lightningText}>⚡</Text>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: WHEEL_SIZE + 60,
    height: WHEEL_SIZE + 100,
  },
  pointerContainer: {
    position: "absolute",
    top: 10,
    zIndex: 10,
  },
  pointer: {
    backgroundColor: ChristmasTheme.light.tertiary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  pointerText: {
    fontSize: 24,
    color: "white",
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    marginTop: 30,
  },
  wheelBorder: {
    width: "100%",
    height: "100%",
    borderRadius: WHEEL_SIZE / 2,
    padding: 8,
  },
  wheelBorderGradient: {
    width: "100%",
    height: "100%",
    borderRadius: WHEEL_SIZE / 2,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentsContainer: {
    width: WHEEL_SIZE - 24,
    height: WHEEL_SIZE - 24,
    borderRadius: (WHEEL_SIZE - 24) / 2,
    overflow: "hidden",
    position: "relative",
  },
  segment: {
    position: "absolute",
    width: "100%",
    height: "50%",
    top: 0,
    left: 0,
    transformOrigin: "center bottom",
  },
  segmentGradient: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: (WHEEL_SIZE - 24) / 2,
    borderTopRightRadius: (WHEEL_SIZE - 24) / 2,
  },
  segmentContent: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  playerName: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  center: {
    position: "absolute",
    width: WHEEL_SIZE / 3,
    height: WHEEL_SIZE / 3,
    borderRadius: WHEEL_SIZE / 6,
    alignItems: "center",
    justifyContent: "center",
    top: "50%",
    left: "50%",
    marginTop: -(WHEEL_SIZE / 6),
    marginLeft: -(WHEEL_SIZE / 6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  centerGradient: {
    width: "100%",
    height: "100%",
    borderRadius: WHEEL_SIZE / 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFD700",
  },
  centerIcon: {
    fontSize: 48,
  },
  lightning: {
    position: "absolute",
    zIndex: 5,
  },
  lightningLeft: {
    left: -20,
    top: "40%",
  },
  lightningRight: {
    right: -20,
    top: "40%",
  },
  lightningText: {
    fontSize: 48,
    color: "#FFD700",
    textShadowColor: "#FFA500",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default SpinningWheel;
