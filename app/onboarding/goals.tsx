import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useTranslation } from "react-i18next";
import { GlamourButton } from "@/components/ui/GlamourButton";
import { trackOnboardingGoalsCompleted } from "@/services/onboardingAnalytics";

export default function GoalsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data, updateData } = useOnboarding();
    const { t } = useTranslation();
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

    const handleContinue = async () => {
        if (selectedGoal) {
            updateData("goals", [selectedGoal]);
            await trackOnboardingGoalsCompleted([selectedGoal]);
            router.push("/onboarding/profile");
        }
    };

    const GoalOption = ({ label, value, icon, iconColor }: { label: string; value: string; icon: any; iconColor: string }) => (
        <TouchableOpacity
            style={[
                styles.optionButton,
                selectedGoal === value && styles.selectedOption,
            ]}
            onPress={() => setSelectedGoal(value)}
            activeOpacity={0.8}
        >
            <Text style={styles.icon}>{icon}</Text>
            <Text style={[
                styles.optionText,
                selectedGoal === value && styles.selectedOptionText
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

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
                            onPress={() => {
                                if (router.canGoBack()) {
                                    router.back();
                                } else {
                                    router.replace("/onboarding/gender");
                                }
                            }}
                            style={styles.backButton}
                            activeOpacity={0.8}
                        >
                            <View style={styles.backButtonGlass}>
                                <Ionicons name="chevron-back" size={20} color="white" />
                            </View>
                        </TouchableOpacity>

                        {/* Progress Bar */}
                        <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: "80%" }]} />
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.mainContent}>
                        <Text style={styles.title}>
                            {t("onboarding.goals.title")}
                        </Text>

                        <View style={styles.warningContainer}>
                            <Ionicons name="warning" size={16} color="#FFD700" />
                            <Text style={styles.warningText}>{t("onboarding.goals.warning")}</Text>
                        </View>

                        <View style={styles.optionsContainer}>
                            <GoalOption label={t("onboarding.goals.knowBetter")} value="know_better" icon="🕵️‍♂️" iconColor="#FFD700" />
                            <GoalOption label={t("onboarding.goals.spiceUp")} value="spice_up" icon="🌶️" iconColor="#FF4500" />
                            <GoalOption label={t("onboarding.goals.haveFun")} value="have_fun" icon="🎉" iconColor="#FF69B4" />
                        </View>
                    </View>

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                        <GlamourButton
                            title={t("onboarding.goals.continue")}
                            onPress={handleContinue}
                            disabled={!selectedGoal}
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
        alignItems: "center",
        marginBottom: 20,
    },
    backButton: {
        marginRight: 20,
    },
    backButtonGlass: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    progressBarContainer: {
        flex: 1,
        height: 6,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#FF4500",
        borderRadius: 3,
    },
    mainContent: {
        flex: 1,
        alignItems: "center",
        paddingTop: 20,
    },
    title: {
        fontSize: 26,
        fontFamily: "BebasNeue-Regular",
        color: "white",
        textAlign: "center",
        marginBottom: 10,
        lineHeight: 30,
    },
    warningContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 40,
        gap: 8,
    },
    warningText: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
        fontFamily: "Montserrat-Regular",
    },
    optionsContainer: {
        width: "100%",
        gap: 16,
    },
    optionButton: {
        width: "100%",
        backgroundColor: "#2D1515",
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "transparent",
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
    },
    selectedOption: {
        backgroundColor: "#2D1515", // Keep dark background but maybe add border or different style if needed, screenshot shows same bg but maybe slightly lighter or different border? Actually screenshot shows dark bg. Let's keep it simple.
        borderColor: "#FF4500",
        borderWidth: 1,
    },
    icon: {
        fontSize: 20,
    },
    optionText: {
        fontSize: 16,
        fontFamily: "Montserrat-Regular",
        color: "rgba(255, 255, 255, 0.8)",
    },
    selectedOptionText: {
        color: "white",
        fontFamily: "Montserrat-Bold",
    },
    bottomSection: {
        width: "100%",
        alignItems: "center",
        marginTop: 20,
    },

});
