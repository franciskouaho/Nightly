import { useState, useEffect } from 'react';
import useRevenueCat from './useRevenueCat';

interface PricingData {
  weekly: {
    price: string;
    priceNumber: number;
    currency: string;
  } | null;
  monthly: {
    price: string;
    priceNumber: number;
    currency: string;
  } | null;
  annual: {
    price: string;
    priceNumber: number;
    currency: string;
  } | null;
}

export default function usePricing() {
  const { currentOffering } = useRevenueCat();
  const [pricing, setPricing] = useState<PricingData>({
    weekly: null,
    monthly: null,
    annual: null,
  });

  useEffect(() => {
    if (currentOffering?.availablePackages) {
      const packages = currentOffering.availablePackages;
      
      const weeklyPackage = packages.find((pkg: any) => pkg.packageType === 'WEEKLY');
      const monthlyPackage = packages.find((pkg: any) => pkg.packageType === 'MONTHLY');
      const annualPackage = packages.find((pkg: any) => pkg.packageType === 'ANNUAL');

      setPricing({
        weekly: weeklyPackage ? {
          price: weeklyPackage.product.priceString,
          priceNumber: weeklyPackage.product.price,
          currency: weeklyPackage.product.currencyCode,
        } : null,
        monthly: monthlyPackage ? {
          price: monthlyPackage.product.priceString,
          priceNumber: monthlyPackage.product.price,
          currency: monthlyPackage.product.currencyCode,
        } : null,
        annual: annualPackage ? {
          price: annualPackage.product.priceString,
          priceNumber: annualPackage.product.price,
          currency: annualPackage.product.currencyCode,
        } : null,
      });
    }
  }, [currentOffering]);

  // Fonction pour calculer les économies annuelles
  const calculateAnnualSavings = () => {
    if (!pricing.monthly || !pricing.annual) return null;
    
    const monthlyYearlyCost = pricing.monthly.priceNumber * 12;
    const savings = monthlyYearlyCost - pricing.annual.priceNumber;
    const savingsPercentage = Math.round((savings / monthlyYearlyCost) * 100);
    
    return {
      amount: savings,
      percentage: savingsPercentage,
      currency: pricing.annual.currency,
    };
  };

  // Fonction pour obtenir le prix formaté avec devise
  const getFormattedPrice = (type: 'weekly' | 'monthly' | 'annual') => {
    const priceData = pricing[type];
    if (!priceData) return 'N/A';
    return priceData.price;
  };

  return {
    pricing,
    calculateAnnualSavings,
    getFormattedPrice,
    isLoading: !currentOffering,
  };
}
