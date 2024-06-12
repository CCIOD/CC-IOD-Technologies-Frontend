import { forwardRef, ReactElement } from "react";

type Props = {
  icon?: ReactElement;
  text: string;
  onClick?: () => void;
  selected?: boolean;
  selectedColor?: "blue" | "green";
};

const MenuOption = forwardRef<HTMLButtonElement, Props>(
  ({ icon, text, selected = false, selectedColor = "blue", onClick }, ref) => {
    const selectedCSS = selected
      ? `opt-selected ${
          selectedColor === "green" ? "opt-selected-green" : "opt-selected-blue"
        }`
      : "";
    return (
      <button
        type="button"
        onClick={onClick}
        ref={ref}
        className={`group opt-select ${selectedCSS}`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {text}
      </button>
    );
  }
);

MenuOption.displayName = "MenuOption";

export default MenuOption;
