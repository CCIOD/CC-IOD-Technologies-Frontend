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
 * Calcula el tiempo restante del contrato basado en la fecha de instalación y duración
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
  // Validar entrada
  if (!placementDate || !contractDuration) {
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
        displayText: 'Duración inválida'
      };
    }

    const durationMonths = parseInt(durationMatch[1]);
    
    // Fecha actual
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche
    
    // Fecha de instalación
    const installationDate = new Date(placementDate);
    installationDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
    
    // Fecha de vencimiento (agregar meses a la fecha de instalación)
    const expirationDate = new Date(installationDate);
    expirationDate.setMonth(expirationDate.getMonth() + durationMonths);
    
    // Calcular diferencia en milisegundos
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
    
    // Calcular meses y días restantes
    const monthsRemaining = Math.floor(totalDaysRemaining / 30);
    const daysRemaining = totalDaysRemaining % 30;
    
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
