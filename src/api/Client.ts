import axios from 'axios';
import { sessionExpired } from '../utils/alerts';
// console.log(process);

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // baseURL: "https://cciod-tech-api-dev.azurewebsites.net/",
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Limpiar la sesión del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      sessionExpired('La sesión ha expirado.', 'Al parecer su sesión ha caducado o no tiene acceso para realizar esta acción.').then(() => {
        // Redirigir a la página de login en lugar de recargar
        window.location.href = '/';
      });
    }
    return Promise.reject(error);
  },
);

export default client;
