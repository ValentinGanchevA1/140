import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid, Alert, AppState } from 'react-native';
import { UserLocation } from '../../types/user.ts';

export enum LocationErrorType {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  LOCATION_UNAVAILABLE = 'LOCATION_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export interface LocationError {
  type: LocationErrorType;
  message: string;
  code?: number;
}

interface LocationCallback {
  id: string;
  callback: (location: UserLocation) => void;
}

export class LocationService {
  private static watchId: number | null = null;
  private static callbacks: LocationCallback[] = [];
  private static isInitialized: boolean = false;
  private static appStateSubscription: any = null;
  private static lastKnownLocation: UserLocation | null = null;

  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('LocationService already initialized');
      return;
    }

    try {
      const hasPermission = await this.requestLocationPermission();
      if (hasPermission) {
        await this.startLocationTracking();
        this.setupAppStateListener();
        this.isInitialized = true;
      } else {
        throw new Error('Location permission denied');
      }
    } catch (error) {
      console.error('Failed to initialize LocationService:', error);
      throw error;
    }
  }

  static async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return new Promise((resolve) => {
        Geolocation.requestAuthorization(
          () => resolve(true),
          (error) => {
            console.warn('iOS location permission denied:', error);
            resolve(false);
          }
        );
      });
    } else {
      try {
        // Check if permission is already granted
        const checkResult = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (checkResult) {
          return true;
        }

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
      } catch (err) {
        console.warn('Error requesting location permission:', err);
        return false;
      }
    }
  }

  static async getCurrentLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
          };
          this.lastKnownLocation = location;
          resolve(location);
        },
        (error) => {
          console.error('Location error:', error);
          const locationError = this.mapGeolocationError(error);
          reject(locationError);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  static async startLocationTracking(): Promise<void> {
    if (this.watchId !== null) {
      this.stopLocationTracking();
    }

    return new Promise((resolve, reject) => {
      this.watchId = Geolocation.watchPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
          };

          this.lastKnownLocation = location;
          this.notifyCallbacks(location);

          // Resolve on first successful position
          if (resolve) {
            resolve();
          }
        },
        (error) => {
          console.error('Location tracking error:', error);
          const locationError = this.mapGeolocationError(error);

          // Show user-friendly error message
          this.showLocationError(locationError);

          if (reject) {
            reject(locationError);
          }
        },
        {
          enableHighAccuracy: false, // More battery efficient
          distanceFilter: 50, // Update every 50 meters
          interval: 30000, // Check every 30 seconds
          fastestInterval: 10000, // Minimum 10 seconds between updates
        }
      );
    });
  }

  static stopLocationTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  static addLocationCallback(callback: (location: UserLocation) => void): string {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    this.callbacks.push({ id, callback });

    // If we have a last known location, call the callback immediately
    if (this.lastKnownLocation) {
      callback(this.lastKnownLocation);
    }

    return id;
  }

  static removeLocationCallback(callbackId: string): void {
    this.callbacks = this.callbacks.filter(item => item.id !== callbackId);
  }

  static clearAllCallbacks(): void {
    this.callbacks = [];
  }

  static getLastKnownLocation(): UserLocation | null {
    return this.lastKnownLocation;
  }

  static cleanup(): void {
    this.stopLocationTracking();
    this.clearAllCallbacks();
    this.removeAppStateListener();
    this.isInitialized = false;
    this.lastKnownLocation = null;
  }

  // Private helper methods
  private static notifyCallbacks(location: UserLocation): void {
    this.callbacks.forEach(({ callback }) => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location callback:', error);
      }
    });
  }

  private static mapGeolocationError(error: any): LocationError {
    switch (error.code) {
      case 1:
        return {
          type: LocationErrorType.PERMISSION_DENIED,
          message: 'Location permission denied',
          code: error.code
        };
      case 2:
        return {
          type: LocationErrorType.LOCATION_UNAVAILABLE,
          message: 'Location unavailable',
          code: error.code
        };
      case 3:
        return {
          type: LocationErrorType.TIMEOUT,
          message: 'Location request timed out',
          code: error.code
        };
      default:
        return {
          type: LocationErrorType.UNKNOWN,
          message: error.message || 'Unknown location error',
          code: error.code
        };
    }
  }

  private static showLocationError(error: LocationError): void {
    let title = 'Location Error';
    let message = error.message;

    switch (error.type) {
      case LocationErrorType.PERMISSION_DENIED:
        title = 'Permission Required';
        message = 'Please enable location permissions in your device settings.';
        break;
      case LocationErrorType.LOCATION_UNAVAILABLE:
        message = 'Unable to determine your location. Please check your GPS settings.';
        break;
      case LocationErrorType.TIMEOUT:
        message = 'Location request timed out. Please try again.';
        break;
    }

    Alert.alert(title, message, [{ text: 'OK' }]);
  }

  private static setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && this.isInitialized && this.watchId === null) {
        // Restart location tracking when app becomes active
        this.startLocationTracking().catch(console.error);
      } else if (nextAppState === 'background') {
        // Optionally stop tracking in background to save battery
        // this.stopLocationTracking();
      }
    });
  }

  private static removeAppStateListener(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}
