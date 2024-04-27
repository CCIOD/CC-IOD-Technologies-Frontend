import { useState } from "react";
import { Sidebar } from "../components/sidebarComponents/Sidebar"

export const UserPage = () => {
  const [sideMenuIsExpand, setSideMenuIsExpand] = useState(true);

  return (
    <>
      <div className="relative min-h-screen md:flex">
      {/* sidemenu */}
      <Sidebar setExpand={setSideMenuIsExpand} isExpand={sideMenuIsExpand} />
      {/* content */}
      <div
        className={`flex-1 min-h-screen mx-0 bg-cciod-white-200 transition-all duration-300 ease-in-out ${
          sideMenuIsExpand ? "md:ml-60" : "md:ml-20"
        }`}
      >
          {/* <Blog /> */}
          Hola
      </div>
    </div>
    </>
  )
}
