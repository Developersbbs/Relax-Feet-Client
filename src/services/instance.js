// axiosInstance.js
import axios from 'axios';

// Use /api as baseURL to let Vite's proxy handle the target
const baseURL = '/api';

const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to include auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized mean token is missing or expired
    if (error.response?.status === 401) {
      // Clear auth state from storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login ONLY IF we are not already on an auth page
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;