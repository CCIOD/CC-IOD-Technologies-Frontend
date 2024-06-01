export type UserRole = "Administrador" | "Director" | "Administrativo";
export interface UserForm {
  email: string;
  password: string;
}
export interface UserProfile {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}
