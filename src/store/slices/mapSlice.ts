import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserLocation, User, NearbyUsersRequest } from '../types';
import { userApi } from '../../services/userApi';

interface LocationInput {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface MapState {
  currentLocation: UserLocation | null;
  nearbyUsers: User[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: MapState = {
  currentLocation: null,
  nearbyUsers: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const createUserLocationWithTimestamp = (location: LocationInput): UserLocation => ({
  latitude: location.latitude,
  longitude: location.longitude,
  accuracy: location.accuracy ?? -1,
  timestamp: new Date(),
});

export const updateUserLocation = createAsyncThunk<
  UserLocation,
  LocationInput,
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

      if (error instanceof Error) {
        if (error.message.includes('network')) {
          return rejectWithValue('Network error: Unable to update location');
        }
        if (error.message.includes('timeout')) {
          return rejectWithValue('Request timeout: Location update failed');
        }
        return rejectWithValue(`Location update failed: ${error.message}`);
      }

      return rejectWithValue('Failed to update location');
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

      if (error instanceof Error) {
        if (error.message.includes('network')) {
          return rejectWithValue('Network error: Unable to fetch nearby users');
        }
        if (error.message.includes('timeout')) {
          return rejectWithValue('Request timeout: Failed to fetch nearby users');
        }
        return rejectWithValue(`Failed to fetch nearby users: ${error.message}`);
      }

      return rejectWithValue('Failed to fetch nearby users');
    }
  }
);

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setNearbyUsers: (state, action: PayloadAction<User[]>) => {
      state.nearbyUsers = action.payload;
    },
    clearNearbyUsers: (state) => {
      state.nearbyUsers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Update location
      .addCase(updateUserLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserLocation.fulfilled, (state, action) => {
        state.currentLocation = action.payload;
        state.isLoading = false;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateUserLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update location';
      })
      // Fetch nearby users
      .addCase(fetchNearbyUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyUsers.fulfilled, (state, action) => {
        state.nearbyUsers = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchNearbyUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch nearby users';
      });
  },
});

export const { clearError, setNearbyUsers, clearNearbyUsers } = mapSlice.actions;
export default mapSlice.reducer;