import { createContext, useContext, useState, ReactNode } from 'react';

interface OnboardingData {
    product: string;
    platforms: string[];
    alertLevel: string;
    notificationMethods: string[];
}

interface OnboardingContextType {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
    resetData: () => void;
}

const initialData: OnboardingData = {
    product: 'productivity',
    platforms: ['instagram', 'facebook'],
    alertLevel: 'medium',
    notificationMethods: ['email', 'push'],
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<OnboardingData>(initialData);

    const updateData = (updates: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const resetData = () => {
        setData(initialData);
    };

    return (
        <OnboardingContext.Provider value={{ data, updateData, resetData }}>
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
