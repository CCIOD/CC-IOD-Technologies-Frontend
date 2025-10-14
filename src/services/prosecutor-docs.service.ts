import { AxiosError } from "axios";
import client from "../api/Client";
import { ApiResponse } from "../interfaces/interfaces";

// Obtener todos los documentos de fiscalía de un cliente
export const getProsecutorDocsByClient = async (clientId: number) => {
  try {
    const response = await client.get<ApiResponse>(`/prosecutor-docs/client/${clientId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};

// Obtener un documento específico
export const getProsecutorDocById = async (docId: number) => {
  try {
    const response = await client.get<ApiResponse>(`/prosecutor-docs/${docId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};

// Crear un nuevo documento
export const createProsecutorDoc = async (data: FormData) => {
  try {
    const response = await client.post<ApiResponse>("/prosecutor-docs", data, {
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

// Actualizar un documento
export const updateProsecutorDoc = async (docId: number, data: FormData) => {
  try {
    const response = await client.put<ApiResponse>(
      `/prosecutor-docs/${docId}`,
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

// Eliminar un documento
export const deleteProsecutorDoc = async (docId: number) => {
  try {
    const response = await client.delete<ApiResponse>(`/prosecutor-docs/${docId}`);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};

// Obtener todos los documentos (solo admin)
export const getAllProsecutorDocs = async () => {
  try {
    const response = await client.get<ApiResponse>("/prosecutor-docs");
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};
