import { useState } from "react";
import { Button } from "../generic/Button";
import { Alert } from "../generic/Alert";
import { formatDateDisplay, addMonthsToDate } from "../../utils/format";
import { FaCheck, FaTimes, FaFile } from "react-icons/fa";
import "./RenewalModal.css";

interface RenewalModalProps {
  daysRemaining: number;
  currentExpirationDate: string;
  onConfirm: (months: number, documentFile?: File, renewalAmount?: number, paymentFrequency?: string) => Promise<void>;
  onClose: () => void;
}

/**
 * Modal para solicitar cantidad de meses a renovar
 * Valida entrada y muestra previsualización de nueva fecha de vencimiento
 */
export const RenewalModal = ({
  daysRemaining,
  currentExpirationDate,
  onConfirm,
  onClose,
}: RenewalModalProps) => {
  const [monthsNew, setMonthsNew] = useState(6);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [renewalAmount, setRenewalAmount] = useState<string>("");
  const [paymentFrequency, setPaymentFrequency] = useState<string>("Mensual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Valida y confirma la renovación
   */
  const handleConfirm = async () => {
    // Validaciones
    if (monthsNew < 1 || monthsNew > 12) {
      setError("Los meses deben estar entre 1 y 12");
      return;
    }

    if (monthsNew % 1 !== 0) {
      setError("Los meses deben ser un número entero");
      return;
    }

    const amount = parseFloat(renewalAmount);
    if (renewalAmount && (isNaN(amount) || amount < 0)) {
      setError("El monto de renovación debe ser un número válido mayor o igual a 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(monthsNew, documentFile || undefined, renewalAmount ? amount : undefined, paymentFrequency);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error desconocido al renovar";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcula la nueva fecha de vencimiento
   */
  const calculateNewExpirationDate = (): string => {
    const currentDate = new Date(currentExpirationDate);
    const newDate = addMonthsToDate(currentDate, monthsNew);
    return formatDateDisplay(newDate);
  };

  /**
   * Calcula aproximadamente los días que se agregarán
   */
  const calculateAddedDays = (): number => {
    return Math.round((monthsNew * 365) / 12);
  };

  /**
   * Convierte días a meses y días
   */
  const convertDaysToMonthsAndDays = (totalDays: number): string => {
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;
    if (months === 0) return `${days} días`;
    if (days === 0) return `${months} meses`;
    return `${months} meses ${days} días`;
  };

  return (
    <div className="renewal-modal-content">
      {/* Información actual */}
      <div className="current-info">
        <h4 className="info-title">Información actual</h4>
        <div className="info-grid">
          <div className="info-item">
            <label className="info-label">Días restantes</label>
            <p className="info-value">{daysRemaining} días</p>
          </div>
          <div className="info-item">
            <label className="info-label">Fecha actual de vencimiento</label>
            <p className="info-value">{formatDateDisplay(currentExpirationDate)}</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="renewal-form">
        <div className="form-group">
          <label htmlFor="monthsNew" className="form-label">
            Meses a renovar *
          </label>
          <input
            id="monthsNew"
            type="number"
            min="1"
            max="12"
            step="1"
            value={monthsNew}
            onChange={(e) => {
              setMonthsNew(Number(e.target.value));
              setError(null);
            }}
            className="form-input"
            disabled={loading}
          />
          <small className="form-hint">
            Ingresa un número entre 1 y 12 meses
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="renewalAmount" className="form-label">
            Monto de Renovación *
          </label>
          <input
            id="renewalAmount"
            type="number"
            min="0"
            step="0.01"
            value={renewalAmount}
            onChange={(e) => {
              setRenewalAmount(e.target.value);
              setError(null);
            }}
            className="form-input"
            disabled={loading}
            placeholder="0.00"
          />
          <small className="form-hint">
            Ingresa el monto de la renovación
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="paymentFrequency" className="form-label">
            Frecuencia de Pago *
          </label>
          <select
            id="paymentFrequency"
            value={paymentFrequency}
            onChange={(e) => {
              setPaymentFrequency(e.target.value);
              setError(null);
            }}
            className="form-input"
            disabled={loading}
          >
            <option value="Mensual">Mensual</option>
            <option value="Bimestral">Bimestral</option>
            <option value="Trimestral">Trimestral</option>
            <option value="Semestral">Semestral</option>
            <option value="Contado">Contado</option>
          </select>
          <small className="form-hint">
            Selecciona la frecuencia de pago
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="documentFile" className="form-label">
            Documento de Renovación (PDF) - Opcional
          </label>
          <div className="file-input-wrapper">
            <input
              id="documentFile"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setDocumentFile(file || null);
                setError(null);
              }}
              className="form-input-file"
              disabled={loading}
            />
            {documentFile && (
              <div className="file-selected">
                <FaFile className="file-icon" />
                <span>{documentFile.name}</span>
              </div>
            )}
          </div>
          <small className="form-hint">
            Selecciona un archivo PDF, DOC o DOCX de tu equipo
          </small>
        </div>

        {/* Previsualización */}
        <div className="preview-section">
          <h4 className="preview-title">Previsualización</h4>
          <div className="preview-grid">
            <div className="preview-item">
              <label className="preview-label">Tiempo actual</label>
              <p className="preview-value">{convertDaysToMonthsAndDays(daysRemaining)}</p>
            </div>
            <div className="preview-operator">+</div>
            <div className="preview-item">
              <label className="preview-label">Meses nuevos</label>
              <p className="preview-value">{monthsNew} meses</p>
            </div>
            <div className="preview-operator">=</div>
            <div className="preview-item result">
              <label className="preview-label">Aproximadamente</label>
              <p className="preview-value">
                {convertDaysToMonthsAndDays(daysRemaining + calculateAddedDays())}
              </p>
            </div>
          </div>

          <div className="new-expiration">
            <label className="expiration-label">
              Nueva fecha de vencimiento
            </label>
            <p className="expiration-value">
              {calculateNewExpirationDate()}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert text1={`Error: ${error}`} color="red" />
        )}
      </div>

      {/* Botones */}
      <div className="modal-footer">
        <Button
          onClick={onClose}
          color="gray"
          type="button"
        >
          <FaTimes /> Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          color="theme"
          spinner={loading}
          type="button"
        >
          <FaCheck /> Confirmar Renovación
        </Button>
      </div>
    </div>
  );
};
