import { useState } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, DocumentData, QueryDocumentSnapshot, WithFieldValue } from 'firebase/firestore';
import { db } from '@/config/firebase';

export const useFirestore = <T extends DocumentData>(collectionPath: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const collectionRef = collection(db, collectionPath);

  // Fetch all documents
  const fetchAll = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collectionRef);
      const documents = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
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
  const add = async (document: WithFieldValue<T>) => {
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
  const update = async (id: string, document: Partial<WithFieldValue<T>>) => {
    try {
      setLoading(true);
      const docRef = doc(db, collectionPath, id);
      await updateDoc(docRef, document as DocumentData);
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