import { FC, ReactNode } from "react";
import { Spinner } from "./Spinner";

interface IProps {
  children: ReactNode;
  color?:
    | "blue"
    | "theme"
    | "green"
    | "warning"
    | "failure"
    | "sky"
    | "gray"
    | "purple";
  darkMode?: boolean;
  size?: "sm" | "md" | "auto" | "min" | "auth";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  title?: string;
  className?: string;
  spinner?: boolean;
  isLoading?: boolean;
}
interface IStyle {
  bg: {
    [param: string]: string;
  };
  darkMode: {
    [param: string]: string;
  };
  size: {
    [param: string]: string;
  };
}
const style: IStyle = {
  bg: {
    blue: "btn-blue",
    theme: `btn-theme`,
    green: "btn-green",
    warning: "btn-warning",
    failure: "btn-failure",
    sky: "btn-sky",
    gray: "btn-gray",
    purple: "btn-purple",
  },
  darkMode: {
    blue: "btn-blue-dark",
    theme: `btn-theme-dark`,
    green: "btn-green-dark",
    warning: "btn-warning-dark",
    failure: "btn-failure-dark",
    sky: "btn-sky-dark",
    gray: "btn-gray-dark",
    purple: "btn-purple-dark",
  },
  size: {
    auto: "w-[7.5rem] py-2",
    auth: "px-3 py-2",
    sm: "text-sm px-1 py-1 w-20 text-center",
    md: "px-3 h-9 w-[5rem]",
    min: "size-9",
  },
};

export const Button: FC<IProps> = ({
  children,
  color = "blue",
  darkMode = false,
  size = "auto",
  type = "button",
  onClick,
  title,
  className = "",
  spinner = false,
  isLoading = false,
}) => {
  const handleClick = () => {
    if (onClick) onClick();
  };
  const getClassNames = () => {
    const baseClasses = ["btn", className, style.size[size]];
    const colorClasses = darkMode
      ? style.darkMode[color]
      : `${style.bg[color]}`;
    const textColor = darkMode ? "text-cciod-white-100" : "";

    return [colorClasses, textColor, ...baseClasses].join(" ");
  };
  return (
    <button
      type={type}
      className={getClassNames()}
      onClick={() => handleClick()}
      title={title}
    >
      {spinner && isLoading ? <Spinner size="sm" color={color} /> : children}
    </button>
  );
};
