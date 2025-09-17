import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Automatically attach token to all requests
axiosInstance.interceptors.request.use((config) => {
  const token = cookies.get('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
  

});

export default axiosInstance;
