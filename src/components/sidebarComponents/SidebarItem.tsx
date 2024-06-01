import { NavLink } from "react-router-dom";
import { ISidebar } from "./Structure";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

interface IProps {
  item: ISidebar;
  isExpand: boolean;
}

export const SidebarItem = ({ item, isExpand }: IProps) => {
  const { toggleSidebarMobile } = useContext(AppContext);
  return (
    <NavLink
      to={`/dashboard/${item.link}`}
      role="button"
      tabIndex={0}
      onClick={() => toggleSidebarMobile()}
      className={({ isActive, isPending, isTransitioning }) =>
        [
          "group m-0 flex items-center justify-between h-12 py-0 pr-3 mb-1 focus:outline-none border-l-4 border-transparent",
          isPending ? "pending" : "",
          isActive
            ? "!border-green-500 text-green-500 pl-4 cursor-default"
            : "hover:text-green-300 hover:scale-105 transition-transform duration-100 cursor-pointer pl-4",
          isTransitioning ? "transitioning" : "",
        ].join(" ")
      }
    >
      <div className="flex items-center gap-3 px-3">
        {item.icon}
        <div className={`truncate ${isExpand ? "" : "w-0 h-0 opacity-0"}`}>
          {item.title}
        </div>
      </div>
    </NavLink>
  );
};
