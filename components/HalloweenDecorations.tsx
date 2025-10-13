import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/Colors';

interface HalloweenDecorationsProps {
  style?: any;
}

const Spider: React.FC<{ style?: any; delay?: number }> = ({ style, delay = 0 }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateSpider = () => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(moveAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(moveAnim, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateSpider();
  }, [moveAnim, delay]);

  const moveInterpolate = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.spider,
        {
          transform: [{ rotate: moveInterpolate }]
        },
        style
      ]}
    >
      <View style={styles.spiderBody} />
      <View style={[styles.spiderLeg, styles.leg1]} />
      <View style={[styles.spiderLeg, styles.leg2]} />
      <View style={[styles.spiderLeg, styles.leg3]} />
      <View style={[styles.spiderLeg, styles.leg4]} />
    </Animated.View>
  );
};

const SpiderWeb: React.FC<{ style?: any; size?: number; rotation?: number; delay?: number; showSpider?: boolean }> = ({ 
  style, 
  size = 40, 
  rotation = 0,
  delay = 0,
  showSpider = true
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateWeb = () => {
      // Animation d'apparition
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Animation de rotation subtile
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 8000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateWeb();
  }, [fadeAnim, scaleAnim, rotateAnim, delay]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-2deg', '2deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.spiderWeb, 
        { 
          width: size, 
          height: size,
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { rotate: rotateInterpolate },
            { rotate: `${rotation}deg` }
          ]
        }, 
        style
      ]}
    >
      {/* Lignes radiales (rayons) */}
      <View style={[styles.webRay, styles.ray1, { transform: [{ rotate: '0deg' }] }]} />
      <View style={[styles.webRay, styles.ray2, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.webRay, styles.ray3, { transform: [{ rotate: '90deg' }] }]} />
      <View style={[styles.webRay, styles.ray4, { transform: [{ rotate: '135deg' }] }]} />
      <View style={[styles.webRay, styles.ray5, { transform: [{ rotate: '180deg' }] }]} />
      <View style={[styles.webRay, styles.ray6, { transform: [{ rotate: '225deg' }] }]} />
      <View style={[styles.webRay, styles.ray7, { transform: [{ rotate: '270deg' }] }]} />
      <View style={[styles.webRay, styles.ray8, { transform: [{ rotate: '315deg' }] }]} />
      
      {/* Cercles concentriques */}
      <View style={[styles.webCircle, styles.circle1]} />
      <View style={[styles.webCircle, styles.circle2]} />
      <View style={[styles.webCircle, styles.circle3]} />
      
      {/* Centre de la toile */}
      <View style={styles.webCenter} />
      
      {/* Araignée qui se déplace */}
      {showSpider && <Spider style={styles.spiderOnWeb} delay={delay + 2000} />}
    </Animated.View>
  );
};

