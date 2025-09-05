export interface ICarrierAct {
  act_id: number;
  carrier_id: number;
  act_title: string;
  act_description?: string;
  act_document_url: string;
  uploaded_by: number;
  uploaded_by_name: string;
  upload_date: string;
  client_name?: string;
  contract_number?: string;
}

export interface ICarrierActForm {
  act_title: string;
  act_description: string;
  act_document: File | null;
}

export interface ICarrierActUploadResponse {
  success: boolean;
  message: string;
  data?: ICarrierAct;
}

export interface ICarrierActsResponse {
  success: boolean;
  message: string;
  data?: ICarrierAct[];
}
