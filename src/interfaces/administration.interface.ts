import { SelectableItem } from "./interfaces";

// Tipos de venta
export type TSaleType = "Contado" | "Crédito";

export const saleTypeValues: SelectableItem[] = [
  { id: 1, name: "Contado" },
  { id: 2, name: "Crédito" },
];

// Estado de pago
export type TPaymentStatus = "Pendiente" | "Pagado" | "Vencido" | "Parcial";

export const paymentStatusValues: SelectableItem[] = [
  { id: 1, name: "Pendiente" },
  { id: 2, name: "Pagado" },
  { id: 3, name: "Vencido" },
  { id: 4, name: "Parcial" },
];

// Interfaz para un pago individual del plan de pagos
export interface IPaymentPlanItem {
  payment_id?: number;
  payment_number: number; // Número de pago (1, 2, 3...)
  scheduled_amount: number; // Importe a pagar
  scheduled_date: string; // Fecha de pago programada
  paid_amount?: number; // Importe pagado
  actual_payment_date?: string; // Fecha de pago real
  travel_expenses?: number; // Pago de viáticos
  travel_expenses_date?: string; // Fecha de pago de viáticos
  other_expenses?: number; // Otros gastos
  other_expenses_description?: string; // Descripción de otros gastos
  other_expenses_date?: string; // Fecha de otros gastos
  payment_status?: TPaymentStatus; // Estado del pago
  notes?: string; // Notas adicionales
  created_at?: string;
  updated_at?: string;
}

// Interfaz para el estado de cuenta del cliente
export interface IAccountStatement {
  total_sales: number; // Ventas totales
  total_paid: number; // Total de abonos
  pending_balance: number; // Adeudo pendiente
  total_travel_expenses: number; // Total de viáticos
  total_other_expenses: number; // Total de otros gastos
  next_payment_date?: string; // Próxima fecha de pago
  next_payment_amount?: number; // Próximo monto a pagar
  overdue_payments: number; // Número de pagos vencidos
  overdue_amount: number; // Monto vencido
}

// Interfaz para datos administrativos del cliente
export interface IAdministrationClient {
  id: number;
  contract_number?: string;
  client_name: string; // Nombre del cliente (defendant_name)
  defendant_name: string;
  criminal_case: string;
  court_name?: string; // Nombre del juzgado
  judge_name?: string; // Nombre del juez
  lawyer_name?: string; // Nombre del abogado
  signer_name?: string; // Nombre del firmante
  prospect_id?: number; // ID del prospecto
  investigation_file_number?: number; // Número de expediente
  placement_date: string; // Fecha de colocación
  contract_date?: string; // Fecha del contrato
  contract_duration?: string; // Periodo de contratación (meses)
  payment_frequency?: string; // Frecuencia de pago
  payment_day?: number; // Día de pago
  registered_at?: string; // Fecha de registro
  contact_numbers: Array<{
    contact_name: string;
    phone_number: string;
    relationship_id?: number | null;
    relationship_name?: string | null;
  }>;
  observations?: Array<{
    date: string;
    observation: string;
  }>;
  invoice_file?: string; // Archivo de factura
  contract_file?: string; // Archivo de contrato
  account_statement?: IAccountStatement | string; // Estado de cuenta
  payment_plan?: IPaymentPlanItem[]; // Plan de pagos
  status: string;
  bracelet_type?: string;
  // Campos calculados
  days_to_expiration?: number; // Días para vencimiento
  months_remaining?: number; // Meses restantes
  total_contract_amount?: number; // Monto total del contrato
}

// Formulario de administración del cliente
export interface IAdministrationForm {
  contract_number?: string;
  defendant_name: string;
  criminal_case: string;
  placement_date: string;
  contract_date?: string;
  contract_duration?: string;
  payment_frequency?: string;
  payment_day?: number;
  total_contract_amount?: number;
  payment_plan?: IPaymentPlanItem[];
  invoice_file?: string;
  contract_file?: string;
  court_name?: string;
  judge_name?: string;
  lawyer_name?: string;
  signer_name?: string;
  contact_numbers: Array<{
    contact_name: string;
    phone_number: string;
    relationship_id?: number | null;
    relationship_name?: string | null;
  }>;
  observations?: Array<{
    date: string;
    observation: string;
  }>;
}

// Interfaz para contratos por vencer
export interface IExpiringContract {
  id: number;
  nombre: string;
  numeroContrato: string;
  estado: string;
  fechaColocacion: string;
  duracion: string;
  fechaVencimiento: string;
  diasRestantes?: { days: number };
  diasVencido?: { days: number };
}

// Interfaz para las métricas del dashboard
export interface IDashboardMetrics {
  pagosPendientes?: {
    cantidad: number;
    total: number;
  };
  pagosVencidos?: {
    cantidad: number;
    adeudo: number;
  };
  contratosPorVencer?: {
    vencidos: number;
    proximos30Dias: number;
  };
  ingresosDelMes?: {
    total: number;
    cantidadPagos: number;
  };
  resumen?: {
    totalClientesActivos: number;
    adeudoTotalPendiente: number;
  };
  pagosProgramadosSemana?: {
    cantidad: number;
    monto: number;
  };
  clientesPorTipoVenta?: {
    Contado: number;
    Crédito: number;
  };
  ultimosPagos?: any[];
  clientesMayorAdeudo?: any[];
  contratosVencidosDetalle?: IExpiringContract[];
  contratosProximosVencer?: IExpiringContract[];
  fechaActualizacion?: string;
}

// Interfaz para filtros de la tabla
export interface IAdministrationFilters {
  sale_type?: TSaleType | "Todos";
  payment_status?: TPaymentStatus | "Todos";
  client_status?: 
    | "Pendiente de aprobación"
    | "Pendiente de audiencia"
    | "Pendiente de colocación"
    | "Colocado"
    | "Desinstalado"
    | "Cancelado"
    | "Todos";
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Datos para la fila de la tabla
export interface DataRowAdministration extends IAdministrationClient {
  // Campos adicionales para la tabla si son necesarios
}
