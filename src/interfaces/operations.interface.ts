export interface DataRowOperations {
  id: string;
  name: string;
  contract: string;
  installation_report: string;
}

export interface IOperationForm {
  contract: string | null;
  installation_report: string | null;
}
