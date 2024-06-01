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
    yellow: "bg-yellow-400 text-yellow-900",
    red: "bg-red-400 text-red-900",
    blue: "bg-blue-400 text-blue-900",
  };
  return (
    <div
      className={`w-full text-center py-1 mb-2 ${background[color]} font-semibold rounded-md`}
    >
      {text2 && length
        ? `Hay ${length} ${text1}${length > 1 ? "s" : ""} pendiente${
            length > 1 ? "s" : ""
          } de registrarse
      como ${text2}${length > 1 ? (text2 === "Portador" ? "es" : "s") : ""}.`
        : text1}
    </div>
  );
};
