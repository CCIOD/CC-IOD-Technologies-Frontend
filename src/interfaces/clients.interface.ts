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
export const dataFilters: SelectableItem[] = [
  { id: 1, name: "Sin filtros" },
  { id: 2, name: "Pendiente de aprobación" },
  { id: 3, name: "Pendiente de audiencia" },
  { id: 4, name: "Pendiente de colocación" },
  { id: 5, name: "Colocado" },
];

export interface DataRowClients {
  id: number;
  contact_numbers: string;
  contract_number: number;
  contract: string;
  court_name: string;
  criminal_case: string;
  name: string;
  hearing_date: string;
  investigation_file_number: number | null;
  judge_name: string;
  lawyer_name: string;
  observations: string;
  prospect_id: number;
  signer_name: string;
  status: TClientStatus;
}

export interface IClientForm {
  contact_numbers: string[];
  contract_number: number;
  court_name: string;
  criminal_case: string;
  defendant_name: string;
  hearing_date: string;
  investigation_file_number: number | null;
  judge_name: string;
  lawyer_name: string;
  observations?: string;
  prospect_id: number;
  signer_name: string;
  status: TClientStatus;
}
