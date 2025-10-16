import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRoom } from '@/hooks/useRoom';
import RoomHeader from '@/components/room/RoomHeader';
import PlayerList from '@/components/room/PlayerList';
import GameControls from '@/components/room/GameControls';
import RulesDrawer from '@/components/room/RulesDrawer';
import InviteModal from '@/components/room/InviteModal';
import HalloweenDecorations from '@/components/HalloweenDecorations';
import { useTranslation } from 'react-i18next';

export default function RoomScreen() {
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const { t } = useTranslation();
  const {
    room,
    loading,
    isStartingGame,
    canStartGame,
    startGame,
    togglePlayerReady,
    isHost,
    isPlayerReady
  } = useRoom(String(id));

  const [showRules, setShowRules] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

    if (loading) {
        return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>
            {t('room.loading', 'Chargement de la salle...')}
          </Text>
        </View>
            </View>
        );
    }

  if (!room) {
    return (
        <View style={styles.container}>
        <StatusBar barStyle="light-content" />
            <LinearGradient
          colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
                locations={[0, 0.2, 0.5, 0.8, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>
            {t('room.error', 'Salle introuvable')}
                        </Text>
                    </View>
                </View>
    );
  }

  return (
    <View style={styles.container}>
       <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#0E1117", "#0E1117", "#661A59", "#0E1117", "#21101C"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <HalloweenDecorations />
      
      <RoomHeader
        room={room}
        onRulesPress={() => setShowRules(true)}
        onInvitePress={() => setShowInvite(true)}
      />

      <View style={styles.content}>
        <PlayerList players={room.players} />
        
        <GameControls
          room={room}
          isHost={isHost}
          isPlayerReady={isPlayerReady}
          canStartGame={canStartGame(room.gameId)}
          onToggleReady={togglePlayerReady}
          onStartGame={startGame}
                    />
                </View>

                <RulesDrawer
        visible={showRules}
        onClose={() => setShowRules(false)}
        gameId={room.gameId}
      />

      <InviteModal
        visible={showInvite}
        onClose={() => setShowInvite(false)}
        roomId={room.id}
        onCopyCode={() => {}}
        onShareCode={() => {}}
      />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
  content: {
        flex: 1,
    paddingHorizontal: 20,
    },
  loadingOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },
});