import { SelectableItem } from "./interfaces";

export const userStatusValues: SelectableItem[] = [
  { id: 2, name: "Director" },
  { id: 3, name: "Administrativo" },
];

export interface DataRowUsers {
  id: number;
  name: string;
  email: string;
  role_name: string;
  password?: string;
  role_id: number;
}
export interface IUserForm {
  name: string;
  email: string;
  password?: string;
  role_id: number;
}
export interface IAdminForm {
  name: string;
  email: string;
}
export interface IPasswordForm {
  password: string;
}
