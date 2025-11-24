import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { getFirestore, doc, updateDoc, getDoc, onSnapshot } from '@react-native-firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { trackDistanceCalculated, trackLocationSharingToggled } from '@/services/couplesAnalytics';

interface LocationCoords {
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface UseCoupleLocationReturn {
  distance: string | null;
  distanceKm: number | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  hasPermission: boolean;
  enableLocationSharing: () => Promise<void>;
  disableLocationSharing: () => Promise<void>;
  isLocationSharingEnabled: boolean;
  updateLocation: () => Promise<void>;
}

/**
 * Hook pour gérer la géolocalisation du couple
 * Calcule la distance entre les deux partenaires
 */
export function useCoupleLocation(partnerId?: string): UseCoupleLocationReturn {
  const { user } = useAuth();
  const [distance, setDistance] = useState<string | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLocationSharingEnabled, setIsLocationSharingEnabled] = useState(false);

  // Vérifier les permissions au montage
  useEffect(() => {
    checkPermission();
    checkLocationSharingStatus();
  }, []);

  // Écouter les changements de localisation du partenaire
  useEffect(() => {
    if (!partnerId || !user?.uid || !isLocationSharingEnabled) {
      return;
    }

    const db = getFirestore();
    const partnerRef = doc(db, 'users', partnerId);

    // Écouter les changements en temps réel
    const unsubscribe = onSnapshot(
      partnerRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const partnerData = snapshot.data();
          if (partnerData?.location && partnerData?.locationSharingEnabled) {
            calculateDistance();
          }
        }
      },
      (err) => {
        console.error('Error listening to partner location:', err);
      }
    );

    return () => unsubscribe();
  }, [partnerId, user?.uid, isLocationSharingEnabled]);

  /**
   * Vérifier si nous avons les permissions de localisation
   */
  const checkPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (err) {
      console.error('Error checking location permission:', err);
      setHasPermission(false);
    }
  };

  /**
   * Vérifier si le partage de localisation est activé
   */
  const checkLocationSharingStatus = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsLocationSharingEnabled(userData?.locationSharingEnabled === true);
      }
    } catch (err) {
      console.error('Error checking location sharing status:', err);
    }
  };

  /**
   * Demander la permission de localisation
   */
  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      return status === 'granted';
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError('Impossible de demander la permission de localisation');
      return false;
    }
  };

  /**
   * Activer le partage de localisation
   */
  const enableLocationSharing = async () => {
    if (!user?.uid) return;

    // Demander la permission si nécessaire
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        setError('Permission de localisation refusée');
        return;
      }
    }

    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);

      // Obtenir la position actuelle
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      };

      // Mettre à jour Firestore
      await updateDoc(userRef, {
        locationSharingEnabled: true,
        location: locationData,
      });

      setIsLocationSharingEnabled(true);
      await trackLocationSharingToggled(true);

      // Calculer la distance immédiatement
      await calculateDistance();
    } catch (err: any) {
      console.error('Error enabling location sharing:', err);
      setError(err.message || 'Erreur lors de l\'activation du partage de localisation');
    }
  };

  /**
   * Désactiver le partage de localisation
   */
  const disableLocationSharing = async () => {
    if (!user?.uid) return;

    try {
      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, {
        locationSharingEnabled: false,
        location: null,
      });

      setIsLocationSharingEnabled(false);
      setDistance(null);
      setDistanceKm(null);
      await trackLocationSharingToggled(false);
    } catch (err: any) {
      console.error('Error disabling location sharing:', err);
      setError(err.message || 'Erreur lors de la désactivation du partage de localisation');
    }
  };

  /**
   * Mettre à jour la position de l'utilisateur
   */
  const updateLocation = async () => {
    if (!user?.uid || !hasPermission || !isLocationSharingEnabled) {
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      };

      const db = getFirestore();
      const userRef = doc(db, 'users', user.uid);

      await updateDoc(userRef, {
        location: locationData,
      });

      // Recalculer la distance
      await calculateDistance();
    } catch (err: any) {
      console.error('Error updating location:', err);
      setError(err.message || 'Erreur lors de la mise à jour de la position');
    }
  };

  /**
   * Calculer la distance entre les deux partenaires
   */
  const calculateDistance = useCallback(async () => {
    if (!user?.uid || !partnerId || !isLocationSharingEnabled) {
      return;
    }

    try {
      setLoading(true);
      const db = getFirestore();

      // Récupérer les positions des deux utilisateurs
      const userRef = doc(db, 'users', user.uid);
      const partnerRef = doc(db, 'users', partnerId);

      const [userDoc, partnerDoc] = await Promise.all([
        getDoc(userRef),
        getDoc(partnerRef),
      ]);

      if (!userDoc.exists() || !partnerDoc.exists()) {
        setError('Données utilisateur introuvables');
        return;
      }

      const userData = userDoc.data();
      const partnerData = partnerDoc.data();

      // Vérifier que les deux utilisateurs partagent leur localisation
      if (!userData?.locationSharingEnabled || !partnerData?.locationSharingEnabled) {
        setDistance(null);
        setDistanceKm(null);
        return;
      }

      const userLocation = userData.location as LocationCoords | undefined;
      const partnerLocation = partnerData.location as LocationCoords | undefined;

      if (!userLocation || !partnerLocation) {
        setDistance(null);
        setDistanceKm(null);
        return;
      }

      // Calculer la distance avec la formule de Haversine
      const distanceInKm = calculateHaversineDistance(
        userLocation.latitude,
        userLocation.longitude,
        partnerLocation.latitude,
        partnerLocation.longitude
      );

      setDistanceKm(distanceInKm);

      // Formater la distance pour l'affichage
      if (distanceInKm < 1) {
        setDistance(`${Math.round(distanceInKm * 1000)}m`);
      } else if (distanceInKm < 10) {
        setDistance(`${distanceInKm.toFixed(1)}km`);
      } else {
        setDistance(`${Math.round(distanceInKm)}km`);
      }

      // Track l'analytics
      await trackDistanceCalculated(distanceInKm);
      setError(null);
    } catch (err: any) {
      console.error('Error calculating distance:', err);
      setError(err.message || 'Erreur lors du calcul de la distance');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, partnerId, isLocationSharingEnabled]);

  return {
    distance,
    distanceKm,
    loading,
    error,
    requestPermission,
    hasPermission,
    enableLocationSharing,
    disableLocationSharing,
    isLocationSharingEnabled,
    updateLocation,
  };
}

/**
 * Calculer la distance entre deux coordonnées GPS avec la formule de Haversine
 * @param lat1 Latitude du point 1
 * @param lon1 Longitude du point 1
 * @param lat2 Latitude du point 2
 * @param lon2 Longitude du point 2
 * @returns Distance en kilomètres
 */
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convertir des degrés en radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
