import { useContext, useEffect, useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { SidebarContext } from "../../context/SidebarContext";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { Button } from "./Button";
import { FiMoon, FiSun } from "react-icons/fi";

type TypeTheme = "light" | "dark";
const getInitialTheme = (): TypeTheme => {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const HeaderComponent = () => {
  const initialTheme = getInitialTheme();
  const [theme, setTheme] = useState<TypeTheme>(initialTheme);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const element = document.querySelector("html");
    theme === "dark" ? element?.classList.add("dark") : element?.classList.remove("dark");
  }, [theme]);

  const handleChangeTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const { toggleSidebarMobile } = useContext(SidebarContext);
  const handleToggleMenu = () => toggleSidebarMobile();
  const handleClick = () => {};
  return (
    <div className="app-bg app-text h-14 flex gap-4 items-center justify-between md:justify-end px-5">
      <div className="block md:hidden">
        <button onClick={() => handleToggleMenu()}>
          <RxHamburgerMenu size={24} />
        </button>
      </div>
      <div className="flex gap-4 items-center">
          <button type="button"
            onClick={handleChangeTheme}
          >
            {theme === "light" ? <FiMoon className="mr-2" size={24}/> : <FiSun className="mr-2" size={24}/> }
          </button>
        <div>
          <span>Username</span>
        </div>
        <Button handleClick={handleClick}>
          <span className="hidden sm:block">Cerrar sesión</span>
          <RiLogoutBoxRLine className="block sm:hidden" size={24} />
        </Button>
      </div>
    </div>
  );
};