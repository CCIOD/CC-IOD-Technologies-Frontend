import { AxiosError } from "axios";
import client from "../api/Client";
import { ApiResponse } from "../interfaces/interfaces";

const unwrap = (error: unknown): never => {
  const axiosError = error as AxiosError;
  throw axiosError?.isAxiosError
    ? (axiosError.response?.data as ApiResponse) || axiosError.message
    : error;
};

export interface IFolderEntry {
  type: "folder";
  prefix: string;
  name: string;
}

export interface IFileEntry {
  type: "file";
  name: string;
  fullName: string;
  url: string;
  size: number;
  lastModified: string | null;
  contentType: string | null;
}

export type IDocEntry = IFolderEntry | IFileEntry;

export interface IDocsListResponse {
  success: boolean;
  data: IDocEntry[];
  prefix: string;
}

export const listDocsAPI = async (prefix = "") => {
  try {
    const r = await client.get<IDocsListResponse>("operations-docs", {
      params: { prefix },
    });
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const createDocFolderAPI = async (parent: string, name: string) => {
  try {
    const r = await client.post<ApiResponse<{ prefix: string }>>(
      "operations-docs/folder",
      { parent, name },
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const uploadDocsAPI = async (prefix: string, files: File[]) => {
  try {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const r = await client.post<ApiResponse<{ url: string; blobName: string }[]>>(
      "operations-docs/upload",
      form,
      {
        params: { prefix },
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const deleteDocFileAPI = async (blobName: string) => {
  try {
    const r = await client.delete<ApiResponse>("operations-docs/file", {
      data: { blobName },
    });
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};

export const deleteDocFolderAPI = async (prefix: string) => {
  try {
    const r = await client.delete<ApiResponse>("operations-docs/folder", {
      data: { prefix },
    });
    return r.data;
  } catch (e) {
    return unwrap(e);
  }
};
