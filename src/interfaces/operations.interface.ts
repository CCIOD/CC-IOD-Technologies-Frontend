export interface DataRowOperations {
  id: number;
  name: string;
  contract: string | null;
  installation_report: string | null;
}

export interface IOperationForm {
  contract: File | null;
  installation_report: File | null;
}
