import { useState, useEffect } from "react";
import { IContractValidity } from "../../interfaces/administration.interface";
import { contractService } from "../../services/contract.service";
import { updateRenewal, deleteRenewal } from "../../services/renewals.service";
import { Alert } from "../generic/Alert";
import { Button } from "../generic/Button";
import { Spinner } from "../generic/Spinner";
import { RenewalModal } from "./RenewalModal";
import { formatDateDisplay } from "../../utils/format";
import { FaSync, FaHandshake, FaEdit, FaTrash } from "react-icons/fa";
import { alertTimer } from "../../utils/alerts";
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
  const [validity, setValidity] = useState<IContractValidity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [renewalError, setRenewalError] = useState<string | null>(null);
  const [editingRenewal, setEditingRenewal] = useState<number | null>(null);
  const [editedRenewalData, setEditedRenewalData] = useState<any>({});
  const [savingRenewal, setSavingRenewal] = useState(false);
  const [deletingRenewal, setDeletingRenewal] = useState<number | null>(null);

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
   * Guardar cambios de renovación
   */
  const handleSaveRenewal = async () => {
    if (!editingRenewal || !editedRenewalData) return;
    
    try {
      setSavingRenewal(true);
      
      await updateRenewal(editingRenewal, {
        renewal_date: editedRenewalData.fechaRenovacion,
        renewal_duration: editedRenewalData.duracionRenovacion,
        renewal_amount: editedRenewalData.montoRenovacion,
        payment_frequency: editedRenewalData.frecuenciaPago,
        notes: editedRenewalData.notes || "",
      });

      alertTimer("Renovación actualizada correctamente", "success");
      
      // Recargar datos
      await fetchContractValidity();
      
      // Limpiar estado de edición
      setEditingRenewal(null);
      setEditedRenewalData({});
      
      // Llamar callback si existe
      if (onRenewalSuccess) {
        onRenewalSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al actualizar la renovación";
      alertTimer(message, "error");
      console.error("Error updating renewal:", err);
    } finally {
      setSavingRenewal(false);
    }
  };

  /**
   * Eliminar renovación
   */
  const handleDeleteRenewal = async (renewalId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta renovación?")) {
      return;
    }

    try {
      setDeletingRenewal(renewalId);
      
      await deleteRenewal(renewalId);

      alertTimer("Renovación eliminada correctamente", "success");
      
      // Recargar datos
      await fetchContractValidity();
      
      // Llamar callback si existe
      if (onRenewalSuccess) {
        onRenewalSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al eliminar la renovación";
      alertTimer(message, "error");
      console.error("Error deleting renewal:", err);
    } finally {
      setDeletingRenewal(null);
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

  /**
   * Convertir fecha ISO a formato YYYY-MM-DD para inputs de tipo date
   */
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
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

        {/* Información general */}
        <div className="contract-info">
          <div className="info-row">
            <div className="info-field">
              <label className="field-label">Fecha de colocación</label>
              <p className="field-value">
                {validity.placement_date ? formatDateDisplay(validity.placement_date) : "N/A"}
              </p>
            </div>
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

        {/* Contrato Original */}
        {validity.contratoOriginal && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-bold mb-3 app-text">📄 Contrato Original</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Número de Contrato</label>
                <p className="font-medium app-text">{validity.contratoOriginal.numeroContrato}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Fecha</label>
                <p className="font-medium app-text">{formatDateDisplay(validity.contratoOriginal.fechaContrato)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Frecuencia de Pago</label>
                <p className="font-medium app-text">{validity.contratoOriginal.frecuenciaPago}</p>
              </div>
            </div>
          </div>
        )}

        {/* Renovaciones */}
        {validity.renovaciones && validity.renovaciones.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-bold app-text">
                🔄 Renovaciones ({validity.totalRenovaciones})
              </h4>
            </div>
            
            <div className="space-y-3">
              {validity.renovaciones.map((renewal, index) => (
                <div 
                  key={renewal.id} 
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-bold app-text">Renovación #{index + 1}</h5>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (editingRenewal === renewal.id) {
                            setEditingRenewal(null);
                            setEditedRenewalData({});
                          } else {
                            setEditingRenewal(renewal.id);
                            setEditedRenewalData({
                              ...renewal,
                              fechaRenovacion: formatDateForInput(renewal.fechaRenovacion),
                            });
                          }
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        title="Editar renovación"
                        disabled={deletingRenewal === renewal.id}
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteRenewal(renewal.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        title="Eliminar renovación"
                        disabled={deletingRenewal === renewal.id || editingRenewal === renewal.id}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  {editingRenewal === renewal.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Fecha Renovación</label>
                        <input
                          type="date"
                          value={editedRenewalData.fechaRenovacion || ""}
                          onChange={(e) => setEditedRenewalData({...editedRenewalData, fechaRenovacion: e.target.value})}
                          className="w-full p-2 rounded border app-bg app-text text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Duración</label>
                        <input
                          type="text"
                          value={editedRenewalData.duracionRenovacion || ""}
                          onChange={(e) => setEditedRenewalData({...editedRenewalData, duracionRenovacion: e.target.value})}
                          className="w-full p-2 rounded border app-bg app-text text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Frecuencia de Pago</label>
                        <select
                          value={editedRenewalData.frecuenciaPago || ""}
                          onChange={(e) => setEditedRenewalData({...editedRenewalData, frecuenciaPago: e.target.value})}
                          className="w-full p-2 rounded border app-bg app-text text-sm"
                        >
                          <option value="">Seleccionar...</option>
                          <option value="Mensual">Mensual</option>
                          <option value="Bimestral">Bimestral</option>
                          <option value="Trimestral">Trimestral</option>
                          <option value="Semestral">Semestral</option>
                          <option value="Contado">Contado</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 lg:col-span-3 flex gap-2">
                        <Button
                          onClick={handleSaveRenewal}
                          color="green"
                          size="sm"
                        >
                          {savingRenewal ? "Guardando..." : "Guardar"}
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingRenewal(null);
                            setEditedRenewalData({});
                          }}
                          color="gray"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Fecha Renovación</label>
                        <p className="font-medium app-text text-sm">{formatDateDisplay(renewal.fechaRenovacion)}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Duración</label>
                        <p className="font-medium app-text text-sm">{renewal.duracionRenovacion}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Frecuencia de Pago</label>
                        <p className="font-medium app-text text-sm">{renewal.frecuenciaPago}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
              <Button
                onClick={() => setShowRenewalModal(true)}
                color="theme"
              >
                <FaHandshake /> Renovar Contrato
              </Button>
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
