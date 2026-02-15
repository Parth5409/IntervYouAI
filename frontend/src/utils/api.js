import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  // Pointing to the API Gateway (Spring Boot default port is 8080)
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/core/v1',
  withCredentials: true, // For handling cookies if used, but we'll primarily use headers for JWT
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to every request
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