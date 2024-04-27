import { FC, ReactNode } from "react"

interface IProps {
  children: ReactNode,
  color?: "blue" | "theme" | "green" | "warning" | "failure" | "sky",
  outline?: boolean,
  outlineColor?: boolean,
  size?: "sm" | "md" | "auto",
  handleClick?: () => void,
}
interface IStyle {
  bg: {
    [param: string]: string;
  }
  text: {
    [param: string]: string;
  }
  size: {
    [param: string]: string;
  }
}
export const Button: FC<IProps> = ({ children, color = "blue", outline = false, outlineColor=false,  size="auto", handleClick = () => {} }) => {
  const style: IStyle = {
    bg: {
      blue: "bg-blue-900 hover:bg-blue-800 border-blue-900",
      theme: `bg-cciod-black-300 border-cciod-black-300 ${outline ? "dark:border-cciod-white-200 hover:bg-cciod-black-200" : "hover:bg-opacity-90"}`,
      green: "bg-green-500 hover:bg-green-600 border-green-500",
      warning: "bg-yellow-500 hover:bg-yellow-600 border-yellow-500",
      failure: "bg-red-500 hover:bg-red-600 border-red-500",
      sky: "bg-sky-500 hover:bg-sky-600 border-sky-500",
    },
    text: {
      blue: "text-blue-900",
      theme: "text-cciod-black-300 dark:text-cciod-white-200",
      green: "text-green-500",
      warning: "text-yellow-500",
      failure: "text-red-500",
      sky: "text-sky-500",
    },
    size: {
      auto: "px-3 py-2",
      sm:"text-sm px-1 py-1 w-20 text-center",
      md: "px-3 py-2 w-[7rem]",
    }
  }
  return (
    <button
      className={
        `border ${style.bg[color]} ${outline ? `bg-transparent hover:bg-opacity-15 
        ${outlineColor ? style.text[color] : ""}` : "text-cciod-white-100"} 
        ${style.size[size]} rounded-lg flex justify-center items-center gap-2 transition-colors`}
      onClick={() => handleClick()}>
      {children}
    </button>
  )
}
