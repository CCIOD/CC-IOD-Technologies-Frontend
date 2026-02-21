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
  Pendiente: "status-primary",
  Aprobado: "status-quaternary",
  "Pendiente de aprobación": "status-primary",
  "Pendiente de audiencia": "status-secondary",
  "Pendiente de colocación": "status-tertiary",
  Colocado: "status-quaternary",
  Cancelado: "status-danger",
  Desinstalado: "bg-gray-500 text-gray-50",
  Traspaso: "status-secondary",
};
export const Status: FC<Props> = ({ status }) => {
  const className = `status ${statusCSS[status]}`;
  return (
    <span className={className} title={status}>
      {status}
    </span>
  );
};
