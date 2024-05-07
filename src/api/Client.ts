import axios from "axios";
import { sessionExpired } from "../utils/alerts";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401 || error.response.status === 403) {
      sessionExpired(
        "La sesión ha expirado.",
        "Al parecer su sesión ha caducado o no tiene acceso para realizar esta acción."
      ).then(() => {
        window.location.reload();
      });
    }
    return Promise.reject(error);
  }
);

export default client;
