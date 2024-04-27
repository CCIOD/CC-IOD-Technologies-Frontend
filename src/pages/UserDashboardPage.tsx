import { useContext, useEffect } from "react";
import { Sidebar } from "../components/sidebarComponents/Sidebar"
import { HeaderComponent } from "../components/pure/HeaderComponent";
import { Outlet } from "react-router-dom";
import { SidebarMobile } from "../components/sidebarComponents/SidebarMobile";
import { SidebarContext } from "../context/SidebarContext";

export const UserDashboardPage = () => {
  const { sideMenuIsExpand, toggleSideMenu } = useContext(SidebarContext);
  useEffect(() => {
    const handleResize = () => {
      toggleSideMenu(window.innerWidth >= 1280 ? true : false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="relative min-h-screen sm:flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="block md:hidden">
          <SidebarMobile />
        </div>
        {/* {toggleMenuMobile ? "si" : "no"} */}
        <div className={`app-bg2 flex-1 min-h-screen mx-0 transition-all duration-300 ease-in-out ${
          sideMenuIsExpand ? "sm:ml-60" : "sm:ml-0 md:ml-20"}`}>
          <HeaderComponent />
          <div className="app-text px-5 py-2 w-full h-screen">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}
