import { useContext } from "react";
import { RiArrowLeftSLine, RiDashboardLine } from "react-icons/ri";
import { SidebarItems } from "./SidebarItems";
import { NavLink } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

export const Sidebar = () => {
  const { sideMenuIsExpand, toggleSideMenu } = useContext(AppContext);
  const handleExpand = () => toggleSideMenu(!sideMenuIsExpand);

  return (
    <>
      <nav
        role="navigation"
        className={`app-bg border-r app-border shadow-sm duration-300 ease-in-out md:fixed md:translate-x-0 ${
          sideMenuIsExpand ? "sm:w-60" : "sm:w-20"
        } hidden md:block`}
      >
        <button
          className="hidden md:block absolute z-50 top-16 -right-3 app-bg app-text p-0.5 rounded-full border app-border"
          onClick={() => handleExpand()}
        >
          <RiArrowLeftSLine
            className={`${
              sideMenuIsExpand ? "rotate-0" : "rotate-180"
            } transform duration-500`}
          />
        </button>
        <div className={`relative h-screen overflow-hidden`}>
          <div className="app-text">
            <div className="list-none text-sm font-normal px-3 mt-2 mb-8">
              <NavLink
                to="/dashboard/"
                className={`flex cursor-pointer rounded-lg items-center justify-between h-12 pl-4`}
              >
                <div className="flex items-center gap-3 text-blue-600">
                  <RiDashboardLine size={30} className="text-blue-600" />
                  <div
                    className={`truncate ${
                      sideMenuIsExpand ? "" : "w-0 h-0 opacity-0"
                    }`}
                  >
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
