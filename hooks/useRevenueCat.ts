/*
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesOffering } from 'react-native-purchases';

const APIKeys = {
    apple: 'appl_BUWsmlSbbbxzCqsmloqsfKcvUVa',
    google: 'goog_xyOWWvvgJbmzWHJLVGdlXdYavbQ',
};

const typesOfMembership = {
    weekly: 'ngt_weekly',
    monthly: 'ngt_monthly',
    yearly: 'ngt_yearly',
};

function useRevenueCat() {
    const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

    const isProMember = customerInfo?.activeSubscriptions?.includes(typesOfMembership.monthly) ||
        customerInfo?.activeSubscriptions?.includes(typesOfMembership.yearly);


    useEffect(() => {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        const fetchData = async () => {
            if (Platform.OS === 'android') {
                Purchases.configure({apiKey: APIKeys.google});
            } else {
                Purchases.configure({apiKey: APIKeys.apple});
            }
            const offerings = await Purchases.getOfferings();
            const customerInfo = await Purchases.getCustomerInfo();
            setCustomerInfo(customerInfo);
            setCurrentOffering(offerings.current);
        };

        fetchData().catch(console.error);
    }, []);

    useEffect(() => {
        const customerInfoUpdated = async (purchaserInfo: CustomerInfo) => {
            setCustomerInfo(purchaserInfo);
        };
        Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);
        return () => {
            Purchases.removeCustomerInfoUpdateListener && Purchases.removeCustomerInfoUpdateListener(customerInfoUpdated);
        };
    }, []);

    return { currentOffering, customerInfo, isProMember };
}

export default useRevenueCat; */
