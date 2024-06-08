import { createContext, ReactNode, useContext, useState } from "react";
import { updateData } from "../services/api.service";
import { INameForm, IPasswordForm } from "../interfaces/users.interface";
import { alertTimer } from "../utils/alerts";
import { AuthContext } from "./AuthContext";
import { UserProfile } from "../interfaces/auth.interfaces";
const sideMenu: string | null = localStorage.getItem("sideMenu");
const current: boolean = sideMenu === "yes" ? true : false;

type AppContextType = {
  sidebarMobile: boolean;
  toggleSidebarMobile: () => void;
  toggleSideMenu: (value: boolean) => void;
  sideMenuIsExpand: boolean;
  isLoading: boolean;
  modalPass: {
    isOpenModalPass: boolean;
    toggleModalPass: (value: boolean, id?: number | null) => void;
    userID: number | null;
  };
  modalEdit: {
    isOpenModalEdit: boolean;
    toggleModalEdit: (value: boolean) => void;
    handleChangePass: (data: IPasswordForm) => void;
    handleUpdateAdmin: (data: INameForm) => void;
  };
};
export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { updateUser, user } = useContext(AuthContext);

  const [sidebarMobile, setSidebarMobile] = useState<boolean>(false);
  const [sideMenuIsExpand, setSideMenuIsExpand] = useState<boolean>(current);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenModalEdit, setIsOpenModalEdit] = useState<boolean>(false);
  const [isOpenModalPass, setIsOpenModalPass] = useState<boolean>(false);
  const [userID, setUserID] = useState<number | null>(null);

  const toggleSidebarMobile = () => {
    setSidebarMobile(!sidebarMobile);
  };
  const toggleSideMenu = (state: boolean) => {
    localStorage.setItem("sideMenu", state ? "yes" : "no");
    setSideMenuIsExpand(state);
  };

  const toggleModalPass = (value: boolean, id: number | null = null) => {
    setIsOpenModalPass(value);
    setUserID(id);
  };
  const toggleModalEdit = (value: boolean) => setIsOpenModalEdit(value);

  const handleChangePass = async (data: IPasswordForm) => {
    setIsLoading(true);
    try {
      const id: number = userID as number;
      const res = await updateData("users/change-password", id, data);
      if (res.success) {
        toggleModalPass(false);
        alertTimer(`La contraseña se ha actualizado`, "success");
      }
    } catch (error) {
      console.log(error);
      alertTimer(`Ha ocurrido un error.`, "error");
    }
    setIsLoading(false);
  };
  const handleUpdateAdmin = async (data: INameForm) => {
    setIsLoading(true);
    try {
      const res = await updateData("users/update-admin", 1, data);
      if (res.success) {
        toggleModalEdit(false);
        alertTimer(`El usuario se ha actualizado`, "success");
        updateUser({ ...user, name: data.name } as UserProfile);
      }
    } catch (error) {
      console.log(error);
      alertTimer(`Ha ocurrido un error.`, "error");
    }
    setIsLoading(false);
  };

  return (
    <AppContext.Provider
      value={{
        sidebarMobile,
        toggleSidebarMobile,
        toggleSideMenu,
        sideMenuIsExpand,
        isLoading,
        modalPass: {
          isOpenModalPass,
          toggleModalPass,
          userID,
        },
        modalEdit: {
          isOpenModalEdit,
          toggleModalEdit,
          handleChangePass,
          handleUpdateAdmin,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
