import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { UserRole } from "../interfaces/auth.interfaces";

type Props = { children: React.ReactNode; allowedRoles: UserRole[] };

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const location = useLocation();
  const { isLoggedIn, user } = useContext(AuthContext);

  if (!isLoggedIn()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  } else {
    if (
      !user ||
      !user.role ||
      (allowedRoles && !allowedRoles.includes(user.role))
    ) {
      return <Navigate to="/panel/unauthorized" replace />;
    }
    return <>{children}</>;
  }
};

export default ProtectedRoute;
