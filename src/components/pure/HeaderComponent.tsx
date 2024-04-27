import { useContext } from "react";
import { RxHamburgerMenu } from "react-icons/rx"
import { SidebarContext } from "../../context/SidebarContext";
import { RiLogoutBoxRLine } from "react-icons/ri";

export const HeaderComponent = () => {
  const { toggleSidebarMobile } = useContext(SidebarContext);
  const handleToggleMenu = () => toggleSidebarMobile();
  return (
    <div className='app-bg app-text h-14 flex gap-4 items-center justify-between md:justify-end px-5'>
      <div className="block md:hidden">
<button onClick={() => handleToggleMenu()}><RxHamburgerMenu size={24} /></button>
      </div>
      <div className="flex gap-4 items-center">

      {/* <div></div> Toggle change Theme */}
      <div>
        <span>Víctor Manuel</span>
      </div>
        <button className='bg-blue-900 hover:bg-blue-800 px-3 py-2 rounded-md text-cciod-white-100 flex items-center gap-2'>
          <span className="hidden sm:block">Cerrar sesión</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </button>
      </div>
    </div>
  )
}
