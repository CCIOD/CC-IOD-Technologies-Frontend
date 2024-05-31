import { createContext, ReactNode, useState } from "react";
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
};
export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarMobile, setSidebarMobile] = useState<boolean>(false);
  const [sideMenuIsExpand, setSideMenuIsExpand] = useState<boolean>(current);

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

  //  ------------------- MODALES ---------------------

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
