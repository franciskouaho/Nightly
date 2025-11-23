import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

// Type pour l'utilisateur
export interface User {
    id: string | number;
    pseudo: string;
    displayName?: string;
    avatar?: string;
    level?: number;
    isHost?: boolean;
}

// Type local pour Player qui correspond à ce que nous utilisons dans ce composant
// NOTE: Dans Firestore, le champ s'appelle "username" mais dans notre code on utilise "pseudo"
// On fait le mapping lors de la lecture/écriture
export interface LocalPlayer {
    id: string;
    username: string; // Dans Firestore, c'est "username"
    displayName?: string;
    name: string; // Pour la rétrocompatibilité avec le code existant
    isHost: boolean;
    isReady: boolean;
    avatar: string;
    level: number;
}

// Interface pour l'objet Room qui correspond à ce qui est créé dans la page d'accueil
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

// Interface pour les données de création de salle
export interface RoomCreationData {
    name: string;
    gameId: string;
    maxPlayers: number;
    host: string;
    players: LocalPlayer[];
    createdAt: string;
    status: string;
    code: string;
}

// Interface pour les styles du composant Room
export interface RoomScreenStyles {
    container: ViewStyle;
    header: ViewStyle;
    headerContent: ViewStyle;
    backButton: ViewStyle;
    roomTitle: TextStyle;
    roomCode: TextStyle;
    content: ViewStyle;
    playersSection: ViewStyle;
    playersTitle: TextStyle;
    playersList: ViewStyle;
    playerItem: ViewStyle;
    playerInfo: ViewStyle;
    playerName: TextStyle;
    playerLevel: TextStyle;
    readyButton: ViewStyle;
    readyButtonText: TextStyle;
    startButton: ViewStyle;
    startButtonText: TextStyle;
    rulesButton: ViewStyle;
    inviteButton: ViewStyle;
    loadingOverlay: ViewStyle;
    loadingText: TextStyle;
    hostBadge: ViewStyle;
    hostBadgeText: TextStyle;
    readyBadge: ViewStyle;
    readyBadgeText: TextStyle;
    playerAvatar: ImageStyle;
    halloweenDecorations: ViewStyle;
}
