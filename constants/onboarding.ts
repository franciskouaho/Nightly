import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface OnboardingSlideData {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  colors: string[];
}

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: 'welcome',
    titleKey: 'onboarding.welcome.title',
    descriptionKey: 'onboarding.welcome.description',
    icon: 'gamepad-variant',
    colors: ['#667eea', '#764ba2'],
  },
  {
    id: 'games',
    titleKey: 'onboarding.games.title',
    descriptionKey: 'onboarding.games.description',
    icon: 'account-group',
    colors: ['#f093fb', '#f5576c'],
  },
  {
    id: 'social',
    titleKey: 'onboarding.social.title',
    descriptionKey: 'onboarding.social.description',
    icon: 'account-heart',
    colors: ['#4facfe', '#00f2fe'],
  },
  {
    id: 'ready',
    titleKey: 'onboarding.ready.title',
    descriptionKey: 'onboarding.ready.description',
    icon: 'rocket-launch',
    colors: ['#43e97b', '#38f9d7'],
  },
];

export const ONBOARDING_STORAGE_KEY = 'onboarding_completed';

export const ONBOARDING_CONFIG = {
  ANIMATION_DURATION: 300,
  DOT_WIDTH_ACTIVE: 24,
  DOT_WIDTH_INACTIVE: 8,
  DOT_OPACITY_ACTIVE: 1,
  DOT_OPACITY_INACTIVE: 0.3,
  VIEWABILITY_THRESHOLD: 50,
} as const;
