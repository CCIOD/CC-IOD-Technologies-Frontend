export type UserRole =
  | 'Administrador'
  | 'Director'
  | 'Administrativo'
  | 'Seguimiento'
  | 'Contador'
  | 'Monitorista';

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

export interface PinForm {
  email: string;
  pin: string;
}
