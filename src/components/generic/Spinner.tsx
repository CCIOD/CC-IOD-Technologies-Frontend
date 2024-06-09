import { FC } from "react";

type Props = {
  color?:
    | "blue"
    | "theme"
    | "green"
    | "warning"
    | "failure"
    | "sky"
    | "gray"
    | "yellow"
    | "purple";
  size?: "sm" | "lg";
};
interface IStyle {
  spinner: {
    [param: string]: string;
  };
  size: {
    [param: string]: string;
  };
}
const style: IStyle = {
  spinner: {
    blue: "border-blue-400 border-t-blue-700",
    theme: `border-cciod-white-300 border-t-cciod-black-100 dark:border-cciod-black-100 dark:border-t-cciod-white-100`,
    green: "border-green-400 border-t-green-800",
    warning: "border-yellow-400 border-t-yellow-800",
    failure: "border-red-400 border-t-red-800",
    sky: "border-sky-400 border-t-sky-800",
    gray: "border-gray-400 border-t-gray-800",
    purple: "border-purple-400 border-t-purple-800",
    yellow: "border-yellow-400 border-t-yellow-800",
  },
  size: {
    sm: "border-[3px] border-t-[3px] size-6",
    lg: "border-4 border-t-4 size-10",
  },
};
export const Spinner: FC<Props> = ({ color = "theme", size = "lg" }) => {
  return (
    <div
      className={`loader ease-linear rounded-full mr-1 ${style.size[size]} ${style.spinner[color]}`}
    ></div>
  );
};
