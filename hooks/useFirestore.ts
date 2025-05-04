import { useState } from 'react';
import { collection, query, where, getDocs, getFirestore, doc, addDoc, updateDoc, deleteDoc, onSnapshot, getDoc } from '@react-native-firebase/firestore';

type DocumentData = {
  [field: string]: any;
};

export const useFirestore = <T extends DocumentData>(collectionPath: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const db = getFirestore();
  const collectionRef = collection(db, collectionPath);

  // Fetch all documents
  const fetchAll = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collectionRef);
      const documents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as T[];
      setData(documents);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new document
  const add = async (document: T) => {
    try {
      setLoading(true);
      const docRef = await addDoc(collectionRef, document);
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
      const docRef = doc(db, collectionPath, id);
      await updateDoc(docRef, document as any);
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
      const docRef = doc(db, collectionPath, id);
      await deleteDoc(docRef);
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
      const docRef = doc(db, collectionPath, id);
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();
      if (data) {
        return { id: docSnap.id, ...data } as unknown as T;
      }
      return null;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to collection changes
  const subscribe = (callback: (data: T[]) => void) => {
    return onSnapshot(
      collectionRef,
      (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as unknown as T[];
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