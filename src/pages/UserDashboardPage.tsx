import { useState } from "react";
import { Sidebar } from "../components/sidebarComponents/Sidebar"
import { HeaderComponent } from "../components/pure/HeaderComponent";
import { Outlet } from "react-router-dom";

export const UserDashboardPage = () => {
  const [sideMenuIsExpand, setSideMenuIsExpand] = useState(true);

  return (
    <>
      <div className="relative min-h-screen md:flex">
      <Sidebar setExpand={setSideMenuIsExpand} isExpand={sideMenuIsExpand} />
      <div className={`app-bg2 flex-1 min-h-screen mx-0 transition-all duration-300 ease-in-out ${
        sideMenuIsExpand ? "md:ml-60" : "md:ml-20"}`}>
        <HeaderComponent />
        <div className="app-text px-5 py-2 w-full h-screen">
          <Outlet />
        </div>
      </div>
    </div>
    </>
  )
}
