import { AxiosError } from "axios";
import { ApiResponse } from "../interfaces/response.interface";
import client from "../api/Client";

export const getAllClientsFromApi = async () => {
  try {
    const response = await client.get<ApiResponse>("clients");

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};
