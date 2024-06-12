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
  const expand = isExpand ? "" : "w-0 h-0 opacity-0";
  return (
    <NavLink
      to={`/dashboard/${item.link}`}
      title={item.title}
      role="button"
      tabIndex={0}
      onClick={() => toggleSidebarMobile()}
      className={({ isActive, isPending, isTransitioning }) =>
        [
          "group ",
          isPending ? "pending" : "",
          isActive ? "navlink-active" : "navlink-hover",
          isTransitioning ? "transitioning" : "",
        ].join(" ")
      }
    >
      <div className="flex items-center gap-3 px-3">
        {item.icon}
        <div className={`truncate ${expand}`}>{item.title}</div>
      </div>
    </NavLink>
  );
};
