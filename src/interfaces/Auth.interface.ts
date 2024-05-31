export interface UserForm {
  email: string;
  password: string;
}
export interface UserProfile {
  userId: number;
  name: string;
  email: string;
  role: "Administrador" | "Administrativo";
}
export interface RecoveryForm {
  email: string;
}

export interface ForgetForm {
  password: string;
}