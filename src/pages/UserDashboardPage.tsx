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

  return (
    <>
      <div className="relative min-h-screen sm:flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="block md:hidden">
          <SidebarMobile />
        </div>
        <div
          className={`app-bg2 flex-1 min-h-screen mx-0 transition-all duration-300 ease-in-out overflow-x-hidden ${
            sideMenuIsExpand ? "sm:ml-60" : "sm:ml-0 md:ml-20"
          }`}
        >
          <HeaderComponent />
          <div
            className={`w-full ${
              sideMenuIsExpand
                ? "md:w-[calc(100vw-16.2rem)]"
                : "md:w-[calc(100vw-5.6rem)]"
            }`}
          >
            <div className="app-text px-1 md:px-6 py-6 min-h-screen">
              <Outlet />
            </div>
          </div>
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
