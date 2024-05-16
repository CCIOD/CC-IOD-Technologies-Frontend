export interface DataRowOperations {
  id: number;
  name: string;
  contract: string;
  installation_report: string;
}

export interface IOperationForm {
  contract: File | null;
  installation_report: File | null;
}
