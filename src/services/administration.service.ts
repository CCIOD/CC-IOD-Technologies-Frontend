import client from "../api/Client";
import {
  IAdministrationClient,
  IAdministrationForm,
  IDashboardMetrics,
  IPaymentPlanItem,
} from "../interfaces/administration.interface";
import { ApiResponse } from "../interfaces/interfaces";

// ============================================
// DASHBOARD ENDPOINTS
// ============================================

/**
 * Obtener resumen del dashboard
 */
export const getDashboardSummary = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await client.get("/administration/dashboard/summary");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Obtener métricas del dashboard
 */
export const getDashboardMetrics = async (): Promise<
  ApiResponse<IDashboardMetrics>
> => {
  try {
    const response = await client.get("/administration/dashboard/metrics");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// ============================================
// CLIENTS ENDPOINTS
// ============================================

/**
 * Obtener todos los clientes para administración
 */
export const getAdministrationClients = async (): Promise<
  ApiResponse<IAdministrationClient[]>
> => {
  try {
    const response = await client.get("/administration/clients");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Obtener un cliente específico para administración
 */
export const getAdministrationClientById = async (
  id: number
): Promise<ApiResponse<IAdministrationClient>> => {
  try {
    const response = await client.get(`/administration/clients/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Crear un nuevo cliente en administración
 */
export const createAdministrationClient = async (
  data: Partial<IAdministrationForm>
): Promise<ApiResponse<IAdministrationClient>> => {
  try {
    const response = await client.post("/administration/clients", data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Actualizar información administrativa del cliente
 */
export const updateAdministrationClient = async (
  id: number,
  data: Partial<IAdministrationForm>
): Promise<ApiResponse<IAdministrationClient>> => {
  try {
    const response = await client.put(`/administration/clients/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Eliminar un cliente de administración
 */
export const deleteAdministrationClient = async (
  id: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await client.delete(`/administration/clients/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// ============================================
// PAYMENTS ENDPOINTS
// ============================================

/**
 * Obtener plan de pagos de un cliente
 */
export const getClientPayments = async (
  clientId: number
): Promise<ApiResponse<IPaymentPlanItem[]>> => {
  try {
    const response = await client.get(
      `/administration/clients/${clientId}/payments`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Crear pagos para un cliente
 */
export const createClientPayments = async (
  clientId: number,
  paymentPlan: IPaymentPlanItem[]
): Promise<ApiResponse<IPaymentPlanItem[]>> => {
  try {
    const response = await client.post(
      `/administration/clients/${clientId}/payments`,
      { payments: paymentPlan }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Actualizar un pago específico
 */
export const updatePayment = async (
  paymentId: number,
  paymentData: Partial<IPaymentPlanItem>
): Promise<ApiResponse<IPaymentPlanItem>> => {
  try {
    const response = await client.put(
      `/administration/payments/${paymentId}`,
      paymentData
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Eliminar un pago
 */
export const deletePayment = async (
  paymentId: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await client.delete(`/administration/payments/${paymentId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Crear o actualizar plan de pagos (mantener compatibilidad)
 * @deprecated Usar createClientPayments o updatePayment individualmente
 */
export const updatePaymentPlan = async (
  clientId: number,
  paymentPlan: IPaymentPlanItem[]
): Promise<ApiResponse<IPaymentPlanItem[]>> => {
  try {
    // Si los pagos tienen IDs, actualizar individualmente
    // Si no, crear todos
    const hasIds = paymentPlan.some((p) => p.payment_id);

    if (hasIds) {
      // Actualizar pagos existentes
      const updatePromises: Promise<any>[] = paymentPlan
        .filter((p) => p.payment_id)
        .map((payment) =>
          updatePayment(payment.payment_id!, payment)
        );

      // Crear nuevos pagos
      const newPayments = paymentPlan.filter((p) => !p.payment_id);
      if (newPayments.length > 0) {
        updatePromises.push(createClientPayments(clientId, newPayments));
      }

      await Promise.all(updatePromises);
      
      // Recargar pagos actualizados
      return await getClientPayments(clientId);
    } else {
      // Crear todos los pagos
      return await createClientPayments(clientId, paymentPlan);
    }
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Registrar un pago (mantener compatibilidad)
 * @deprecated Usar updatePayment directamente
 */
export const registerPayment = async (
  _clientId: number,
  paymentId: number,
  paymentData: Partial<IPaymentPlanItem>
): Promise<ApiResponse<IPaymentPlanItem>> => {
  return updatePayment(paymentId, paymentData);
};

// ============================================
// FILES ENDPOINTS
// ============================================

/**
 * Obtener archivos de un cliente
 */
export const getClientFiles = async (
  clientId: number
): Promise<ApiResponse<any[]>> => {
  try {
    const response = await client.get(
      `/administration/clients/${clientId}/files`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Subir archivos para un cliente (facturas, contratos, etc.)
 */
export const uploadClientFiles = async (
  clientId: number,
  files: File[],
  fileType?: string
): Promise<ApiResponse<any[]>> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    if (fileType) {
      formData.append("file_type", fileType);
    }

    const response = await client.post(
      `/administration/clients/${clientId}/files`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Eliminar un archivo
 */
export const deleteFile = async (fileId: number): Promise<ApiResponse<void>> => {
  try {
    const response = await client.delete(`/administration/files/${fileId}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Subir archivo de factura (mantener compatibilidad)
 * @deprecated Usar uploadClientFiles con fileType="invoice"
 */
export const uploadInvoice = async (
  clientId: number,
  file: File
): Promise<ApiResponse<{ invoice_file: string }>> => {
  try {
    const response = await uploadClientFiles(clientId, [file], "invoice");
    return {
      success: response.success,
      message: response.message,
      data: { invoice_file: response.data?.[0]?.file_url || "" },
    };
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

// ============================================
// LEGACY/HELPER ENDPOINTS (si son necesarios)
// ============================================

/**
 * Obtener estado de cuenta del cliente
 */
export const getClientAccountStatement = async (
  clientId: number
): Promise<ApiResponse<any>> => {
  try {
    // Este endpoint puede ser parte de dashboard/summary o clients/:id
    // Ajustar según implementación del backend
    const response = await client.get(
      `/administration/clients/${clientId}/account-statement`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Obtener clientes con pagos pendientes
 */
export const getClientsPendingPayments = async (): Promise<
  ApiResponse<IAdministrationClient[]>
> => {
  try {
    // Este puede ser parte de dashboard/summary o un filtro en /clients
    const response = await client.get("/administration/clients?status=pending");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

/**
 * Obtener clientes con contratos próximos a vencer
 */
export const getClientsExpiringContracts = async (
  days: number = 30
): Promise<ApiResponse<IAdministrationClient[]>> => {
  try {
    // Este puede ser parte de dashboard/summary o un filtro en /clients
    const response = await client.get(
      `/administration/clients?expiring=${days}`
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
