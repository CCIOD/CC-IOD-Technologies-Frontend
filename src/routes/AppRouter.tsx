import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { UserDashboardPage } from "../pages/UserDashboardPage";
import { ProspectsPage } from "../pages/ProspectsPage";
import { ClientsPage } from "../pages/ClientsPage";
import { AdministrationPage } from "../pages/AdministrationPage";
import { CarriersPage } from "../pages/CarriersPage";
import { OperationsPage } from "../pages/OperationsPage";
import { UsersPage } from "../pages/UsersPage";
import { SignInPage } from "../pages/SignInPage";
import { LoginPinPage } from "../pages/LoginPinPage";
import { AccessControlPage } from "../pages/AccessControlPage";
import { AlertsPage } from "../pages/AlertsPage";
import { ReportsPage } from "../pages/ReportsPage";
import { BitacoraPage } from "../pages/BitacoraPage";
import { AuditPage } from "../pages/AuditPage";
import { ProtocolsPage } from "../pages/ProtocolsPage";
import { SeguimientoPage } from "../pages/SeguimientoPage";
import { SecurityProfilePage } from "../pages/SecurityProfilePage";
import { DocumentsPage } from "../pages/DocumentsPage";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";
import { ForgotPassword } from "../pages/ForgotPassword";
import { ResetPassword } from "../pages/ResetPassword";
import { NotFoundPage } from "../pages/NotFoundPage";

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
          path: "login-pin",
          element: <LoginPinPage />,
        },
        {
          path: "forgot-password",
          element: <ForgotPassword />,
        },
        {
          path: "reset-password/:token",
          element: <ResetPassword />,
        },
        {
          path: "*",
          element: <NotFoundPage />,
        },
        {
          path: "panel/",
          element: <UserDashboardPage />,
          children: [
            {
              index: true,
              element: <Navigate replace to="/panel/prospectos" />,
            },
            {
              path: "prospectos",
              element: (
                <ProtectedRoute
                  allowedRoles={["Administrador", "Director", "Administrativo", "Seguimiento"]}
                >
                  <ProspectsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "clientes",
              element: (
                <ProtectedRoute
                  allowedRoles={["Administrador", "Director", "Administrativo", "Seguimiento"]}
                >
                  <ClientsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "administracion",
              element: (
                <ProtectedRoute
                  allowedRoles={["Administrador", "Director", "Administrativo", "Seguimiento"]}
                >
                  <AdministrationPage />
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
                <ProtectedRoute allowedRoles={["Administrador", "Director"]}>
                  <UsersPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "control-acceso",
              element: (
                <ProtectedRoute allowedRoles={["Administrador", "Director"]}>
                  <AccessControlPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "alertas",
              element: (
                <ProtectedRoute
                  allowedRoles={["Administrador", "Director", "Monitorista"]}
                >
                  <AlertsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "bitacora",
              element: (
                <ProtectedRoute
                  allowedRoles={["Administrador", "Director", "Monitorista"]}
                >
                  <BitacoraPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "reportes-semanales",
              element: (
                <ProtectedRoute
                  allowedRoles={["Administrador", "Director", "Monitorista"]}
                >
                  <ReportsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "auditoria",
              element: (
                <ProtectedRoute allowedRoles={["Administrador", "Director"]}>
                  <AuditPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "protocolos",
              element: (
                <ProtectedRoute allowedRoles={["Administrador", "Director"]}>
                  <ProtocolsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "seguimiento",
              element: (
                <ProtectedRoute
                  allowedRoles={["Administrador", "Director", "Monitorista"]}
                >
                  <SeguimientoPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "seguridad",
              element: (
                <ProtectedRoute
                  allowedRoles={[
                    "Administrador",
                    "Director",
                    "Administrativo",
                    "Seguimiento",
                    "Contador",
                    "Monitorista",
                  ]}
                >
                  <SecurityProfilePage />
                </ProtectedRoute>
              ),
            },
            {
              path: "documentos",
              element: (
                <ProtectedRoute allowedRoles={["Administrador"]}>
                  <DocumentsPage />
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
