import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { trackOnboardingLoading } from "@/services/onboardingAnalytics";

export default function LoadingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        t("onboarding.loading.step1"),
        t("onboarding.loading.step2"),
        t("onboarding.loading.step3"),
    ];

    useEffect(() => {
        // Track loading screen view
        trackOnboardingLoading();

        // Animation des étapes
        const stepInterval = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev < steps.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, 1500);

        // Rediriger vers ready après toutes les étapes
        const redirectTimer = setTimeout(() => {
            router.replace("/onboarding/ready");
        }, steps.length * 1500 + 1000);

        return () => {
            clearInterval(stepInterval);
            clearTimeout(redirectTimer);
        };
    }, []);

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
                        <Text style={styles.preTitle}>
                            {t("onboarding.loading.preTitle")}
                        </Text>

                        <Text style={styles.title}>
                            {t("onboarding.loading.title")}
                        </Text>

                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#FF4500" />
                        </View>

                        <View style={styles.stepsContainer}>
                            {steps.map((step, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.stepItem,
                                        index <= currentStep && styles.stepItemActive,
                                    ]}
                                >
                                    {index < currentStep ? (
                                        <MaterialCommunityIcons
                                            name="check-circle"
                                            size={20}
                                            color="#FF4500"
                                        />
                                    ) : index === currentStep ? (
                                        <ActivityIndicator size="small" color="#FF4500" />
                                    ) : (
                                        <Ionicons
                                            name="ellipse-outline"
                                            size={20}
                                            color="rgba(255, 255, 255, 0.3)"
                                        />
                                    )}
                                    <Text
                                        style={[
                                            styles.stepText,
                                            index <= currentStep && styles.stepTextActive,
                                        ]}
                                    >
                                        {step}
                                    </Text>
                                </View>
                            ))}
                        </View>
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
    },
    preTitle: {
        fontSize: 14,
        fontFamily: "Montserrat-Regular",
        color: "rgba(255, 255, 255, 0.6)",
        textAlign: "center",
        marginBottom: 20,
        textTransform: "lowercase",
    },
    title: {
        fontSize: 28,
        fontFamily: "BebasNeue-Regular",
        color: "white",
        textAlign: "center",
        marginBottom: 60,
        lineHeight: 34,
    },
    loaderContainer: {
        marginBottom: 60,
    },
    stepsContainer: {
        width: "100%",
        gap: 20,
    },
    stepItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        opacity: 0.5,
    },
    stepItemActive: {
        opacity: 1,
    },
    stepText: {
        fontSize: 16,
        fontFamily: "Montserrat-Regular",
        color: "rgba(255, 255, 255, 0.6)",
    },
    stepTextActive: {
        color: "white",
        fontFamily: "Montserrat-Bold",
    },
});
