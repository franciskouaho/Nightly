import { Stack } from "expo-router";
import { OnboardingProvider } from "@/contexts/OnboardingContext";

export default function OnboardingLayout() {
    return (
        <OnboardingProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="name" />
                <Stack.Screen name="age" />
                <Stack.Screen name="gender" />
                <Stack.Screen name="goals" />
                <Stack.Screen name="profile" />
                <Stack.Screen name="account" />
                <Stack.Screen name="notifications" />
                <Stack.Screen name="loading" />
                <Stack.Screen name="ready" />
            </Stack>
        </OnboardingProvider>
    );
}
