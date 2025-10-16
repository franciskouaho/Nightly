import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { LocalPlayer } from '@/types/room';
import Avatar from '@/components/Avatar';

interface PlayerListProps {
  players: LocalPlayer[];
}

export default function PlayerList({ players }: PlayerListProps) {
  const renderPlayer = ({ item: player }: { item: LocalPlayer }) => (
    <View style={styles.playerItem}>
      <View style={styles.playerInfo}>
        <Avatar 
          source={{ uri: player.avatar }} 
          size={50} 
          style={styles.playerAvatar}
        />
        <View style={styles.playerDetails}>
          <View style={styles.playerNameContainer}>
            <Text style={styles.playerName}>{player.name}</Text>
            {player.isHost && (
              <View style={styles.hostBadge}>
                <Text style={styles.hostBadgeText}>HOST</Text>
              </View>
            )}
          </View>
          <Text style={styles.playerLevel}>Niveau {player.level}</Text>
          {player.isReady && (
            <View style={styles.readyBadge}>
              <Text style={styles.readyBadgeText}>Prêt</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.playersSection}>
      <Text style={styles.playersTitle}>
        Joueurs ({players.length}/20)
      </Text>
      <FlatList
        data={players}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        style={styles.playersList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  playersSection: {
    flex: 1,
    marginTop: 20,
  },
  playersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  playersList: {
    flex: 1,
  },
  playerItem: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    marginRight: 16,
  },
  playerDetails: {
    flex: 1,
  },
  playerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  playerLevel: {
    fontSize: 14,
    color: '#A259FF',
    marginBottom: 8,
  },
  hostBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  hostBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  readyBadge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  readyBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
});
