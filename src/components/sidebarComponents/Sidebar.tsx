import { useContext } from "react";
import { RiArrowLeftSLine, RiDashboardLine } from "react-icons/ri";
import { SidebarItems } from "./SidebarItems";
import { NavLink } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

export const Sidebar = () => {
  const { sideMenuIsExpand, toggleSideMenu } = useContext(AppContext);
  const handleExpand = () => toggleSideMenu(!sideMenuIsExpand);

  const navExp = sideMenuIsExpand ? "sm:w-52" : "sm:w-12";
  const arrowIcon = sideMenuIsExpand ? "rotate-0" : "rotate-180";
  const logoExp = sideMenuIsExpand ? "" : "w-0 h-0 opacity-0";
  return (
    <>
      <nav
        role="navigation"
        className={`app-bg border-r app-border shadow-sm duration-300 ease-in-out md:fixed md:translate-x-0 ${navExp} hidden md:block`}
      >
        <button className="btn-expand-sidebar" onClick={() => handleExpand()}>
          <RiArrowLeftSLine className={`${arrowIcon} transform duration-500`} />
        </button>
        <div className={`relative h-screen overflow-hidden`}>
          <div className="app-text">
            <div className="list-none text-sm font-normal mt-2 mb-8">
              <NavLink
                to="/dashboard/"
                className={`flex cursor-pointer items-center h-12 pl-2`}
              >
                <div className="flex items-center gap-[0.600rem] sidebar-color">
                  <RiDashboardLine size={30} className="sidebar-color" />
                  <div className={`truncate ${logoExp}`}>
                    <span className="block font-bold text-2xl">
                      <span>CC-IOD</span>
                      <sup className="text-md truncate">&#174;</sup>
                    </span>
                    <span className="block text-xs">TECHNOLOGIES</span>
                  </div>
                </div>
              </NavLink>
            </div>
            <SidebarItems isExpand={sideMenuIsExpand} />
          </div>
        </div>
      </nav>
    </>
  );
};
