"use client";

import Colors from "@/constants/Colors";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ImageBackground,
  Modal,
  TextInput,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChristmasSnow from "@/components/ChristmasSnow";
import { useAuth } from "@/contexts/AuthContext";
import { usePaywall } from "@/contexts/PaywallContext";
import { useTranslation } from "react-i18next";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "@react-native-firebase/firestore";
import Clipboard from "@react-native-clipboard/clipboard";
import { Alert } from "react-native";

export default function CouplesScreen() {
  const { user } = useAuth();
  const { showPaywallA, isProMember } = usePaywall();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [hasPartner, setHasPartner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coupleCode, setCoupleCode] = useState<string | null>(null);
  const [showCodeDrawer, setShowCodeDrawer] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [slideAnim] = useState(new Animated.Value(0));
  const [partnerData, setPartnerData] = useState<any>(null);
  const [coupleData, setCoupleData] = useState<any>(null);
  const [couplePhoto, setCouplePhoto] = useState<string | null>(null);

  // Vérifier si l'utilisateur a un partenaire connecté
  useEffect(() => {
    const checkPartner = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData) {
            // Vérifier si l'utilisateur a un partenaire (partnerId ou coupleCode)
            const partnerId = userData.partnerId;
            const code = userData.coupleCode;
            
            if (partnerId || code) {
              // Vérifier si le partenaire existe
              if (partnerId) {
                const partnerRef = doc(db, "users", partnerId);
                const partnerDoc = await getDoc(partnerRef);
                if (partnerDoc.exists()) {
                  const partnerData = partnerDoc.data();
                  if (partnerData) {
                    setHasPartner(true);
                    setPartnerData(partnerData);
                    // Récupérer la photo de couple (peut être dans userData ou partnerData)
                    const photo = userData.couplePhoto || partnerData.couplePhoto || null;
                    setCouplePhoto(photo);
                    // Calculer les données du couple
                    const userCreatedAt = new Date(userData.createdAt || new Date().toISOString());
                    const partnerCreatedAt = new Date(partnerData.createdAt || new Date().toISOString());
                    const coupleCreatedAt = userCreatedAt > partnerCreatedAt ? partnerCreatedAt : userCreatedAt;
                    setCoupleData({
                      joinedDate: coupleCreatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      daysTogether: Math.floor((new Date().getTime() - coupleCreatedAt.getTime()) / (1000 * 60 * 60 * 24)),
                    });
                  } else {
                    setHasPartner(false);
                  }
                } else {
                  setHasPartner(false);
                }
              } else {
                setHasPartner(false);
              }
              setCoupleCode(code || null);
            } else {
              setHasPartner(false);
            }
          } else {
            setHasPartner(false);
          }
        } else {
          setHasPartner(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du partenaire:", error);
        setHasPartner(false);
      } finally {
        setLoading(false);
      }
    };

    checkPartner();
  }, [user?.uid]);

  const handleResendCode = async () => {
    // TODO: Implémenter la logique pour renvoyer le code
    console.log("Resend code");
  };

  const handleCopyCode = async () => {
    if (!coupleCode) return;
    try {
      await Clipboard.setString(coupleCode);
      Alert.alert(
        t("couples.partnerNotConnected.codeCopied"),
        t("couples.partnerNotConnected.codeCopiedMessage")
      );
    } catch (error) {
      console.error("Erreur lors de la copie du code:", error);
      Alert.alert(t("errors.general"), t("errors.tryAgain"));
    }
  };

  const handleEnterCode = () => {
    setShowCodeDrawer(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleCloseDrawer = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowCodeDrawer(false);
      setInputCode("");
    });
  };

  const handleSubmitCode = async () => {
    if (!inputCode.trim() || inputCode.trim().length < 6) {
      Alert.alert(t("errors.general"), "Le code doit contenir au moins 6 caractères");
      return;
    }

    if (!user?.uid) {
      Alert.alert(t("errors.general"), "Vous devez être connecté");
      return;
    }

    try {
      const db = getFirestore();
      // Nettoyer le code (garder uniquement les lettres majuscules et chiffres)
      const cleanCode = inputCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      if (cleanCode.length < 6) {
        Alert.alert(t("errors.general"), "Le code doit contenir au moins 6 caractères (lettres et chiffres)");
        return;
      }

      // Vérifier que l'utilisateur n'essaie pas d'utiliser son propre code
      if (cleanCode === coupleCode) {
        Alert.alert(t("errors.general"), "Vous ne pouvez pas utiliser votre propre code");
        handleCloseDrawer();
        return;
      }

      // Chercher l'utilisateur avec ce code
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("coupleCode", "==", cleanCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert(t("errors.general"), "Code invalide. Vérifiez le code et réessayez.");
        return;
      }

      const partnerDoc = querySnapshot.docs[0];
      if (!partnerDoc) {
        Alert.alert(t("errors.general"), "Code invalide. Vérifiez le code et réessayez.");
        return;
      }
      
      const partnerId = partnerDoc.id;
      const partnerData = partnerDoc.data();
      
      if (!partnerData) {
        Alert.alert(t("errors.general"), "Impossible de récupérer les données du partenaire");
        return;
      }

      // Vérifier que le partenaire n'a pas déjà un partenaire
      if (partnerData.partnerId && partnerData.partnerId !== user.uid) {
        Alert.alert(t("errors.general"), "Ce code est déjà utilisé par un autre couple");
        handleCloseDrawer();
        return;
      }

      // Vérifier que l'utilisateur n'a pas déjà un partenaire
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : null;
      if (userData && userData.partnerId) {
        Alert.alert(t("errors.general"), "Vous avez déjà un partenaire connecté");
        handleCloseDrawer();
        return;
      }

      // Connecter les deux utilisateurs
      const partnerRef = doc(db, "users", partnerId);
      
      // Mettre à jour les deux documents
      await updateDoc(userRef, { partnerId: partnerId });
      await updateDoc(partnerRef, { partnerId: user.uid });

      // Mettre à jour l'état local
      setHasPartner(true);
      setPartnerData(partnerData);
      
      // Récupérer la photo de couple (peut être dans userData ou partnerData)
      const currentUserData = userDoc.exists() ? userDoc.data() : null;
      const photo = currentUserData?.couplePhoto || partnerData.couplePhoto || null;
      setCouplePhoto(photo);
      
      // Calculer les données du couple
      const userCreatedAt = new Date(currentUserData?.createdAt || new Date().toISOString());
      const partnerCreatedAt = new Date(partnerData.createdAt || new Date().toISOString());
      const coupleCreatedAt = userCreatedAt > partnerCreatedAt ? partnerCreatedAt : userCreatedAt;
      setCoupleData({
        joinedDate: coupleCreatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        daysTogether: Math.floor((new Date().getTime() - coupleCreatedAt.getTime()) / (1000 * 60 * 60 * 24)),
      });

      Alert.alert(
        "Partenaire connecté !",
        `Vous êtes maintenant connecté avec ${partnerData.pseudo || "votre partenaire"}`
      );

      handleCloseDrawer();
    } catch (error: any) {
      console.error("Erreur lors de la connexion du partenaire:", error);
      Alert.alert(t("errors.general"), error.message || "Une erreur est survenue");
    }
  };

  // Données réelles du couple
  const partnerName = partnerData?.pseudo?.toUpperCase() || "";
  const userName = user?.pseudo?.toUpperCase() || "FRANCISCO";
  const coupleName = partnerName ? `${userName} & ${partnerName}` : userName;
  const currentStreak = 0; // TODO: Calculer depuis Firestore
  const joinedDate = coupleData?.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const daysTogether = coupleData?.daysTogether || 0;
  const distance = "999km"; // TODO: Calculer depuis les coordonnées GPS si disponibles

  // Si le partenaire n'est pas connecté, afficher la page d'invitation
  if (!loading && !hasPartner) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[
            "#C41E3A", // Red top
            "#8B1538", // Darker red middle
            "#2A0505", // Very dark bottom
          ]}
          locations={[0, 0.4, 1]}
          style={styles.background}
        >
          <View style={[styles.partnerNotConnectedContainer, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
            {/* Code Display */}
            {coupleCode && (
              <View style={styles.codeDisplayContainer}>
                <Text style={styles.codeLabel}>
                  {t("couples.partnerNotConnected.yourCode")}
                </Text>
                <TouchableOpacity
                  style={styles.codeBox}
                  onPress={handleCopyCode}
                  activeOpacity={0.8}
                >
                  <Text style={styles.codeText}>{coupleCode}</Text>
                  <Ionicons name="copy-outline" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.codeHint}>
                  {t("couples.partnerNotConnected.codeHint")}
                </Text>
              </View>
            )}

            {/* Title */}
            <Text style={styles.title}>
              {t("couples.partnerNotConnected.title")}
            </Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              {t("couples.partnerNotConnected.subtitle")}
            </Text>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {/* Resend Code Button */}
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendCode}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#C41E3A", "#8B1538"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.buttonContent}>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                  <Text style={styles.resendButtonText}>
                    {t("couples.partnerNotConnected.resendCode")}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Enter Code Button */}
              <TouchableOpacity
                style={styles.enterCodeButton}
                onPress={handleEnterCode}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#FF4500", "#C41E3A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.buttonContent}>
                  <Ionicons name="person-add" size={20} color="white" />
                  <Text style={styles.enterCodeButtonText}>
                    {t("couples.partnerNotConnected.enterCode")}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Code Input Drawer Modal */}
        <Modal
          visible={showCodeDrawer}
          transparent
          animationType="none"
          onRequestClose={handleCloseDrawer}
        >
          <TouchableOpacity
            style={styles.drawerOverlay}
            activeOpacity={1}
            onPress={handleCloseDrawer}
          >
            <Animated.View
              style={[
                styles.drawerContainer,
                {
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [400, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                {/* Drawer Handle */}
                <View style={styles.drawerHandle} />

                {/* Title */}
                <Text style={styles.drawerTitle}>
                  {t("couples.partnerNotConnected.enterCode")}
                </Text>

                {/* Subtitle */}
                <Text style={styles.drawerSubtitle}>
                  {t("couples.partnerNotConnected.enterCodeSubtitle")}
                </Text>

                {/* Code Input */}
                <View style={styles.codeInputContainer}>
                  <TextInput
                    style={styles.codeInput}
                    value={inputCode}
                    onChangeText={(text) => {
                      // Ne garder que les lettres et chiffres, convertir en majuscules
                      const alphanumeric = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      setInputCode(alphanumeric);
                    }}
                    placeholder={t("couples.partnerNotConnected.codePlaceholder")}
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    keyboardType="default"
                    autoCapitalize="characters"
                    maxLength={20}
                    autoFocus
                  />
                </View>

                {/* Buttons */}
                <View style={styles.drawerButtonsContainer}>
                  <TouchableOpacity
                    style={styles.drawerCancelButton}
                    onPress={handleCloseDrawer}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.drawerCancelButtonText}>
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.drawerSubmitButton,
                      inputCode.trim().length < 6 && styles.drawerSubmitButtonDisabled,
                    ]}
                    onPress={handleSubmitCode}
                    activeOpacity={0.8}
                    disabled={inputCode.trim().length < 6}
                  >
                    <LinearGradient
                      colors={
                        inputCode.trim().length >= 6
                          ? ["#C41E3A", "#8B1538"]
                          : ["#555", "#333"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.drawerSubmitButtonGradient}
                    >
                      <Text style={styles.drawerSubmitButtonText}>
                        {t("common.validate")}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          "#C41E3A", // Red top
          "#8B1538", // Darker red middle
          "#2A0505", // Very dark bottom
        ]}
        locations={[0, 0.4, 1]}
        style={styles.background}
      >
        <ChristmasSnow />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          bounces={false}
        >
          {/* Header with Background Image */}
          <ImageBackground
            source={
              couplePhoto
                ? { uri: couplePhoto }
                : { uri: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=2574&auto=format&fit=crop" }
            }
            style={styles.headerBackground}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['transparent', '#C41E3A']} // Blend into the gradient color
              style={styles.headerOverlay}
              locations={[0.2, 1]}
            />

            <View style={[styles.headerTopActions, { top: insets.top + 10 }]}>
              <TouchableOpacity style={styles.addImageButton}>
                <MaterialCommunityIcons name="image-plus" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.namesContainer}>
              <Text style={styles.coupleNames}>{coupleName}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" size={24} color="#FFB6C1" />
                <View style={styles.statTextColumn}>
                  <Text style={styles.statLabel}>current streak</Text>
                  <Text style={styles.statValue}>{currentStreak} days</Text>
                </View>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="calendar" size={24} color="#FFB6C1" />
                <View style={styles.statTextColumn}>
                  <Text style={styles.statLabel}>joined on</Text>
                  <Text style={styles.statValue}>{joinedDate}</Text>
                </View>
              </View>
            </View>
          </ImageBackground>

          <View style={styles.contentContainer}>

            {/* Widgets */}
            <Text style={styles.sectionTitle}>Widgets</Text>
            <View style={styles.widgetsContainer}>
              {/* Days Together */}
              <View style={[styles.widgetCard, styles.leftWidget]}>
                <View style={styles.daysWidgetContent}>
                  <View style={styles.heartsIconContainer}>
                    <Ionicons name="heart" size={38} color="#FFB6C1" style={styles.heartIconMain} />
                    <Ionicons name="heart" size={28} color="#FFB6C1" style={styles.heartIconSecondary} />
                  </View>
                  <Text style={styles.daysCount}>{daysTogether}</Text>
                  <Text style={styles.daysLabel}>days{"\n"}together</Text>
                </View>
              </View>

              {/* Distance */}
              <View style={[styles.widgetCard, styles.rightWidget]}>
                <View style={styles.distanceWidgetContent}>
                  <View style={styles.distanceVisual}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
                    </View>
                    <View style={styles.distanceLine} />
                    <View style={styles.centerIcon}>
                      <Ionicons name="person" size={16} color="#FFB6C1" />
                      <Ionicons name="heart" size={10} color="#FFB6C1" style={styles.smallHeartIcon} />
                    </View>
                    <View style={styles.distanceLine} />
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{partnerName.charAt(0)}</Text>
                    </View>
                  </View>
                  <Text style={styles.distanceText}>{distance}</Text>
                  <Text style={styles.distanceLabel}>between us</Text>
                </View>

                <View style={styles.widgetSeparator} />

                <TouchableOpacity style={styles.addWidgetRow}>
                  <Text style={styles.addWidgetText}>Add</Text>
                  <Ionicons name="chevron-forward" size={16} color="#FFB6C1" />
                </TouchableOpacity>
              </View>
            </View>
            {/* Your Daily */}
            <Text style={styles.sectionTitle}>Your daily</Text>
            <View style={styles.dailyCard}>
              <View style={styles.dailyHeader}>
                <View style={styles.dailyFlamesContainer}>
                  <MaterialCommunityIcons name="fire" size={32} color="#8B1538" style={{ opacity: 0.6 }} />
                  <MaterialCommunityIcons name="fire" size={32} color="#8B1538" style={{ opacity: 0.6 }} />
                </View>
                <Text style={styles.dailyTitle}>It's time to connect!</Text>
                <Text style={styles.dailySubtitle}>
                  Play the daily game to feel{"\n"}even closer.
                </Text>
              </View>
              <TouchableOpacity style={styles.discoverButton} activeOpacity={0.8}>
                <Text style={styles.discoverButtonText}>Discover daily</Text>
              </TouchableOpacity>
            </View>

            {/* History Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>History</Text>
              <View style={styles.historyCard}>
                <View style={styles.streakContainer}>
                  <View style={styles.streakFlameContainer}>
                    <MaterialCommunityIcons name="fire" size={80} color="#FF4500" />
                    <Text style={styles.streakNumberLarge}>{currentStreak}</Text>
                  </View>
                  <Text style={styles.streakTitle}>Streak with {partnerName}</Text>
                  <Text style={styles.streakSubtitle}>
                    Your daily connection helps{"\n"}your streak grow and strengthens{"\n"}your bond.
                  </Text>
                </View>

                <View style={styles.weekDaysContainer}>
                  {[
                    { day: 'Su', active: true, num: 1 },
                    { day: 'Mo', active: true, num: 2 },
                    { day: 'Tu', active: true, num: 3 },
                    { day: 'We', active: false },
                    { day: 'Th', active: false },
                    { day: 'Fr', active: false },
                    { day: 'Sa', active: false }
                  ].map((item, index) => (
                    <View key={index} style={styles.dayColumn}>
                      <Text style={[styles.weekDayText, item.active && styles.weekDayTextActive]}>
                        {item.day}
                      </Text>
                      <View style={styles.dayFlameContainer}>
                        <MaterialCommunityIcons
                          name="fire"
                          size={36}
                          color={item.active ? "#FF7F50" : "rgba(255, 255, 255, 0.1)"}
                        />
                        {item.active && (
                          <Text style={styles.dayFlameNumber}>{item.num}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  headerBackground: {
    width: "100%",
    height: 300, // Adjust height as needed
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)", // Darken the image slightly
  },
  headerTopActions: {
    position: "absolute",
    top: 60, // Adjust for safe area
    right: 20,
    zIndex: 10,
  },
  addImageButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  namesContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  coupleNames: {
    color: "white",
    fontSize: 28,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dailyCard: {
    backgroundColor: "#2D223A", // Theme card color
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.1)",
    alignItems: "center",
    marginBottom: 30,
  },
  dailyHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  dailyFlamesContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  dailyTitle: {
    color: "white",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  dailySubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  discoverButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(10px)",
  },
  discoverButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    letterSpacing: 0.2,
  },
  historyCard: {
    backgroundColor: "#2D223A", // Theme card color
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.1)",
  },
  streakContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  streakFlameContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  streakNumberLarge: {
    position: "absolute",
    color: "white",
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    top: 35, // Adjust based on icon size
  },
  streakTitle: {
    color: "white",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  streakSubtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontFamily: "Roboto-Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  weekDaysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
  },
  dayColumn: {
    alignItems: "center",
    gap: 8,
  },
  weekDayText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
  },
  weekDayTextActive: {
    color: "#FF7F50", // Orange for active days
  },
  dayFlameContainer: {
    width: 36,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dayFlameNumber: {
    position: "absolute",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    top: 14, // Adjust to center in the flame
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    width: "100%",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statTextColumn: {
    alignItems: "flex-start",
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 10,
    fontFamily: "Roboto-Regular",
  },
  statValue: {
    color: "white",
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
  },
  contentContainer: {
    padding: 20,
    marginTop: 20,
  },
  premiumBox: {
    backgroundColor: "#3A2A2A", // Dark brownish/grey
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  premiumText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    marginBottom: 16,
    lineHeight: 24,
  },
  tryPremiumButton: {
    backgroundColor: "#FF4500", // Bright orange/red
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "flex-start",
    shadowColor: "#FF4500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tryPremiumText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    marginBottom: 16,
  },
  widgetsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
    height: 180, // Fixed height for alignment
  },
  widgetCard: {
    backgroundColor: "#2D223A", // Theme card color
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.2)",
    overflow: "hidden",
  },
  leftWidget: {
    flex: 0.8, // Slightly narrower
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  rightWidget: {
    flex: 1.2, // Slightly wider
    paddingTop: 20,
  },
  daysWidgetContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  heartsIconContainer: {
    flexDirection: "row",
    marginBottom: 12,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  heartIconMain: {
    zIndex: 2,
    transform: [{ rotate: "-10deg" }],
  },
  heartIconSecondary: {
    marginLeft: -10,
    marginTop: -10,
    opacity: 0.8,
    transform: [{ rotate: "10deg" }],
  },
  daysCount: {
    color: "#FFB6C1", // Light pink/peach
    fontSize: 32,
    fontFamily: "Montserrat-Bold",
    marginBottom: 4,
    textAlign: "center",
  },
  daysLabel: {
    color: "rgba(255, 182, 193, 0.6)",
    fontSize: 14,
    fontFamily: "Roboto-Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  distanceWidgetContent: {
    alignItems: "center",
    paddingHorizontal: 16,
    flex: 1,
  },
  distanceVisual: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.3)",
  },
  avatarText: {
    color: "#FFB6C1",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
  },
  distanceLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 182, 193, 0.3)",
    marginHorizontal: 8,
  },
  centerIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  smallHeartIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
  },
  distanceText: {
    color: "#FFB6C1",
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    marginBottom: 2,
  },
  distanceLabel: {
    color: "rgba(255, 182, 193, 0.6)",
    fontSize: 12,
    fontFamily: "Roboto-Regular",
  },
  widgetSeparator: {
    height: 1,
    backgroundColor: "rgba(255, 182, 193, 0.1)",
    width: "100%",
    marginTop: "auto",
  },
  addWidgetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0, 0, 0, 0.1)", // Slightly darker bottom area
  },
  addWidgetText: {
    color: "#FFB6C1",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
  },
  dailySection: {
    backgroundColor: "#3A1A1A", // Darker red background for bottom section
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
    minHeight: 200,
  },
  dailyContent: {
    alignItems: "center",
    marginBottom: 30,
  },
  flamesRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 30,
    padding: 4,
    width: "100%",
    height: 60,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    gap: 8,
  },
  activeToggle: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  toggleText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  partnerNotConnectedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  codeDisplayContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  codeLabel: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 12,
    textAlign: "center",
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(196, 30, 58, 0.3)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: "rgba(196, 30, 58, 0.5)",
    gap: 12,
    minWidth: 200,
  },
  codeText: {
    color: "white",
    fontSize: 24,
    fontFamily: "Montserrat-Bold",
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 12,
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontFamily: "BebasNeue-Regular",
    color: "white",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 28,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Montserrat-Regular",
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    width: "100%",
    gap: 16,
    paddingHorizontal: 20,
  },
  resendButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#FF4500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  resendButtonText: {
    color: "white",
    fontSize: 17,
    fontFamily: "Montserrat-Bold",
  },
  enterCodeButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    overflow: "hidden",
  },
  enterCodeButtonText: {
    color: "white",
    fontSize: 17,
    fontFamily: "Montserrat-Bold",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  // Drawer Modal Styles
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  drawerContainer: {
    backgroundColor: "#2A0505",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 24,
    maxHeight: "70%",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(196, 30, 58, 0.3)",
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  drawerTitle: {
    fontSize: 24,
    fontFamily: "BebasNeue-Regular",
    color: "white",
    textAlign: "center",
    marginBottom: 12,
  },
  drawerSubtitle: {
    fontSize: 15,
    fontFamily: "Montserrat-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  codeInputContainer: {
    marginBottom: 32,
  },
  codeInput: {
    backgroundColor: "rgba(196, 30, 58, 0.2)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    color: "white",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    borderWidth: 1.5,
    borderColor: "rgba(196, 30, 58, 0.4)",
  },
  drawerButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  drawerCancelButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  drawerCancelButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  drawerSubmitButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  drawerSubmitButtonDisabled: {
    opacity: 0.5,
  },
  drawerSubmitButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  drawerSubmitButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
});
