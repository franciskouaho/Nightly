import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useTranslation } from "react-i18next";
import { GlamourButton } from "@/components/ui/GlamourButton";
import { trackOnboardingNameCompleted } from "@/services/onboardingAnalytics";

export default function NameScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data, updateData } = useOnboarding();
    const { t } = useTranslation();
    const [name, setName] = useState(data.pseudo || "");

    const handleContinue = async () => {
        if (name.trim()) {
            updateData("pseudo", name.trim());
            await trackOnboardingNameCompleted(name.trim());
            router.push("/onboarding/age");
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                                        router.replace("/welcome");
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
                                <View style={[styles.progressBar, { width: "20%" }]} />
                            </View>
                        </View>

                        {/* Content */}
                        <View style={styles.mainContent}>
                            <Text style={styles.title}>
                                {t("onboarding.name.title")}
                            </Text>

                            <TextInput
                                style={styles.input}
                                placeholder={t("onboarding.name.placeholder")}
                                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                                value={name}
                                onChangeText={setName}
                                autoFocus
                                selectionColor="#FF4500"
                            />
                        </View>

                        {/* Bottom Section */}
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : "height"}
                            style={styles.bottomSection}
                            keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
                        >
                            <GlamourButton
                                title={t("onboarding.name.continue")}
                                onPress={handleContinue}
                                disabled={!name.trim()}
                            />
                        </KeyboardAvoidingView>

                    </View>
                </LinearGradient>
            </View>
        </TouchableWithoutFeedback>
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
        backgroundColor: "#FF4500", // Orange
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
    input: {
        width: "100%",
        backgroundColor: "#3A1A1A",
        borderRadius: 16,
        padding: 20,
        fontSize: 18,
        fontFamily: "Montserrat-Regular",
        color: "white",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    bottomSection: {
        width: "100%",
        alignItems: "center",
    },

});
