import { AxiosError } from "axios";
import client from "../api/Client";
import { ApiResponse } from "../interfaces/interfaces";

const unwrap = (error: unknown): never => {
  const axiosError = error as AxiosError;
  throw axiosError?.isAxiosError
    ? (axiosError.response?.data as ApiResponse) || axiosError.message
    : error;
};

export interface IWeeklyReportAttachment {
  attachment_id: number;
  file_url: string;
  filename: string;
  mime_type: string | null;
  caption: string | null;
  section: "mensajes" | "recorrido" | "evidencia";
  display_order: number;
}

export type WeeklyReportType = "full" | "reported-only";

export interface IWeeklyReport {
  weekly_report_id: number;
  period_from: string;
  period_to: string;
  title: string | null;
  summary: string | null;
  carrier_id: number | null;
  folio: string | null;
  state_code: string | null;
  subject_name: string | null;
  bracelet_serial: string | null;
  installation_date: string | null;
  installation_location: string | null;
  total_alerts: number;
  reported_alerts: number;
  unreported_alerts: number;
  report_document: string;
  report_type?: WeeklyReportType;
  generated_at: string;
  generated_by: number;
  generated_by_name?: string;
  attachments?: IWeeklyReportAttachment[];
}

export interface IGenerateWeeklyReportForm {
  carrier_id: number;
  period_from: string;
  period_to: string;
  title?: string;
  summary?: string;
  state_code?: string;
  report_type?: WeeklyReportType;
}

export interface IWeeklyReportListResponse {
  success: boolean;
  data: IWeeklyReport[];
  total: number;
  limit: number;
  offset: number;
}

export const generateWeeklyReportAPI = async (form: IGenerateWeeklyReportForm) => {
  try {
    const r = await client.post<ApiResponse<IWeeklyReport>>(
      "weekly-reports/generate",
      form,
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const listWeeklyReportsAPI = async (params?: {
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    const r = await client.get<IWeeklyReportListResponse>("weekly-reports", {
      params,
    });
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const getWeeklyReportAPI = async (id: number) => {
  try {
    const r = await client.get<ApiResponse<IWeeklyReport>>(`weekly-reports/${id}`);
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const deleteWeeklyReportAPI = async (id: number) => {
  try {
    const r = await client.delete<ApiResponse>(`weekly-reports/${id}`);
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const regenerateWeeklyReportAPI = async (id: number) => {
  try {
    const r = await client.post<ApiResponse<IWeeklyReport>>(
      `weekly-reports/${id}/regenerate`,
      {}
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const uploadAttachmentsAPI = async (
  id: number,
  files: File[],
  section: "mensajes" | "recorrido" | "evidencia",
  caption?: string,
) => {
  try {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));
    form.append("section", section);
    if (caption) form.append("caption", caption);
    const r = await client.post<ApiResponse<IWeeklyReportAttachment[]>>(
      `weekly-reports/${id}/attachments`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const deleteAttachmentAPI = async (id: number, attachmentId: number) => {
  try {
    const r = await client.delete<ApiResponse>(
      `weekly-reports/${id}/attachments/${attachmentId}`,
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};
