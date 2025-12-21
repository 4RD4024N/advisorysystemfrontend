import axios from 'axios';

// API Base URL - can be configured for different environments
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:44375/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Request to:', config.url);
      console.log('📝 Token attached:', token.substring(0, 50) + '...');
    } else {
      console.warn('⚠️ No token found for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response from:', response.config.url, '- Status:', response.status);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.error('❌ API Error:', {
      url,
      status,
      message: error.message,
      data: error.response?.data
    });
    
    if (status === 401) {
      console.warn('🔒 Unauthorized - Redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (status === 403) {
      console.error('🚫 Forbidden - Access denied. Check your role and token.');
      console.error('📍 Failed URL:', url);
      console.error('📦 Response data:', error.response?.data);
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = token.split('.')[1];
          const decoded = JSON.parse(atob(payload));
          console.log('📋 Current token payload:', decoded);
          console.log('🔑 All claim keys:', Object.keys(decoded));
          
          // Check role specifically
          const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          console.log('👤 Role Claim Value:', roleClaim);
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }
      
      console.log('💡 SOLUTION: Backend needs this configuration:');
      console.log(`
        options.TokenValidationParameters = new TokenValidationParameters
        {
            RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        };
      `);
    }
    
    return Promise.reject(error);
  }
);

export default api;
