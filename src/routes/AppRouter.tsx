import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { UserDashboardPage } from "../pages/UserDashboardPage";
import { ProspectsPage } from "../pages/ProspectsPage";
import { ClientsPage } from "../pages/ClientsPage";
import { CarriersPage } from "../pages/CarriersPage";
import { OperationsPage } from "../pages/OperationsPage";
import { UsersPage } from "../pages/UsersPage";
import { SignInPage } from "../pages/SignInPage";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { ForgotPassword } from "../pages/ForgotPassword";
import { ResetPassword } from "../pages/ResetPassword";

export const AppRouter = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: <SignInPage />,
        },
        {
          path: "sign-in",
          element: <SignInPage />,
        },
        {
          path: "forgot-password",
          element: <ForgotPassword />,
        },
        {
          path: "reset-password",
          element: <ResetPassword />,
        },
        {
          path: "dashboard/",
          element: <UserDashboardPage />,
          children: [
            {
              index: true,
              element: <Navigate replace to="/dashboard/prospectos" />,
            },
            {
              path: "prospectos",
              element: (
                <ProtectedRoute
                  allowedRoles={["Administrador", "Director", "Administrativo"]}
                >
                  <ProspectsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "clientes",
              element: (
                <ProtectedRoute
                  allowedRoles={["Administrador", "Director", "Administrativo"]}
                >
                  <ClientsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "portadores",
              element: (
                <ProtectedRoute allowedRoles={["Administrador", "Director"]}>
                  <CarriersPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "operaciones",
              element: (
                <ProtectedRoute allowedRoles={["Administrador", "Director"]}>
                  <OperationsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "usuarios",
              element: (
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <UsersPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "unauthorized",
              element: <UnauthorizedPage />,
            },
          ],
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
};
