import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { GestureResponderEvent, TouchableOpacity } from 'react-native';

let PlatformPressable: typeof TouchableOpacity;

try {
  PlatformPressable = require('@react-navigation/elements').PlatformPressable;
} catch {
  PlatformPressable = TouchableOpacity;
}

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...(props as any)}
      onPressIn={(ev: GestureResponderEvent) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
