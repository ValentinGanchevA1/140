import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse, ApiError } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_ENDPOINTS.BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        const apiError: ApiError = {
          message: error.message || 'An error occurred',
          code: error.code,
          details: error.response?.data,
        };

        // Handle specific error cases
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }

        return Promise.reject(apiError);
      }
    );
  }

  private getAuthToken(): string | null {
    // Implement token retrieval logic
    return null;
  }

  private handleUnauthorized(): void {
    // Handle unauthorized access (logout, redirect, etc.)
    console.log('Unauthorized access detected');
  }

  // Generic HTTP methods
  async get<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url);
    return response.data;
  }

  async post<T, D = any>(url: string, data?: D): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(url, data);
    return response.data;
  }

  async put<T, D = any>(url: string, data?: D): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.api.delete<ApiResponse<T>>(url);
    return response.data;
  }

  // Update auth token
  setAuthToken(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }
}

export const apiService = new ApiService();