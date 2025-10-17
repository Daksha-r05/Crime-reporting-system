import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', email),
  resetPassword: (resetData) => api.post('/auth/reset-password', resetData),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  getMyReports: (params) => api.get('/users/my-reports', { params }),
  getAssignedCases: (params) => api.get('/users/assigned-cases', { params }),
  getAvailableOfficers: () => api.get('/users/available-officers'),
  updateFCMToken: (fcmToken) => api.post('/users/fcm-token', { fcmToken }),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationRead: (id) => api.put(`/users/notifications/${id}/read`),
};

// Crime API calls
export const crimeAPI = {
  reportCrime: (crimeData) => api.post('/crimes', crimeData),
  getCrimes: (params) => api.get('/crimes', { params }),
  getCrime: (id) => api.get(`/crimes/${id}`),
  updateStatus: (id, statusData) => api.put(`/crimes/${id}/status`, statusData),
  assignOfficer: (id, officerData) => api.put(`/crimes/${id}/assign`, officerData),
  getFIRRequests: (params) => api.get('/crimes/fir/requests', { params }),
  updateFIR: (id, data) => api.put(`/crimes/${id}/fir`, data),
  getHeatmapData: (params) => api.get('/crimes/heatmap/data', { params }),
  getStats: (params) => api.get('/crimes/stats/summary', { params }),
};

// Admin API calls
export const adminAPI = {
  getDashboard: (params) => api.get('/admin/dashboard', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  verifyUser: (id, verificationData) => api.put(`/admin/users/${id}/verify`, verificationData),
  updateUserStatus: (id, statusData) => api.put(`/admin/users/${id}/status`, statusData),
  updateUserRole: (id, roleData) => api.put(`/admin/users/${id}/role`, roleData),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getVerificationNeeded: (params) => api.get('/admin/crimes/verification-needed', { params }),
  verifyCrime: (id, verificationData) => api.put(`/admin/crimes/${id}/verify`, verificationData),
};

// File upload API calls
export const uploadAPI = {
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
};

// Utility functions
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'An error occurred';
    const status = error.response.status;
    
    switch (status) {
      case 400:
        return { type: 'error', message: `Bad Request: ${message}` };
      case 401:
        return { type: 'error', message: 'Unauthorized. Please log in again.' };
      case 403:
        return { type: 'error', message: 'Access denied. Insufficient permissions.' };
      case 404:
        return { type: 'error', message: 'Resource not found.' };
      case 422:
        return { type: 'error', message: `Validation Error: ${message}` };
      case 500:
        return { type: 'error', message: 'Server error. Please try again later.' };
      default:
        return { type: 'error', message: `Error ${status}: ${message}` };
    }
  } else if (error.request) {
    // Request was made but no response received
    return { type: 'error', message: 'Network error. Please check your connection.' };
  } else {
    // Something else happened
    return { type: 'error', message: 'An unexpected error occurred.' };
  }
};

export default api;
