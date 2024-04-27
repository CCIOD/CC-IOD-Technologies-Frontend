import { ISidebar } from "./Structure"

interface IProps {
  item: ISidebar,
  isExpand: boolean;
}

export const SidebarItem = ({ item, isExpand } : IProps) => {
  return (
    <a role="button" tabIndex={0} className={"group m-0 flex cursor-pointer items-center justify-between h-12 py-0 pr-3 mb-1 focus:outline-none pl-4 hover:bg-green-100"}>
      <div className="flex items-center gap-3 px-3">
        {item.icon}
        <div className={`truncate ${isExpand ? "" : "w-0 h-0 opacity-0"}`}>
          {item.title}
        </div>
      </div>
    </a>
  )
}
