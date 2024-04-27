import { useState } from "react";
import { Sidebar } from "../components/sidebarComponents/Sidebar"
import { HeaderComponent } from "../components/pure/HeaderComponent";

export const UserPage = () => {
  const [sideMenuIsExpand, setSideMenuIsExpand] = useState(true);

  return (
    <>
      <div className="relative min-h-screen md:flex">
      <Sidebar setExpand={setSideMenuIsExpand} isExpand={sideMenuIsExpand} />
      <div className={`app-bg2 flex-1 min-h-screen mx-0 transition-all duration-300 ease-in-out ${
        sideMenuIsExpand ? "md:ml-60" : "md:ml-20"}`}>
        <HeaderComponent />
        <div className="page-container color-text">
              {/* <Outlet /> */}
        </div>
      </div>
    </div>
    </>
  )
}
