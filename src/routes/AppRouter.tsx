import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { UserDashboardPage } from '../pages/UserDashboardPage'
import { ProspectsPage } from '../pages/ProspectsPage'
import { ClientsPage } from '../pages/ClientsPage'
import { CarriersPage } from '../pages/CarriersPage'
import { OperationsPage } from '../pages/OperationsPage'
import { UsersPage } from '../pages/UsersPage'
import { SignInPage } from '../pages/SignInPage'
import { RecoverPassword } from '../pages/RecoverPassword'

export const AppRouter = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<UserDashboardPage />}>
          <Route index element={<ProspectsPage />}></Route>
          <Route path='prospectos' element={<ProspectsPage />}></Route>
          <Route path='clientes' element={<ClientsPage />}></Route>
          <Route path='portadores' element={<CarriersPage />}></Route>
          <Route path='operaciones' element={<OperationsPage />}></Route>
          <Route path='usuarios' element={<UsersPage />}></Route>
        </Route>
        <Route path="sign-in" element={<SignInPage />}></Route>
        <Route path='recover-password' element={<RecoverPassword />}></Route>
      </>
    )
  )
  return <RouterProvider router={router} />;
}
