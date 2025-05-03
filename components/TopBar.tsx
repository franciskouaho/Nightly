import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

type TopBarProps = {
  showNotificationButton?: boolean;
  rightButtons?: React.ReactNode;
};

export default function TopBar({ 
  showNotificationButton = true,
  rightButtons
}: TopBarProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Notifications', 'Cette fonctionnalité sera bientôt disponible !');
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Bonjour </Text>
          <Text style={styles.userName}>{user?.pseudo}</Text>
        </View>
      </View>
      
      <View style={styles.rightContainer}>
        {showNotificationButton && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/(tabs)/profil')}
          >
            <LinearGradient
              colors={["#A259FF", "#C471F5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 12, padding: 7 }}
            >
              <Feather name="settings" size={22} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
        {rightButtons}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginTop: 50,
    height: 48,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(93, 109, 255, 0.3)',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  greetingContainer: {
    flexDirection: 'row',
    marginLeft: 10,
    alignItems: 'center',
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  }
});