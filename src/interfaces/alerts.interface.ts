export type AlertStatus = 'activa' | 'desactivada';

export interface IAlertProtocol {
  protocol_id: number;
  alert_type: string;
  label: string;
  message_template: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IAlertAuditEntry {
  audit_id: number;
  action_type: 'CREATE' | 'UPDATE' | 'DEACTIVATE' | 'REPORT' | 'REPORT_UPDATE';
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  user_id: number | null;
  user_name: string | null;
  ip_address?: string | null;
  created_at: string;
}

export interface IAlert {
  alert_id: number;
  alert_type: string;
  protocol_id: number | null;
  protocol_label?: string;
  carrier_id: number | null;
  client_id: number | null;
  subject_name?: string | null;
  subject_status?: string | null;
  bracelet_serial?: string | null;
  authority_whatsapp?: string | null;
  authority_email?: string | null;
  zona_inclusion: string | null;
  zona_exclusion: string | null;
  house_arrest: string | null;
  correa: string | null;
  info_operativa: string | null;
  generated_message: string;
  status: AlertStatus;
  activated_at: string;
  activated_by: number;
  activated_by_name?: string;
  deactivated_at: string | null;
  deactivated_by: number | null;
  deactivated_by_name?: string;
  reported_to_authority: boolean;
  reported_at: string | null;
  reported_by: number | null;
  reported_by_name?: string;
  report_document: string | null;
  locked: boolean;
  is_locked?: boolean; // alias devuelto por GET /alerts/:id
  audit_log?: IAlertAuditEntry[];
}

export interface IAlertCreateForm {
  alert_type: string;
  carrier_id?: number | null;
  client_id?: number | null;
  zona_inclusion?: string;
  zona_exclusion?: string;
  house_arrest?: string;
  correa?: string;
  info_operativa?: string;
}

export interface IAlertEditForm {
  zona_inclusion?: string;
  zona_exclusion?: string;
  house_arrest?: string;
  correa?: string;
  info_operativa?: string;
}

export interface IAlertListResponse {
  success: boolean;
  data: IAlert[];
  total: number;
  limit: number;
  offset: number;
}
