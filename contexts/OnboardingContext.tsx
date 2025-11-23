import React, { createContext, useContext, useState } from 'react';

type OnboardingData = {
    pseudo: string;
    name: string | null; // Nom complet (optionnel)
    birthDate: Date | null;
    gender: string | null;
    goals: string[];
    avatar: string | null;
};

type OnboardingContextType = {
    data: OnboardingData;
    updateData: (key: keyof OnboardingData, value: any) => void;
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<OnboardingData>({
        pseudo: '',
        name: null,
        birthDate: null,
        gender: null,
        goals: [],
        avatar: null,
    });

    const updateData = (key: keyof OnboardingData, value: any) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <OnboardingContext.Provider value={{ data, updateData }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
}

