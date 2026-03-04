import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.id) config.headers['x-user-id'] = user.id;
  return config;
});

export default api;
