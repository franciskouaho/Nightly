import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Animated, InteractionManager } from 'react-native';

interface Snowflake {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  size: number;
  speed: number;
  startX: number; // Stocker la position X initiale
}

// Composant de flocon optimisé avec meilleure apparence visuelle
const SnowflakeView = React.memo(({ size, isStar }: { size: number; isStar: boolean }) => {
  if (isStar) {
    // Forme d'étoile de neige avec 6 branches reconnaissables
    const center = size / 2;
    const branchLength = size * 0.4;
    const branchWidth = 1.5;
    
    return (
      <View style={[styles.starContainer, { width: size, height: size }]}>
        {/* 6 branches en étoile */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * Math.PI) / 3;
          return (
            <View
              key={i}
              style={[
                styles.starBranch,
                {
                  width: branchLength,
                  height: branchWidth,
                  left: center - branchLength / 2,
                  top: center - branchWidth / 2,
                  transform: [{ rotate: `${(angle * 180) / Math.PI}deg` }],
                },
              ]}
            />
          );
        })}
        {/* Centre de l'étoile */}
        <View
          style={[
            styles.starCenter,
            {
              width: size * 0.3,
              height: size * 0.3,
              left: center - (size * 0.15),
              top: center - (size * 0.15),
            },
          ]}
        />
      </View>
    );
  }
  
  // Boule de neige ronde avec légère ombre pour le volume
  return (
    <View
      style={[
        styles.snowball,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      {/* Point lumineux pour donner du volume */}
      <View
        style={[
          styles.snowballHighlight,
          {
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: size * 0.2,
            left: size * 0.15,
            top: size * 0.15,
          },
        ]}
      />
    </View>
  );
});

SnowflakeView.displayName = 'SnowflakeView';

export default function ChristmasSnow() {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  
  // Réduire le nombre de flocons pour de meilleures performances : 35 au lieu de 70
  // Moins d'étoiles SVG (coûteuses) : 10 au lieu de 30
  const snowflakes = useMemo<Snowflake[]>(() => {
    const total = 35;
    const starCount = 10;
    
    return Array.from({ length: total }, (_, i) => {
      const isStar = i < starCount;
      const size = isStar 
        ? Math.random() * 5 + 8 // Étoiles entre 8 et 13 (plus grandes pour être visibles)
        : Math.random() * 4 + 4; // Boules de neige entre 4 et 8 (plus grandes)
      const speed = Math.random() * 0.8 + 0.5; // Entre 0.5 et 1.3 (beaucoup plus lent)
      const startX = Math.random() * 100;
      
      return {
        id: i,
        x: new Animated.Value(startX),
        y: new Animated.Value(-10 - Math.random() * 50),
        opacity: new Animated.Value(Math.random() * 0.3 + 0.7), // Moins de variation
        size,
        speed,
        startX, // Stocker la position X initiale
      };
    });
  }, []);

  useEffect(() => {
    // Démarrer l'animation après l'interaction initiale pour de meilleures performances
    const interaction = InteractionManager.runAfterInteractions(() => {
      setShouldAnimate(true);
    });

    return () => {
      interaction.cancel();
    };
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;

    // Animer chaque flocon avec des animations optimisées
    const animations: Animated.CompositeAnimation[] = [];

    snowflakes.forEach((flake, index) => {
      // Démarrer les animations avec un léger délai pour éviter les pics de performance
      const delay = index * 20; // Délai progressif

      // Animation horizontale simplifiée (moins de séquences)
      const horizontalRange = 10; // Réduit de 15 à 10
      const horizontalAnim = Animated.loop(
        Animated.timing(flake.x, {
          toValue: flake.startX + horizontalRange,
          duration: 4000,
          useNativeDriver: false,
        })
      );

      // Animation verticale simplifiée (une seule animation en boucle)
      // Ralentir la chute : durée plus longue
      const verticalAnim = Animated.loop(
        Animated.timing(flake.y, {
          toValue: 105, // Arrêter un peu avant la fin pour éviter qu'ils sortent trop
          duration: (15000 / flake.speed), // Durée beaucoup plus longue pour ralentir
          useNativeDriver: false,
        })
      );

      // Animation d'opacité simplifiée (moins de variation)
      const opacityAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(flake.opacity, {
            toValue: 0.6,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(flake.opacity, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
        ])
      );

      const parallelAnim = Animated.parallel([horizontalAnim, verticalAnim, opacityAnim]);
      animations.push(parallelAnim);
      
      // Démarrer avec un délai progressif
      setTimeout(() => {
        parallelAnim.start(() => {
          // Réinitialiser la position quand l'animation se termine
          flake.y.setValue(-10 - Math.random() * 30); // Moins de variation pour éviter qu'ils sortent trop
          flake.x.setValue(flake.startX);
        });
      }, delay);
    });

    return () => {
      animations.forEach((anim) => {
        anim.stop();
      });
    };
  }, [snowflakes, shouldAnimate]);

  if (!shouldAnimate) {
    return null; // Ne rien afficher avant que l'animation soit prête
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {snowflakes.map((flake, index) => {
        const isStar = index < 10;
        return (
          <Animated.View
            key={flake.id}
            style={[
              styles.snowflake,
              {
                left: flake.x.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
                top: flake.y.interpolate({
                  inputRange: [-10, 110],
                  outputRange: ['-10%', '110%'],
                }),
                opacity: flake.opacity,
              },
            ]}
          >
            <SnowflakeView size={flake.size} isStar={isStar} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  snowflake: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  snowball: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 2, // Pour Android
  },
  snowballHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
  },
  starContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starBranch: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
  },
  starCenter: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 1, // Pour Android
  },
});
