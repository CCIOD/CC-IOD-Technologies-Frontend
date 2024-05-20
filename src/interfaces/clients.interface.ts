export type TStatus =
  | "Pendiente de aprobación"
  | "Pendiente de audiencia"
  | "Pendiente de colocación"
  | "Colocado";

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
  status: TStatus;
}
