import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService, CreateRoomPayload } from '@/services/queries/room';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

/**
 * Hook for creating a new game room
 * This hook is extracted from useRooms for more targeted use
 */
export function useCreateRoom() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: CreateRoomPayload) => {
      // Check internet connection
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection. Please check your connection and try again.');
      }
      
      return roomService.createRoom(payload);
    },
    onSuccess: (data) => {
      // Invalidate room list query to force refresh
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      
      // Add new room to cache
      queryClient.setQueryData(['rooms', data.code], data);
      
      // Redirect to newly created room page
      router.push(`/room/${data.code}`);
    },
    onError: (error: any) => {
      let message = 'Unable to create room. Please try again.';
      
      if (error.message.includes('Network Error')) {
        message = 'Server connection problem. Please check your internet connection and try again.';
      } else if (error.response?.data?.error) {
        message = error.response.data.error;
      }
      
      Alert.alert('Error', message);
    }
  });
}
