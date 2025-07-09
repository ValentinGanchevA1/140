import { createAsyncThunk } from '@reduxjs/toolkit';
import { UserLocation, User, NearbyUsersRequest } from '../../types/user';
import { userApi } from '../../services/api/userApi';

// Extract helper function for location conversion
const createUserLocationWithTimestamp = (location: Omit<UserLocation, 'accuracy' | 'timestamp'>): UserLocation => ({
  latitude: location.latitude,
  longitude: location.longitude,
  accuracy: 0, // Default accuracy value
  timestamp: new Date(),
});

export const updateUserLocation = createAsyncThunk<
  UserLocation,
  Omit<UserLocation, 'accuracy' | 'timestamp'>,
  { rejectValue: string }
>(
  'map/updateUserLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      const userLocation = createUserLocationWithTimestamp(locationData);
      await userApi.updateLocation(userLocation);
      return userLocation;
    } catch (error) {
      console.error('Failed to update user location:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update location'
      );
    }
  }
);

export const fetchNearbyUsers = createAsyncThunk<
  User[],
  NearbyUsersRequest,
  { rejectValue: string }
>(
  'map/fetchNearbyUsers',
  async (nearbyUsersRequest, { rejectWithValue }) => {
    try {
      return await userApi.getNearbyUsers(nearbyUsersRequest);
    } catch (error) {
      console.error('Failed to fetch nearby users:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch nearby users'
      );
    }
  }
);
