import React from 'react';
import { View, Text, FlatList, StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import Avatar from '@/components/Avatar';
import { LocalPlayer } from '@/types/roomTypes';
import { useTranslation } from 'react-i18next';

interface PlayersListProps {
  players: LocalPlayer[];
  maxPlayers: number;
}

interface PlayersListStyles {
  container: ViewStyle;
  playerCard: ViewStyle;
  playerAvatar: ImageStyle;
  playerInfo: ViewStyle;
  playerName: TextStyle;
  hostBadge: ViewStyle;
  hostText: TextStyle;
  readyBadge: ViewStyle;
  readyText: TextStyle;
}

/**
 * Liste des joueurs dans la room
 */
export default function PlayersList({ players, maxPlayers }: PlayersListProps) {
  const { t } = useTranslation();

  return (
    <FlatList
      data={players}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.playerCard}>
          <View style={{ marginRight: 10 }}>
            <Avatar
              source={item.avatar}
              size={40}
              username={item.username || item.displayName}
            />
          </View>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{item.username || item.displayName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {item.isHost && (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostText}>{t('room.host')}</Text>
                </View>
              )}
              {item.isReady && (
                <View style={styles.readyBadge}>
                  <Text style={styles.readyText}>{t('room.ready')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create<PlayersListStyles>({
  container: {
    flex: 1,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  hostBadge: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  hostText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  readyBadge: {
    backgroundColor: '#00c853',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
