import { AxiosError } from "axios";
import client from "../api/Client";
import {
  IContractValidityResponse,
  IRenewalRequest,
  IRenewalResponse,
} from "../interfaces/administration.interface";

/**
 * Servicio para gestionar la vigencia de contratos
 * Encapsula todas las llamadas HTTP relacionadas con contratos
 */
class ContractService {
  /**
   * Obtiene la información de vigencia actual del contrato
   * GET /clients/:id/vigencia
   *
   * @param clientId - ID del cliente
   * @returns Información de vigencia del contrato
   * @throws Error si la solicitud falla
   */
  async getContractValidity(
    clientId: number
  ): Promise<IContractValidityResponse> {
    try {
      const response = await client.get<IContractValidityResponse>(
        `/clients/${clientId}/vigencia`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Renueva un contrato agregando meses adicionales
   * PUT /clients/:id/renovar-contrato
   *
   * @param clientId - ID del cliente
   * @param request - Datos de renovación (meses, documento, fecha)
   * @returns Información de renovación realizada
   * @throws Error si la solicitud falla
   */
  async renewContract(
    clientId: number,
    request: IRenewalRequest
  ): Promise<IRenewalResponse> {
    try {
      const response = await client.put<IRenewalResponse>(
        `/clients/${clientId}/renovar-contrato`,
        request,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores de axios
   * Extrae el mensaje de error y lo lanza como una excepción
   *
   * @param error - Error de axios o desconocido
   * @throws Error con mensaje descriptivo
   */
  private handleError(error: unknown): never {
    if (error instanceof Error) {
      throw error;
    }

    if (typeof error === "object" && error !== null) {
      const axiosError = error as AxiosError<any>;

      if (axiosError.isAxiosError) {
        const message =
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          "Error desconocido";

        throw new Error(message);
      }
    }

    throw new Error("Error desconocido en el servicio de contratos");
  }
}

// Exportar instancia única del servicio
export const contractService = new ContractService();
