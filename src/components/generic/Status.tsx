import { FC } from "react";
import { TStatus } from "../../interfaces/tableData.interface";
type Props = {
  status: TStatus;
};

type TStatusCSS = {
  [param: string]: string;
};

const statusCSS: TStatusCSS = {
  Pendiente:
    "border-yellow-500 text-yellow-500 dark:bg-yellow-500 dark:app-text",
  Aprobado:
    "border-teal-500 text-teal-500 dark:border-none dark:bg-teal-500 dark:app-text",
  "Pendiente de aprobación":
    "border-orange-500 text-orange-500 dark:bg-orange-500 dark:app-text",
  "Pendiente de audiencia":
    "border-lime-500 text-lime-500 dark:bg-lime-500 dark:app-text",
  "Pendiente de colocación":
    "border-emerald-500 text-emerald-500 dark:bg-emerald-500 dark:app-text",
  Colocado: "border-cyan-500 text-cyan-500 dark:bg-cyan-500 dark:app-text",
};
export const Status: FC<Props> = ({ status }) => {
  return (
    <span
      className={`px-2 py-1 rounded-md truncate border ${statusCSS[status]}`}
      title={status}
    >
      {status}
    </span>
  );
};
