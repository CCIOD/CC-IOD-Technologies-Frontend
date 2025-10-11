import { AxiosError } from "axios";
import client from "../api/Client";
import { ApiResponse } from "../interfaces/interfaces";

// Obtener todas las renovaciones de un cliente
export const getRenewalsByClient = async (clientId: number) => {
  try {
    const response = await client.get<ApiResponse>(`/renewals/client/${clientId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};

// Obtener una renovación específica
export const getRenewalById = async (renewalId: number) => {
  try {
    const response = await client.get<ApiResponse>(`/renewals/${renewalId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};

// Crear una nueva renovación
export const createRenewal = async (data: FormData) => {
  try {
    const response = await client.post<ApiResponse>("/renewals", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};

// Actualizar una renovación
export const updateRenewal = async (renewalId: number, data: FormData) => {
  try {
    const response = await client.put<ApiResponse>(
      `/renewals/${renewalId}`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};

// Eliminar una renovación
export const deleteRenewal = async (renewalId: number) => {
  try {
    const response = await client.delete<ApiResponse>(`/renewals/${renewalId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};

// Obtener todas las renovaciones (solo admin)
export const getAllRenewals = async () => {
  try {
    const response = await client.get<ApiResponse>("/renewals");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};
