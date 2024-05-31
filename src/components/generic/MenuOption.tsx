import { forwardRef, ReactElement } from "react";

type Props = {
  icon?: ReactElement;
  text: string;
  onClick?: () => void;
  selected?: boolean;
  selectedColor?: "blue" | "green";
};

// Usamos forwardRef para que el componente pueda recibir refs
const MenuOption = forwardRef<HTMLButtonElement, Props>(
  ({ icon, text, selected = false, selectedColor = "blue", onClick }, ref) => {
    const selectedCSS =
      selectedColor === "green"
        ? "bg-green-500 text-gray-300 !cursor-default hover:!bg-green-500 hover:!text-gray-300 font-medium"
        : "bg-blue-500 text-gray-300 !cursor-default hover:!bg-blue-500 hover:!text-gray-300 font-medium";
    return (
      <button
        type="button"
        onClick={onClick}
        ref={ref}
        className={`group w-full flex items-center px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-gray-100 ${
          selected ? selectedCSS : ""
        }`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {text}
      </button>
    );
  }
);

// Añadimos un displayName para una mejor depuración
MenuOption.displayName = "MenuOption";

export default MenuOption;
