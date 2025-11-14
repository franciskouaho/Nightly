import ChristmasTheme from "@/constants/themes/Christmas";
import { Player } from "@/types/gameTypes";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View, Image } from "react-native";
import Svg, { Path, G, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(width * 0.8, 350);
const RADIUS = (WHEEL_SIZE - 24) / 2;

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
      const totalSegments = Math.max(12, players.length);
      const segmentsPerPlayer = Math.floor(totalSegments / players.length);
      const playerIndex = players.findIndex((p) => p.id === selectedPlayer.id);
      const segmentAngle = 360 / totalSegments;
      
      // Calculer l'angle du segment du joueur sélectionné (au centre du segment)
      // La flèche pointe vers le haut, donc on ajuste pour que le segment soit aligné
      const playerSegmentIndex = playerIndex * segmentsPerPlayer;
      const targetAngle = 360 * 5 - (playerSegmentIndex * segmentAngle + (segmentAngle / 2));

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: targetAngle,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
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
    inputRange: [0, 360 * 10], // Supporter jusqu'à 10 tours
    outputRange: ["0deg", "3600deg"],
  });

  // Créer un segment en camembert (triangle)
  const createSegmentPath = (
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Segments SVG en camembert - toujours 12 segments minimum pour un bel effet
  const renderSegments = () => {
    const totalSegments = Math.max(12, players.length); // Au moins 12 segments
    const segmentAngle = 360 / totalSegments;
    const centerX = RADIUS;
    const centerY = RADIUS;

    return (
      <>
        <Defs>
          <SvgLinearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#6432A0" stopOpacity="1" />
            <Stop offset="1" stopColor="#9B59D0" stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="grad2" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#4A0E78" stopOpacity="1" />
            <Stop offset="1" stopColor="#7E3BB5" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        {Array.from({ length: totalSegments }).map((_, index) => {
          const startAngle = index * segmentAngle - 90;
          const endAngle = (index + 1) * segmentAngle - 90;
          const isEven = index % 2 === 0;

          return (
            <Path
              key={`segment-${index}`}
              d={createSegmentPath(centerX, centerY, RADIUS, startAngle, endAngle)}
              fill={`url(#${isEven ? "grad1" : "grad2"})`}
              stroke="#FFD700"
              strokeWidth="2"
            />
          );
        })}
      </>
    );
  };

  // Générer chaque segment avec son contenu (avatar + nom)
  const renderPlayerSegments = () => {
    const totalSegments = Math.max(12, players.length);
    const segmentsPerPlayer = Math.floor(totalSegments / players.length);

    return players.map((player, playerIndex) => {
      // Distribuer les joueurs équitablement sur la roue
      const segmentIndex = playerIndex * segmentsPerPlayer;
      const segmentAngle = 360 / totalSegments;
      
      // Angle au centre du segment du joueur
      const centerAngle = (segmentIndex + 0.5) * segmentAngle;
      
      // Distance depuis le centre pour positionner le contenu
      const contentDistance = RADIUS * 0.6; // 60% du rayon
      
      // Calcul de la position
      const angleRad = ((centerAngle - 90) * Math.PI) / 180; // -90 pour commencer en haut
      const x = contentDistance * Math.cos(angleRad);
      const y = contentDistance * Math.sin(angleRad);

      return (
        <View
          key={player.id}
          style={[
            styles.segmentContent,
            {
              transform: [
                { translateX: x },
                { translateY: y },
                { rotate: `${centerAngle}deg` }, // Rotation pour aligner radialement
              ],
            },
          ]}
        >
          {/* Nom écrit verticalement (chaque lettre en dessous de l'autre) */}
          <View style={styles.nameContainer}>
            {player.name.split('').map((letter, idx) => (
              <Text key={idx} style={styles.nameText}>
                {letter.toUpperCase()}
              </Text>
            ))}
          </View>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Pointer */}
      <View style={styles.pointerContainer}>
        <View style={styles.pointer}>
          <Text style={styles.pointerText}>▼</Text>
        </View>
      </View>

      {/* Roue animée */}
      <Animated.View
        style={[
          styles.wheel,
          {
            transform: [{ rotate: spin }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.wheelBorder}>
          <LinearGradient
            colors={["#FFD700", "#FFA500", "#FFD700"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.wheelBorderGradient}
          >
            {/* Segments en camembert SVG */}
            <Svg
              width={WHEEL_SIZE - 24}
              height={WHEEL_SIZE - 24}
              viewBox={`0 0 ${WHEEL_SIZE - 24} ${WHEEL_SIZE - 24}`}
              style={styles.svgWheel}
            >
              {renderSegments()}
            </Svg>

            {/* Contenus des segments (avatars + noms) */}
            <View style={styles.contentLayer}>
              {renderPlayerSegments()}
            </View>

            {/* Centre de la roue */}
            <View style={styles.centerCircle}>
              <Image
                source={require("@/assets/jeux/pile.png")}
                style={styles.centerImage}
                resizeMode="cover"
              />
            </View>
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Éclairs */}
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
  svgWheel: {
    position: "absolute",
    borderRadius: RADIUS,
    overflow: "hidden",
  },
  contentLayer: {
    position: "absolute",
    width: WHEEL_SIZE - 24,
    height: WHEEL_SIZE - 24,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 2,
    borderColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: 20,
  },
  nameContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 0, // Pas d'espace entre les lettres
  },
  nameText: {
    color: "white",
    fontSize: 9,
    fontWeight: "900",
    fontFamily: "Righteous-Regular",
    textAlign: "center",
    lineHeight: 10,
    textShadowColor: "rgba(0, 0, 0, 1)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 0,
  },
  centerCircle: {
    position: "absolute",
    width: WHEEL_SIZE / 3.5,
    height: WHEEL_SIZE / 3.5,
    borderRadius: WHEEL_SIZE / 7,
    borderWidth: 3,
    borderColor: "#FFD700",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  centerImage: {
    width: "125%",
    height: "125%",
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
