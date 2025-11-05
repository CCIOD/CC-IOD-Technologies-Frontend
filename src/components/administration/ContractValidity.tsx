import { useState, useEffect, useContext } from "react";
import { IContractValidity } from "../../interfaces/administration.interface";
import { contractService } from "../../services/contract.service";
import { Alert } from "../generic/Alert";
import { Button } from "../generic/Button";
import { Spinner } from "../generic/Spinner";
import { RenewalModal } from "./RenewalModal";
import { formatDateDisplay } from "../../utils/format";
import { FaSync, FaHandshake } from "react-icons/fa";
import { AuthContext } from "../../context/AuthContext";
import "./ContractValidity.css";

interface ContractValidityProps {
  clientId: number;
  onRenewalSuccess?: () => void;
}

/**
 * Componente para mostrar y gestionar la vigencia de un contrato
 * Displays contract validity information and allows renewals
 */
export const ContractValidity = ({
  clientId,
  onRenewalSuccess,
}: ContractValidityProps) => {
  const { user } = useContext(AuthContext);
  const [validity, setValidity] = useState<IContractValidity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [renewalError, setRenewalError] = useState<string | null>(null);

  // Cargar datos de vigencia al montar
  useEffect(() => {
    fetchContractValidity();
  }, [clientId]);

  /**
   * Obtiene la información de vigencia actual del contrato
   */
  const fetchContractValidity = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contractService.getContractValidity(clientId);
      setValidity(response.data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al cargar la vigencia del contrato";
      setError(message);
      console.error("Error fetching contract validity:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refrescar datos de vigencia (botón de actualizar)
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchContractValidity();
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Maneja la renovación del contrato
   */
  const handleRenew = async (
    monthsNew: number,
    documentFile?: File
  ): Promise<void> => {
    try {
      setRenewalError(null);
      
      // Si hay un archivo, simular su carga (en producción sería a Azure Storage)
      let documentUrl: string | undefined;
      if (documentFile) {
        // En una implementación real, aquí se subiría el archivo a Azure Storage
        // y se obtendría la URL
        documentUrl = documentFile.name; // Por ahora, usar el nombre del archivo como placeholder
      }
      
      const response = await contractService.renewContract(clientId, {
        months_new: monthsNew,
        renewal_document_url: documentUrl,
      });

      // Actualizar datos locales con la nueva información
      if (validity) {
        setValidity({
          ...validity,
          expiration_date: response.data.new_expiration_date,
          months_contracted: response.data.total_months_contracted,
          days_remaining: response.data.days_remaining,
          last_renewal: {
            renewal_date: response.data.renewal_date,
            months_added: response.data.months_added,
          },
        });
      }

      // Cerrar modal
      setShowRenewalModal(false);

      // Llamar callback si existe
      if (onRenewalSuccess) {
        onRenewalSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al renovar el contrato";
      setRenewalError(message);
      console.error("Error renewing contract:", err);
    }
  };

  /**
   * Obtener clase CSS para el estado del contrato
   */
  const getStatusClass = (): string => {
    if (!validity) return "status-neutral";
    if (validity.days_remaining > 90) return "status-green";
    if (validity.days_remaining > 30) return "status-yellow";
    return "status-red";
  };

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="contract-validity-container">
        <Spinner />
      </div>
    );
  }

  // Renderizar error
  if (error) {
    return (
      <div className="contract-validity-container">
        <Alert text1={`Error: ${error}`} color="red" />
        <Button onClick={handleRefresh} color="gray" size="sm">
          Reintentar
        </Button>
      </div>
    );
  }

  // Renderizar contenido
  if (!validity) {
    return (
      <div className="contract-validity-container">
        <Alert text1="No hay información de vigencia disponible" color="yellow" />
      </div>
    );
  }

  return (
    <div className="contract-validity-container">
      <div className="contract-validity-card">
        {/* Header con título y botón refrescar */}
        <div className="card-header">
          <h3 className="card-title">Vigencia del Contrato</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="refresh-button"
            title="Actualizar vigencia"
          >
            <FaSync className={refreshing ? "spinning" : ""} />
          </button>
        </div>

        {/* Información del contrato */}
        <div className="contract-info">
          <div className="info-row">
            <div className="info-field">
              <label className="field-label">Fecha de colocación</label>
              <p className="field-value">
                {validity.placement_date ? formatDateDisplay(validity.placement_date) : "N/A"}
              </p>
            </div>
            <div className="info-field">
              <label className="field-label">Fecha del contrato</label>
              <p className="field-value">
                {validity.contract_date ? formatDateDisplay(validity.contract_date) : "N/A"}
              </p>
            </div>
          </div>

          <div className="info-row">
            <div className="info-field">
              <label className="field-label">Duración inicial</label>
              <p className="field-value">{validity.contract_duration ? `${validity.contract_duration} meses` : "N/A"}</p>
            </div>
            <div className="info-field">
              <label className="field-label">Meses contratados</label>
              <p className="field-value">{validity.months_contracted ? `${validity.months_contracted} meses` : "N/A"}</p>
            </div>
          </div>

          <div className="info-row">
            <div className="info-field">
              <label className="field-label">Fecha de vencimiento</label>
              <p className="field-value">
                {validity.expiration_date ? formatDateDisplay(validity.expiration_date) : "N/A"}
              </p>
            </div>
            <div className="info-field">
              <label className="field-label">Días restantes</label>
              <p className={`field-value days-remaining ${getStatusClass()}`}>
                {validity.days_remaining ? `${validity.days_remaining} días` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Estado del contrato */}
        {validity.is_active ? (
          <div className="contract-status active">
            <div className="status-indicator active"></div>
            <span className="status-text">Contrato vigente</span>
          </div>
        ) : (
          <div className="contract-status expired">
            <div className="status-indicator expired"></div>
            <span className="status-text">Contrato vencido</span>
          </div>
        )}

        {/* Información de última renovación */}
        {validity.last_renewal && (
          <div className="last-renewal-section">
            <h4 className="section-title">Última renovación</h4>
            <div className="renewal-info">
              <div className="info-row">
                <div className="info-field">
                  <label className="field-label">Fecha de renovación</label>
                  <p className="field-value">
                    {formatDateDisplay(validity.last_renewal.renewal_date)}
                  </p>
                </div>
                <div className="info-field">
                  <label className="field-label">Meses agregados</label>
                  <p className="field-value">
                    {validity.last_renewal.months_added} meses
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error de renovación */}
        {renewalError && (
          <Alert text1={`Error en renovación: ${renewalError}`} color="red" />
        )}

        {/* Botones de acción */}
        <div className="action-buttons">
          {validity.is_active && validity.days_remaining > 0 && (
            <Button
              onClick={() => setShowRenewalModal(true)}
              color="theme"
            >
              <FaHandshake /> Renovar Contrato
            </Button>
          )}
          {(!validity.is_active || validity.days_remaining <= 0) && (
            <div className="expired-contract-alert">
              <Alert text1="⚠️ El contrato ha vencido o no está activo." color="yellow" />
              {user?.role === "Administrador" && (
                <Button
                  onClick={() => setShowRenewalModal(true)}
                  color="theme"
                >
                  <FaHandshake /> Renovar Contrato
                </Button>
              )}
              {user?.role !== "Administrador" && (
                <Alert text1="Contacte con administración para renovarlo." color="yellow" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de renovación */}
      {showRenewalModal && validity && validity.days_remaining && (
        <RenewalModal
          daysRemaining={validity.days_remaining}
          currentExpirationDate={validity.expiration_date}
          onConfirm={handleRenew}
          onClose={() => setShowRenewalModal(false)}
        />
      )}
    </div>
  );
};
