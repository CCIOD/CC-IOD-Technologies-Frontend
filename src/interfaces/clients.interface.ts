import { SelectableItem } from "./interfaces";

export type TClientStatus =
  | "Pendiente de aprobación"
  | "Pendiente de audiencia"
  | "Pendiente de colocación"
  | "Colocado"
  | "Desinstalado"
  | "Cancelado";

export const clientStatusValues: SelectableItem[] = [
  { id: 1, name: "Pendiente de aprobación" },
  { id: 2, name: "Pendiente de audiencia" },
  { id: 3, name: "Pendiente de colocación" },
  { id: 4, name: "Colocado" },
  { id: 5, name: "Desinstalado" },
  { id: 6, name: "Cancelado" },
];
export const dataFilters: SelectableItem[] = [
  { id: 1, name: "Sin filtros" },
  { id: 2, name: "Pendiente de aprobación" },
  { id: 3, name: "Pendiente de audiencia" },
  { id: 4, name: "Pendiente de colocación" },
  { id: 5, name: "Colocado" },
  { id: 6, name: "Desinstalado" },
  { id: 7, name: "Cancelado" },
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

export interface IContractRenewal {
  renewal_id?: number; // ID de la renovación (para edición/visualización)
  renewal_date: string; // Fecha de renovación
  renewal_document?: string; // URL o nombre del documento
  renewal_duration?: string; // Duración de la renovación (ej: "12 meses")
  notes?: string; // Notas adicionales
  created_at?: string; // Fecha de creación
  updated_at?: string; // Fecha de actualización
}

export interface IProsecutorDocument {
  prosecutor_doc_id?: number; // ID del documento (para edición/visualización)
  document_type: string; // Tipo de documento (ej: "Oficio", "Citatorio", etc.)
  document_number?: string; // Número de oficio/documento
  issue_date: string; // Fecha de emisión del documento
  document_file?: string; // URL del archivo
  prosecutor_office?: string; // Fiscalía emisora
  notes?: string; // Notas adicionales
  created_at?: string; // Fecha de creación
  updated_at?: string; // Fecha de actualización
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
  relationship_id?: number | string | null;
  phone_number: string;
  relationship_name?: string; // Solo en response del GET
  relationship?: string; // Campo del backend
}

export interface DataRowClients {
  id: number;
  name: string;
  contract_number?: number;
  criminal_case: string;
  defendant_name: string;
  investigation_file_number?: number | string;
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
  
  // Campos de cancelación
  cancellation_reason?: string;
  
  // Renovaciones de contrato
  contract_renewals?: IContractRenewal[];
  
  // Documentos de fiscalía
  prosecutor_documents?: IProsecutorDocument[];
  
  // Observaciones múltiples
  observations?: IClientObservation[];
  
  // Campos de administración
  invoice_file?: string; // Archivo de factura
  payment_plan?: any[]; // Plan de pagos
  account_statement?: any; // Estado de cuenta
  total_contract_amount?: number; // Monto total del contrato
}

export interface IClientForm {
  contract_number?: number;
  defendant_name: string;
  criminal_case: string;
  investigation_file_number?: number | string;
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
  
  // Campos de cancelación
  cancellation_reason?: string;
  
  // Observaciones múltiples
  observations?: (IClientObservation | string)[];
  newObservation?: string;
}
