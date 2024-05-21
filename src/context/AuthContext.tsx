import { createContext, ReactNode, useEffect, useState } from "react";
import { UserForm, UserProfile } from "../interfaces/auth.interface";
import { useNavigate } from "react-router-dom";
import { loginUserAPI } from "../services/authService";
import { alertTimer, sessionExpired } from "../utils/alerts";
import { jwtDecode } from "jwt-decode";
import { ApiResponse } from "../interfaces/interfaces";

type UserContextType = {
  user: UserProfile | null;
  token: string | null;
  loginUser: (user: UserForm) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
  formError: string | null;
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

  // Método para revocar el acceso
  const revokeAccess = (alert: boolean = true) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken("");
    if (alert) alertTimer("Cerrando la sesión.", "success");
    navigate("/");
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
    // Verificar si el token de autorización ha expirado
    if (token) {
      const decodedToken = jwtDecode<{ exp: number }>(token as string);
      const currentTime = Date.now() / 1000;
      const timeUntilExpire = (decodedToken.exp - currentTime) * 1000;
      const timer = setTimeout(() => {
        sessionExpired(
          "La sesión ha caducado.",
          "Inicia sesión para tener acceso."
        ).then(() => revokeAccess());
      }, timeUntilExpire);
      return () => clearTimeout(timer);
    }
  }, [token]);
  // Inicio de sesión
  const loginUser = async (user: UserForm) => {
    try {
      const res = await loginUserAPI(user);
      localStorage.setItem("token", res.token as string);
      localStorage.setItem("user", JSON.stringify(res.data));
      setToken(res.token!);
      setUser(res.data!);
      alertTimer("Sesión iniciada", "success");
      navigate("/dashboard/");
    } catch (error) {
      alertTimer("Ocurrió un error al iniciar sesión.", "error");
      const err = error as ApiResponse;
      setFormError(err.message);
    }
  };
  const isLoggedIn = () => !!user;
  const logout = () => revokeAccess();
  const values: UserContextType = {
    user,
    token,
    loginUser,
    logout,
    isLoggedIn,
    formError,
  };
  return (
    <AuthContext.Provider value={values}>
      {isReady ? children : null}
    </AuthContext.Provider>
  );
};
