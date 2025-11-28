"use client";

import Colors from "@/constants/Colors";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  Modal,
  TextInput,
  Animated,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChristmasSnow from "@/components/ChristmasSnow";
import { useAuth } from "@/contexts/AuthContext";
import { usePaywall } from "@/contexts/PaywallContext";
import { useTranslation } from "react-i18next";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from "@react-native-firebase/firestore";
import functions from "@react-native-firebase/functions";
import storage from "@react-native-firebase/storage";
import Clipboard from "@react-native-clipboard/clipboard";

// ImagePicker - rendre optionnel si le module n'est pas installé
let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {
  console.warn('expo-image-picker not available');
}

// DateTimePicker - rendre optionnel si le module n'est pas installé
let DateTimePicker: any = null;
try {
  const dtp = require('@react-native-community/datetimepicker');
  DateTimePicker = dtp.default || dtp;
} catch (e) {
  console.warn('DateTimePicker not available');
}
import { useCoupleLocation } from "@/hooks/useCoupleLocation";
import { useCoupleStreak } from "@/hooks/useCoupleStreak";
import { useDailyChallenge } from "@/hooks/useDailyChallenge";
import {
  trackCouplesScreenViewed,
  trackCoupleCodeCopied,
  trackCoupleCodeEntryStarted,
  trackCoupleConnected,
  trackCoupleConnectionFailed,
  trackCoupleDisconnected,
  trackCouplePhotoUploaded,
  trackCouplePhotoUploadButtonClicked,
  trackCoupleDateModified,
  trackCoupleDateEditClicked,
  trackBreakCoupleButtonClicked,
  trackDailyChallenge,
  trackDailyChallengeSkipped,
  trackDailyChallengePaywallShown,
  trackDailyChallengeResponseSubmitted,
  trackLocationSharingToggled,
  trackDistanceCalculated,
  trackGPSPermissionDenied,
  trackStreakIncreased,
  trackCouplesSystemUsage,
} from "@/services/couplesAnalytics";
import { WidgetService } from "@/services/widgetService";

