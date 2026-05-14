import { AxiosError } from "axios";
import client from "../api/Client";
import { ApiResponse } from "../interfaces/interfaces";

const unwrap = (error: unknown): never => {
  const axiosError = error as AxiosError;
  throw axiosError?.isAxiosError
    ? (axiosError.response?.data as ApiResponse) || axiosError.message
    : error;
};

export type AuditSource = "clients" | "alerts" | "access";

export interface IUnifiedAuditEntry {
  source: AuditSource;
  action_type: string;
  user_id: number | null;
  user_name: string | null;
  subject_id: number | null;
  subject_label: string | null;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface IAuditUnifiedResponse {
  success: boolean;
  data: IUnifiedAuditEntry[];
  total: number;
  limit: number;
  offset: number;
  sources: AuditSource[];
}

export interface IAuditSummary {
  totals: {
    clients: number;
    alerts: number;
    access: number;
    access_denied: number;
    alerts_reported: number;
  };
  top_users: { user_id: number | null; name: string | null; events: string }[];
  per_day: { day: string; events: string }[];
}

export const listUnifiedAuditAPI = async (params?: {
  source?: string;
  from?: string;
  to?: string;
  user_id?: number;
  action_type?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    const r = await client.get<IAuditUnifiedResponse>("audit/unified", {
      params,
    });
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const getAuditSummaryAPI = async (params?: { from?: string; to?: string }) => {
  try {
    const r = await client.get<ApiResponse<IAuditSummary>>("audit/summary", {
      params,
    });
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};
