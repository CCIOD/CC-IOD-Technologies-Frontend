import { AxiosError } from "axios";
import client from "../api/Client";
import { ApiResponse } from "../interfaces/interfaces";
import { UserForm, UserProfile } from "../interfaces/auth.interfaces";

export const loginUserAPI = async (user: UserForm) => {
  try {
    const response = await client.post<ApiResponse<UserProfile>>(
      "auth/login",
      user
    );
    console.log(client);

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};
export const sendEmailAPI = async (email: string) => {
  try {
    const response = await client.put<ApiResponse<UserProfile>>(
      "auth/forgot-password",
      { email }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};
export const sendResetPasswordAPI = async (password: string, token: string) => {
  try {
    const response = await client.put<ApiResponse<UserProfile>>(
      `auth/reset-password/${token}`,
      { password }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw axiosError.isAxiosError
      ? axiosError.response?.data || axiosError.message
      : error;
  }
};
