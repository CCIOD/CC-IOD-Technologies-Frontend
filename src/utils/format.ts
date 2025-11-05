export const formatTime12to24 = (time: string): string => {
  const [timeWithoutPeriod, period] = time.split(" ");
  let hours = timeWithoutPeriod.split(":")[0];
  const minutes = timeWithoutPeriod.split(":")[1];

  if (period === "PM" && hours !== "12") hours = String(Number(hours) + 12);
  if (period === "AM" && hours === "12") hours = "00";
  return `${hours}:${minutes}`;
};

export const formatDate = (date: string) =>
  new Date(date).toISOString().split("T")[0];

/**
 * Calcula el tiempo restante del contrato basado en la fecha de colocación y duración
 * @param placementDate - Fecha de colocación/instalación (ISO string)
 * @param contractDuration - Duración del contrato en meses (string)
 * @returns Objeto con meses restantes, días restantes y estado
 */
export const calculateContractTimeRemaining = (
  placementDate: string,
  contractDuration: string | undefined
): {
  monthsRemaining: number;
  daysRemaining: number;
  totalDaysRemaining: number;
  status: 'active' | 'expired' | 'warning' | 'unknown';
  displayText: string;
} => {
  // Validar entrada - debe tener ambos valores y no ser cadenas vacías
  if (!placementDate || placementDate === '' || !contractDuration || contractDuration === '') {
    return {
      monthsRemaining: 0,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      status: 'unknown',
      displayText: 'No disponible'
    };
  }

  try {
    // Convertir duración a número (asumiendo que viene en formato "X meses" o solo número)
    const durationMatch = contractDuration.match(/(\d+)/);
    if (!durationMatch) {
      return {
        monthsRemaining: 0,
        daysRemaining: 0,
        totalDaysRemaining: 0,
        status: 'unknown',
        displayText: 'Sin duración'
      };
    }

    const durationMonths = parseInt(durationMatch[1]);
    
    // Validar que la duración sea un número válido mayor a 0
    if (isNaN(durationMonths) || durationMonths <= 0) {
      return {
        monthsRemaining: 0,
        daysRemaining: 0,
        totalDaysRemaining: 0,
        status: 'unknown',
        displayText: 'Duración inválida'
      };
    }
    
    // Fecha actual
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche
    
    // Fecha de colocación
    const placementDateObj = new Date(placementDate);
    placementDateObj.setHours(0, 0, 0, 0); // Normalizar a medianoche
    
    // Fecha de vencimiento (fecha colocación + duración en meses)
    const expirationDate = new Date(placementDateObj);
    expirationDate.setMonth(expirationDate.getMonth() + durationMonths);
    
    // Calcular diferencia en días entre hoy y la fecha de vencimiento
    const timeDiff = expirationDate.getTime() - today.getTime();
    const totalDaysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // Si ya expiró
    if (totalDaysRemaining <= 0) {
      const daysExpired = Math.abs(totalDaysRemaining);
      return {
        monthsRemaining: 0,
        daysRemaining: 0,
        totalDaysRemaining,
        status: 'expired',
        displayText: `Expirado hace ${daysExpired} día${daysExpired !== 1 ? 's' : ''}`
      };
    }
    
    // Calcular meses y días restantes de forma precisa
    // Usar la diferencia entre today y expirationDate
    let tempDate = new Date(today);
    let monthsRemaining = 0;
    
    // Contar cuántos meses completos caben
    while (true) {
      const nextMonth = new Date(tempDate);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      if (nextMonth <= expirationDate) {
        monthsRemaining++;
        tempDate = nextMonth;
      } else {
        break;
      }
    }
    
    // Los días restantes son la diferencia entre tempDate y expirationDate
    const daysRemaining = Math.ceil((expirationDate.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Determinar estado
    let status: 'active' | 'expired' | 'warning' | 'unknown' = 'active';
    if (totalDaysRemaining <= 30) {
      status = 'warning'; // Menos de 30 días
    }
    
    // Crear texto de visualización
    let displayText = '';
    if (monthsRemaining > 0) {
      displayText = `${monthsRemaining} mes${monthsRemaining !== 1 ? 'es' : ''}`;
      if (daysRemaining > 0) {
        displayText += ` ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}`;
      }
    } else {
      displayText = `${totalDaysRemaining} día${totalDaysRemaining !== 1 ? 's' : ''}`;
    }
    
    return {
      monthsRemaining,
      daysRemaining,
      totalDaysRemaining,
      status,
      displayText
    };
    
  } catch (error) {
    console.error('Error calculating contract time remaining:', error);
    return {
      monthsRemaining: 0,
      daysRemaining: 0,
      totalDaysRemaining: 0,
      status: 'unknown',
      displayText: 'Error de cálculo'
    };
  }
};

/**
 * Suma meses a una fecha
 * @param baseDate - Fecha base (Date o string en formato ISO)
 * @param months - Número de meses a sumar
 * @returns Nueva fecha con meses agregados
 */
export const addMonthsToDate = (baseDate: Date | string, months: number): Date => {
  const date = typeof baseDate === 'string' ? new Date(baseDate) : new Date(baseDate);
  date.setMonth(date.getMonth() + months);
  return date;
};

/**
 * Formatea una fecha para mostrar en español
 * @param date - Fecha a formatear (string ISO o Date)
 * @param locale - Locale para formato (default: 'es-ES')
 * @returns Fecha formateada en texto
 */
export const formatDateDisplay = (date: string | Date, locale = 'es-ES'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};
