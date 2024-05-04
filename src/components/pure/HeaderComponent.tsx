import { useContext } from "react";
import { RxHamburgerMenu } from "react-icons/rx"
import { SidebarContext } from "../../context/SidebarContext";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { Button } from "./Button";

export const HeaderComponent = () => {
  const { toggleSidebarMobile } = useContext(SidebarContext);
  const handleToggleMenu = () => toggleSidebarMobile();
  const handleClick = () => {}
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
        <Button onClick={handleClick}>
          <span className="hidden sm:block">Cerrar sesión</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      </div>
    </div>
  )
}
