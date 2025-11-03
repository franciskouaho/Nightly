"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image,
  ImageBackground,
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
        router.replace("/(auth)/login");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/christmas/splash/splash.png")}
        style={styles.background}
      >
        <LinearGradient
          colors={[
            "rgba(14, 17, 23, 0.7)",
            "rgba(14, 17, 23, 0.5)",
            "rgba(102, 26, 89, 0.5)",
            "rgba(14, 17, 23, 0.5)",
            "rgba(33, 16, 28, 0.7)",
          ]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
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
                  source={require("@/assets/christmas/splash/mascotte.png")}
                  style={styles.mascotte}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{t("splash.title")}</Text>
                <Text style={styles.subtitle}>{t("splash.subtitle")}</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 120,
  },
  topContent: {
    alignItems: "center",
  },
  mascoContainer: {
    // Shine removed
  },
  textContainer: {
    alignItems: "center",
  },
  mascotte: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
  title: {
    fontSize: 56,
    fontFamily: "Righteous-Regular",
    color: "#fff",
    marginTop: 20,
    letterSpacing: 2,
    textShadowColor: "rgba(196, 30, 58, 0.8)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 15,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 10,
    letterSpacing: 0.5,
  },
});
