import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '@/services/socketService';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);

  const initializeSocket = useCallback(async () => {
    try {
      // Use the getInstanceAsync method to get an instance of the socket
      const socket = await socketService.getInstanceAsync(true);
      socketRef.current = socket;
      
      // Set up connection event handlers
      socket.on('connect', () => {
        setIsConnected(true);
      });
      
      socket.on('disconnect', () => {
        setIsConnected(false);
      });
      
      return socket;
    } catch (error) {
      console.error('Error initializing socket:', error);
      setIsConnected(false);
      return null;
    }
  }, []);

  useEffect(() => {
    initializeSocket();
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        try {
          socketRef.current.disconnect();
        } catch (error) {
          console.error('Error disconnecting socket:', error);
        }
      }
    };
  }, [initializeSocket]);

  return socketRef.current;
}

export default useSocket; 