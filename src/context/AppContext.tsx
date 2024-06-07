import { createContext, ReactNode, useContext, useState } from "react";
import { getDataById, updateData } from "../services/api.service";
import {
  DataRowUsers,
  INameForm,
  IPasswordForm,
} from "../interfaces/users.interface";
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
  modalPass: {
    isOpenModalPass: boolean;
    toggleModalPass: (value: boolean, id?: number | null) => void;
    userID: number | null;
  };
  modalEdit: {
    isOpenModalEdit: boolean;
    toggleModalEdit: (value: boolean) => void;
    adminData: DataRowUsers | null;
    handleChangePass: (data: IPasswordForm) => void;
    handleUpdateAdmin: (data: INameForm) => void;
  };
};
export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { updateUser, user } = useContext(AuthContext);

  const [sidebarMobile, setSidebarMobile] = useState<boolean>(false);
  const [sideMenuIsExpand, setSideMenuIsExpand] = useState<boolean>(current);

  const [isOpenModalEdit, setIsOpenModalEdit] = useState<boolean>(false);
  const [isOpenModalPass, setIsOpenModalPass] = useState<boolean>(false);
  const [userID, setUserID] = useState<number | null>(null);
  const [adminData, setAdminData] = useState<DataRowUsers | null>(null);

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
  const getUserById = async (id: number) => {
    try {
      const res = await getDataById("users", id);
      console.log(res);

      const data: DataRowUsers = res.data!;
      if (!data) setAdminData(null);
      setAdminData(data);
    } catch (error) {
      console.log(error);
    }
  };
  const toggleModalEdit = (value: boolean) => {
    setIsOpenModalEdit(value);
    getUserById(1);
  };

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
      alertTimer(`Ha ocurrido un error.`, "error");
    }
  };
  const handleUpdateAdmin = async (data: INameForm) => {
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
  };

  return (
    <AppContext.Provider
      value={{
        sidebarMobile,
        toggleSidebarMobile,
        toggleSideMenu,
        sideMenuIsExpand,
        modalPass: {
          isOpenModalPass,
          toggleModalPass,
          userID,
        },
        modalEdit: {
          isOpenModalEdit,
          toggleModalEdit,
          adminData,
          handleChangePass,
          handleUpdateAdmin,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
