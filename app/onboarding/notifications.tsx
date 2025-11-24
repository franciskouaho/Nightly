import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { GlamourButton } from "@/components/ui/GlamourButton";
import * as Notifications from 'expo-notifications';
import { ExpoNotificationService } from "@/services/expoNotificationService";
import { trackOnboardingNotificationsCompleted } from "@/services/onboardingAnalytics";

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [isRequesting, setIsRequesting] = useState(false);

    const handleTurnOnNotifications = async () => {
        setIsRequesting(true);
        try {
            // Demander les permissions de notification
            const { status } = await Notifications.requestPermissionsAsync();

            let notificationsEnabled = false;
            if (status === 'granted') {
                // Initialiser le service de notifications
                const notificationService = ExpoNotificationService.getInstance();
                await notificationService.initialize();
                notificationsEnabled = true;
            }

            // Track notifications completion
            await trackOnboardingNotificationsCompleted(notificationsEnabled);

            // Continuer vers l'écran suivant même si la permission est refusée
            router.push("/onboarding/loading");
        } catch (error) {
            console.error("Erreur lors de la demande de permissions:", error);
            // Track notifications as disabled on error
            await trackOnboardingNotificationsCompleted(false);
            // Continuer quand même vers l'écran suivant
            router.push("/onboarding/loading");
        } finally {
            setIsRequesting(false);
        }
    };

    const handleSkip = async () => {
        // Track notifications as disabled (skipped)
        await trackOnboardingNotificationsCompleted(false);
        router.push("/onboarding/loading");
    };

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
                <View style={[styles.contentContainer, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={handleSkip}
                            style={styles.skipButton}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.skipButtonText}>{t("common.skip") || "Skip"}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.mainContent}>
                        <Text style={styles.title}>
                            {t("onboarding.notifications.title")}
                        </Text>

                        {/* Notification Example */}
                        <View style={styles.notificationExample}>
                            <View style={styles.notificationIconContainer}>
                                <Image 
                                    source={require("@/assets/christmas/logo.png")} 
                                    style={styles.notificationIcon}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={styles.notificationContent}>
                                <Text style={styles.notificationText}>
                                    {t("onboarding.notifications.example")}
                                </Text>
                            </View>
                        </View>

                        {/* Benefits List */}
                        <View style={styles.benefitsContainer}>
                            <View style={styles.benefitItem}>
                                <Ionicons name="notifications-off" size={24} color="#FFD700" />
                                <Text style={styles.benefitText}>
                                    {t("onboarding.notifications.benefit1")}
                                </Text>
                            </View>
                            <View style={styles.benefitItem}>
                                <Ionicons name="chatbubbles-outline" size={24} color="white" />
                                <Text style={styles.benefitText}>
                                    {t("onboarding.notifications.benefit2")}
                                </Text>
                            </View>
                            <View style={styles.benefitItem}>
                                <Ionicons name="star" size={24} color="#FFD700" />
                                <Text style={styles.benefitText}>
                                    {t("onboarding.notifications.benefit3")}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                        <GlamourButton
                            title={t("onboarding.notifications.button")}
                            onPress={handleTurnOnNotifications}
                            disabled={isRequesting}
                        />
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1A0505",
    },
    background: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 40,
    },
    skipButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    skipButtonText: {
        color: "rgba(255, 255, 255, 0.7)",
        fontSize: 16,
        fontFamily: "Montserrat-Regular",
    },
    mainContent: {
        flex: 1,
        alignItems: "center",
        paddingTop: 20,
    },
    title: {
        fontSize: 28,
        fontFamily: "BebasNeue-Regular",
        color: "white",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 34,
    },
    notificationExample: {
        width: "100%",
        backgroundColor: "white",
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 40,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    notificationIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "transparent",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        overflow: "hidden",
    },
    notificationIcon: {
        width: 40,
        height: 40,
    },
    notificationContent: {
        flex: 1,
    },
    notificationText: {
        fontSize: 14,
        fontFamily: "Montserrat-Regular",
        color: "#000",
        lineHeight: 20,
    },
    benefitsContainer: {
        width: "100%",
        gap: 24,
    },
    benefitItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    benefitText: {
        fontSize: 16,
        fontFamily: "Montserrat-Regular",
        color: "white",
        flex: 1,
    },
    bottomSection: {
        width: "100%",
        alignItems: "center",
        marginTop: 20,
    },
});

