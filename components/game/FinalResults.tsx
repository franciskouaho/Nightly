import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Player } from '@/types/gameTypes'; // Assuming Player interface is here
import { useTranslation } from 'react-i18next';
import RoundedButton from '@/components/RoundedButton';
import { useRouter } from 'expo-router';

interface FinalResultsProps {
  players: Player[];
  scores: Record<string, number>;
  gameId: string;
}

export default function FinalResults({ players, scores, gameId }: FinalResultsProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // Sort players by score in descending order
  // Ensure player exists and has an id before accessing scores[player.id]
  const sortedPlayers = [...players].sort((a, b) => (scores?.[b?.id!] || 0) - (scores?.[a?.id!] || 0));

  // Determine the winner(s) - could be multiple in case of a tie
  // Add check for sortedPlayers[0] before accessing id
  const topScore = sortedPlayers.length > 0 && sortedPlayers[0]?.id ? (scores?.[sortedPlayers[0].id] || 0) : 0;
  const winners = sortedPlayers.filter(player => player?.id && (scores?.[player.id] || 0) === topScore && topScore > 0);

  const handleGoHome = () => {
    router.replace('/'); // Navigate back to the home screen or game list
  };

  // Helper function to safely get player name with fallbacks
  const getPlayerDisplayName = (player: Player | undefined): string => {
    if (!player) return t('game.player', 'Joueur'); // Fallback for undefined player
    return player.displayName || player.username || player.name || t('game.player', 'Joueur');
  };

  return (
    <View style={styles.container}>
       <View style={styles.header}>
            <Text style={styles.title}>{t('game.finalResults.title', 'Résultats Finaux')}</Text>
        </View>

      {winners.length > 0 && (
        <View style={styles.winnersContainer}>
          <Text style={styles.winnerText}>
            {winners.length > 1
              ? t('game.finalResults.winners', 'Gagnants !')
              : t('game.finalResults.winner', 'Gagnant !')}
          </Text>
          {winners.map(winner => (
              // Use helper function for safe name display
              <Text key={winner.id} style={styles.winnerName}>
                {getPlayerDisplayName(winner)}
              </Text>
          ))}
        </View>
      )}

      {/* Handle case with no winners (e.g., all scores are 0 or negative) */}
      {winners.length === 0 && sortedPlayers.length > 0 && (
          <View style={styles.noWinnerContainer}>
               <Text style={styles.noWinnerText}>{t('game.finalResults.noWinner', 'Aucun gagnant ce tour.')}</Text>
          </View>
      )}

      <Text style={styles.scoresTitle}>{t('game.finalResults.scores', 'Scores Finaux')}:</Text>
      <ScrollView style={styles.scoresList}>
        {/* Ensure player object is valid before rendering */}
        {sortedPlayers.filter(player => player?.id).map((player, index) => (
          <View key={player.id} style={styles.scoreRow}>
            <Text style={styles.scoreRank}>{index + 1}.</Text>
            <Text style={styles.scorePlayerName}>
               {/* Use helper function for safe name display */}
               {getPlayerDisplayName(player)}
            </Text>
            <Text style={styles.scoreValue}>{scores?.[player.id] || 0}</Text>
          </View>
        ))}
      </ScrollView>

       <RoundedButton
          title={t('common.goHome', 'Accueil')}
          onPress={handleGoHome}
          style={styles.homeButton}
        />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  winnersContainer: {
      marginBottom: 20,
      alignItems: 'center',
  },
  winnerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFD700', // Gold color for winner
      marginBottom: 10,
  },
  winnerName: {
      fontSize: 20,
      color: '#fff',
      marginBottom: 5,
  },
  noWinnerContainer: {
       marginBottom: 20,
       alignItems: 'center',
   },
    noWinnerText: {
       fontSize: 20,
       fontWeight: 'bold',
       color: '#fff',
       textAlign: 'center',
   },
  scoresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  scoresList: {
    width: '100%',
    maxWidth: 400,
     maxHeight: 300, // Limit height for scrolling
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
  },
   scoreRank: {
       fontSize: 16,
       color: '#fff',
       marginRight: 10,
       fontWeight: 'bold',
   },
  scorePlayerName: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A259FF',
  },
  homeButton: {
      marginTop: 20,
      width: '100%',
      maxWidth: 300,
  }
}); 