const HalloweenDecorations: React.FC<HalloweenDecorationsProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Étoiles scintillantes */}
      <View style={[styles.star, styles.star1]} />
      <View style={[styles.star, styles.star2]} />
      <View style={[styles.star, styles.star3]} />
      <View style={[styles.star, styles.star4]} />
      
      {/* Lignes mystérieuses */}
      <View style={[styles.mysteryLine, styles.line1]} />
      <View style={[styles.mysteryLine, styles.line2]} />
      <View style={[styles.mysteryLine, styles.line3]} />
      
      {/* Toilettes d'araignées géantes qui couvrent toute la page */}
      {/* Toile principale au centre */}
      <SpiderWeb style={styles.mainSpiderWeb} size={120} rotation={0} delay={0} showSpider={true} />
      
      {/* Toilettes secondaires qui se connectent */}
      <SpiderWeb style={styles.spiderWeb1} size={80} rotation={15} delay={500} showSpider={false} />
      <SpiderWeb style={styles.spiderWeb2} size={70} rotation={-30} delay={1000} showSpider={true} />
      <SpiderWeb style={styles.spiderWeb3} size={90} rotation={60} delay={1500} showSpider={false} />
      <SpiderWeb style={styles.spiderWeb4} size={60} rotation={-45} delay={2000} showSpider={true} />
      <SpiderWeb style={styles.spiderWeb5} size={85} rotation={120} delay={2500} showSpider={false} />
      
      {/* Toilettes supplémentaires pour couvrir les zones */}
      <SpiderWeb style={styles.spiderWeb6} size={65} rotation={200} delay={3000} showSpider={true} />
      <SpiderWeb style={styles.spiderWeb7} size={75} rotation={280} delay={3500} showSpider={false} />
      <SpiderWeb style={styles.spiderWeb8} size={55} rotation={320} delay={4000} showSpider={true} />
      
      {/* Toilettes supplémentaires pour couvrir les cartes de jeux */}
      <SpiderWeb style={styles.spiderWeb9} size={70} rotation={45} delay={4500} showSpider={false} />
      <SpiderWeb style={styles.spiderWeb10} size={60} rotation={135} delay={5000} showSpider={true} />
      <SpiderWeb style={styles.spiderWeb11} size={80} rotation={225} delay={5500} showSpider={false} />
      <SpiderWeb style={styles.spiderWeb12} size={55} rotation={315} delay={6000} showSpider={true} />
      
      {/* Toilettes spécifiques sur les cartes de jeux */}
      <SpiderWeb style={styles.gameCardWeb1} size={50} rotation={30} delay={6500} showSpider={true} />
      <SpiderWeb style={styles.gameCardWeb2} size={45} rotation={150} delay={7000} showSpider={false} />
      <SpiderWeb style={styles.gameCardWeb3} size={55} rotation={270} delay={7500} showSpider={true} />
      <SpiderWeb style={styles.gameCardWeb4} size={40} rotation={60} delay={8000} showSpider={false} />
      <SpiderWeb style={styles.gameCardWeb5} size={50} rotation={180} delay={8500} showSpider={true} />
      
      {/* Lignes de connexion entre les toilettes */}
      <View style={[styles.connectionLine, styles.connection1]} />
      <View style={[styles.connectionLine, styles.connection2]} />
      <View style={[styles.connectionLine, styles.connection3]} />
      <View style={[styles.connectionLine, styles.connection4]} />
      <View style={[styles.connectionLine, styles.connection5]} />
      <View style={[styles.connectionLine, styles.connection6]} />
      <View style={[styles.connectionLine, styles.connection7]} />
      <View style={[styles.connectionLine, styles.connection8]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
    zIndex: 5,
    pointerEvents: 'none', // Permet le scroll et les interactions
  },
  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: Colors.tertiary,
    borderRadius: 1,
    opacity: 0.6,
  },
  star1: {
    top: '15%',
    left: '25%',
  },
  star2: {
    top: '35%',
    right: '30%',
  },
  star3: {
    top: '55%',
    left: '15%',
  },
  star4: {
    top: '75%',
    right: '20%',
  },
  mysteryLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: Colors.primary,
    opacity: 0.2,
  },
  line1: {
    width: 30,
    top: '25%',
    left: '5%',
    transform: [{ rotate: '45deg' }],
  },
  line2: {
    width: 25,
    top: '45%',
    right: '10%',
    transform: [{ rotate: '-30deg' }],
  },
  line3: {
    width: 35,
    top: '65%',
    left: '60%',
    transform: [{ rotate: '60deg' }],
  },
  // Styles pour les toilettes d'araignées
  spiderWeb: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5, // Augmenté pour être bien visibles sur les cartes de jeux
  },
  webRay: {
    position: 'absolute',
    width: 1,
    height: '50%',
    backgroundColor: '#E0E0E0',
    opacity: 0.8,
    transformOrigin: 'bottom center',
  },
  ray1: { transform: [{ rotate: '0deg' }] },
  ray2: { transform: [{ rotate: '45deg' }] },
  ray3: { transform: [{ rotate: '90deg' }] },
  ray4: { transform: [{ rotate: '135deg' }] },
  ray5: { transform: [{ rotate: '180deg' }] },
  ray6: { transform: [{ rotate: '225deg' }] },
  ray7: { transform: [{ rotate: '270deg' }] },
  ray8: { transform: [{ rotate: '315deg' }] },
  webCircle: {
    position: 'absolute',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    borderRadius: 50,
    opacity: 0.6,
  },
  circle1: {
    width: '60%',
    height: '60%',
  },
  circle2: {
    width: '80%',
    height: '80%',
  },
  circle3: {
    width: '100%',
    height: '100%',
  },
  webCenter: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F0F0F0',
    opacity: 0.6,
  },
  // Toile principale au centre (en arrière-plan)
  mainSpiderWeb: {
    top: '40%',
    left: '50%',
    marginLeft: -60,
    marginTop: -60,
    zIndex: 5,
  },
  // Positions des toilettes d'araignées pour couvrir toute la page (en arrière-plan)
  spiderWeb1: {
    top: '10%',
    right: '10%',
    zIndex: 5,
  },
  spiderWeb2: {
    top: '20%',
    left: '8%',
    zIndex: 5,
  },
  spiderWeb3: {
    bottom: '30%',
    right: '15%',
    zIndex: 5,
  },
  spiderWeb4: {
    top: '55%',
    left: '10%',
    zIndex: 5,
  },
  spiderWeb5: {
    bottom: '10%',
    left: '20%',
    zIndex: 5,
  },
  spiderWeb6: {
    top: '35%',
    right: '25%',
    zIndex: 5,
  },
  spiderWeb7: {
    bottom: '45%',
    left: '30%',
    zIndex: 5,
  },
  spiderWeb8: {
    top: '70%',
    right: '35%',
    zIndex: 5,
  },
  spiderWeb9: {
    top: '85%',
    left: '15%',
    zIndex: 5,
  },
  spiderWeb10: {
    top: '90%',
    right: '20%',
    zIndex: 5,
  },
  spiderWeb11: {
    bottom: '5%',
    left: '50%',
    marginLeft: -40,
    zIndex: 5,
  },
  spiderWeb12: {
    bottom: '8%',
    right: '45%',
    zIndex: 5,
  },
  // Toilettes spécifiques sur les cartes de jeux
  gameCardWeb1: {
    top: '45%',
    left: '20%',
    zIndex: 25, // Au-dessus des cartes
  },
  gameCardWeb2: {
    top: '48%',
    left: '55%',
    zIndex: 25,
  },
  gameCardWeb3: {
    top: '51%',
    right: '25%',
    zIndex: 25,
  },
  gameCardWeb4: {
    bottom: '25%',
    left: '25%',
    zIndex: 25,
  },
  gameCardWeb5: {
    bottom: '22%',
    right: '30%',
    zIndex: 25,
  },
  // Styles pour les araignées
  spider: {
    position: 'absolute',
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spiderBody: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2C2C2C',
    position: 'absolute',
  },
  spiderLeg: {
    position: 'absolute',
    width: 1,
    height: 4,
    backgroundColor: '#2C2C2C',
  },
  leg1: {
    top: -1,
    left: 1,
    transform: [{ rotate: '45deg' }],
  },
  leg2: {
    top: -1,
    right: 1,
    transform: [{ rotate: '-45deg' }],
  },
  leg3: {
    bottom: -1,
    left: 1,
    transform: [{ rotate: '-45deg' }],
  },
  leg4: {
    bottom: -1,
    right: 1,
    transform: [{ rotate: '45deg' }],
  },
  spiderOnWeb: {
    top: '50%',
    left: '50%',
    marginTop: -4,
    marginLeft: -4,
  },
  // Lignes de connexion entre les toilettes
  connectionLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#E0E0E0',
    opacity: 0.2, // Augmenté pour être visibles
    zIndex: 1,
  },
  connection1: {
    width: '30%',
    top: '25%',
    left: '25%',
    transform: [{ rotate: '45deg' }],
  },
  connection2: {
    width: '25%',
    top: '45%',
    right: '20%',
    transform: [{ rotate: '-30deg' }],
  },
  connection3: {
    width: '35%',
    top: '65%',
    left: '35%',
    transform: [{ rotate: '60deg' }],
  },
  connection4: {
    width: '28%',
    bottom: '40%',
    right: '30%',
    transform: [{ rotate: '-45deg' }],
  },
  connection5: {
    width: '32%',
    bottom: '25%',
    left: '25%',
    transform: [{ rotate: '75deg' }],
  },
  connection6: {
    width: '22%',
    top: '52%',
    left: '45%',
    transform: [{ rotate: '15deg' }],
  },
  connection7: {
    width: '28%',
    top: '78%',
    left: '35%',
    transform: [{ rotate: '120deg' }],
  },
  connection8: {
    width: '25%',
    bottom: '12%',
    right: '25%',
    transform: [{ rotate: '200deg' }],
  },
});

export default HalloweenDecorations;
