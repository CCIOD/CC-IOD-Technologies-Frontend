import { forwardRef, ReactElement } from "react";

type Props = {
  icon?: ReactElement;
  text: string;
  onClick: () => void;
};

// Usamos forwardRef para que el componente pueda recibir refs
const MenuOption = forwardRef<HTMLButtonElement, Props>(
  ({ icon, text, onClick }, ref) => {
    return (
      <button
        type="button"
        onClick={onClick}
        ref={ref}
        className="group w-full flex items-center p-2 rounded-md hover:bg-blue-900 hover:text-gray-200"
      >
        {icon && icon}
        {text}
      </button>
    );
  }
);

// Añadimos un displayName para una mejor depuración
MenuOption.displayName = "MenuOption";

export default MenuOption;
