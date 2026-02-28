import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { queryClient } from '../main';

export const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const { token, isExpired, logout } = useAuthStore.getState();

  if (token) {
    if (isExpired()) {
      logout();
      return Promise.reject(new Error('Token expired'));
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      logoutAndRedirect();
    }
    return Promise.reject(error);
  },
);

function logoutAndRedirect() {
  const { logout } = useAuthStore.getState();
  logout();

  queryClient?.clear();
}
