import { useContext } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { SidebarContext } from "../../context/SidebarContext";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { Button } from "../generic/Button";
import { FiMoon, FiSun } from "react-icons/fi";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";

export const HeaderComponent = () => {
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  const { toggleSidebarMobile } = useContext(SidebarContext);
  const handleToggleMenu = () => toggleSidebarMobile();
  return (
    <div className="app-bg app-text h-14 flex gap-4 items-center justify-between md:justify-end px-5">
      <div className="block md:hidden">
        <button onClick={() => handleToggleMenu()}>
          <RxHamburgerMenu size={24} />
        </button>
      </div>
      <div className="flex gap-4 items-center">
        <button type="button" onClick={toggleTheme}>
          {theme === "light" ? (
            <FiMoon className="mr-2" size={24} />
          ) : (
            <FiSun className="mr-2" size={24} />
          )}
        </button>
        <div>
          <span>Username</span>
        </div>
        <Button onClick={logout}>
          <span className="hidden sm:block">Cerrar sesión</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      </div>
    </div>
  );
};
// 63
