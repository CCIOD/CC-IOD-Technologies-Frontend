import { AxiosError } from "axios";
import client from "../api/Client";
import { ApiResponse } from "../interfaces/interfaces";

export const getAllData = async (endpoint: string) => {
  try {
    const response = await client.get<ApiResponse>(endpoint);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};

export const getAllDataById = async (endpoint: string, id: number) => {
  try {
    const response = await client.get<ApiResponse>(`${endpoint}/${id}`);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};

export const updateData = async (
  endpoint: string,
  id: number,
  formData: FormData
) => {
  try {
    const response = await client.put<ApiResponse>(
      `${endpoint}/${id}`,
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

export const deleteData = async (
  endpoint: string,
  id: number,
  file?: "contract" | "installation_report"
) => {
  try {
    const response = await client.put<ApiResponse>(
      `${endpoint}/${id}`,
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
