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
import { RecoverPassword } from "../pages/RecoverPassword";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";

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
          path: "recover-password",
          element: <RecoverPassword />,
        },
        {
          path: "dashboard/",
          element: (
            <ProtectedRoute>
              <UserDashboardPage />
            </ProtectedRoute>
          ),
          children: [
            {
              index: true,
              element: <Navigate replace to="/dashboard/prospectos" />,
            },
            {
              path: "prospectos",
              element: <ProspectsPage />,
            },
            {
              path: "clientes",
              element: <ClientsPage />,
            },
            {
              path: "portadores",
              element: <CarriersPage />,
            },
            {
              path: "operaciones",
              element: <OperationsPage />,
            },
            {
              path: "usuarios",
              element: <UsersPage />,
            },
          ],
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
};
