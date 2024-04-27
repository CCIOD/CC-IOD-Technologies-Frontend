import { FC } from "react";
import { RiArrowLeftSLine, RiDashboardLine } from "react-icons/ri";
import { SidebarItems } from "./SidebarItems";

interface SidebarProps {
  setExpand: (value: boolean) => void;
  isExpand: boolean;
}

export const Sidebar: FC<SidebarProps> = ({ setExpand, isExpand }) => {
  const handleExpand = () => setExpand(!isExpand)

  return (
    <nav role="navigation" className={`app-bg border-r app-border shadow-sm duration-300 ease-in-out md:fixed md:translate-x-0 ${isExpand ? "w-60" : "w-20"}`}>
      <button className="absolute z-50 top-16 -right-3 app-bg3 app-text p-0.5 rounded-full border app-border"
        onClick={() => handleExpand()}
      >
        <RiArrowLeftSLine className={`${isExpand ? "rotate-0" : "rotate-180"} transform duration-500`} />
      </button>
      <div className={`relative h-screen overflow-hidden`}>
        <div className="app-text">
          <div className="list-none text-sm font-normal px-3 mt-2 mb-8">
            <a href="/" className={`flex cursor-pointer rounded-lg items-center justify-between h-12 pl-4`}>
              <div className="flex items-center gap-3 text-blue-600">
                <RiDashboardLine size={30} className="text-blue-600" />
                <div className={`truncate ${isExpand ? "" : "w-0 h-0 opacity-0"}`}>
                  <span className="block font-bold text-2xl">
                    <span>CC-IOD</span>
                    <sup className="text-md truncate">&#174;</sup></span>
                  <span className="block text-xs">TECHNOLOGIES</span>
                </div>
              </div>
            </a>
          </div>
          <SidebarItems isExpand={isExpand} />
        </div>
      </div>
    </nav>
  );
};