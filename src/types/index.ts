// src/types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  age?: number;
  location?: UserLocation;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

export interface NearbyUsersRequest {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// src/types/navigation.ts
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  Map: undefined;
  Chat: undefined;
  Dating: undefined;
  Marketplace: undefined;
  Profile: undefined;
};

export type MapScreenProps = BottomTabScreenProps<RootTabParamList, 'Map'>;
export type ChatScreenProps = BottomTabScreenProps<RootTabParamList, 'Chat'>;
export type DatingScreenProps = BottomTabScreenProps<RootTabParamList, 'Dating'>;
export type MarketplaceScreenProps = BottomTabScreenProps<RootTabParamList, 'Marketplace'>;
export type ProfileScreenProps = BottomTabScreenProps<RootTabParamList, 'Profile'>;

// src/constants/index.ts
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
} as const;

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const API_ENDPOINTS = {
  BASE_URL: 'https://your-api.com/api',
  AUTH: '/auth',
  USERS: '/users',
  LOCATION: '/location',
  CHAT: '/chat',
  MARKETPLACE: '/marketplace',
} as const;