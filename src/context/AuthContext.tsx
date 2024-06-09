import { createContext, ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUserAPI } from "../services/auth.service";
import { alertTimer, sessionExpired } from "../utils/alerts";
import { jwtDecode } from "jwt-decode";
import { ApiResponse } from "../interfaces/interfaces";
import { UserForm, UserProfile } from "../interfaces/auth.interfaces";

type UserContextType = {
  user: UserProfile | null;
  token: string | null;
  loginUser: (user: UserForm) => void;
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

  // Método para revocar el acceso
  const revokeAccess = (alert: boolean = true) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
    if (alert) alertTimer("Cerrando la sesión.", "success");
    // navigate("/");
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
  // Inicio de sesión
  const loginUser = async (user: UserForm) => {
    setIsLoading(true);
    try {
      const res = await loginUserAPI(user);
      localStorage.setItem("token", res.token as string);
      localStorage.setItem("user", JSON.stringify(res.data));
      setToken(res.token!);
      setUser(res.data!);
      alertTimer("Sesión iniciada", "success");
      navigate("/dashboard/");
      setFormError("");
    } catch (error) {
      alertTimer("Ocurrió un error al iniciar sesión.", "error");
      const err = error as ApiResponse;
      setFormError(err.message);
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
