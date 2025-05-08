declare module 'react-native-in-app-review' {
  export function isAvailable(): Promise<boolean>;
  export function requestReview(): Promise<void>;
} 