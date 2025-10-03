import axios from 'axios';
import { User, UserRole } from './types/user';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set the auth token for all subsequent requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Wrapper function to handle API errors gracefully
const handleRequest = async <T>(request: Promise<{ data: T }>): Promise<T> => {
  try {
    const { data } = await request;
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Throw an error with the message from the backend
      throw new Error(error.response.data.message || 'An unexpected error occurred');
    }
    // Throw a generic error for network issues or other problems
    throw new Error('Network error or server is unreachable');
  }
};

// Normalize user objects coming from server (which may use _id instead of id)
const normalizeUser = (raw: any): User => {
  return {
    id: raw.id || raw._id,
    username: raw.username,
    fullName: raw.fullName,
    role: raw.role,
    tracking: raw.tracking?.map((t: any) => (typeof t === 'string' ? t : t?.toString?.() ?? String(t))) || undefined,
  };
};

// --- API Definitions ---

export const api = {
  // Auth
  register: (payload: { username: string; password: string; fullName: string; role: UserRole }) => 
    handleRequest(apiClient.post<{ token: string; user: User }>('/auth/register', payload)),
  
  login: (payload: { username: string; password: string }) => 
    handleRequest(apiClient.post<{ token: string; user: User }>('/auth/login', payload)),
  
  getMe: () => handleRequest(apiClient.get<User>('/auth/me')).then(normalizeUser),

  // Users
  getTrackableUsers: () => handleRequest<any[]>('/users/trackable' as any as Promise<{ data: any[] }>).then((users) => users.map(normalizeUser)),

  updateTrackingList: (payload: { trackableUserId: string; action: 'add' | 'remove' }) =>
    handleRequest<any>(apiClient.put('/users/profile/tracking', payload)).then(normalizeUser),

  // Users (Admin)
  listUsers: () => handleRequest<any[]>(apiClient.get('/users')).then((users) => users.map(normalizeUser)),

  // Locations
  updateLocation: (payload: { userId: string; latitude: number; longitude: number }) =>
    handleRequest(apiClient.post('/locations', payload)),

  getLatestLocation: (userId: string) =>
    handleRequest(apiClient.get(`/locations/${userId}`)),
};


