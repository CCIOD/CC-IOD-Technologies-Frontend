import { AxiosError } from "axios";
import client from "../api/Client";
import { ApiResponse } from "../interfaces/interfaces";

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
export const getClient = async () => {
  try {
    const response = await client.get<ApiResponse>(
      "prospects/approved-without-client"
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};
