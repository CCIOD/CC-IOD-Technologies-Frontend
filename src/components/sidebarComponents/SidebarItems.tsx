import { SidebarItem } from './SidebarItem'
import { sidebarStructure } from './Structure';

interface IProps {
  isExpand: boolean;
}
export const SidebarItems = ({ isExpand }: IProps) => {
  return (
    <div className="font-normal">
      {sidebarStructure.map((item, index) =>
        <SidebarItem key={index} item={item} isExpand={isExpand} />
      )}
    </div>
  )
}
