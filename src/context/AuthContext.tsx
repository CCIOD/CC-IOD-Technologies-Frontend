import { createContext, ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginUserAPI,
  loginUserWithPinAPI,
  webauthnLoginAPI,
} from "../services/auth.service";
import { alertTimer, sessionExpired } from "../utils/alerts";
import { jwtDecode } from "jwt-decode";
import { ApiResponse } from "../interfaces/interfaces";
import { PinForm, UserForm, UserProfile } from "../interfaces/auth.interfaces";

type UserContextType = {
  user: UserProfile | null;
  token: string | null;
  loginUser: (user: UserForm) => void;
  loginPin: (form: PinForm) => void;
  loginWebauthn: (email: string) => Promise<void>;
  logout: () => void;
  isLoggedIn: () => boolean;
  updateUser: (user: UserProfile) => void;
  formError: string | null;
  isLoading: boolean;
};
// Contexto de autenticación
export const AuthContext = createContext<UserContextType>(
  {} as UserContextType
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  // Estados para mantener información de la autenticación del usuario
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateUser = (user: UserProfile) => {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const revokeAccess = (alert: boolean = true) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
    if (alert) alertTimer("Cerrando la sesión.", "success");
  };

  useEffect(() => {
    // Detectar si hay un usuario. Si no hay que revocar los permisos
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (user && token) {
      setUser(JSON.parse(user));
      setToken(token);
    } else {
      revokeAccess(false);
    }
    setIsReady(true);
  }, []);
  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode<{ exp: number }>(token as string);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        logout(false);
        return;
      }
      const timeUntilExpire = (decodedToken.exp - currentTime) * 1000;
      const timer = setTimeout(() => {
        sessionExpired(
          "La sesión ha caducado",
          "Inicia sesión para tener acceso."
        ).then(() => {
          logout();
        });
      }, timeUntilExpire);
      return () => clearTimeout(timer);
    }
  }, [token, navigate]);

  /**
   * Cierre por inactividad: si el usuario no interactúa con la app durante
   * IDLE_LIMIT_MS, se cierra su sesión. Esto va *encima* del TTL del JWT —
   * el primero que ocurra cierra la sesión.
   */
  useEffect(() => {
    if (!token) return;
    const IDLE_LIMIT_MS = 60 * 60 * 1000; // 1 hora
    let timer: number;

    const triggerLogout = () => {
      sessionExpired(
        "Sesión cerrada por inactividad",
        "No detectamos actividad en la última hora. Inicia sesión de nuevo para continuar."
      ).then(() => logout());
    };

    const resetTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(triggerLogout, IDLE_LIMIT_MS);
    };

    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((e) =>
      window.addEventListener(e, resetTimer, { passive: true })
    );
    resetTimer();

    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  const persistSession = (token: string, profile: UserProfile) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(profile));
    setToken(token);
    setUser(profile);
  };

  // Inicio de sesión
  const loginUser = async (user: UserForm) => {
    setIsLoading(true);
    try {
      const res = await loginUserAPI(user);
      persistSession(res.token as string, res.data as UserProfile);
      alertTimer("Sesión iniciada", "success");
      navigate("/panel/");
      setFormError("");
    } catch (error) {
      alertTimer("Ocurrió un error al iniciar sesión.", "error");
      const err = error as ApiResponse;
      setFormError(err.message);
    }
    setIsLoading(false);
  };

  const loginPin = async (form: PinForm) => {
    setIsLoading(true);
    try {
      const res = await loginUserWithPinAPI(form);
      persistSession(res.token as string, res.data as UserProfile);
      alertTimer("Sesión iniciada por PIN", "success");
      navigate("/panel/");
      setFormError("");
    } catch (error) {
      const err = error as ApiResponse;
      setFormError(err.message);
    }
    setIsLoading(false);
  };

  const loginWebauthn = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await webauthnLoginAPI(email);
      persistSession(res.token as string, res.data as UserProfile);
      alertTimer("Sesión iniciada con huella", "success");
      navigate("/panel/");
      setFormError("");
    } catch (error) {
      const err = error as ApiResponse;
      setFormError(err?.message || "No se pudo autenticar con huella.");
    }
    setIsLoading(false);
  };
  const isLoggedIn = () => !!user;
  const logout = (alert: boolean = true) => {
    revokeAccess(alert);
    navigate("/");
  };
  const values: UserContextType = {
    user,
    token,
    loginUser,
    loginPin,
    loginWebauthn,
    logout,
    isLoggedIn,
    formError,
    updateUser,
    isLoading,
  };
  return (
    <AuthContext.Provider value={values}>
      {isReady ? children : null}
      {/* {children} */}
    </AuthContext.Provider>
  );
};
