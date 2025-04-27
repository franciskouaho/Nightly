import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomService, Room } from '@/services/queries/room';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useCreateRoom } from './useCreateRoom';
import SocketService from '@/services/socketService';
import api from '@/config/axios'; // Using the api instance from axios.ts
import { AxiosError } from 'axios';

// Interface for API error responses
interface ApiErrorResponse {
  error?: string;
  message?: string;
}

// Hook to list all rooms
export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      // Check internet connection
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection. Please check your connection and try again.');
      }
      
      const rooms = await roomService.getRooms();
      return rooms;
    },
    staleTime: 1000 * 30, // Refresh after 30 seconds
    retry: (failureCount, error: Error) => {
      return failureCount < 2;
    },
  });
}

// Hook to get details of a specific room
export function useRoom(roomCode: string | undefined) {
  return useQuery({
    queryKey: ['rooms', roomCode],
    queryFn: async () => {
      if (!roomCode) {
        throw new Error('Missing room code');
      }
      
      // Check internet connection
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection. Please check your connection and try again.');
      }
      
      try {
        const room = await roomService.getRoomByCode(roomCode);
        
        // Ensure important properties exist
        if (!room.players) {
          room.players = [];
        }
        
        return room;
      } catch (error) {
        throw error;
      }
    },
    staleTime: 1000 * 30, // Refresh after 30 seconds
    enabled: !!roomCode, // Don't execute if roomCode is undefined
    retry: (failureCount, error: Error) => {
      // Don't retry if room doesn't exist (404)
      const axiosError = error as AxiosError<ApiErrorResponse>;
      if (axiosError.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Export useCreateRoom hook
export { useCreateRoom };

// Hook to join a room
export const useJoinRoom = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (code: string) => {
      try {
        // Ensure socket is initialized before attempting to join a room
        try {
          await SocketService.initialize();
          // Try to join the room via WebSocket
          await SocketService.joinRoom(code);
        } catch (socketError) {
          // Continue even with WebSocket errors, HTTP API is priority
        }
        
        // Call API to join the room
        const response = await api.post(`/rooms/${code}/join`);
        
        return {
          code,
          message: response.data?.message || 'Room joined successfully'
        };
      } catch (error) {
        // Improved error handling
        const axiosError = error as AxiosError<ApiErrorResponse>;
        if (axiosError.response) {
          // API responded with an error
          const message = axiosError.response.data?.error || 'Error when attempting to join the room';
          throw new Error(message);
        } else if (axiosError.request) {
          // No response received from server
          throw new Error('Server not responding. Please check your internet connection.');
        } else {
          // Error in setting up the request
          throw new Error(`Error: ${axiosError.message}`);
        }
      }
    },
    onSuccess: (data) => {
      router.push(`/room/${data.code}`);
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message);
    }
  });
};

// Hook to leave a room
export function useLeaveRoom() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (roomCode: string) => {
      return roomService.leaveRoom(roomCode);
    },
    onSuccess: (_, roomCode) => {
      // Invalidate all room-related data
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      // Redirect to home page
      router.replace('/');
    },
    onError: (error, roomCode) => {
      Alert.alert(
        'Error',
        'Unable to leave the room. Please try again.'
      );
    }
  });
}

// Hook to toggle player ready status
export function useToggleReadyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomCode, isReady }: { roomCode: string; isReady: boolean }) => {
      return roomService.toggleReadyStatus(roomCode, isReady);
    },
    onSuccess: (data, variables) => {
      // Update cache with new status
      queryClient.setQueryData(['user', 'ready', variables.roomCode], variables.isReady);
      
      // Invalidate specific room query to refresh data
      queryClient.invalidateQueries({ queryKey: ['rooms', variables.roomCode] });
    },
    onError: (error, variables) => {
      Alert.alert(
        'Error',
        'Unable to update your status. Please try again.'
      );
    }
  });
}

// Hook to start a game
export function useStartGame() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (roomCode: string) => {
      // Check internet connection before starting
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        throw new Error('No internet connection. Please check your connection and try again.');
      }
      
      try {
        // Clean up old connections to avoid conflicts
        await SocketService.cleanup();
        
        // Wait a short time to ensure previous connection is closed
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Initialize socket with force
        const socket = await SocketService.getInstanceAsync(true);
        
        let socketReady = false;
        if (socket) {
          // Try to join the room
          const joinResult = await SocketService.joinRoom(roomCode);
          
          if (joinResult) {
            socketReady = true;
          }
        }
        
        // Direct and explicit call to startGame
        const startResult = await roomService.startGame(roomCode);
        
        // If API succeeded but socket is not ready, try to connect one last time
        if (!socketReady && startResult.data && startResult.data.gameId) {
          try {
            await SocketService.getInstanceAsync(true);
            await SocketService.joinGame(String(startResult.data.gameId));
          } catch (lastSocketError) {
            // Ignore errors
          }
        }
        
        return startResult;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      // Redirect to game page
      router.replace(`/game/${data.data.gameId}`);
    },
    onError: (error: any, roomCode) => {
      // Get detailed error message
      let errorMessage = 'Unable to start game. Please try again.';
      
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  });
}
