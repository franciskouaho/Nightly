import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export const useFirestore = <T>(collectionPath: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const db = firestore();
  const collectionRef = db.collection(collectionPath);

  // Fetch all documents
  const fetchAll = async () => {
    try {
      setLoading(true);
      const snapshot = await collectionRef.get();
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      setData(documents);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new document
  const add = async (document: Omit<T, 'id'>) => {
    try {
      setLoading(true);
      const docRef = await collectionRef.add(document);
      return docRef.id;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a document
  const update = async (id: string, document: Partial<T>) => {
    try {
      setLoading(true);
      await collectionRef.doc(id).update(document);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a document
  const remove = async (id: string) => {
    try {
      setLoading(true);
      await collectionRef.doc(id).delete();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a single document
  const get = async (id: string) => {
    try {
      setLoading(true);
      const doc = await collectionRef.doc(id).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() } as T;
      }
      return null;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  const subscribe = (callback: (data: T[]) => void) => {
    return collectionRef.onSnapshot(
      (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(documents);
        callback(documents);
      },
      (err) => {
        setError(err as Error);
      }
    );
  };

  return {
    data,
    loading,
    error,
    fetchAll,
    add,
    update,
    remove,
    get,
    subscribe
  };
}; 