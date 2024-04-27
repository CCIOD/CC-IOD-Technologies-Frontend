import { NavLink } from "react-router-dom";
import { ISidebar } from "./Structure"

interface IProps {
  item: ISidebar,
  isExpand: boolean;
}

export const SidebarItem = ({ item, isExpand } : IProps) => {
  return (
//     <NavLink
//   to="/messages"
//   className={({ isActive, isPending, isTransitioning }) =>
//     [
//       isPending ? "pending" : "",
//       isActive ? "active" : "",
//       isTransitioning ? "transitioning" : "",
//     ].join(" ")
//   }
// >
//   Messages
// </NavLink>
    <NavLink to={item.link} role="button" tabIndex={0}
      // className={"group m-0 flex cursor-pointer items-center justify-between h-12 py-0 pr-3 mb-1 focus:outline-none pl-4 hover:bg-blue-100 dark:hover:bg-green-500"}
      className={({ isActive, isPending, isTransitioning }) =>
    [ "group m-0 flex items-center justify-between h-12 py-0 pr-3 mb-1 focus:outline-none",
      isPending ? "pending" : "",
      isActive ? "border-l-4 border-green-500 text-green-500 pl-3 cursor-default" : "hover:bg-slate-100 dark:hover:bg-slate-500 cursor-pointer pl-4",
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
  )
}
