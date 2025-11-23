import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useTranslation } from "react-i18next";
import { GlamourButton } from "@/components/ui/GlamourButton";

// DateTimePicker - rendre optionnel si le module n'est pas installé
let DateTimePicker: any = null;
try {
    const dtp = require('@react-native-community/datetimepicker');
    DateTimePicker = dtp.default || dtp;
} catch (e) {
    console.warn('DateTimePicker not available');
}

export default function AgeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { data, updateData } = useOnboarding();
    const { t } = useTranslation();
    const [date, setDate] = useState(data.birthDate || new Date(2000, 0, 1));
    const [showPicker, setShowPicker] = useState(false);

    const handleContinue = () => {
        updateData("birthDate", date);
        router.push("/onboarding/gender");
    };

    const onChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
            if (event.type === 'set' && selectedDate) {
                setDate(selectedDate);
            }
        } else {
            // iOS
            if (selectedDate) {
                setDate(selectedDate);
            }
            if (event.type === 'dismissed') {
                setShowPicker(false);
            }
        }
    };

    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
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
                                    router.replace("/onboarding/name");
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
                            <View style={[styles.progressBar, { width: "40%" }]} />
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.mainContent}>
                        <Text style={styles.title}>
                            {t("onboarding.age.title", { name: data.pseudo.toUpperCase() })}
                        </Text>

                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => setShowPicker(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.dateText}>{formatDate(date)}</Text>
                            <Ionicons name="calendar-outline" size={24} color="white" />
                        </TouchableOpacity>

                        {showPicker && DateTimePicker && Platform.OS === 'ios' && (
                            <Modal
                                transparent={true}
                                animationType="slide"
                                visible={showPicker}
                                onRequestClose={() => setShowPicker(false)}
                            >
                                <View style={styles.modalOverlay}>
                                    <View style={styles.modalContent}>
                                        <View style={styles.modalHeader}>
                                            <TouchableOpacity
                                                onPress={() => setShowPicker(false)}
                                                style={styles.modalButton}
                                            >
                                                <Text style={styles.modalButtonText}>{t("onboarding.age.cancel")}</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.modalTitle}>{t("onboarding.age.selectDate")}</Text>
                                            <TouchableOpacity
                                                onPress={() => setShowPicker(false)}
                                                style={styles.modalButton}
                                            >
                                                <Text style={styles.modalButtonText}>{t("onboarding.age.ok")}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
                                            display="spinner"
                                            onChange={onChange}
                                            maximumDate={new Date()}
                                            textColor="white"
                                            themeVariant="dark"
                                            style={styles.datePicker}
                                        />
                                    </View>
                                </View>
                            </Modal>
                        )}
                        {showPicker && DateTimePicker && Platform.OS === 'android' && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onChange}
                                maximumDate={new Date()}
                            />
                        )}
                    </View>

                    {/* Bottom Section */}
                    <View style={styles.bottomSection}>
                        <Text style={styles.disclaimer}>
                            {t("onboarding.age.disclaimer")}
                        </Text>

                        <GlamourButton
                            title={t("onboarding.age.continue")}
                            onPress={handleContinue}
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
    dateInput: {
        width: "100%",
        backgroundColor: "#3A1A1A",
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    dateText: {
        fontSize: 18,
        fontFamily: "Montserrat-Regular",
        color: "white",
    },
    datePicker: {
        marginTop: 20,
        width: "100%",
        height: 200,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#2A0505",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    modalTitle: {
        color: "white",
        fontSize: 18,
        fontFamily: "Montserrat-Bold",
    },
    modalButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    modalButtonText: {
        color: "#FF4500",
        fontSize: 16,
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
