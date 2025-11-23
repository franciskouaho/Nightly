import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface GlamourButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const GlamourButton: React.FC<GlamourButtonProps> = ({
    title,
    onPress,
    disabled = false,
    style,
    textStyle,
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                disabled && styles.disabledButton,
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled}
        >
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#D4AF37",
        width: "100%",
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
        borderBottomWidth: 6,
        borderBottomColor: "#AA8C2C",
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: "#A0852A", // Desaturated/Darker Gold for disabled state
        borderBottomColor: "#7A6320",
    },
    text: {
        color: "#FFFFFF",
        fontSize: 20,
        fontFamily: "Montserrat-Bold",
        letterSpacing: 0.5,
    },
});
