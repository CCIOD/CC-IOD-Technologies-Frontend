import { useContext } from "react";
import { Sidebar } from "../components/sidebarComponents/Sidebar";
import { HeaderComponent } from "../components/header/HeaderComponent";
import { Outlet } from "react-router-dom";
import { SidebarMobile } from "../components/sidebarComponents/SidebarMobile";
import { AppContext } from "../context/AppContext";
import { Modal } from "../components/generic/Modal";
import { ChangePasswordForm } from "../components/modalForms/ChangePasswordForm";
import { AdminForm } from "../components/modalForms/AdminForm";
import { AuthContext } from "../context/AuthContext";

export const UserDashboardPage = () => {
  const { sideMenuIsExpand, modalPass, modalEdit, isLoading } =
    useContext(AppContext);
  const { user } = useContext(AuthContext);
  const { isOpenModalPass, toggleModalPass, userID } = modalPass;
  const {
    isOpenModalEdit,
    toggleModalEdit,
    handleChangePass,
    handleUpdateAdmin,
  } = modalEdit;

  const contentExp = sideMenuIsExpand ? "md:ml-52" : "ml-0 md:ml-14";
  const mainExp = sideMenuIsExpand
    ? "md:w-[calc(100vw-13.5rem)]"
    : "md:w-[calc(100vw-4.2rem)]";
  return (
    <>
      <div className="relative min-h-screen md:flex">
        <Sidebar />
        <SidebarMobile />
        <div
          className={`app-bg2 flex-1 min-h-screen mx-0 transition-all duration-300 ease-in-out overflow-x-hidden ${contentExp}`}
        >
          <HeaderComponent />
          <main className={`w-full ${mainExp}`}>
            <div className="app-text px-1 md:px-6 py-6 min-h-screen">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <Modal
        title={`Cambiar contraseña ${userID === 1 ? "del Administrador" : ""}`}
        isOpen={isOpenModalPass}
        toggleModal={toggleModalPass}
        size="xs"
        backdrop
      >
        <ChangePasswordForm
          toggleModal={toggleModalPass}
          handleSubmit={(data) => handleChangePass(data)}
          isLoading={isLoading}
        />
      </Modal>
      <Modal
        title="Editar información del Administrador"
        isOpen={isOpenModalEdit}
        toggleModal={toggleModalEdit}
        size="sm"
        backdrop
      >
        <AdminForm
          toggleModal={toggleModalEdit}
          handleSubmit={(data) => handleUpdateAdmin(data)}
          adminData={user}
          isLoading={isLoading}
        />
      </Modal>
    </>
  );
};
