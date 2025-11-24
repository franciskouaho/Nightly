"use client";

import { useAuth } from "@/contexts/AuthContext";
import ChristmasTheme from "@/constants/themes/Christmas";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Redirection après 2 secondes
    const timer = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/welcome");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          "#C41E3A", // Red top
          "#8B1538", // Darker red middle
          "#2A0505", // Very dark bottom
        ]}
        locations={[0, 0.4, 1]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.topContent}>
            <View style={styles.mascoContainer}>
              <Image
                source={require("@/assets/mascotte.png")}
                style={styles.mascotte}
              />
            </View>
            <View style={styles.textContainer}>
              <View style={styles.titleContainer}>
                <View style={styles.titleDot} />
                <Text style={styles.title}>{t("splash.title")}</Text>
              </View>
              <View style={styles.subtitleContainer}>
                <Text style={styles.subtitle}>{t("splash.subtitle")}</Text>
                <View style={styles.subtitleDot} />
              </View>
            </View>
          </View>
        </Animated.View>
        <View style={styles.bottomImageContainer}>
          <Image
            source={require("@/assets/laurier.png")}
            style={styles.bottomImage}
          />
          <Text style={styles.versionText}>v{appVersion}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  mascoContainer: {
    // Shine removed
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  mascotte: {
    width: 180,
    height: 180,
    resizeMode: "contain",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 0,
  },
  titleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#C41E3A",
    marginRight: 8,
    marginTop: 8,
  },
  title: {
    fontSize: 56,
    fontFamily: "BebasNeue-Regular",
    color: "#fff",
    letterSpacing: 3,
    textShadowColor: "rgba(196, 30, 58, 0.8)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 0.5,
  },
  subtitleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C41E3A",
    marginLeft: 6,
  },
  bottomImageContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  versionText: {
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
