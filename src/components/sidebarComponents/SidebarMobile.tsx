import { SidebarItems } from "./SidebarItems";
import { RxCross1 } from "react-icons/rx";
import { SidebarContext } from "../../context/SidebarContext";
import { useContext } from "react";
import { LogoCCIOD } from "../header/LogoCCIOD";

export const SidebarMobile = () => {
  const { sidebarMobile, toggleSidebarMobile } = useContext(SidebarContext);
  const handleToggleMenu = () => toggleSidebarMobile();
  return (
    <nav
      role="navigation"
      className={`z-50 app-bg border-r app-border shadow-sm duration-300 ease-in-out md:fixed md:translate-x-0 w-full sm:w-80 fixed ${
        sidebarMobile ? "-translate-x-0" : `-translate-x-full`
      }`}
    >
      <button
        type="button"
        className="z-30 absolute top-4 right-2 app-text"
        onClick={() => handleToggleMenu()}
      >
        <RxCross1 size={24} />
      </button>
      <div className={`relative h-screen overflow-hidden`}>
        <div className="app-text">
          <LogoCCIOD />
          <SidebarItems isExpand={true} />
        </div>
      </div>
    </nav>
  );
};
