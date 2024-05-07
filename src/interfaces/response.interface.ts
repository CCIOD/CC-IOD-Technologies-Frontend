export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  token?: string;
  message: string;
}
