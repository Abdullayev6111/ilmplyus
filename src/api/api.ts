import axios from 'axios';
import useAuthStore from '../store/useAuthStore';
import { queryClient } from '../main';
import { notifications } from '@mantine/notifications';

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
  (res) => {
    const method = res.config.method?.toUpperCase();
    if (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method || '')) {
      if (res.config.url?.includes('/login') && res.data?.user?.name) {
        notifications.show({
          id: 'global-success-notification',
          message: `Muaffaqiyatli, ${res.data.user.name}`,
          color: 'green',
        });
      } else {
        notifications.show({
          id: 'global-success-notification',
          message: 'Muaffaqiyatli',
          color: 'green',
        });
      }
    }
    return res;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    notifications.show({
      id: 'global-error-notification',
      message: errorMessage ? `Xatolik: ${errorMessage}` : 'Xatolik',
      color: 'red',
    });

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
