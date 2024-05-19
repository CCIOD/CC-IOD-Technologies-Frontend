import { AxiosError } from "axios";
import { ApiResponse } from "../interfaces/response.interface";
import client from "../api/Client";

export const getAllOperationsFromApi = async () => {
  try {
    const response = await client.get<ApiResponse>("operations");

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};
export const getOperationByIdFromApi = async (id: number) => {
  try {
    const response = await client.get<ApiResponse>(`operations/${id}`);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};
export const updateOperationFromApi = async (
  id: number,
  formData: FormData
) => {
  try {
    const response = await client.put<ApiResponse>(
      `operations/${id}`,
      formData,
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
export const deleteFileFromApi = async (
  id: number,
  file: "contract" | "installation_report"
) => {
  try {
    const response = await client.put<ApiResponse>(
      `operations/delete-file/${id}`,
      { file },
      {
        headers: {
          "Content-Type": "application/json",
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
