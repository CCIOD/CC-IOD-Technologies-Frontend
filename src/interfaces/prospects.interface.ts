import { SelectableItem } from "./interfaces";

export type TProspectStatus = "Pendiente" | "Aprobado";

export const prospectStatusValues: SelectableItem[] = [
  { id: 1, name: "Pendiente" },
  { id: 2, name: "Aprobado" },
];

export const dataFilters: SelectableItem[] = [
  { id: 1, name: "Sin filtros" },
  { id: 2, name: "Pendiente" },
  { id: 3, name: "Aprobado" },
];

export interface DataRowProspects {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: string;
  status: TProspectStatus;
  relationship_name: TProspectStatus;
  relationship_id: number;
  observations: string;
}
export interface IProspectForm {
  name: string;
  email: string;
  phone: string;
  date: string;
  status: TProspectStatus;
  relationship_id: number;
  observations?: string;
}
