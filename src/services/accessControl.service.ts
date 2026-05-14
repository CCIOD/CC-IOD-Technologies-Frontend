import { AxiosError } from "axios";
import client from "../api/Client";
import { ApiResponse } from "../interfaces/interfaces";

const unwrap = (error: unknown): never => {
  const axiosError = error as AxiosError;
  throw axiosError?.isAxiosError
    ? (axiosError.response?.data as any) || axiosError.message
    : error;
};

export interface IIpWhitelist {
  ip_whitelist_id: number;
  cidr: string;
  label: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IAuthorizedDevice {
  device_id: number;
  device_token: string;
  label: string;
  user_id: number | null;
  user_name?: string | null;
  user_email?: string | null;
  is_active: boolean;
  last_seen_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IAccessAttempt {
  attempt_id: number;
  user_id: number | null;
  user_name?: string | null;
  email: string | null;
  ip_address: string | null;
  device_token: string | null;
  user_agent: string | null;
  method: "password" | "pin" | "webauthn";
  outcome:
    | "success"
    | "denied_password"
    | "denied_pin"
    | "denied_ip"
    | "denied_device"
    | "denied_user"
    | "denied_webauthn";
  failure_reason: string | null;
  attempted_at: string;
}

// ----- IP Whitelist -----

export const listIpWhitelistAPI = async () => {
  try {
    const r = await client.get<ApiResponse<IIpWhitelist[]>>(
      "access-control/ip-whitelist"
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const createIpWhitelistAPI = async (data: Omit<IIpWhitelist, "ip_whitelist_id">) => {
  try {
    const r = await client.post<ApiResponse<IIpWhitelist>>(
      "access-control/ip-whitelist",
      data
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const updateIpWhitelistAPI = async (
  id: number,
  data: Partial<Omit<IIpWhitelist, "ip_whitelist_id">>
) => {
  try {
    const r = await client.put<ApiResponse<IIpWhitelist>>(
      `access-control/ip-whitelist/${id}`,
      data
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const deleteIpWhitelistAPI = async (id: number) => {
  try {
    const r = await client.delete<ApiResponse>(`access-control/ip-whitelist/${id}`);
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

// ----- Devices -----

export const listDevicesAPI = async () => {
  try {
    const r = await client.get<ApiResponse<IAuthorizedDevice[]>>(
      "access-control/devices"
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const createDeviceAPI = async (data: {
  device_token: string;
  label: string;
  user_id?: number | null;
  is_active?: boolean;
}) => {
  try {
    const r = await client.post<ApiResponse<IAuthorizedDevice>>(
      "access-control/devices",
      data
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const updateDeviceAPI = async (
  id: number,
  data: Partial<{
    device_token: string;
    label: string;
    user_id: number | null;
    is_active: boolean;
  }>
) => {
  try {
    const r = await client.put<ApiResponse<IAuthorizedDevice>>(
      `access-control/devices/${id}`,
      data
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const deleteDeviceAPI = async (id: number) => {
  try {
    const r = await client.delete<ApiResponse>(`access-control/devices/${id}`);
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

// ----- Attempts (read-only) -----

export interface AttemptsResponse {
  success: boolean;
  data: IAccessAttempt[];
  total: number;
  limit: number;
  offset: number;
}

export const listAttemptsAPI = async (params?: {
  outcome?: string;
  method?: string;
  email?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    const r = await client.get<AttemptsResponse>("access-control/attempts", {
      params,
    });
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

// ----- Reporte por monitorista -----

export interface IMonitoristaReportRow {
  user_id: number;
  name: string;
  email: string;
  total_logins: number;
  last_login_at: string | null;
  last_method: "password" | "pin" | "webauthn" | null;
  last_ip: string | null;
  last_device_token: string | null;
  failed_in_range: number;
}

export const listMonitoristasReportAPI = async (params?: {
  from?: string;
  to?: string;
}) => {
  try {
    const r = await client.get<ApiResponse<IMonitoristaReportRow[]>>(
      "access-control/monitoristas-report",
      { params },
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export interface IMonitoristaSession {
  attempt_id: number;
  ip_address: string | null;
  device_token: string | null;
  user_agent: string | null;
  method: "password" | "pin" | "webauthn";
  outcome: string;
  failure_reason: string | null;
  attempted_at: string;
}

export interface IMonitoristaSessionsResponse {
  success: boolean;
  data: IMonitoristaSession[];
  total: number;
  limit: number;
  offset: number;
}

export const listMonitoristaSessionsAPI = async (
  userId: number,
  params?: {
    outcome?: string;
    method?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  },
) => {
  try {
    const r = await client.get<IMonitoristaSessionsResponse>(
      `access-control/monitoristas/${userId}/sessions`,
      { params },
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};
