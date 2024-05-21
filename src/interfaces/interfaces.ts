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
