// Importar interfaces comunes de clientes
import { ClientContact, IClientObservation, TClientStatus } from './clients.interface';

export interface DataRowCarriers {
  id: number;
  name: string;
  residence_area: string;
  placement_date: string;
  placement_time: string;
  electronic_bracelet: string;
  beacon: string;
  wireless_charger: string;
  information_emails: string[]; // Cambiar a array directamente
  contact_numbers: ClientContact[]; // Usar la misma estructura que clientes
  house_arrest: string;
  installer_name: string;
  observations: IClientObservation[]; // Observaciones múltiples como en clientes
  relationship_name: string;
  relationship_id: number;
  client_id: number; // Agregar referencia al cliente
  contract_duration?: string; // Duración del contrato del cliente asociado
  client_status?: TClientStatus; // Estado del cliente asociado
}

export interface ICarrierForm {
  residence_area: string;
  placement_date: string;
  placement_time: string;
  electronic_bracelet: string;
  beacon: string;
  wireless_charger: string;
  information_emails: string[];
  contact_numbers: ClientContact[]; // Usar la misma estructura que clientes
  house_arrest: string;
  installer_name: string;
  observations: (IClientObservation | string)[]; // Observaciones múltiples
  newObservation?: string; // Campo temporal para nuevas observaciones
  client_id: number;
  relationship_id: number;
}
