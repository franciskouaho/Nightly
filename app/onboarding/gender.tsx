import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useTranslation } from "react-i18next";
import { GlamourButton } from "@/components/ui/GlamourButton";
import { trackOnboardingGenderCompleted } from "@/services/onboardingAnalytics";

export default function GenderScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data, updateData } = useOnboarding();
    const { t } = useTranslation();
    const [selectedGender, setSelectedGender] = useState<string | null>(data.gender);

    const handleContinue = async () => {
        if (selectedGender) {
            updateData("gender", selectedGender);
            await trackOnboardingGenderCompleted(selectedGender);
            router.push("/onboarding/goals");
        }
    };

    const GenderOption = ({ label, value }: { label: string; value: string }) => (
        <TouchableOpacity
            style={[
                styles.optionButton,
                selectedGender === value && styles.selectedOption,
            ]}
            onPress={() => setSelectedGender(value)}
            activeOpacity={0.8}
        >
            <Text style={[
                styles.optionText,
                selectedGender === value && styles.selectedOptionText
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
                                    router.replace("/onboarding/age");
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
                            <View style={[styles.progressBar, { width: "60%" }]} />
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.mainContent}>
                        <Text style={styles.title}>
                            {t("onboarding.gender.title")}
                        </Text>

                        <View style={styles.optionsContainer}>
                            <GenderOption label={t("onboarding.gender.female")} value="female" />
                            <GenderOption label={t("onboarding.gender.male")} value="male" />
                            <GenderOption label={t("onboarding.gender.other")} value="other" />
                        </View>
                    </View>

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                        <Text style={styles.disclaimer}>
                            {t("onboarding.gender.disclaimer")}
                        </Text>

                        <GlamourButton
                            title={t("onboarding.gender.continue")}
                            onPress={handleContinue}
                            disabled={!selectedGender}
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
        marginBottom: 40,
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
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontFamily: "BebasNeue-Regular",
        color: "white",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 32,
    },
    optionsContainer: {
        width: "100%",
        gap: 16,
    },
    optionButton: {
        width: "100%",
        backgroundColor: "#2D1515", // Dark reddish brown
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "transparent",
    },
    selectedOption: {
        backgroundColor: "#FF4500",
        borderColor: "#FF4500",
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
        gap: 20,
    },
    mascotContainer: {
        marginBottom: 10,
    },
    disclaimer: {
        color: "rgba(255, 255, 255, 0.5)",
        fontSize: 12,
        fontFamily: "Montserrat-Regular",
        textAlign: "center",
        lineHeight: 18,
        marginBottom: 10,
    },

});
