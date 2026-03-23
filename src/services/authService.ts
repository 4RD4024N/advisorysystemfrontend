import api from './api';
import { logger } from '../utils/logger';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresAt?: string;
}

export interface UserInfo {
  email: string;
  name: string;
  role: string | string[];
  sub: string;
}

export interface DecodedToken {
  email: string;
  name?: string;
  unique_name?: string;
  given_name?: string;
  role?: string | string[];
  Role?: string | string[];
  roles?: string | string[];
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
  sub?: string;
  nameid?: string;
  exp?: number;
}

/**
 * Authentication Service
 */
const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Login user and get JWT token
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * Logout user
   */
  logout: (): void => {
    localStorage.removeItem('token');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get current token
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  /**
   * Decode JWT token and get user info
   */
  getUserInfo: (): UserInfo | null => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // JWT structure: header.payload.signature
      const payload = token.split('.')[1];
      const decoded: DecodedToken = JSON.parse(atob(payload));

      logger.debug('Decoding token claims', { claims: Object.keys(decoded) });

      // Check if token is expired
      if (decoded.exp) {
        const expirationDate = new Date(decoded.exp * 1000);
        const now = new Date();
        const isExpired = now > expirationDate;

        if (isExpired) {
          logger.warn('Token has expired', { expirationDate, currentTime: now });
        } else {
          logger.debug('Token is valid', { expiresAt: expirationDate });
        }

        if (isExpired) {
          return null;
        }
      }

      // Try different role claim formats
      const role = decoded.role
        || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        || decoded.Role
        || decoded.roles
        || decoded['role'];

      logger.debug('User role detected', { role });

      return {
        email: decoded.email,
        name: decoded.name || decoded.unique_name || decoded.given_name || '',
        role: role || '',
        sub: decoded.sub || decoded.nameid || ''
      };
    } catch (error) {
      logger.error('Failed to decode token', error as Error);
      return null;
    }
  },

  /**
   * Check if user has specific role
   */
  hasRole: (roles: string | string[]): boolean => {
    const userInfo = authService.getUserInfo();
    if (!userInfo || !userInfo.role) return false;

    const userRoles = Array.isArray(userInfo.role) ? userInfo.role : [userInfo.role];
    const requiredRoles = Array.isArray(roles) ? roles : [roles];

    return requiredRoles.some(role => userRoles.includes(role));
  },

  /**
   * Check if user is Admin
   */
  isAdmin: (): boolean => {
    return authService.hasRole('Admin');
  },

  /**
   * Check if user is Advisor
   */
  isAdvisor: (): boolean => {
    return authService.hasRole('Advisor');
  },

  /**
   * Check if user is Student
   */
  isStudent: (): boolean => {
    return authService.hasRole('Student');
  },

  /**
   * Refresh JWT token
   * Get a new token before the current one expires
   */
  refresh: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh');
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      if (response.data.expiresAt) {
        localStorage.setItem('tokenExpiry', response.data.expiresAt);
      }
    }
    return response.data;
  },

  /**
   * Validate JWT token
   * Check if current token is valid and get user info
   */
  validate: async (): Promise<UserInfo> => {
    const response = await api.get<UserInfo>('/auth/validate');
    return response.data;
  },
};

export default authService;
