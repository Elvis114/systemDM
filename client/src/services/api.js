import axios from 'axios';

// Use environment variable for API URL, fallback to production API
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://systemdm.onrender.com' });

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
