import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, where, Firestore } from 'firebase/firestore';

export interface Room {
  id: string;
  name: string;
  createdBy: string;
  players: string[];
  currentPhase: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  createdAt: Date;
}

export function useFirebaseRooms(db: Firestore) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const roomsRef = collection(db, 'rooms');
    const unsubscribe = onSnapshot(roomsRef, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Room[];
      setRooms(roomsData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const createRoom = async (roomData: Omit<Room, 'id' | 'createdAt'>) => {
    try {
      const roomRef = await addDoc(collection(db, 'rooms'), {
        ...roomData,
        createdAt: new Date(),
      });
      return roomRef.id;
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const joinRoom = async (roomId: string, playerId: string) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        players: [...rooms.find(r => r.id === roomId)?.players || [], playerId]
      });
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const leaveRoom = async (roomId: string, playerId: string) => {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        await updateDoc(roomRef, {
          players: room.players.filter(p => p !== playerId)
        });
      }
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  const deleteRoom = async (roomId: string) => {
    try {
      await deleteDoc(doc(db, 'rooms', roomId));
    } catch (err: any) {
      throw new Error(err.message);
    }
  };

  return {
    rooms,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    deleteRoom,
  };
}