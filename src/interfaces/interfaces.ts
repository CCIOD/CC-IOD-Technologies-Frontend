export interface SelectableItem {
  id: number | string;
  name: string;
  status?: string;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  token?: string;
  message: string;
}

export type TRelationship = "Familiar" | "Abogado";

export const relationshipValues: SelectableItem[] = [
  { id: 1, name: "Familiar" },
  { id: 2, name: "Abogado" },
];