// Fonction helper pour générer l'ID du couple
const getCoupleId = (userId1: string, userId2: string): string => {
  const sorted = [userId1, userId2].sort();
  return `${sorted[0]}_${sorted[1]}`;
};

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
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(6).fill(''));
  const codeInputRefs = useRef<(TextInput | null)[]>([]);
  const [slideAnim] = useState(new Animated.Value(0));
  const [partnerData, setPartnerData] = useState<any>(null);
  const [coupleData, setCoupleData] = useState<any>(null);
  const [couplePhoto, setCouplePhoto] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customJoinedDate, setCustomJoinedDate] = useState<Date | null>(null);

  // Hooks pour les nouvelles fonctionnalités
  const { 
    distance, 
    distanceKm,
    isLocationSharingEnabled, 
    enableLocationSharing, 
    disableLocationSharing,
    hasPermission,
    requestPermission,
    updateLocation,
    loading: locationLoading,
    error: locationError
  } = useCoupleLocation(partnerId || undefined);
  const { 
    currentStreak, 
    longestStreak,
    weekActivity, 
    recordActivity, 
    checkAndUpdateStreak,
    loading: streakLoading 
  } = useCoupleStreak(partnerId || undefined);
  const { 
    todayChallenge, 
    hasCompletedToday, 
    submitResponse, 
    userResponse, 
    partnerResponse,
    loading: challengeLoading,
    skipChallenge,
    freeChallengesUsed,
    freeChallengesRemaining,
    canUseChallenge
  } = useDailyChallenge(partnerId || undefined, isProMember);

  // Vérifier si l'utilisateur a un partenaire connecté (avec listener en temps réel)
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const userRef = doc(db, "users", user.uid);

    // Fonction pour charger les données du partenaire
    const loadPartnerData = async (partnerId: string) => {
      try {
        setPartnerId(partnerId);
        const partnerRef = doc(db, "users", partnerId);
        const partnerDoc = await getDoc(partnerRef);
        
        if (partnerDoc.exists()) {
          const partnerData = partnerDoc.data();
          
          if (partnerData) {
            setHasPartner(true);
            setPartnerData(partnerData);
            
            // Récupérer les données de l'utilisateur pour calculer les dates
            const userDoc = await getDoc(userRef);
            const userData = userDoc.exists() ? userDoc.data() : null;
            
            // Récupérer la photo de couple
            const photo = userData?.couplePhoto || partnerData.couplePhoto || null;
            setCouplePhoto(photo);
            
            // Calculer les données du couple
            // Vérifier s'il y a une date personnalisée dans le document couple
            const coupleId = getCoupleId(user.uid, partnerId);
            const coupleRef = doc(db, 'couples', coupleId);
            const coupleDoc = await getDoc(coupleRef);
            
            let joinedDate: Date;
            if (coupleDoc.exists()) {
              const coupleDocData = coupleDoc.data();
              // Si une date personnalisée existe, l'utiliser
              if (coupleDocData?.customJoinedDate) {
                joinedDate = new Date(coupleDocData.customJoinedDate);
                setCustomJoinedDate(joinedDate);
              } else {
                // Sinon, utiliser la date de création la plus ancienne
                const userCreatedAt = new Date(userData?.createdAt || new Date().toISOString());
                const partnerCreatedAt = new Date(partnerData.createdAt || new Date().toISOString());
                joinedDate = userCreatedAt > partnerCreatedAt ? partnerCreatedAt : userCreatedAt;
                setCustomJoinedDate(null);
              }
            } else {
              // Pas de document couple, utiliser la date de création la plus ancienne
              const userCreatedAt = new Date(userData?.createdAt || new Date().toISOString());
              const partnerCreatedAt = new Date(partnerData.createdAt || new Date().toISOString());
              joinedDate = userCreatedAt > partnerCreatedAt ? partnerCreatedAt : userCreatedAt;
              setCustomJoinedDate(null);
            }
            
            const daysTogether = Math.floor((new Date().getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
            
            setCoupleData({
              joinedDate: joinedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              daysTogether: daysTogether,
            });
          } else {
            setHasPartner(false);
          }
        } else {
          setHasPartner(false);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du partenaire:", error);
        setHasPartner(false);
      }
    };

    // Vérification initiale IMMÉDIATE (avant le listener) pour éviter d'afficher la page d'invitation
    const initialCheck = async () => {
      try {
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData) {
            // Générer un code s'il n'existe pas
            let code = userData.coupleCode;
            if (!code) {
              const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
              let generatedCode = "";
              for (let i = 0; i < 6; i++) {
                generatedCode += chars.charAt(Math.floor(Math.random() * chars.length));
              }
              code = generatedCode;
              await updateDoc(userRef, { coupleCode: code });
            }
            setCoupleCode(code || null);

            // Vérifier immédiatement si l'utilisateur a un partenaire
            const partnerId = userData.partnerId;
            
            if (partnerId) {
              await loadPartnerData(partnerId);
              setLoading(false);
            } else {
              // Vérification alternative : chercher si quelqu'un a ce code comme partenaire
              // ou vérifier dans la collection couples si on a un document avec notre UID
              try {
                // D'abord, chercher dans les utilisateurs
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("coupleCode", "==", code));
                const querySnapshot = await getDocs(q);
                
                let partnerFound = false;
                querySnapshot.forEach((docSnap) => {
                  const otherUserData = docSnap.data();
                  
                  // Si cet utilisateur a notre UID comme partnerId, alors nous sommes connectés
                  if (otherUserData.partnerId === user.uid && docSnap.id !== user.uid) {
                    setPartnerId(docSnap.id);
                    loadPartnerData(docSnap.id).then(() => {
                      setLoading(false);
                    });
                    partnerFound = true;
                    return;
                  }
                });
                
                // Si pas trouvé, vérifier dans la collection couples
                if (!partnerFound) {
                  const couplesRef = collection(db, "couples");
                  const couplesQuery = query(couplesRef);
                  const couplesSnapshot = await getDocs(couplesQuery);
                  
                  couplesSnapshot.forEach((coupleDoc) => {
                    const coupleData = coupleDoc.data();
                    const userIds = coupleData.userIds || [];
                    
                    // Si ce document contient notre UID, trouver l'autre UID
                    if (userIds.includes(user.uid) && userIds.length === 2) {
                      const otherUserId = userIds.find((id: string) => id !== user.uid);
                      if (otherUserId) {
                        // Mettre à jour notre document utilisateur avec le partnerId
                        updateDoc(userRef, { partnerId: otherUserId }).then(() => {
                          setPartnerId(otherUserId);
                          loadPartnerData(otherUserId).then(() => {
                            setLoading(false);
                          });
                        }).catch((err) => {
                          console.error("Erreur lors de la mise à jour:", err);
                          // Charger quand même les données du partenaire
                          setPartnerId(otherUserId);
                          loadPartnerData(otherUserId).then(() => {
                            setLoading(false);
                          });
                        });
                        partnerFound = true;
                        return;
                      }
                    }
                  });
                }
                
                // Si on arrive ici, pas de partenaire trouvé
                if (!partnerFound) {
                  setHasPartner(false);
                  setLoading(false);
                }
              } catch (error) {
                console.error("Erreur lors de la vérification alternative:", error);
                setHasPartner(false);
                setLoading(false);
              }
            }
          } else {
            setHasPartner(false);
            setLoading(false);
          }
        } else {
          setHasPartner(false);
          setLoading(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification initiale:", error);
        setHasPartner(false);
        setLoading(false);
      }
    };

    // Faire la vérification initiale
    initialCheck();

    // Ensuite, écouter les changements en temps réel sur le document utilisateur
    const unsubscribe = onSnapshot(
      userRef,
      async (userDoc) => {
        try {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData) {
              // Générer un code s'il n'existe pas
              let code = userData.coupleCode;
              if (!code) {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                let generatedCode = "";
                for (let i = 0; i < 6; i++) {
                  generatedCode += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                code = generatedCode;
                await updateDoc(userRef, { coupleCode: code });
              }
              setCoupleCode(code || null);

              // Vérifier si l'utilisateur a un partenaire
              const partnerId = userData.partnerId;
              if (partnerId) {
                await loadPartnerData(partnerId);
              } else {
                setHasPartner(false);
                setPartnerId(null);
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
        }
      },
      (error) => {
        console.error("Erreur lors de l'écoute du document utilisateur:", error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Track l'écran et vérifier le streak au montage
  useEffect(() => {
    trackCouplesScreenViewed(hasPartner, {
      currentStreak,
      distanceKm: distanceKm || undefined,
      hasActiveChallenge: !!todayChallenge && !hasCompletedToday,
      locationSharingEnabled: isLocationSharingEnabled,
    });
    
    // Track l'utilisation globale du système de couples
    if (hasPartner && partnerId) {
      trackCouplesSystemUsage({
        daysTogether: coupleData?.daysTogether || 0,
        currentStreak,
        longestStreak: longestStreak || 0,
        locationSharingEnabled: isLocationSharingEnabled,
        averageDistanceKm: distanceKm || undefined,
      });
      checkAndUpdateStreak();
    }
  }, [hasPartner, partnerId, currentStreak, longestStreak, coupleData?.daysTogether, distanceKm, todayChallenge, hasCompletedToday, isLocationSharingEnabled]);

  // Synchroniser les données avec le widget depuis Firebase en temps réel
  useEffect(() => {
    if (!user?.uid) return;

    if (!hasPartner || !partnerId) {
      // Pas de partenaire, vider les données du widget
      WidgetService.syncCoupleData(
        user.uid,
        null,
        null,
        null,
        0,
        null
      );
      return;
    }

    // Synchroniser initialement avec les données actuelles
    const syncInitialData = async () => {
      await WidgetService.syncCoupleData(
        user.uid,
        partnerId,
        { currentStreak, longestStreak },
        distance || null,
        daysTogether,
        {
          hasActive: !!todayChallenge && !hasCompletedToday,
          text: todayChallenge?.question || '',
        }
      );
    };

    syncInitialData();

    // Écouter les changements en temps réel depuis Firebase
    const unsubscribe = WidgetService.setupCoupleDataListener(
      user.uid,
      partnerId
    );

    // Cleanup à la désactivation
    return () => {
      unsubscribe();
    };
  }, [
    user?.uid,
    hasPartner,
    partnerId,
    // Ne pas dépendre de toutes les données pour éviter trop de re-renders
    // Les listeners Firebase se chargeront des mises à jour
  ]);

  const handleResendCode = async () => {
    // TODO: Implémenter la logique pour renvoyer le code
  };

  const handleCopyCode = async () => {
    if (!coupleCode) return;
    try {
      await Clipboard.setString(coupleCode);
      await trackCoupleCodeCopied(coupleCode);
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
    trackCoupleCodeEntryStarted();
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
      setCodeDigits(Array(6).fill(''));
      codeInputRefs.current.forEach((ref) => ref?.blur());
    });
  };

  const handleCodeDigitChange = (value: string, index: number) => {
    // Ne garder que les lettres et chiffres, convertir en majuscules
    const alphanumeric = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Si plusieurs caractères sont collés (paste détecté)
    if (alphanumeric.length > 1) {
      // Vider immédiatement le champ source
      if (codeInputRefs.current[index]) {
        codeInputRefs.current[index].setNativeProps({ text: '' });
      }
      // Distribuer les caractères dans les champs appropriés
      const newDigits = Array(6).fill('');
      for (let i = 0; i < Math.min(alphanumeric.length, 6); i++) {
        if (index + i < 6) {
          newDigits[index + i] = alphanumeric[i];
        }
      }
      setCodeDigits(newDigits);
      setInputCode(newDigits.join(''));
      
      // Focus sur le dernier champ rempli ou le premier vide
      const lastFilledIndex = Math.min(index + alphanumeric.length - 1, 5);
      const nextEmptyIndex = lastFilledIndex + 1;
      if (nextEmptyIndex < 6) {
        setTimeout(() => {
          codeInputRefs.current[nextEmptyIndex]?.focus();
        }, 50);
      } else {
        codeInputRefs.current.forEach((ref) => ref?.blur());
      }
      return;
    }
    
    // Comportement normal : un seul caractère
    const char = alphanumeric.slice(0, 1);
    const newDigits = [...codeDigits];
    newDigits[index] = char;
    setCodeDigits(newDigits);
    
    // Mettre à jour le code complet
    const fullCode = newDigits.join('');
    setInputCode(fullCode);
    
    // Passer au champ suivant si un caractère a été saisi
    if (char && index < 5) {
      codeInputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    // Gérer la suppression : si Backspace et champ vide, aller au précédent
    if (key === 'Backspace' && !codeDigits[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmitCode = async () => {
    const fullCode = codeDigits.join('');
    if (!fullCode.trim() || fullCode.trim().length < 6) {
      Alert.alert(t("errors.general"), "Le code doit contenir au moins 6 caractères");
      return;
    }

    if (!user?.uid) {
      Alert.alert(t("errors.general"), "Vous devez être connecté");
      return;
    }

    try {
      // Nettoyer le code (garder uniquement les lettres majuscules et chiffres)
      const cleanCode = fullCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      
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

      // Appeler la Cloud Function pour connecter le couple
      const connectCoupleFn = functions().httpsCallable("connectCouple");
      const result = await connectCoupleFn({ partnerCode: cleanCode });
      
      const resultData = result.data as any;
      
      if (resultData.success) {
        // Mettre à jour l'état local avec les données retournées
        setHasPartner(true);
        setPartnerId(resultData.partnerId);
        setPartnerData(resultData.partnerData);
        
        // Récupérer les données complètes du couple depuis Firebase
        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const currentUserData = userDoc.exists() ? userDoc.data() : null;
        
        // Récupérer la photo de couple
        const photo = currentUserData?.couplePhoto || resultData.partnerData.couplePhoto || null;
        setCouplePhoto(photo);
        
        // Calculer les données du couple
        const userCreatedAt = new Date(currentUserData?.createdAt || new Date().toISOString());
        const partnerCreatedAt = new Date(resultData.partnerData.createdAt || new Date().toISOString());
        const coupleCreatedAt = userCreatedAt > partnerCreatedAt ? partnerCreatedAt : userCreatedAt;
        setCoupleData({
          joinedDate: coupleCreatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          daysTogether: Math.floor((new Date().getTime() - coupleCreatedAt.getTime()) / (1000 * 60 * 60 * 24)),
        });

        await trackCoupleConnected(cleanCode, resultData.partnerId);
        
        Alert.alert(
          "Partenaire connecté !",
          resultData.message || `Vous êtes maintenant connecté avec ${resultData.partnerData.pseudo || "votre partenaire"}`
        );

        handleCloseDrawer();
      } else {
        throw new Error(resultData.message || "Erreur lors de la connexion");
      }
    } catch (error: any) {
      console.error("Erreur lors de la connexion du partenaire:", error);
      
      // Gérer les erreurs spécifiques de la Cloud Function
      let errorMessage = "Une erreur est survenue";
      
      if (error?.code === "not-found") {
        errorMessage = "Code invalide. Vérifiez le code et réessayez.";
        await trackCoupleConnectionFailed("invalid_code");
      } else if (error?.code === "failed-precondition") {
        errorMessage = error.message || "Ce code est déjà utilisé ou vous avez déjà un partenaire";
        await trackCoupleConnectionFailed("partner_already_connected");
      } else if (error?.code === "invalid-argument") {
        errorMessage = error.message || "Code invalide";
        await trackCoupleConnectionFailed("invalid_code");
      } else {
        await trackCoupleConnectionFailed("unknown_error");
      }
      
      Alert.alert(t("errors.general"), errorMessage);
    }
  };

  // Gérer le changement de date dans le datePicker
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setCustomJoinedDate(selectedDate);
    }
  };

  // Sauvegarder la date personnalisée de mise en couple
  const handleSaveJoinedDate = async (date: Date) => {
    if (!user?.uid || !partnerId) {
      Alert.alert(t("errors.general"), "Impossible de sauvegarder la date");
      return;
    }

    try {
      const db = getFirestore();
      const coupleId = getCoupleId(user.uid, partnerId);
      const coupleRef = doc(db, 'couples', coupleId);
      
      // Créer ou mettre à jour le document couple avec la date personnalisée
      await setDoc(coupleRef, {
        customJoinedDate: date.toISOString(),
      }, { merge: true });

      // Mettre à jour l'état local
      const daysTogether = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      setCoupleData({
        joinedDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        daysTogether: daysTogether,
      });

      setShowDatePicker(false);
      const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      await trackCoupleDateModified(formattedDate, daysTogether);
      Alert.alert("Succès", "La date de mise en couple a été mise à jour");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la date:", error);
      Alert.alert(t("errors.general"), "Erreur lors de la sauvegarde de la date");
    }
  };

  // Sélectionner et uploader une photo de couple
  const handlePickImage = async () => {
    await trackCouplePhotoUploadButtonClicked();
    
    if (!ImagePicker) {
      Alert.alert(t("errors.general"), "La sélection d'image n'est pas disponible");
      return;
    }

    if (!user?.uid || !partnerId) {
      Alert.alert(t("errors.general"), "Vous devez être connecté avec un partenaire");
      return;
    }

    try {
      // Demander la permission d'accéder à la galerie
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission requise",
          "L'accès à la galerie est nécessaire pour sélectionner une photo."
        );
        return;
      }

      // Ouvrir le sélecteur d'image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await handleUploadImage(imageUri);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
      Alert.alert(t("errors.general"), "Erreur lors de la sélection de l'image");
    }
  };

  // Uploader l'image vers Firebase Storage
  const handleUploadImage = async (imageUri: string) => {
    if (!user?.uid || !partnerId) {
      return;
    }

    try {
      // Créer une référence dans Firebase Storage
      const coupleId = getCoupleId(user.uid, partnerId);
      const filename = `couple_${coupleId}_${Date.now()}.jpg`;
      const storageRef = storage().ref(`couple-photos/${coupleId}/${filename}`);

      // Uploader l'image en utilisant putFile pour React Native
      const uploadTask = storageRef.putFile(imageUri);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          // Vous pouvez ajouter une barre de progression ici si nécessaire
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress}%`);
        },
        (error) => {
          console.error("Erreur lors de l'upload:", error);
          Alert.alert(t("errors.general"), "Erreur lors de l'upload de l'image");
        },
        async () => {
          try {
            // Upload terminé, récupérer l'URL de téléchargement
            const downloadURL = await storageRef.getDownloadURL();
            
            // Mettre à jour les documents Firestore pour les deux utilisateurs
            const db = getFirestore();
            const userRef = doc(db, "users", user.uid);
            const partnerRef = doc(db, "users", partnerId);
            
            await Promise.all([
              updateDoc(userRef, { couplePhoto: downloadURL }),
              updateDoc(partnerRef, { couplePhoto: downloadURL })
            ]);

            // Mettre à jour l'état local
            setCouplePhoto(downloadURL);
            
            // Track l'upload de photo
            await trackCouplePhotoUploaded();
            
            Alert.alert("Succès", "La photo de couple a été mise à jour");
          } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            Alert.alert(t("errors.general"), "Erreur lors de la mise à jour de la photo");
          }
        }
      );
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      Alert.alert(t("errors.general"), "Erreur lors de l'upload de l'image");
    }
  };

  // Séparer le couple
  const handleBreakCouple = () => {
    trackBreakCoupleButtonClicked();
    
    Alert.alert(
      "Séparer le couple",
      "Êtes-vous sûr de vouloir séparer le couple ? Cette action est irréversible.",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Séparer",
          style: "destructive",
          onPress: async () => {
            if (!user?.uid || !partnerId) {
              Alert.alert(t("errors.general"), "Impossible de séparer le couple");
              return;
            }

            try {
              const db = getFirestore();
              const userRef = doc(db, "users", user.uid);
              const partnerRef = doc(db, "users", partnerId);

              // Supprimer le partnerId des deux utilisateurs
              await Promise.all([
                updateDoc(userRef, { partnerId: null }),
                updateDoc(partnerRef, { partnerId: null })
              ]);

              // Supprimer aussi la photo de couple si elle existe
              await Promise.all([
                updateDoc(userRef, { couplePhoto: null }),
                updateDoc(partnerRef, { couplePhoto: null })
              ]);

              // Réinitialiser les états locaux immédiatement
              setHasPartner(false);
              setPartnerId(null);
              setPartnerData(null);
              setCouplePhoto(null);
              setCoupleData(null);
              setCustomJoinedDate(null);

              // Track la séparation du couple
              await trackCoupleDisconnected('user_initiated');
              
              // Le listener onSnapshot détectera automatiquement le changement
              // et mettra à jour l'interface pour afficher l'écran avec le code
              
              Alert.alert("Couple séparé", "Le couple a été séparé avec succès", [
                {
                  text: "OK",
                  onPress: () => {
                    // L'écran se mettra automatiquement à jour via le listener
                  }
                }
              ]);
            } catch (error) {
              console.error("Erreur lors de la séparation du couple:", error);
              Alert.alert(t("errors.general"), "Erreur lors de la séparation du couple");
            }
          }
        }
      ]
    );
  };

  // Données réelles du couple
  const partnerName = partnerData?.pseudo || "";
  const userName = user?.pseudo || "";
  const coupleName = partnerName && userName 
    ? `${userName.toUpperCase()} & ${partnerName.toUpperCase()}` 
    : userName ? userName.toUpperCase() : "COUPLE";
  const joinedDate = coupleData?.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const daysTogether = coupleData?.daysTogether || 0;
  
  // Formater la distance pour l'affichage
  let displayDistance = "N/A";
  if (distance) {
    displayDistance = distance;
  } else if (distanceKm !== null && distanceKm !== undefined) {
    if (distanceKm < 1) {
      displayDistance = `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 100) {
      displayDistance = `${distanceKm.toFixed(1)}km`;
    } else {
      displayDistance = `${Math.round(distanceKm)}km`;
    }
  }

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

                {/* Code Input - 6 champs séparés comme dans la home */}
                <View style={styles.codeInputContainer}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        codeInputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.codeDigitInput,
                        codeDigits[index] && styles.codeDigitInputFilled,
                      ]}
                      value={codeDigits[index]}
                      onChangeText={(value) => handleCodeDigitChange(value, index)}
                      onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, index)}
                      keyboardType="default"
                      autoCapitalize="characters"
                      maxLength={index === 0 ? 6 : 1}
                      selectTextOnFocus
                      autoFocus={index === 0 && showCodeDrawer}
                    />
                  ))}
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
                      codeDigits.join('').trim().length < 6 && styles.drawerSubmitButtonDisabled,
                    ]}
                    onPress={handleSubmitCode}
                    activeOpacity={0.8}
                    disabled={codeDigits.join('').trim().length < 6}
                  >
                    <LinearGradient
                      colors={
                        codeDigits.join('').trim().length >= 6
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
              <View style={styles.headerActionsRow}>
                <TouchableOpacity 
                  style={styles.breakCoupleButton}
                  onPress={handleBreakCouple}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="heart-broken" size={24} color="#FF6B6B" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.addImageButton}
                  onPress={handlePickImage}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="image-plus" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.namesContainer}>
              <Text style={styles.coupleNames}>{coupleName}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" size={26} color="#FFD4E5" />
                <View style={styles.statTextColumn}>
                  <Text style={styles.statLabel}>{t("couples.currentStreak")}</Text>
                  <Text style={styles.statValue}>
                    {streakLoading ? "..." : `${currentStreak} ${currentStreak === 1 ? t("couples.day") : t("couples.days")}`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.statItem}
                onPress={async () => {
                  await trackCoupleDateEditClicked();
                  setShowDatePicker(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar" size={26} color="#FFD4E5" />
                <View style={styles.statTextColumn}>
                  <Text style={styles.statLabel}>{t("couples.joinedOn")}</Text>
                  <Text style={styles.statValue}>{joinedDate}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ImageBackground>

          <View style={styles.contentContainer}>

            {/* Widgets */}
            <Text style={styles.sectionTitle}>{t("couples.widgets")}</Text>
            <View style={styles.widgetsContainer}>
              {/* Days Together */}
              <View style={[styles.widgetCard, styles.leftWidget]}>
                <View style={styles.daysWidgetContent}>
                  <View style={styles.heartsIconContainer}>
                    <Ionicons name="heart" size={40} color="#FFD4E5" style={styles.heartIconMain} />
                    <Ionicons name="heart" size={30} color="#FFD4E5" style={styles.heartIconSecondary} />
                  </View>
                  <Text style={styles.daysCount}>{daysTogether}</Text>
                  <Text style={styles.daysLabel}>{t("couples.daysTogether")}</Text>
                </View>
              </View>

              {/* Distance */}
              <View style={[styles.widgetCard, styles.rightWidget]}>
                <View style={styles.distanceWidgetContent}>
                  <View style={styles.distanceVisual}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {userName ? userName.charAt(0).toUpperCase() : "?"}
                      </Text>
                    </View>
                    <View style={styles.distanceLine} />
                    <View style={styles.centerIcon}>
                      <Ionicons name="heart" size={14} color="#FFD4E5" />
                    </View>
                    <View style={styles.distanceLine} />
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {partnerName ? partnerName.charAt(0).toUpperCase() : "?"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.distanceText}>
                    {locationLoading ? "..." : (displayDistance === "N/A" ? "—" : displayDistance)}
                  </Text>
                  <Text style={styles.distanceLabel}>{t("couples.betweenUs")}</Text>
                  {locationError && (
                    <Text style={styles.errorText}>{locationError}</Text>
                  )}
                  {!isLocationSharingEnabled && !locationLoading && displayDistance === "N/A" && (
                    <View style={styles.distanceHintContainer}>
                      <Text style={styles.distanceHint}>{t("couples.activateGPSHint")}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.widgetSeparator} />

                <TouchableOpacity 
                  style={styles.addWidgetRow}
                  onPress={async () => {
                    if (!isLocationSharingEnabled) {
                      if (!hasPermission) {
                        const granted = await requestPermission();
                        if (!granted) {
                          await trackGPSPermissionDenied();
                          Alert.alert(
                            "Permission requise",
                            "L'accès à la localisation est nécessaire pour partager votre position."
                          );
                          return;
                        }
                      }
                      await enableLocationSharing();
                      await trackLocationSharingToggled(true);
                    } else {
                      await disableLocationSharing();
                      await trackLocationSharingToggled(false);
                    }
                  }}
                >
                  <Text style={styles.addWidgetText}>
                    {isLocationSharingEnabled ? t("couples.deactivateGPS") : t("couples.activateGPS")}
                  </Text>
                  <Ionicons 
                    name={isLocationSharingEnabled ? "location" : "location-outline"} 
                    size={18} 
                    color="#FFD4E5" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            {/* Your Daily */}
            <Text style={styles.sectionTitle}>{t("couples.yourDaily")}</Text>
            <View style={styles.dailyCard}>
              {challengeLoading ? (
                <Text style={styles.dailySubtitle}>{t("couples.loadingChallenge")}</Text>
              ) : todayChallenge ? (
                <>
                  <View style={styles.dailyHeader}>
                    <View style={styles.dailyFlamesContainer}>
                      <MaterialCommunityIcons name="fire" size={36} color="#FFD4E5" style={{ opacity: 0.9 }} />
                      <MaterialCommunityIcons name="fire" size={36} color="#FFD4E5" style={{ opacity: 0.9 }} />
                    </View>
                    <Text style={styles.dailyTitle}>
                      {hasCompletedToday ? t("couples.challengeCompleted") : t("couples.dailyChallenge")}
                    </Text>
                    <Text style={styles.dailySubtitle}>
                      {todayChallenge.question}
                    </Text>
                    {hasCompletedToday && (
                      <View style={styles.responseContainer}>
                        {userResponse && (
                          <Text style={styles.responseText}>
                            <Text style={styles.responseLabel}>Votre réponse: </Text>
                            {userResponse}
                          </Text>
                        )}
                        {partnerResponse && (
                          <Text style={styles.responseText}>
                            <Text style={styles.responseLabel}>Réponse de {partnerName}: </Text>
                            {partnerResponse}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                  {!hasCompletedToday && (
                    <>
                      {!isProMember && (
                        <Text style={styles.freeChallengesRemaining}>
                          {freeChallengesRemaining > 0 
                            ? `${freeChallengesRemaining} défi${freeChallengesRemaining > 1 ? 's' : ''} gratuit${freeChallengesRemaining > 1 ? 's' : ''} restant${freeChallengesRemaining > 1 ? 's' : ''}`
                            : "Limite de défis gratuits atteinte"}
                        </Text>
                      )}
                      <TouchableOpacity 
                        style={[styles.discoverButton, (!canUseChallenge || !!userResponse) && styles.discoverButtonDisabled]} 
                        activeOpacity={0.8}
                        onPress={async () => {
                          if (!canUseChallenge) {
                            // Afficher le paywall si la limite est atteinte
                            await trackDailyChallengePaywallShown(freeChallengesUsed, 3);
                            showPaywallA();
                            return;
                          }
                          if (!userResponse) {
                            Alert.prompt(
                              "Votre réponse",
                              todayChallenge.question,
                              [
                                { text: "Annuler", style: "cancel" },
                                {
                                  text: "Envoyer",
                                  onPress: async (response: string | undefined) => {
                                    if (response && response.trim()) {
                                      await submitResponse(response.trim());
                                      // Track la soumission de réponse
                                      await trackDailyChallengeResponseSubmitted(
                                        todayChallenge.type || 'unknown',
                                        !!partnerResponse,
                                        isProMember
                                      );
                                      // Enregistrer l'activité pour le streak
                                      await recordActivity();
                                    }
                                  },
                                },
                              ],
                              "plain-text"
                            );
                          }
                        }}
                        disabled={!!userResponse}
                      >
                        <Text style={styles.discoverButtonText}>
                          {!canUseChallenge 
                            ? "Passer à Premium pour continuer" 
                            : userResponse 
                              ? t("couples.waitingForPartner") 
                              : t("couples.respondToChallenge")}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              ) : (
                <Text style={styles.dailySubtitle}>
                  {t("couples.noChallengeAvailable")}
                </Text>
              )}
            </View>

            {/* History Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("couples.history")}</Text>
              <View style={styles.historyCard}>
                <View style={styles.streakContainer}>
                  <View style={styles.streakFlameContainer}>
                    <MaterialCommunityIcons name="fire" size={80} color="#FF4500" />
                    <Text style={styles.streakNumberLarge}>
                      {streakLoading ? "..." : currentStreak}
                    </Text>
                  </View>
                  <Text style={styles.streakTitle}>Streak with {partnerName}</Text>
                  {longestStreak > currentStreak && (
                    <Text style={styles.longestStreakText}>
                      Meilleur streak: {longestStreak} jours
                    </Text>
                  )}
                  <Text style={styles.streakSubtitle}>
                    {t("couples.dailyConnectionHelp")}
                  </Text>
                </View>

                <View style={styles.weekDaysContainer}>
                  {weekActivity.length > 0 ? (
                    weekActivity.map((item, index) => (
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
                          {item.active && item.streakNumber > 0 && (
                            <Text style={styles.dayFlameNumber}>{item.streakNumber}</Text>
                          )}
                        </View>
                      </View>
                    ))
                  ) : (
                    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
                      <View key={index} style={styles.dayColumn}>
                        <Text style={styles.weekDayText}>{day}</Text>
                        <View style={styles.dayFlameContainer}>
                          <MaterialCommunityIcons
                            name="fire"
                            size={36}
                            color="rgba(255, 255, 255, 0.1)"
                          />
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Modal pour modifier la date de mise en couple */}
      {showDatePicker && DateTimePicker && (
        <>
          {Platform.OS === 'ios' && (
            <Modal
              visible={showDatePicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.datePickerModal}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={styles.datePickerCancelButton}
                    >
                      <Text style={styles.datePickerCancelText}>{t("common.cancel")}</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>{t("couples.selectJoinedDate")}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (customJoinedDate) {
                          handleSaveJoinedDate(customJoinedDate);
                        } else {
                          setShowDatePicker(false);
                        }
                      }}
                      style={styles.datePickerSaveButton}
                    >
                      <Text style={styles.datePickerSaveText}>{t("common.validate")}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.datePickerWheel}>
                    <DateTimePicker
                      value={customJoinedDate || new Date()}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      maximumDate={new Date()}
                      locale="fr_FR"
                      textColor="white"
                      themeVariant="dark"
                    />
                  </View>
                </View>
              </View>
            </Modal>
          )}
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={customJoinedDate || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}
        </>
      )}
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
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
  },
  headerActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  addImageButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  breakCoupleButton: {
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
    backgroundColor: "rgba(196, 30, 58, 0.25)", // Rouge avec transparence
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 212, 229, 0.4)",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#C41E3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    color: "#FFD4E5",
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: "rgba(196, 30, 58, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dailySubtitle: {
    color: "rgba(255, 212, 229, 0.9)",
    fontSize: 15,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  discoverButton: {
    backgroundColor: "rgba(196, 30, 58, 0.4)",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#C41E3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: "rgba(255, 212, 229, 0.5)",
  },
  discoverButtonText: {
    color: "#FFD4E5",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  historyCard: {
    backgroundColor: "rgba(196, 30, 58, 0.25)", // Rouge avec transparence
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 212, 229, 0.4)",
    shadowColor: "#C41E3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    color: "rgba(255, 212, 229, 0.7)",
    fontSize: 11,
    fontFamily: "Montserrat-Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    color: "#FFD4E5",
    fontSize: 15,
    fontFamily: "Montserrat-Bold",
    textShadowColor: "rgba(196, 30, 58, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    color: "#FFD4E5",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    marginBottom: 18,
    textTransform: "uppercase",
    letterSpacing: 1,
    textShadowColor: "rgba(196, 30, 58, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  widgetsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
    minHeight: 220, // Min height to accommodate content with text
  },
  widgetCard: {
    backgroundColor: "rgba(196, 30, 58, 0.25)", // Rouge avec transparence
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 182, 193, 0.4)",
    overflow: "hidden",
    shadowColor: "#C41E3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
    justifyContent: "space-between",
    flexDirection: "column",
  },
  daysWidgetContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  heartsIconContainer: {
    flexDirection: "row",
    marginBottom: 16,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  heartIconMain: {
    zIndex: 2,
    transform: [{ rotate: "-10deg" }],
    shadowColor: "#FFB6C1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  heartIconSecondary: {
    marginLeft: -12,
    marginTop: -12,
    opacity: 0.9,
    transform: [{ rotate: "10deg" }],
    shadowColor: "#FFB6C1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  daysCount: {
    color: "#FFD4E5", // Rose clair plus visible
    fontSize: 36,
    fontFamily: "Montserrat-Bold",
    marginBottom: 6,
    textAlign: "center",
    textShadowColor: "rgba(196, 30, 58, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  daysLabel: {
    color: "rgba(255, 212, 229, 0.8)",
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    lineHeight: 18,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  distanceWidgetContent: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    flex: 1,
    justifyContent: "flex-start",
  },
  distanceVisual: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(196, 30, 58, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFD4E5",
    shadowColor: "#C41E3A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: "#FFD4E5",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    fontWeight: "bold",
  },
  distanceLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255, 212, 229, 0.5)",
    marginHorizontal: 6,
    borderRadius: 1,
  },
  centerIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(196, 30, 58, 0.2)",
  },
  smallHeartIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
  },
  distanceText: {
    color: "#FFD4E5",
    fontSize: 28,
    fontFamily: "Montserrat-Bold",
    marginBottom: 4,
    textShadowColor: "rgba(196, 30, 58, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  distanceLabel: {
    color: "rgba(255, 212, 229, 0.8)",
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  widgetSeparator: {
    height: 2,
    backgroundColor: "rgba(255, 212, 229, 0.2)",
    width: "100%",
    marginTop: 8,
    marginBottom: 0,
  },
  addWidgetRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "rgba(196, 30, 58, 0.15)", // Rouge plus foncé pour le bouton
  },
  addWidgetText: {
    color: "#FFD4E5",
    fontSize: 15,
    fontFamily: "Montserrat-SemiBold",
    fontWeight: "600",
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
    paddingHorizontal: 20,
  },
  codeLabel: {
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(196, 30, 58, 0.4)",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderWidth: 3,
    borderColor: "rgba(196, 30, 58, 0.7)",
    gap: 16,
    minWidth: 240,
    shadowColor: "#C41E3A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  codeText: {
    color: "white",
    fontSize: 28,
    fontFamily: "Montserrat-Bold",
    letterSpacing: 6,
    textTransform: "uppercase",
  },
  codeHint: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 8,
  },
  codeDigitInput: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: "rgba(26, 26, 46, 0.6)",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#E8B4B8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  codeDigitInputFilled: {
    borderColor: "#C41E3A",
    borderStyle: "solid",
    backgroundColor: "rgba(196, 30, 58, 0.2)",
    color: "#fff",
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
  errorText: {
    color: "#FF6B6B",
    fontSize: 10,
    fontFamily: "Montserrat-Regular",
    marginTop: 4,
    textAlign: "center",
  },
  distanceHintContainer: {
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: 8,
    width: "100%",
  },
  distanceHint: {
    color: "rgba(255, 212, 229, 0.7)",
    fontSize: 10,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 13,
    width: "100%",
  },
  responseContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    width: "100%",
  },
  responseText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontFamily: "Montserrat-Regular",
    marginBottom: 8,
    lineHeight: 18,
  },
  responseLabel: {
    fontFamily: "Montserrat-Bold",
    color: "#FFB6C1",
  },
  longestStreakText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    fontFamily: "Montserrat-Regular",
    marginTop: 4,
    textAlign: "center",
  },
  datePickerModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  datePickerContainer: {
    backgroundColor: "#2A0505",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: "rgba(255, 212, 229, 0.3)",
    borderLeftColor: "rgba(255, 212, 229, 0.3)",
    borderRightColor: "rgba(255, 212, 229, 0.3)",
    borderTopColor: "rgba(255, 212, 229, 0.3)",
    shadowColor: "#C41E3A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 212, 229, 0.2)",
  },
  datePickerCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  datePickerCancelText: {
    color: "rgba(255, 212, 229, 0.8)",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
  },
  datePickerTitle: {
    color: "#FFD4E5",
    fontSize: 18,
    fontFamily: "Montserrat-Bold",
    flex: 1,
    textAlign: "center",
  },
  datePickerSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  datePickerSaveText: {
    color: "#FFD4E5",
    fontSize: 16,
    fontFamily: "Montserrat-Bold",
  },
  datePickerWheel: {
    backgroundColor: "rgba(196, 30, 58, 0.15)",
    paddingVertical: 20,
    minHeight: 200,
    width: "100%",
    marginTop: 8,
  },
  freeChallengesRemaining: {
    color: "#FFD4E5",
    fontSize: 14,
    fontFamily: "Montserrat-Bold",
    textAlign: "center",
    marginBottom: 12,
  },
  discoverButtonDisabled: {
    opacity: 0.5,
  },
});
