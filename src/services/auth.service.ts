import { AxiosError } from "axios";
import { UserForm, UserProfile } from "../interfaces/auth.interface";
import client from "../api/Client";
import { ApiResponse } from "../interfaces/interfaces";

export const loginUserAPI = async (user: UserForm) => {
  try {
    const response = await client.post<ApiResponse<UserProfile>>(
      "auth/login",
      user
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};
