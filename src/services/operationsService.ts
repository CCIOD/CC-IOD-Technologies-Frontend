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
export const updateOperationFromApi = async (
  id: number,
  formData: FormData
) => {
  try {
    console.log(formData);

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
