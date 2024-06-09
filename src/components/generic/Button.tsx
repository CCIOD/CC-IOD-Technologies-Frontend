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
    blue: "border-blue-900 text-blue-900 hover:bg-blue-50 dark:bg-blue-900 dark:hover:bg-blue-800",
    theme: `app-text border-cciod-black-100 hover:bg-cciod-white-200 dark:border-cciod-white-100 dark:!border-opacity-40 dark:hover:bg-cciod-black-200`,
    green:
      "border-green-500 text-green-700 hover:bg-green-50 dark:bg-green-500 dark:hover:bg-green-600",
    warning:
      "border-yellow-500 text-yellow-700 hover:bg-yellow-50 dark:bg-yellow-500 dark:hover:bg-yellow-600",
    failure:
      "border-red-500 text-red-700 hover:bg-red-50 dark:bg-red-500 dark:hover:bg-red-600",
    sky: "border-sky-500 text-sky-700 hover:bg-sky-50 dark:bg-sky-500 dark:hover:bg-sky-600",
    gray: "border-gray-500 text-gray-700 hover:bg-gray-100 dark:bg-gray-500 dark:hover:bg-gray-600",
    purple:
      "border-purple-500 text-purple-700 hover:bg-purple-50 dark:bg-purple-500 dark:hover:bg-purple-600",
  },
  darkMode: {
    blue: "bg-blue-900 hover:bg-blue-800",
    theme: `border-cciod-white-100 !border-opacity-80 hover:bg-cciod-black-200`,
    green: "bg-green-500 hover:bg-green-600",
    warning: "bg-yellow-500 hover:bg-yellow-600",
    failure: "bg-red-500 hover:bg-red-600",
    sky: "bg-sky-500 hover:bg-sky-600",
    gray: "bg-gray-500 hover:bg-gray-600",
    purple: "bg-purple-500 hover:bg-purple-600",
  },
  size: {
    auto: "w-[7.5rem] py-2",
    auth: "px-3 py-2",
    sm: "text-sm px-1 py-1 w-20 text-center",
    md: "px-3 h-9 w-[5rem]",
    min: "size-9",
  },
};
const defaultCss =
  "rounded-md flex justify-center items-center gap-2 transition-colors";

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

  const css = darkMode
    ? `${style.darkMode[color]} text-cciod-white-100`
    : `border ${style.bg[color]} dark:text-cciod-white-100`;
  return (
    <button
      type={type}
      className={`${css} ${style.size[size]} ${defaultCss} ${className}`}
      onClick={() => handleClick()}
      title={title}
    >
      {spinner && isLoading && <Spinner size="sm" color={color} />}
      {children}
    </button>
  );
};
// 118
