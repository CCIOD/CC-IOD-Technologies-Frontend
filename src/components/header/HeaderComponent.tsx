import { Fragment, useContext } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { RiArrowDownSLine } from "react-icons/ri";
import { FiMoon, FiSun } from "react-icons/fi";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "../../hooks/useTheme";
import { Menu, Transition } from "@headlessui/react";
import MenuOption from "../generic/MenuOption";
import { AppContext } from "../../context/AppContext";

export const HeaderComponent = () => {
  const { logout, user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();

  const { toggleSidebarMobile, modalPass, modalEdit } = useContext(AppContext);
  const { toggleModalPass } = modalPass;
  const { toggleModalEdit } = modalEdit;
  const handleToggleMenu = () => toggleSidebarMobile();

  return (
    <div className="app-bg app-text h-14 flex gap-4 items-center justify-between px-2 md:px-6">
      <div className="flex gap-2">
        <button className="block md:hidden" onClick={() => handleToggleMenu()}>
          <RxHamburgerMenu size={24} />
        </button>
        <div className="hidden xs:block font-medium">{user?.role}</div>
      </div>
      <div className="flex gap-4 items-center">
        <button role="button" type="button" onClick={toggleTheme}>
          {theme === "light" ? <FiMoon size={24} /> : <FiSun size={24} />}
        </button>
        <Menu as="div" className="relative inline-block z-20">
          <div>
            <Menu.Button className="inline-flex justify-center items-center app-bg font-medium app-text ">
              {user?.name}
              <RiArrowDownSLine className="ml-1" aria-hidden="true" size={24} />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md app-bg3 app-text shadow-lg ring-1 ring-black/5">
              <div className="p-1">
                {user?.role === "Administrador" && (
                  <>
                    <Menu.Item>
                      <MenuOption
                        text="Cambiar nombre"
                        onClick={() => toggleModalEdit(true)}
                      />
                    </Menu.Item>
                    <Menu.Item>
                      <MenuOption
                        text="Cambiar contraseña"
                        onClick={() => toggleModalPass(true, 1)}
                      />
                    </Menu.Item>
                  </>
                )}
                <Menu.Item>
                  <MenuOption text="Cerrar sesión" onClick={() => logout()} />
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
};
// 63
