// axiosInstance.js
import axios from 'axios';

// In production (Netlify), VITE_API_BASE_URL points to the live backend server.
// In local dev, fall back to '/api' which Vite proxies to localhost:5000.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isProduction = apiBaseUrl && !apiBaseUrl.includes('localhost');
const baseURL = isProduction ? `${apiBaseUrl}/api` : '/api';

const instance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials removed — auth uses JWT Bearer tokens in headers, not cookies
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