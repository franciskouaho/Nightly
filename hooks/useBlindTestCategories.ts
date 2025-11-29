import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, onSnapshot } from '@react-native-firebase/firestore';
import { getFirestore } from '@react-native-firebase/firestore';

export interface BlindTestCategory {
  id: string;
  label: string;
  emoji: string;
  gradient: [string, string];
  description: string;
  order?: number; // Pour ordonner les catégories
  active?: boolean; // Pour activer/désactiver une catégorie
}

export function useBlindTestCategories() {
  const [categories, setCategories] = useState<BlindTestCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const db = getFirestore();
    const categoriesRef = collection(db, 'blindtest-categories');
    
    // Trier par ordre, puis par label
    const q = query(categoriesRef, orderBy('order', 'asc'), orderBy('label', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const categoriesData: BlindTestCategory[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Ne charger que les catégories actives
            if (data.active !== false) {
              categoriesData.push({
                id: doc.id,
                ...data,
              } as BlindTestCategory);
            }
          });
          setCategories(categoriesData);
          setError(null);
        } catch (err) {
          console.error('Erreur lors du chargement des catégories:', err);
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Erreur lors de l\'écoute des catégories:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { categories, loading, error };
}

