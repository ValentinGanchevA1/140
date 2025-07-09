import Geolocation, { GeoPosition, GeoError } from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
// Update the import path below to the correct location of your UserLocation type.
// For example, if your types are in 'src/types/UserLocation.ts', use:
import type { UserLocation } from '../../types/index';
// Or create the file '../../types/index.ts' and export UserLocation from there.

export interface LocationOptions {
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
}

export class LocationService {
  private static instance: LocationService;
  private watchId: number | null = null;
  private currentLocation: UserLocation | null = null;

  private constructor() {}

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async initialize(): Promise<void> {
    if (Platform.OS === 'android') {
      await this.requestAndroidPermissions();
    }
  }

  private async requestAndroidPermissions(): Promise<boolean> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show nearby users.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  async getCurrentLocation(options?: LocationOptions): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      const defaultOptions: LocationOptions = {
        timeout: 15000,
        maximumAge: 10000,
        enableHighAccuracy: true,
        ...options,
      };

      Geolocation.getCurrentPosition(
        (position: GeoPosition) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
          };
          
          this.currentLocation = location;
          resolve(location);
        },
        (error: GeoError) => {
          console.error('Location error:', error);
          reject(new Error(`Location error: ${error.message}`));
        },
        defaultOptions
      );
    });
  }

  watchPosition(
    onLocationChange: (location: UserLocation) => void,
    onError: (error: Error) => void,
    options?: LocationOptions
  ): number | null {
    const defaultOptions: LocationOptions = {
      timeout: 15000,
      maximumAge: 10000,
      enableHighAccuracy: true,
      ...options,
    };

    this.watchId = Geolocation.watchPosition(
      (position: GeoPosition) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        };
        
        this.currentLocation = location;
        onLocationChange(location);
      },
      (error: GeoError) => {
        console.error('Watch position error:', error);
        onError(new Error(`Watch position error: ${error.message}`));
      },
      defaultOptions
    );

    return this.watchId;
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getLastKnownLocation(): UserLocation | null {
    return this.currentLocation;
  }

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  cleanup(): void {
    this.stopWatching();
    this.currentLocation = null;
  }
}

export const locationService = LocationService.getInstance();