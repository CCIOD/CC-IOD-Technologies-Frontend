import { createContext, ReactNode, useState } from "react";
const sideMenu: string | null = localStorage.getItem("sideMenu");
const current: boolean = sideMenu === "yes" ? true : false;
export const AppContext = createContext({
  sidebarMobile: false,
  toggleSidebarMobile: () => {},
  toggleSideMenu: (value: boolean) => console.log(value),
  sideMenuIsExpand: current,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarMobile, setSidebarMobile] = useState<boolean>(false);
  const [sideMenuIsExpand, setSideMenuIsExpand] = useState<boolean>(current);

  const toggleSidebarMobile = () => {
    setSidebarMobile(!sidebarMobile);
  };
  const toggleSideMenu = (state: boolean) => {
    localStorage.setItem("sideMenu", state ? "yes" : "no");
    setSideMenuIsExpand(state);
  };

  return (
    <AppContext.Provider
      value={{
        sidebarMobile,
        toggleSidebarMobile,
        toggleSideMenu,
        sideMenuIsExpand,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
