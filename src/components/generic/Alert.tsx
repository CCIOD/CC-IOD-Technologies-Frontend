import { FC } from "react";

type Props = {
  length?: number;
  text1: string;
  text2?: string;
  color?: "yellow" | "red" | "blue";
};

export const Alert: FC<Props> = ({
  length,
  text1,
  text2,
  color = "yellow",
}) => {
  const background = {
    yellow: "alert-yellow",
    red: "alert-red",
    blue: "alert-blue",
  };
  return (
    <div className={`alert ${background[color]}`}>
      {text2 && length
        ? `Hay ${length} ${text1}${length > 1 ? "s" : ""} pendiente${
            length > 1 ? "s" : ""
          } de registrarse
      como ${text2}${length > 1 ? (text2 === "Portador" ? "es" : "s") : ""}.`
        : text1}
    </div>
  );
};
