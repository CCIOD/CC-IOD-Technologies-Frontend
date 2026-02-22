import { useState, useEffect } from "react";
import { IContractValidity } from "../../interfaces/administration.interface";
import { contractService } from "../../services/contract.service";
import { updateRenewal, deleteRenewal, updateRenewalDocument, deleteRenewalDocument } from "../../services/renewals.service";
import { Alert } from "../generic/Alert";
import { Button } from "../generic/Button";
import { Spinner } from "../generic/Spinner";
import { RenewalModal } from "./RenewalModal";
import { formatDateDisplay, addMonthsToDate } from "../../utils/format";
import { FaSync, FaHandshake, FaEdit, FaTrash, FaDownload, FaFileAlt, FaExclamationCircle, FaUpload } from "react-icons/fa";
import { alertTimer } from "../../utils/alerts";
import "./ContractValidity.css";

interface ContractValidityProps {
  clientId: number;
  clientName?: string;
  onRenewalSuccess?: () => void;
}

/**
 * Componente para mostrar y gestionar la vigencia de un contrato
 * Displays contract validity information and allows renewals
 */
export const ContractValidity = ({
  clientId,
  clientName,
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
  const [uploadingDocument, setUploadingDocument] = useState<number | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<number | null>(null);
  const [updatingDocRenewal, setUpdatingDocRenewal] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ [key: number]: File | null }>({});

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
    documentFile?: File,
    renewalAmount?: number,
    paymentFrequency?: string
  ): Promise<void> => {
    try {
      setRenewalError(null);

      await contractService.renewContract(clientId, {
        months_new: monthsNew,
        renewal_document: documentFile,
        renewal_date: validity?.expiration_date || new Date().toISOString().split('T')[0],
        renewal_amount: renewalAmount,
        payment_frequency: paymentFrequency,
      });

      // Cerrar modal
      setShowRenewalModal(false);

      // Recargar los datos de vigencia desde el servidor
      await fetchContractValidity();

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
   * Maneja la carga de un documento de renovación
   */
  const handleUploadDocument = async (renewalId: number) => {
    const file = selectedFile[renewalId];

    if (!file) {
      alertTimer("Por favor selecciona un archivo", "error");
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alertTimer("Tipo de archivo no permitido. Solo PDF, DOC, DOCX, JPG, PNG", "error");
      return;
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alertTimer("El archivo no debe superar 10MB", "error");
      return;
    }

    try {
      setUploadingDocument(renewalId);

      await updateRenewalDocument(clientId, renewalId, file);

      alertTimer("Documento subido correctamente", "success");

      // Limpiar archivo seleccionado
      setSelectedFile(prev => ({ ...prev, [renewalId]: null }));

      // Recargar datos
      await fetchContractValidity();

      // Limpiar modo actualización
      setUpdatingDocRenewal(null);

      // Llamar callback si existe
      if (onRenewalSuccess) {
        onRenewalSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al subir el documento";
      alertTimer(message, "error");
      console.error("Error uploading document:", err);
    } finally {
      setUploadingDocument(null);
    }
  };

  /**
   * Elimina el documento de una renovación
   */
  const handleDeleteRenewalDocument = async (renewalId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar el documento de esta renovación?")) {
      return;
    }

    try {
      setDeletingDocument(renewalId);

      await deleteRenewalDocument(clientId, renewalId);

      alertTimer("Documento eliminado correctamente", "success");

      // Recargar datos
      await fetchContractValidity();

      if (onRenewalSuccess) {
        onRenewalSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al eliminar el documento";
      alertTimer(message, "error");
      console.error("Error deleting document:", err);
    } finally {
      setDeletingDocument(null);
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
          <div>
            <h3 className="card-title">Vigencia del Contrato</h3>
            {clientName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Cliente: <span className="font-semibold text-gray-800 dark:text-gray-200">{clientName}</span>
              </p>
            )}
          </div>
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
                <label className="text-xs text-gray-600 dark:text-gray-400">Fecha de Colocación</label>
                <p className="font-medium app-text">{formatDateDisplay(validity.placement_date)}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Duración Contratada</label>
                <p className="font-medium app-text">{validity.contract_duration || validity.months_contracted || 'N/A'} meses</p>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Fecha de Vencimiento</label>
                <p className="font-medium app-text">
                  {validity.contract_duration || validity.months_contracted
                    ? formatDateDisplay(addMonthsToDate(validity.placement_date, Number(validity.contract_duration || validity.months_contracted)))
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Frecuencia de Pago</label>
                <p className="font-medium app-text">{validity.contratoOriginal.frecuenciaPago}</p>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Monto Original</label>
                <p className="font-bold text-blue-600 dark:text-blue-400">
                  ${parseFloat(String(validity.contratoOriginal.montoOriginal || 0)).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Pagado</label>
                <p className="font-bold text-green-600 dark:text-green-400">
                  ${parseFloat(String(validity.contratoOriginal.montoPagado || 0)).toFixed(2)}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400">Pendiente</label>
                <p className="font-bold text-red-600 dark:text-red-400">
                  ${parseFloat(String(validity.contratoOriginal.montoPendiente || 0)).toFixed(2)}
                </p>
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
                          onChange={(e) => setEditedRenewalData({ ...editedRenewalData, fechaRenovacion: e.target.value })}
                          className="w-full p-2 rounded border app-bg app-text text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Duración</label>
                        <input
                          type="text"
                          value={editedRenewalData.duracionRenovacion || ""}
                          onChange={(e) => setEditedRenewalData({ ...editedRenewalData, duracionRenovacion: e.target.value })}
                          className="w-full p-2 rounded border app-bg app-text text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Frecuencia de Pago</label>
                        <select
                          value={editedRenewalData.frecuenciaPago || ""}
                          onChange={(e) => setEditedRenewalData({ ...editedRenewalData, frecuenciaPago: e.target.value })}
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
                        <p className="font-medium app-text text-sm">{renewal.duracionRenovacion || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Fecha de Vencimiento</label>
                        <p className="font-medium app-text text-sm">
                          {(() => {
                            if (!renewal.duracionRenovacion) return 'N/A';
                            const durationMatch = renewal.duracionRenovacion.match(/(\d+)/);
                            const months = durationMatch ? parseInt(durationMatch[0]) : 0;
                            return months > 0
                              ? formatDateDisplay(addMonthsToDate(renewal.fechaRenovacion, months))
                              : 'N/A';
                          })()}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Frecuencia de Pago</label>
                        <p className="font-medium app-text text-sm">{renewal.frecuenciaPago}</p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Monto Renovación</label>
                        <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                          ${parseFloat(String(renewal.montoRenovacion || 0)).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400">Pagado</label>
                        <p className="font-bold text-green-600 dark:text-green-400 text-sm">
                          ${parseFloat(String(renewal.montoPagado || 0)).toFixed(2)}
                        </p>
                      </div>
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="text-xs text-gray-600 dark:text-gray-400 block mb-2">Documento de Renovación</label>
                        {renewal.urlDescarga ? (
                          <div className="space-y-3">
                            {updatingDocRenewal === renewal.id ? (
                              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setSelectedFile(prev => ({ ...prev, [renewal.id]: file }));
                                  }}
                                  disabled={uploadingDocument === renewal.id}
                                  className="block w-full sm:w-auto text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                                />
                                <button
                                  onClick={() => handleUploadDocument(renewal.id)}
                                  disabled={!selectedFile[renewal.id] || uploadingDocument === renewal.id}
                                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm ${!selectedFile[renewal.id] || uploadingDocument === renewal.id
                                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                      : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white hover:shadow-md'
                                    }`}
                                >
                                  <FaUpload className="text-base" />
                                  <span>{uploadingDocument === renewal.id ? 'Subiendo...' : 'Guardar'}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setUpdatingDocRenewal(null);
                                    setSelectedFile(prev => ({ ...prev, [renewal.id]: null }));
                                  }}
                                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 transition-colors duration-200"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2 items-center">
                                <a
                                  href={renewal.urlDescarga}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                                >
                                  <FaDownload className="text-base" />
                                  <span>Descargar Documento</span>
                                  <FaFileAlt className="text-base" />
                                </a>
                                <button
                                  onClick={() => setUpdatingDocRenewal(renewal.id)}
                                  disabled={deletingDocument === renewal.id}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                                  title="Actualizar documento"
                                >
                                  <FaUpload className="text-base" />
                                  <span>Actualizar</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteRenewalDocument(renewal.id)}
                                  disabled={deletingDocument === renewal.id}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
                                  title="Eliminar documento"
                                >
                                  <FaTrash className="text-base" />
                                  <span>{deletingDocument === renewal.id ? 'Eliminando...' : 'Eliminar'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-sm font-medium rounded-lg border border-yellow-300 dark:border-yellow-700">
                              <FaExclamationCircle className="text-base" />
                              <span>Documento no disponible, por favor súbelo</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  setSelectedFile(prev => ({ ...prev, [renewal.id]: file }));
                                }}
                                disabled={uploadingDocument === renewal.id}
                                className="block w-full sm:w-auto text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                              />
                              <button
                                onClick={() => handleUploadDocument(renewal.id)}
                                disabled={!selectedFile[renewal.id] || uploadingDocument === renewal.id}
                                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm ${!selectedFile[renewal.id] || uploadingDocument === renewal.id
                                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                  : 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white hover:shadow-md'
                                  }`}
                              >
                                <FaUpload className="text-base" />
                                <span>{uploadingDocument === renewal.id ? 'Subiendo...' : 'Subir Documento'}</span>
                              </button>
                            </div>
                            {selectedFile[renewal.id] && (
                              <p className="text-xs text-green-600 dark:text-green-400">
                                ✓ Archivo seleccionado: {selectedFile[renewal.id]?.name}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Formatos: PDF, DOC, DOCX, JPG, PNG (Máximo 10MB)
                            </p>
                          </div>
                        )}
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
