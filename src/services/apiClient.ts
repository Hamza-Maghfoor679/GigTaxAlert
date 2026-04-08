import axios, { AxiosError } from 'axios';

import { clearAuthToken, getAuthToken } from '@/services/authToken';

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export const apiClient = axios.create({
  // Configure with your backend base URL when available.
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearAuthToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
