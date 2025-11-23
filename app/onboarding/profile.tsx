import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    ScrollView,
    Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useTranslation } from "react-i18next";
import storage from "@react-native-firebase/storage";
import { cacheRemoteImage } from "@/utils/cacheRemoteImage";
import { GlamourButton } from "@/components/ui/GlamourButton";

function chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data, updateData } = useOnboarding();
    const { t } = useTranslation();
    const [profiles, setProfiles] = useState<
        { remoteUrl: string; localUri: string }[]
    >([]);
    const [selectedProfile, setSelectedProfile] = useState<{
        remoteUrl: string;
        localUri: string;
    } | null>(data.avatar ? { remoteUrl: data.avatar, localUri: data.avatar } : null);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
    const [profilesError, setProfilesError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchProfiles = async () => {
            try {
                setIsLoadingProfiles(true);
                const listResult = await storage().ref("profils").listAll();
                const urls = await Promise.all(
                    listResult.items.map(async (item) => item.getDownloadURL()),
                );

                const cachedProfiles = await Promise.all(
                    urls.map(async (remoteUrl) => {
                        const localUri = await cacheRemoteImage(remoteUrl, "profils");
                        return { remoteUrl, localUri };
                    }),
                );

                if (!isMounted) {
                    return;
                }

                setProfiles(cachedProfiles);
                if (!selectedProfile && cachedProfiles.length > 0) {
                    setSelectedProfile(cachedProfiles[0] || null);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des profils:", error);
                if (isMounted) {
                    setProfilesError(t("onboarding.profile.error"));
                }
            } finally {
                if (isMounted) {
                    setIsLoadingProfiles(false);
                }
            }
        };

        fetchProfiles();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleContinue = () => {
        if (selectedProfile) {
            updateData("avatar", selectedProfile.remoteUrl);
            router.push("/onboarding/account");
        }
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
                            onPress={() => {
                                if (router.canGoBack()) {
                                    router.back();
                                } else {
                                    router.replace("/onboarding/goals");
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
                            <View style={[styles.progressBar, { width: "85%" }]} />
                        </View>
                    </View>

                    {/* Content */}
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        <View style={styles.mainContent}>
                            <Text style={styles.title}>
                                {t("onboarding.profile.title")}
                            </Text>

                            <Text style={styles.subtitle}>
                                {t("onboarding.profile.subtitle")}
                            </Text>

                            {/* Selected Avatar Preview */}
                            <View style={styles.selectedAvatarContainer}>
                                {selectedProfile ? (
                                    <Image
                                        source={{
                                            uri: selectedProfile.localUri || selectedProfile.remoteUrl,
                                        }}
                                        style={styles.selectedAvatar}
                                    />
                                ) : (
                                    <View style={[styles.selectedAvatar, styles.placeholderAvatar]}>
                                        {isLoadingProfiles ? (
                                            <ActivityIndicator color="#FF7F50" size="large" />
                                        ) : (
                                            <Ionicons name="image-outline" size={60} color="rgba(255, 255, 255, 0.5)" />
                                        )}
                                    </View>
                                )}
                            </View>

                            {/* Avatar Grid */}
                            {isLoadingProfiles ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator color="#FF7F50" size="large" />
                                    <Text style={styles.loadingText}>{t("onboarding.profile.loading")}</Text>
                                </View>
                            ) : profilesError ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{profilesError}</Text>
                                </View>
                            ) : profiles.length === 0 ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>
                                        {t("onboarding.profile.noAvatars")}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.avatarsGrid}>
                                    {chunkArray(profiles, 4).map((row, rowIdx: number) => (
                                        <View style={styles.avatarsRow} key={rowIdx}>
                                            {row.map((profile, idx: number) => (
                                                <TouchableOpacity
                                                    key={`${profile.remoteUrl}-${idx}`}
                                                    onPress={() => setSelectedProfile(profile)}
                                                    style={styles.avatarButton}
                                                >
                                                    <Image
                                                        source={{
                                                            uri: profile.localUri || profile.remoteUrl,
                                                        }}
                                                        style={[
                                                            styles.avatarImage,
                                                            selectedProfile?.remoteUrl === profile.remoteUrl &&
                                                            styles.avatarImageSelected,
                                                        ]}
                                                    />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                        <GlamourButton
                            title={t("onboarding.profile.continue")}
                            onPress={handleContinue}
                            disabled={!selectedProfile}
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
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    mainContent: {
        flex: 1,
        alignItems: "center",
    },
    title: {
        fontSize: 32,
        fontFamily: "BebasNeue-Regular",
        color: "white",
        textAlign: "center",
        marginBottom: 16,
        lineHeight: 36,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: "Montserrat-Regular",
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 20,
    },
    selectedAvatarContainer: {
        marginBottom: 40,
        alignItems: "center",
    },
    selectedAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: "#FF4500",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    placeholderAvatar: {
        justifyContent: "center",
        alignItems: "center",
    },
    avatarsGrid: {
        width: "100%",
        marginBottom: 20,
    },
    avatarsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    avatarButton: {
        flex: 1,
        alignItems: "center",
        marginHorizontal: 4,
    },
    avatarImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: "transparent",
    },
    avatarImageSelected: {
        borderColor: "#FF4500",
        borderWidth: 3,
        transform: [{ scale: 1.1 }],
        shadowColor: "#FF4500",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 6,
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 40,
    },
    loadingText: {
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: 14,
        fontFamily: "Montserrat-Regular",
        marginTop: 12,
    },
    errorContainer: {
        alignItems: "center",
        paddingVertical: 40,
    },
    errorText: {
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: 14,
        fontFamily: "Montserrat-Regular",
        textAlign: "center",
    },
    bottomSection: {
        width: "100%",
        alignItems: "center",
        marginTop: 20,
    },

});

