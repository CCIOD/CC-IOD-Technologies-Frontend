import { AxiosError } from "axios";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import client from "../api/Client";
import { ApiResponse } from "../interfaces/interfaces";
import { PinForm, UserForm, UserProfile } from "../interfaces/auth.interfaces";

const unwrapError = (error: unknown): never => {
  const axiosError = error as AxiosError;
  throw axiosError?.isAxiosError
    ? (axiosError.response?.data as any) || axiosError.message
    : error;
};

export const loginUserAPI = async (user: UserForm) => {
  try {
    const response = await client.post<ApiResponse<UserProfile>>(
      "auth/login",
      user
    );
    return response.data;
  } catch (error) {
    return unwrapError(error);
  }
};

export const loginUserWithPinAPI = async (form: PinForm) => {
  try {
    const response = await client.post<ApiResponse<UserProfile>>(
      "auth/login-pin",
      form
    );
    return response.data;
  } catch (error) {
    return unwrapError(error);
  }
};

export const setPinAPI = async (pin: string) => {
  try {
    const response = await client.put<ApiResponse>("auth/pin", { pin });
    return response.data;
  } catch (error) {
    return unwrapError(error);
  }
};

export const deletePinAPI = async () => {
  try {
    const response = await client.delete<ApiResponse>("auth/pin");
    return response.data;
  } catch (error) {
    return unwrapError(error);
  }
};

// =============================================================================
// Firma personal
// =============================================================================

export const getMySignatureAPI = async () => {
  try {
    const r = await client.get<ApiResponse<{ signature_url: string | null }>>(
      "auth/signature",
    );
    return r.data;
  } catch (error) {
    return unwrapError(error);
  }
};

/**
 * Guarda la firma como dataURL (image/png;base64,...).
 */
export const setSignatureAPI = async (signature: string) => {
  try {
    const r = await client.put<ApiResponse<{ signature_url: string }>>(
      "auth/signature",
      { signature },
    );
    return r.data;
  } catch (error) {
    return unwrapError(error);
  }
};

export const deleteSignatureAPI = async () => {
  try {
    const r = await client.delete<ApiResponse>("auth/signature");
    return r.data;
  } catch (error) {
    return unwrapError(error);
  }
};

// =============================================================================
// WebAuthn — orquesta el handshake con el autenticador del dispositivo.
// =============================================================================

export const webauthnRegisterAPI = async (deviceLabel?: string) => {
  let opts;
  try {
    opts = await client.post<ApiResponse<any>>("auth/webauthn/register-options", {});
  } catch (error) {
    return unwrapError(error);
  }

  let attestation;
  try {
    attestation = await startRegistration({
      optionsJSON: opts.data.data as any,
    });
  } catch (e: any) {
    // Errores típicos del navegador / autenticador
    const name = e?.name || "";
    const msg = (e?.message || "").toLowerCase();
    if (name === "NotAllowedError" || msg.includes("cancel") || msg.includes("not allowed")) {
      throw { success: false, message: "Cancelaste el prompt del autenticador o expiró el tiempo." };
    }
    if (name === "InvalidStateError") {
      throw { success: false, message: "Este autenticador ya está registrado en tu cuenta." };
    }
    if (name === "NotSupportedError") {
      throw {
        success: false,
        message:
          "Este equipo no tiene un autenticador compatible (huella, Windows Hello, Touch ID o llave de seguridad).",
      };
    }
    if (name === "SecurityError") {
      throw {
        success: false,
        message:
          "Error de seguridad. Verifica que el sitio se sirve desde HTTPS y que el dominio coincide con la configuración del backend.",
      };
    }
    throw { success: false, message: `WebAuthn falló: ${e?.message || name || "error desconocido"}` };
  }

  try {
    const verify = await client.post<ApiResponse>("auth/webauthn/register-verify", {
      response: attestation,
      deviceLabel,
    });
    return verify.data;
  } catch (error) {
    return unwrapError(error);
  }
};

export const webauthnLoginAPI = async (email: string) => {
  let opts;
  try {
    opts = await client.post<ApiResponse<any>>(
      "auth/webauthn/login-options",
      { email }
    );
  } catch (error) {
    return unwrapError(error);
  }

  let assertion;
  try {
    assertion = await startAuthentication({
      optionsJSON: opts.data.data as any,
    });
  } catch (e: any) {
    const name = e?.name || "";
    if (name === "NotAllowedError") {
      throw { success: false, message: "Cancelaste el prompt o expiró el tiempo." };
    }
    if (name === "NotSupportedError") {
      throw {
        success: false,
        message: "Este equipo no tiene autenticador compatible.",
      };
    }
    if (name === "SecurityError") {
      throw {
        success: false,
        message:
          "Error de seguridad. Verifica HTTPS y que el dominio coincida con el RP_ID del backend.",
      };
    }
    throw { success: false, message: `WebAuthn falló: ${e?.message || name}` };
  }

  try {
    const verify = await client.post<ApiResponse<UserProfile>>(
      "auth/webauthn/login-verify",
      { email, response: assertion }
    );
    return verify.data;
  } catch (error) {
    return unwrapError(error);
  }
};

export const listWebauthnCredentialsAPI = async () => {
  try {
    const response = await client.get<ApiResponse<any[]>>("auth/webauthn/credentials");
    return response.data;
  } catch (error) {
    return unwrapError(error);
  }
};

export const deleteWebauthnCredentialAPI = async (credentialId: string) => {
  try {
    const response = await client.delete<ApiResponse>(
      `auth/webauthn/credentials/${encodeURIComponent(credentialId)}`
    );
    return response.data;
  } catch (error) {
    return unwrapError(error);
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
