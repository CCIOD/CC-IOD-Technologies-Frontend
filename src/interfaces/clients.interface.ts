import { SelectableItem } from "./interfaces";

export type TClientStatus =
  | "Pendiente de aprobación"
  | "Pendiente de audiencia"
  | "Pendiente de colocación"
  | "Colocado";

export const clientStatusValues: SelectableItem[] = [
  { id: 1, name: "Pendiente de aprobación" },
  { id: 2, name: "Pendiente de audiencia" },
  { id: 3, name: "Pendiente de colocación" },
  { id: 4, name: "Colocado" },
];

export interface DataRowClients {
  id: number;
  contact_numbers: string;
  contract_number: number;
  court_name: string;
  criminal_case_number: number;
  name: string;
  hearing_date: string;
  investigation_file_number: number;
  judge_name: string;
  lawyer_name: string;
  observations: string;
  prospect_id: number;
  signer_name: string;
  status: TClientStatus;
}

export interface IClientForm {
  contact_numbers: string | null;
  contract_number: number | null;
  court_name: string | null;
  criminal_case_number: number | null;
  defendant_name: string | null;
  hearing_date: string | null;
  investigation_file_number: number | null;
  judge_name: string | null;
  lawyer_name: string | null;
  observations?: string | null;
  prospect_id: number | null;
  signer_name: string | null;
  status: TClientStatus | null;
}
