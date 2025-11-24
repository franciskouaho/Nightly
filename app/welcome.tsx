import React, { useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import ChristmasTheme from "@/constants/themes/Christmas";
import { GlamourButton } from "@/components/ui/GlamourButton";
import analytics from '@react-native-firebase/analytics';
import posthog from 'posthog-react-native';

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const theme = ChristmasTheme.light;

    useEffect(() => {
        // Track welcome screen view
        analytics().logEvent('welcome_view', {
            timestamp: new Date().toISOString(),
        });
        posthog?.capture('welcome_view', {
            timestamp: new Date().toISOString(),
        });
        console.log('📊 Tracking: welcome_view');
    }, []);

    const handleStart = async () => {
        // Track onboarding start
        await analytics().logEvent('onboarding_start', {
            timestamp: new Date().toISOString(),
        });
        posthog?.capture('onboarding_start', {
            timestamp: new Date().toISOString(),
        });
        console.log('📊 Tracking: onboarding_start');

        // Navigate to onboarding
        router.push("/onboarding/name");
    };

    const handleLogin = () => {
        // @ts-ignore - expo-router type issue
        router.replace("/login");
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
                <View style={[styles.contentContainer, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>

                    {/* Mascot Section */}
                    <View style={styles.mascotContainer}>
                        <Image
                            source={require("@/assets/mascotte.png")}
                            style={styles.mascot}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Text Section */}
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>
                            {t("welcome.title")}
                        </Text>
                        <Text style={styles.subtitle}>
                            {t("welcome.subtitle")}
                        </Text>
                    </View>

                    {/* Social Proof */}
                    <View style={styles.socialProofContainer}>
                        <Image
                            source={require("@/assets/lauriergauche.png")}
                            style={styles.laurelLeft}
                            resizeMode="contain"
                        />
                        <View style={styles.socialContent}>
                            {/* <Text style={styles.downloadsText}>+450k Downloads</Text> */}
                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((_, i) => (
                                    <Ionicons key={i} name="star" size={24} color="#FFD700" />
                                ))}
                            </View>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="logo-apple" size={16} color="white" />
                                <Text style={styles.ratingText}>5.0</Text>
                            </View>
                        </View>
                        <Image
                            source={require("@/assets/laurierdroite.png")}
                            style={styles.laurelRight}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Buttons */}
                    <View style={styles.bottomContainer}>
                        <GlamourButton
                            title={t("welcome.startForFree")}
                            onPress={handleStart}
                        />

                        <TouchableOpacity
                            style={styles.loginLink}
                            onPress={handleLogin}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.loginLinkText}>{t("welcome.alreadyHaveAccount")}</Text>
                            <View style={styles.underline} />
                        </TouchableOpacity>
                    </View>

                </View>
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
    contentContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 24,
    },
    mascotContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
    },
    mascot: {
        width: width * 0.5,
        height: width * 0.5,
    },
    textContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontFamily: "BebasNeue-Regular", // Assuming this font is available from _layout
        color: "white",
        textAlign: "center",
        lineHeight: 36,
        marginBottom: 16,
        textShadowColor: "rgba(0, 0, 0, 0.3)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Montserrat-Regular",
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    socialProofContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 40,
    },
    socialContent: {
        alignItems: "center",
        marginHorizontal: 12,
    },
    downloadsText: {
        color: "white",
        fontSize: 14,
        fontFamily: "Montserrat-Bold",
        marginBottom: 4,
    },
    starsContainer: {
        flexDirection: "row",
        gap: 4,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        color: "white",
        fontSize: 14,
        fontFamily: "Montserrat-Bold",
    },
    laurelLeft: {
        width: 50,
        height: 50,
        opacity: 0.8,
    },
    laurelRight: {
        width: 50,
        height: 50,
        opacity: 0.8,
    },
    bottomContainer: {
        width: "100%",
        alignItems: "center",
        gap: 20,
        marginBottom: 20,
    },

    loginLink: {
        alignItems: "center",
    },
    loginLinkText: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: 14,
        fontFamily: "Montserrat-Regular",
    },
    underline: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        width: "100%",
        marginTop: 2,
    },
});
