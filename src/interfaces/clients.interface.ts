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

export interface IOperationForm {
  contact_numbers: string;
  contract_number: number;
  court_name: string;
  criminal_case_number: number;
  defendant_name: string;
  hearing_date: string;
  investigation_file_number: number;
  judge_name: string;
  lawyer_name: string;
  observations: string;
  prospect_id: number;
  signer_name: string;
  status: TClientStatus;
}
