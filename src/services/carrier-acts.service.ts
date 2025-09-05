import client from "../api/Client";
import { ICarrierAct, ICarrierActForm, ICarrierActsResponse, ICarrierActUploadResponse } from "../interfaces/carrier-acts.interface";

export const carrierActsService = {
  // Subir una nueva acta
  async uploadCarrierAct(carrierId: number, actData: ICarrierActForm): Promise<ICarrierActUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('act_title', actData.act_title);
      formData.append('act_description', actData.act_description);
      
      if (actData.act_document) {
        formData.append('act_document', actData.act_document);
      }

      console.log('Uploading to carrier:', carrierId);
      console.log('FormData entries:', Array.from(formData.entries()));

      // Usar el cliente axios configurado que maneja automáticamente la autenticación
      const response = await client.post(`/carrier-acts/carrier/${carrierId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', response.data);
      
      // Axios ya maneja los errores HTTP, así que si llegamos aquí es que fue exitoso
      return response.data;
    } catch (error: unknown) {
      console.error('Error uploading carrier act:', error);
      
      // Mejorar el manejo de errores de axios
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
        if (axiosError.response) {
          // El servidor respondió con un código de error
          const errorMessage = axiosError.response.data?.message || `Error del servidor: ${axiosError.response.status}`;
          throw new Error(errorMessage);
        }
      } else if (error && typeof error === 'object' && 'request' in error) {
        // La petición se hizo pero no hubo respuesta
        throw new Error('No se pudo conectar con el servidor');
      }
      
      // Error en la configuración de la petición o error desconocido
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar la petición';
      throw new Error(errorMessage);
    }
  },

  // Obtener actas de un portador específico
  async getCarrierActs(carrierId: number): Promise<ICarrierAct[]> {
    try {
      const response = await client.get<ICarrierActsResponse>(`/carrier-acts/carrier/${carrierId}`);
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'Error al obtener las actas');
      }
    } catch (error) {
      console.error('Error fetching carrier acts:', error);
      throw error;
    }
  },

  // Eliminar un acta
  async deleteCarrierAct(actId: number): Promise<boolean> {
    try {
      const response = await client.delete(`/carrier-acts/${actId}`);
      
      return response.data.success || true;
    } catch (error) {
      console.error('Error deleting carrier act:', error);
      throw error;
    }
  },

  // Obtener todas las actas del sistema
  async getAllCarrierActs(): Promise<ICarrierAct[]> {
    try {
      const response = await client.get<ICarrierActsResponse>('/carrier-acts/');
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'Error al obtener todas las actas');
      }
    } catch (error) {
      console.error('Error fetching all carrier acts:', error);
      throw error;
    }
  }
};
