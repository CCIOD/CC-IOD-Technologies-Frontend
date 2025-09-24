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
  { id: "", name: "Selecciona la frecuencia de pago" },
  { id: 1, name: "Mensual" },
  { id: 2, name: "Bimestral" },
  { id: 3, name: "Trimestral" },
  { id: 4, name: "Semestral" },
  { id: 5, name: "Contado" }, 
];

export const braceletTypeValues: SelectableItem[] = [
  { id: "", name: "Selecciona el tipo de brazalete" },
  { id: 1, name: "B1" },
  { id: 2, name: "G2" },
  { id: 3, name: "Otro" },
];

export interface IClientObservation {
  date: string; // ISO 8601
  observation: string;
}

export interface IAudienceRecord {
  hearing_id?: number; // ID de la audiencia (para edición)
  hearing_date: string; // Fecha de la audiencia
  hearing_location: string; // Lugar de la audiencia
  attendees: string[]; // Personas que asistieron (array de strings)
  notes?: string; // Notas adicionales
  created_at?: string; // Fecha de creación
  updated_at?: string; // Fecha de actualización
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
  placement_date: string; // Renombrado de hearing_date
  hearings: IAudienceRecord[]; // Campo real del backend
  status: string;
  prospect_id: number;
  
  // Campo de contrato principal (URL completa)
  contract?: string; // URL completa del archivo de contrato
  
  // Nuevos campos
  contract_date?: string;
  contract_document?: string;
  contract_duration?: string;
  contract_folio?: string; // Folio del contrato
  payment_day?: number;
  payment_frequency?: string; // Valor de texto
  bracelet_type?: string; // Valor de texto
  
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
  placement_date: string; // Renombrado de hearing_date
  audiences: IAudienceRecord[]; // Múltiples audiencias
  newAudience?: IAudienceRecord; // Campo temporal para nueva audiencia
  status: TClientStatus;
  prospect_id?: number;
  
  // Nuevos campos
  contract_date?: string;
  contract_document?: string;
  contract_duration?: string;
  contract_folio?: string; // Folio del contrato
  payment_day?: number;
  payment_frequency?: string; // Valor de texto
  bracelet_type?: string; // Valor de texto
  
  // Observaciones múltiples
  observations?: (IClientObservation | string)[];
  newObservation?: string;
}
