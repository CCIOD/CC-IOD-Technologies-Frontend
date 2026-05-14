import axios from 'axios';
import { sessionExpired } from '../utils/alerts';
import { getOrCreateDeviceToken } from '../utils/deviceToken';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    // X-Device-Id: el backend lo usa como segunda vía de autorización en el
    // modelo OR para el rol Monitorista (ver enforceLocationRestriction).
    config.headers['X-Device-Id'] = getOrCreateDeviceToken();
    return config;
  },
  (error) => Promise.reject(error),
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar la sesión del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      sessionExpired('La sesión ha expirado.', 'Al parecer su sesión ha caducado.').then(() => {
        // Redirigir a la página de login en lugar de recargar
        window.location.href = '/';
      });
    } else if (error.response?.status === 403) {
      const message = (error.response.data as any)?.message || '';
      // 403 desde el login = restricción de ubicación. NO redirige a login para
      // que el usuario vea la pantalla bloqueante en su contexto actual.
      if (/ubicación no autorizada|Dispositivo no autorizado/i.test(message)) {
        // Dejar que el componente que disparó la request maneje el error.
      }
    }
    return Promise.reject(error);
  },
);

export default client;
