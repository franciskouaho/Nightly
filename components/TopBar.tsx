import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import PointsDisplay from './PointsDisplay';

type TopBarProps = {
  showNotificationButton?: boolean;
  rightButtons?: React.ReactNode;
  currentQuestion?: {
    id: string;
    text: string;
    theme?: string;
  } | null;
};

const QuestionDisplay = ({ question }: { question: TopBarProps['currentQuestion'] }) => {
  if (!question) return null;

  return (
    <View style={styles.questionContainer}>
      {question.theme && (
        <View style={styles.themeBadge}>
          <Text style={styles.themeText}>{question.theme}</Text>
        </View>
      )}
      <Text style={styles.questionText}>{question.text}</Text>
    </View>
  );
};

export default function TopBar({ 
  showNotificationButton = true,
  rightButtons,
  currentQuestion
}: TopBarProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(t('topBar.notifications.title'), t('topBar.notifications.comingSoon'));
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{t('topBar.greeting')} </Text>
          <Text style={styles.userName}>{user?.pseudo}</Text>
        </View>
      </View>
      
      {currentQuestion && <QuestionDisplay question={currentQuestion} />}
      
      <View style={styles.rightContainer}>
        <PointsDisplay size="medium" />
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
  },
  questionContainer: {
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeBadge: {
    backgroundColor: '#7B2CBF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  themeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});