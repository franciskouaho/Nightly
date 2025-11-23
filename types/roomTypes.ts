import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

/**
 * Types pour la gestion des salles de jeu
 */

// Type pour un joueur dans la room
// NOTE: Dans Firestore, le champ s'appelle "username" mais dans notre code on utilise "pseudo"
// On fait le mapping lors de la lecture/écriture
export interface LocalPlayer {
  id: string;
  username: string; // Dans Firestore, c'est "username"
  displayName?: string;
  name: string; // Pour la rétrocompatibilité
  isHost: boolean;
  isReady: boolean;
  avatar: string;
  level: number;
}

// Interface pour l'objet Room
export interface Room {
  id: string;
  gameId: string;
  gameMode?: string;
  name: string;
  players: LocalPlayer[];
  createdAt: string;
  status: string;
  host: string;
  maxPlayers: number;
  code: string;
  gameDocId?: string;
}

// Styles pour l'écran de room
export interface RoomScreenStyles {
  container: ViewStyle;
  background: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  topBar: ViewStyle;
  topBarRow: ViewStyle;
  backButton: ViewStyle;
  topBarTitleContainer: ViewStyle;
  topBarTitle: TextStyle;
  shareButton: ViewStyle;
  codeContainer: ViewStyle;
  codeLabel: TextStyle;
  codeBox: ViewStyle;
  codeText: TextStyle;
  playersContainer: ViewStyle;
  playersHeaderRow: ViewStyle;
  rulesButtonRow: ViewStyle;
  rulesText: TextStyle;
  rulesCircle: ViewStyle;
  rulesQuestionMark: TextStyle;
  sectionTitle: TextStyle;
  playerCard: ViewStyle;
  playerAvatar: ImageStyle;
  playerInfo: ViewStyle;
  playerName: TextStyle;
  hostBadge: ViewStyle;
  hostText: TextStyle;
  readyBadge: ViewStyle;
  readyText: TextStyle;
  readyButton: ViewStyle;
  readyButtonGradient: ViewStyle;
  readyButtonText: TextStyle;
  rightContainer: ViewStyle;
  headerButtons: ViewStyle;
  inviteButton: ViewStyle;
  gameControlsContainer: ViewStyle;
  roundSelectorContainer: ViewStyle;
  roundSelectorButton: ViewStyle;
  readyButtonContainer: ViewStyle;
  readyButtonFullWidth: ViewStyle;
  roundSelectorGradient: ViewStyle;
  roundSelectorText: TextStyle;
  roundSelectorIconContainer: ViewStyle;
  starIcon: TextStyle;
  smallStarIcon: TextStyle;
  roundOptionsContainer: ViewStyle;
  roundOptionsRow: ViewStyle;
  roundOption: ViewStyle;
  roundOptionText: TextStyle;
  selectedRoundOption: ViewStyle;
  selectedRoundOptionText: TextStyle;
  startButtonContainer: ViewStyle;
  startButton: ViewStyle;
  startButtonText: TextStyle;
  leaveButton: ViewStyle;
  leaveButtonText: TextStyle;
  iconButton: ViewStyle;
  minPlayersWarning: TextStyle;
  disabledButton: ViewStyle;
  centeredWarning: TextStyle;
  minPlayersText: TextStyle;
  halloweenDecorations: ViewStyle;
}
