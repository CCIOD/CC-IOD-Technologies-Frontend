export type TStatus =
  | "Pendiente"
  | "Aprobado"
  | "Pendiente de aprobación"
  | "Pendiente de audiencia"
  | "Pendiente de colocación"
  | "Colocado";

export interface DataRow {
  id: string;
  name: string;
  email: string;
  address: string;
  status: TStatus;
}
