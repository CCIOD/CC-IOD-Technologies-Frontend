import { AxiosError } from "axios";
import client from "../api/Client";
import { ApiResponse } from "../interfaces/interfaces";
import {
  IAlert,
  IAlertAuditEntry,
  IAlertCreateForm,
  IAlertEditForm,
  IAlertListResponse,
  IAlertProtocol,
} from "../interfaces/alerts.interface";

const unwrap = (error: unknown): never => {
  const axiosError = error as AxiosError;
  throw axiosError?.isAxiosError
    ? (axiosError.response?.data as ApiResponse) || axiosError.message
    : error;
};

// ---------------------------------------------------------------------------
// Alertas
// ---------------------------------------------------------------------------

export interface IAlertListFilters {
  status?: "activa" | "desactivada";
  alert_type?: string;
  reported?: boolean;
  carrier_id?: number;
  client_id?: number;
  activated_by?: number;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export const listAlertsAPI = async (filters: IAlertListFilters = {}) => {
  try {
    const r = await client.get<IAlertListResponse>("alerts", { params: filters });
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const getAlertAPI = async (id: number) => {
  try {
    const r = await client.get<ApiResponse<IAlert>>(`alerts/${id}`);
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const createAlertAPI = async (form: IAlertCreateForm) => {
  try {
    const r = await client.post<ApiResponse<IAlert>>("alerts", form);
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const updateAlertAPI = async (id: number, form: IAlertEditForm) => {
  try {
    const r = await client.put<ApiResponse<IAlert>>(`alerts/${id}`, form);
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const deactivateAlertAPI = async (id: number) => {
  try {
    const r = await client.put<ApiResponse<IAlert>>(`alerts/${id}/deactivate`);
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

/**
 * Genera un PDF preview del oficio para que el monitorista lo revise.
 * No marca la alerta como reportada.
 */
export const previewAlertReportAPI = async (id: number, images: File[] = []) => {
  try {
    const formData = new FormData();
    images.forEach((f) => formData.append("images", f));
    const r = await client.post<
      ApiResponse<{
        preview_url: string;
        attachment_urls: string[];
        attachments_count: number;
      }>
    >(`alerts/${id}/report/preview`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

/**
 * Confirma el reporte. El backend genera el folio real, regenera el PDF
 * definitivo usando los anexos ya subidos en el preview, y bloquea la alerta.
 */
export const confirmAlertReportAPI = async (
  id: number,
  attachment_urls: string[],
) => {
  try {
    const r = await client.post<ApiResponse<IAlert & { folio?: string }>>(
      `alerts/${id}/report`,
      { attachment_urls },
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

/**
 * Atajo legado: reporta directo sin paso de preview (sube imágenes y bloquea).
 * Mantengo el export por si alguien lo usa, pero el flujo recomendado es
 * previewAlertReportAPI + confirmAlertReportAPI.
 */
export const reportAlertAPI = async (id: number, images: File[] = []) => {
  try {
    const formData = new FormData();
    images.forEach((f) => formData.append("images", f));
    const r = await client.post<ApiResponse<IAlert & { folio?: string }>>(
      `alerts/${id}/report`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

// ---------------------------------------------------------------------------
// Bitácora
// ---------------------------------------------------------------------------

export interface IAlertAuditFilters {
  alert_id?: number;
  user_id?: number;
  action_type?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface IAlertAuditListResponse {
  success: boolean;
  data: (IAlertAuditEntry & {
    alert_id: number;
    alert_type?: string;
    alert_status?: string;
    reported_to_authority?: boolean;
  })[];
  total: number;
  limit: number;
  offset: number;
}

export const listAlertAuditAPI = async (filters: IAlertAuditFilters = {}) => {
  try {
    const r = await client.get<IAlertAuditListResponse>("alerts/audit", {
      params: filters,
    });
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

// ---------------------------------------------------------------------------
// Protocolos / plantillas
// ---------------------------------------------------------------------------

export interface IAlertProtocolListResponse {
  success: boolean;
  data: IAlertProtocol[];
  available_variables: string[];
}

export const listAlertProtocolsAPI = async () => {
  try {
    const r = await client.get<IAlertProtocolListResponse>("alert-protocols");
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const createAlertProtocolAPI = async (
  data: Omit<IAlertProtocol, "protocol_id" | "created_at" | "updated_at">
) => {
  try {
    const r = await client.post<ApiResponse<IAlertProtocol>>(
      "alert-protocols",
      data
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const updateAlertProtocolAPI = async (
  id: number,
  data: Partial<Omit<IAlertProtocol, "protocol_id">>
) => {
  try {
    const r = await client.put<ApiResponse<IAlertProtocol>>(
      `alert-protocols/${id}`,
      data
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const deleteAlertProtocolAPI = async (id: number) => {
  try {
    const r = await client.delete<ApiResponse>(`alert-protocols/${id}`);
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};
