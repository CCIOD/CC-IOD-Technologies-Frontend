import { useContext, useEffect, useState } from "react";
import { Sidebar } from "../components/sidebarComponents/Sidebar";
import { HeaderComponent } from "../components/header/HeaderComponent";
import { Outlet } from "react-router-dom";
import { SidebarMobile } from "../components/sidebarComponents/SidebarMobile";
import { AppContext } from "../context/AppContext";
import { Modal } from "../components/generic/Modal";
import { ChangePasswordForm } from "../components/modalForms/ChangePasswordForm";
import { IPasswordForm } from "../interfaces/users.interface";
import { updateData } from "../services/api.service";
import { alertTimer } from "../utils/alerts";
import { ApiResponse } from "../interfaces/interfaces";
import { ErrMessage } from "../components/generic/ErrMessage";

export const UserDashboardPage = () => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const { sideMenuIsExpand, toggleSideMenu, modalPass } =
    useContext(AppContext);
  const { isOpenModalPass, toggleModalPass, userID } = modalPass;
  useEffect(() => {
    const handleResize = () => {
      toggleSideMenu(window.innerWidth >= 1280 ? true : false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChangePass = async (data: IPasswordForm) => {
    try {
      const id: number = userID as number;
      const res = await updateData("users/change-password", id, data);
      if (res.success) {
        toggleModalPass(false);
        alertTimer(`La contraseña se ha actualizado`, "success");
      }
    } catch (error) {
      console.log(error);
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
    }
  };
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
        />
        <ErrMessage message={errorMessage} />
      </Modal>
    </>
  );
};
