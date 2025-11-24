import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { GlamourButton } from "@/components/ui/GlamourButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { trackOnboardingReady, trackOnboardingCompleted } from "@/services/onboardingAnalytics";
import { usePaywall } from "@/contexts/PaywallContext";
import { trackPaywallViewed } from "@/services/paywallAnalytics";

export default function ReadyScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { data } = useOnboarding();
    const { showPaywallA } = usePaywall();

    useEffect(() => {
        // Track ready screen view
        trackOnboardingReady();
    }, []);

    const handleLetsGo = async () => {
        // Track onboarding completion
        await trackOnboardingCompleted();

        // Show paywall after onboarding
        showPaywallA(true); // Force show paywall
        await trackPaywallViewed('A', 'post_onboarding');

        // Navigate to tabs (paywall will show as modal on top)
        router.replace("/(tabs)");
    };

    const userName = data.pseudo || "";

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
                    <View style={styles.mainContent}>
                        <Text style={styles.title}>
                            {t("onboarding.ready.title", { name: userName })}
                        </Text>

                        <Text style={styles.subtitle}>
                            {t("onboarding.ready.subtitle")}
                        </Text>
                    </View>

                    <View style={styles.bottomSection}>
                        <GlamourButton
                            title={t("onboarding.ready.letsGo")}
                            onPress={handleLetsGo}
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
        justifyContent: "center",
    },
    mainContent: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
    },
    iconContainer: {
        marginBottom: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 32,
        fontFamily: "BebasNeue-Regular",
        color: "white",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 38,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: "Montserrat-Regular",
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        lineHeight: 24,
    },
    bottomSection: {
        width: "100%",
        alignItems: "center",
        marginTop: 40,
    },
});
