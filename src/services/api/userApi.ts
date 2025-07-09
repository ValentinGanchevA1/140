import { api } from './api';
import { User, UserLocation, NearbyUsersRequest } from '../../types/index';

export const userApi = {
  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/api/users/me', userData);
    return response.data;
  },

  // Update user location
  updateLocation: async (location: UserLocation): Promise<void> => {
    await api.post('/api/users/location', {
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date().toISOString(),
    });
  },

  // Get nearby users
  getNearbyUsers: async (request: NearbyUsersRequest): Promise<User[]> => {
    const response = await api.get('/api/users/nearby', {
      params: {
        latitude: request.latitude,
        longitude: request.longitude,
        radius: request.radius,
        limit: request.limit || 50,
      },
    });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<User> => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  // Upload profile photo
  uploadProfilePhoto: async (imageUri: string): Promise<string> => {
    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    const response = await api.post('/api/users/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.photoUrl;
  },

  // Block/unblock user
  blockUser: async (userId: string): Promise<void> => {
    await api.post(`/api/users/${userId}/block`);
  },

  unblockUser: async (userId: string): Promise<void> => {
    await api.delete(`/api/users/${userId}/block`);
  },

  // Report user
  reportUser: async (userId: string, reason: string): Promise<void> => {
    await api.post(`/api/users/${userId}/report`, { reason });
  },
};
