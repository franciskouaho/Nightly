import { Link, Stack, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Colors from '@/constants/Colors';

export default function NotFoundScreen() {
  const router = useRouter();
  
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <LinearGradient
        colors={[
          Colors.light?.backgroundDarker || "#0D0D1A",
          Colors.light?.background || "#1A1A2E",
          Colors.light?.secondary || "#8B1538"
        ]}
        style={styles.container}
      >
        <ThemedText type="title" style={styles.title}>This screen doesn't exist.</ThemedText>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)')}
          style={styles.button}
        >
          <LinearGradient
            colors={["#C41E3A", "#8B1538"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <ThemedText type="link" style={styles.buttonText}>Go to home screen!</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#E8B4B8',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
