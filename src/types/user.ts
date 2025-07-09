export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface NearbyUsersRequest {
  latitude: number;
  longitude: number;
  radius: number;
  limit?: number;
}

export enum LocationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  LOCATION_UNAVAILABLE = 'LOCATION_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
}
