import { SelectableItem } from "./interfaces";

export type TClientStatus =
  | "Pendiente de aprobación"
  | "Pendiente de audiencia"
  | "Pendiente de colocación"
  | "Colocado"
  | "Desinstalado";

export const clientStatusValues: SelectableItem[] = [
  { id: 1, name: "Pendiente de aprobación" },
  { id: 2, name: "Pendiente de audiencia" },
  { id: 3, name: "Pendiente de colocación" },
  { id: 4, name: "Colocado" },
  { id: 5, name: "Desinstalado" },
];
export const dataFilters: SelectableItem[] = [
  { id: 1, name: "Sin filtros" },
  { id: 2, name: "Pendiente de aprobación" },
  { id: 3, name: "Pendiente de audiencia" },
  { id: 4, name: "Pendiente de colocación" },
  { id: 5, name: "Colocado" },
  { id: 6, name: "Desinstalado" },
];

export const paymentFrequencyValues: SelectableItem[] = [
  { id: 1, name: "Mensual" },
  { id: 2, name: "Bimestral" },
  { id: 3, name: "Trimestral" },
  { id: 4, name: "Semestral" },
  { id: 5, name: "Contado" }, 
];

export interface IClientObservation {
  date: string; // ISO 8601
  observation: string;
}

export interface ClientContact {
  contact_name: string;
  relationship_id?: number;
  phone_number: string;
  relationship_name?: string; // Solo en response del GET
}

export interface DataRowClients {
  id: number;
  name: string;
  contract_number?: number;
  criminal_case: string;
  defendant_name: string;
  investigation_file_number?: number;
  judge_name: string;
  court_name: string;
  lawyer_name: string;
  signer_name: string;
  contact_numbers: ClientContact[]; // Nueva estructura
  hearing_date: string;
  status: string;
  prospect_id: number;
  
  // Campo de contrato principal (URL completa)
  contract?: string; // URL completa del archivo de contrato
  
  // Nuevos campos
  contract_date?: string;
  contract_document?: string;
  contract_duration?: string;
  payment_day?: number;
  payment_frequency?: number;
  
  // Campos de desinstalación
  uninstall_reason?: string;
  uninstall_date?: string;
  
  // Observaciones múltiples
  observations?: IClientObservation[];
}

export interface IClientForm {
  contract_number?: number;
  defendant_name: string;
  criminal_case: string;
  investigation_file_number?: number;
  judge_name: string;
  court_name: string;
  lawyer_name: string;
  signer_name: string;
  contact_numbers: ClientContact[]; // Nueva estructura
  hearing_date: string;
  status: TClientStatus;
  prospect_id?: number;
  
  // Nuevos campos
  contract_date?: string;
  contract_document?: string;
  contract_duration?: string;
  payment_day?: number;
  payment_frequency?: number;
  
  // Observaciones múltiples
  observations?: (IClientObservation | string)[];
  newObservation?: string;
}
