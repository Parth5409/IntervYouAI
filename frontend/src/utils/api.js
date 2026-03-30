import axios from 'axios';

// Create an Axios instance
export const getGatewayURL = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  // Strip common suffixes if they exist to get the root gateway URL
  return url.replace(/\/api\/core\/v1\/?$/, '').replace(/\/api\/engine\/?$/, '').replace(/\/$/, '');
};

export const getAiEngineDirectURL = () => {
  // In dev, it's usually on port 8000. In prod, this would be a specific subdomain.
  return 'http://localhost:8000';
};

const getBaseURL = () => {
  return `${getGatewayURL()}/api/core/v1/`;
};

const axiosInstance = axios.create({
  // Pointing to the API Gateway with Core V1 prefix by default
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instance for AI Engine (different prefix)
export const engineApi = axios.create({
  baseURL: `${getGatewayURL()}/api/engine/`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for engineApi
engineApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Request interceptor for default instance
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors (like 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      // Optional: Redirect logic here or let the UI handle it via useAuth
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;