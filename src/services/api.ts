import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { logger } from '../utils/logger';

// API Base URL - can be configured for different environments
const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'https://localhost:44375/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json; charset=utf-8',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.debug(`Request to: ${config.url}`, { hasToken: true });
    } else {
      logger.warn(`No token found for request: ${config.url}`);
    }
    return config;
  },
  (error: AxiosError) => {
    logger.error('Request interceptor error', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.api(response.config.method?.toUpperCase() || 'GET', response.config.url || '', response.status);
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    logger.api(
      error.config?.method?.toUpperCase() || 'GET',
      url || '',
      status,
      error
    );
    
    if (status === 401) {
      logger.warn('Unauthorized - Redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (status === 403) {
      logger.error('Forbidden - Access denied', error, {
        url,
        responseData: error.response?.data,
      });
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = token.split('.')[1];
          const decoded = JSON.parse(atob(payload));
          const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          logger.debug('Token payload', { role: roleClaim, claims: Object.keys(decoded) });
        } catch (e) {
          logger.error('Failed to decode token', e as Error);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
