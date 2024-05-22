import { FC } from "react";

type Props = {
  length: number;
  text1: string;
  text2: string;
};

export const Alert: FC<Props> = ({ length, text1, text2 }) => {
  return (
    <div className="w-full text-center py-1 mb-2 bg-yellow-400 text-yellow-900 font-semibold rounded-md">
      {`Hay ${length} ${text1}${length > 1 ? "s" : ""} pendiente${
        length > 1 ? "s" : ""
      } de registrarse
      como ${text2}${length > 1 ? (text2 === "Portador" ? "es" : "s") : ""}.`}
    </div>
  );
};
