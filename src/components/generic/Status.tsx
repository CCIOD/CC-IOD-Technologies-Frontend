import { FC } from "react";
import { TClientStatus } from "../../interfaces/clients.interface";
import { TProspectStatus } from "../../interfaces/prospects.interface";
type Props = {
  status: TClientStatus | TProspectStatus;
};

type TStatusCSS = {
  [param: string]: string;
};

const statusCSS: TStatusCSS = {
  Pendiente:
    "border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-500 dark:app-text",
  Aprobado:
    "border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-500 dark:app-text",
  "Pendiente de aprobación":
    "border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-500 dark:app-text",
  "Pendiente de audiencia":
    "border-lime-500 text-lime-500 bg-lime-50 dark:bg-lime-500 dark:app-text",
  "Pendiente de colocación":
    "border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-500 dark:app-text",
  Colocado:
    "border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-500 dark:app-text",
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
