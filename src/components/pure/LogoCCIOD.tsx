import { useContext } from 'react';
import { RiDashboardLine } from 'react-icons/ri'
import { NavLink } from 'react-router-dom'
import { SidebarContext } from '../../context/SidebarContext';

export const LogoCCIOD = () => {
  const { toggleSidebarMobile } = useContext(SidebarContext);
  return (
    <div className="list-none text-sm font-normal px-3 pr-6 mt-2 mb-8">
    <NavLink to="/" onClick={() => toggleSidebarMobile()} className={`flex cursor-pointer rounded-lg items-center justify-between h-12 pl-4`}>
      <div className="flex items-center gap-3 text-blue-600">
        <RiDashboardLine size={30} className="text-blue-600" />
        <div className={`truncate `}>
          <span className="block font-bold text-2xl">
            <span>CC-IOD</span>
            <sup className="text-md truncate">&#174;</sup></span>
          <span className="block text-xs">TECHNOLOGIES</span>
        </div>
      </div>
    </NavLink>
    </div>
  )
}
