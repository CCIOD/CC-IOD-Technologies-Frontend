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
    blue: "spinner-blue",
    theme: "spinner-theme",
    green: "spinner-green",
    warning: "spinner-warning",
    failure: "spinner-failure",
    sky: "spinner-sky",
    gray: "spinner-gray",
    purple: "spinner-purple",
  },
  size: {
    sm: "border-[3px] border-t-[3px] size-6",
    lg: "border-4 border-t-4 size-10",
  },
};
export const Spinner: FC<Props> = ({ color = "theme", size = "lg" }) => {
  const className = `spinner ${style.size[size]} ${style.spinner[color]}`;
  return <div className={className}></div>;
};
