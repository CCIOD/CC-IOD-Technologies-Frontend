/**
 * Utilidades para cálculo y gestión de vigencia de contratos
 */

interface ContractValidityInfo {
  placementDate: string; // ISO date
  durationMonths: number | string;
  expirationDate?: string; // ISO date
  daysRemaining?: number;
  monthsRemaining?: number;
  isExpired?: boolean;
  isExpiringSoon?: boolean; // Menos de 30 días
}

interface RenewalInfo extends ContractValidityInfo {
  renewalDate: string;
  monthsAdded: number;
  newExpirationDate: string;
  totalMonths: number;
}

/**
 * Calcula la fecha de vencimiento basada en fecha de colocación y meses de duración
 * @param placementDate - Fecha de colocación (formato ISO)
 * @param durationMonths - Duración en meses (número o string)
 * @returns Fecha de vencimiento en formato ISO
 */
export const calculateExpirationDate = (
  placementDate: string,
  durationMonths: number | string
): string => {
  const months = typeof durationMonths === "string" 
    ? parseInt(durationMonths, 10) 
    : durationMonths;
    
  const date = new Date(placementDate);
  date.setMonth(date.getMonth() + months);
  
  return date.toISOString().split("T")[0]; // Retorna solo la fecha (YYYY-MM-DD)
};

/**
 * Calcula los días restantes hasta el vencimiento
 * @param expirationDate - Fecha de vencimiento (formato ISO)
 * @returns Número de días restantes (negativo si está vencido)
 */
export const calculateDaysRemaining = (expirationDate: string): number => {
  const expiration = new Date(expirationDate);
  const today = new Date();
  
  // Establecer la hora a medianoche para comparación correcta
  expiration.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Calcula los meses restantes aproximados
 * @param expirationDate - Fecha de vencimiento (formato ISO)
 * @returns Número de meses restantes (aproximado)
 */
export const calculateMonthsRemaining = (expirationDate: string): number => {
  const expiration = new Date(expirationDate);
  const today = new Date();
  
  const monthDiff = (expiration.getFullYear() - today.getFullYear()) * 12 
    + (expiration.getMonth() - today.getMonth());
  
  return Math.max(0, monthDiff);
};

/**
 * Obtiene información completa de vigencia del contrato
 * @param placementDate - Fecha de colocación (formato ISO)
 * @param durationMonths - Duración en meses
 * @returns Objeto con toda la información de vigencia
 */
export const getContractValidityInfo = (
  placementDate: string,
  durationMonths: number | string
): ContractValidityInfo => {
  const expirationDate = calculateExpirationDate(placementDate, durationMonths);
  const daysRemaining = calculateDaysRemaining(expirationDate);
  const monthsRemaining = calculateMonthsRemaining(expirationDate);
  
  return {
    placementDate,
    durationMonths: typeof durationMonths === "string" 
      ? parseInt(durationMonths, 10) 
      : durationMonths,
    expirationDate,
    daysRemaining,
    monthsRemaining,
    isExpired: daysRemaining < 0,
    isExpiringSoon: daysRemaining >= 0 && daysRemaining <= 30,
  };
};

/**
 * Calcula la información de renovación de contrato
 * @param currentExpirationDate - Fecha de vencimiento actual (formato ISO)
 * @param monthsToAdd - Meses a adicionar
 * @param placementDate - Fecha de colocación original
 * @param currentDurationMonths - Duración actual en meses
 * @returns Información de renovación con nuevas fechas
 */
export const calculateRenewalInfo = (
  currentExpirationDate: string,
  monthsToAdd: number,
  placementDate: string,
  currentDurationMonths: number | string
): RenewalInfo => {
  // Nueva fecha de vencimiento se calcula desde la fecha de vencimiento actual
  const newExpirationDate = new Date(currentExpirationDate);
  newExpirationDate.setMonth(newExpirationDate.getMonth() + monthsToAdd);
  const newExpirationDateStr = newExpirationDate.toISOString().split("T")[0];
  
  const currentMonths = typeof currentDurationMonths === "string"
    ? parseInt(currentDurationMonths, 10)
    : currentDurationMonths;
  
  const totalMonths = currentMonths + monthsToAdd;
  
  return {
    placementDate,
    durationMonths: currentMonths,
    expirationDate: currentExpirationDate,
    renewalDate: new Date().toISOString().split("T")[0],
    monthsAdded: monthsToAdd,
    newExpirationDate: newExpirationDateStr,
    totalMonths,
    daysRemaining: calculateDaysRemaining(newExpirationDateStr),
    monthsRemaining: calculateMonthsRemaining(newExpirationDateStr),
    isExpired: false,
    isExpiringSoon: false,
  };
};

/**
 * Formatea una fecha ISO para mostrar
 * @param dateStr - Fecha en formato ISO (YYYY-MM-DD)
 * @param locale - Locale para formateo (por defecto es-MX)
 * @returns Fecha formateada
 */
export const formatDisplayDate = (
  dateStr: string,
  locale: string = "es-MX"
): string => {
  if (!dateStr) return "";
  
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Determina el estado de vigencia del contrato
 * @param daysRemaining - Días restantes
 * @param isExpired - Si está vencido
 * @returns Estado formateado para mostrar
 */
export const getValidityStatus = (
  daysRemaining: number,
  isExpired: boolean
): { status: string; color: string } => {
  if (isExpired) {
    return {
      status: "Vencido",
      color: "text-red-600 bg-red-100",
    };
  }
  
  if (daysRemaining <= 0) {
    return {
      status: "Vencido",
      color: "text-red-600 bg-red-100",
    };
  }
  
  if (daysRemaining <= 30) {
    return {
      status: "Por vencer",
      color: "text-orange-600 bg-orange-100",
    };
  }
  
  if (daysRemaining <= 90) {
    return {
      status: "Próximo a vencer",
      color: "text-yellow-600 bg-yellow-100",
    };
  }
  
  return {
    status: "Vigente",
    color: "text-green-600 bg-green-100",
  };
};

/**
 * Valida si la fecha de colocación y duración son válidas
 * @param placementDate - Fecha de colocación
 * @param durationMonths - Duración en meses
 * @returns Objeto con validación y mensajes de error
 */
export const validateContractData = (
  placementDate: string,
  durationMonths: number | string
): { isValid: boolean; error?: string } => {
  if (!placementDate) {
    return {
      isValid: false,
      error: "La fecha de colocación es requerida",
    };
  }
  
  if (!durationMonths || (typeof durationMonths === "number" && durationMonths <= 0)) {
    return {
      isValid: false,
      error: "La duración en meses debe ser mayor a 0",
    };
  }
  
  const months = typeof durationMonths === "string"
    ? parseInt(durationMonths, 10)
    : durationMonths;
  
  if (isNaN(months)) {
    return {
      isValid: false,
      error: "La duración debe ser un número válido",
    };
  }
  
  return { isValid: true };
};

/**
 * Genera un mensaje de renovación
 * @param daysRemaining - Días restantes
 * @returns Mensaje formateado
 */
export const generateRenewalMessage = (daysRemaining: number): string => {
  const daysText = daysRemaining === 1 ? "día" : "días";
  return `Agrega los nuevos meses contratados. Tiempo restante actual: ${daysRemaining} ${daysText}.`;
};
