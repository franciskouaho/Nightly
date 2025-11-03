import React, { createContext, useContext, ReactNode } from 'react';
import usePaywallManager from '@/hooks/usePaywallManager';
import PaywallModalA from '@/components/PaywallModalA';
import PaywallModalB from '@/components/PaywallModalB';

interface PaywallContextType {
  showPaywallA: (forceShow?: boolean) => void;
  showPaywallB: (forceShow?: boolean) => Promise<void>;
  closePaywallA: () => void;
  closePaywallB: () => void;
  setInActiveGame: (inGame: boolean) => void;
  isProMember: boolean;
  paywallState: any;
  config: any;
  discountPercentage: number;
  originalPrice: number;
  discountedPrice: number;
}

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

interface PaywallProviderProps {
  children: ReactNode;
  config?: {
    cooldownHours?: number;
    maxPaywallBPerSession?: number;
    originalAnnualPrice?: number;
    discountedAnnualPrice?: number;
  };
}

export function PaywallProvider({ children, config }: PaywallProviderProps) {
  const paywallManager = usePaywallManager(config);

  return (
    <PaywallContext.Provider value={paywallManager}>
      {children}
      
      {/* Paywall A - Plan court (semaine/mois) */}
      <PaywallModalA
        isVisible={paywallManager.paywallState.showPaywallA}
        onClose={paywallManager.handlePaywallAClose}
        onUpgradeToAnnual={paywallManager.showPaywallB}
      />
      
      {/* Paywall B - Plan annuel avec réduction */}
      <PaywallModalB
        isVisible={paywallManager.paywallState.showPaywallB}
        onClose={paywallManager.closePaywallB}
        originalPrice={paywallManager.originalPrice}
        discountedPrice={paywallManager.discountedPrice}
      />
    </PaywallContext.Provider>
  );
}

export function usePaywall() {
  const context = useContext(PaywallContext);
  if (context === undefined) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return context;
}
