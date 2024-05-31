import { useContext, useEffect } from "react";
import { Sidebar } from "../components/sidebarComponents/Sidebar";
import { HeaderComponent } from "../components/header/HeaderComponent";
import { Outlet } from "react-router-dom";
import { SidebarMobile } from "../components/sidebarComponents/SidebarMobile";
import { AppContext } from "../context/AppContext";

export const UserDashboardPage = () => {
  const { sideMenuIsExpand, toggleSideMenu } = useContext(AppContext);
  useEffect(() => {
    const handleResize = () => {
      toggleSideMenu(window.innerWidth >= 1280 ? true : false);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
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
        <div
          className={`app-bg2 flex-1 min-h-screen mx-0 transition-all duration-300 ease-in-out overflow-x-hidden ${
            sideMenuIsExpand ? "sm:ml-60" : "sm:ml-0 md:ml-20"
          }`}
        >
          {/* md:w-[calc(100vw-20rem)] */}
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
    </>
  );
};
