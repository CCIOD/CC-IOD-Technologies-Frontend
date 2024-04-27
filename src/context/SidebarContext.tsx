import { createContext, ReactNode, useState } from 'react';
const sideMenu:string | null = localStorage.getItem("sideMenu")
const current:boolean = sideMenu === "yes" ? true : false;
export const SidebarContext = createContext({
  sidebarMobile: false,
  toggleSidebarMobile: () => {},
  toggleSideMenu: (value: boolean) => console.log(value),
  sideMenuIsExpand: current,
});

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
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
    <SidebarContext.Provider value={{ sidebarMobile, toggleSidebarMobile, toggleSideMenu, sideMenuIsExpand }}>
      {children}
    </SidebarContext.Provider>
  );
};
