import { FC, useState, useEffect } from "react";
import { Button } from "../generic/Button";
import { Modal } from "../generic/Modal";
import { IContractRenewal, IProsecutorDocument } from "../../interfaces/clients.interface";
import { formatDate } from "../../utils/format";
import { RiDeleteBinLine, RiEditLine, RiDownloadLine } from "react-icons/ri";
import { 
  createRenewal, 
  updateRenewal, 
  deleteRenewal 
} from "../../services/renewals.service";
import {
  getProsecutorDocsByClient,
  createProsecutorDoc,
  updateProsecutorDoc,
  deleteProsecutorDoc
} from "../../services/prosecutor-docs.service";
import { alertTimer } from "../../utils/alerts";
import { ApiResponse } from "../../interfaces/interfaces";
import { updateData, removeFile } from "../../services/api.service";

type Props = {
  clientId: number;
  clientName: string;
  contractNumber?: number;
  contractDocument?: string | null;
  renewals: IContractRenewal[];
  onClose: () => void;
  onRefresh: () => void;
  onContractUpdate: () => void;
};

export const ContractRenewalsForm: FC<Props> = ({
  clientId,
  clientName,
  contractNumber,
  contractDocument,
  renewals,
  onClose,
  onRefresh,
  onContractUpdate,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRenewal, setEditingRenewal] = useState<IContractRenewal | null>(null);
  const [isUploadingContract, setIsUploadingContract] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [currentContract, setCurrentContract] = useState<string | null | undefined>(contractDocument);

  // Estados para oficios de fiscalía
  const [prosecutorDocs, setProsecutorDocs] = useState<IProsecutorDocument[]>([]);
  const [isAddProsecutorModalOpen, setIsAddProsecutorModalOpen] = useState(false);
  const [editingProsecutorDoc, setEditingProsecutorDoc] = useState<IProsecutorDocument | null>(null);
  const [isLoadingProsecutorDocs, setIsLoadingProsecutorDocs] = useState(false);

  // Actualizar el contrato cuando cambie desde props
  useEffect(() => {
    setCurrentContract(contractDocument);
  }, [contractDocument]);

  // Cargar oficios de fiscalía
  useEffect(() => {
    loadProsecutorDocs();
  }, [clientId]);

  const loadProsecutorDocs = async () => {
    setIsLoadingProsecutorDocs(true);
    try {
      const response = await getProsecutorDocsByClient(clientId);
      if (response.data) {
        setProsecutorDocs(response.data as IProsecutorDocument[]);
      }
    } catch (error) {
      console.error("Error al cargar oficios de fiscalía:", error);
    } finally {
      setIsLoadingProsecutorDocs(false);
    }
  };

  const handleAddRenewal = () => {
    setEditingRenewal(null);
    setIsAddModalOpen(true);
  };

  const handleEditRenewal = (renewal: IContractRenewal) => {
    setEditingRenewal(renewal);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingRenewal(null);
  };

  // Handlers para oficios de fiscalía
  const handleAddProsecutorDoc = () => {
    setEditingProsecutorDoc(null);
    setIsAddProsecutorModalOpen(true);
  };

  const handleEditProsecutorDoc = (doc: IProsecutorDocument) => {
    setEditingProsecutorDoc(doc);
    setIsAddProsecutorModalOpen(true);
  };

  const handleCloseProsecutorModal = () => {
    setIsAddProsecutorModalOpen(false);
    setEditingProsecutorDoc(null);
  };

  const handleDeleteProsecutorDoc = async (docId: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este oficio de fiscalía?")) return;
    
    try {
      await deleteProsecutorDoc(docId);
      alertTimer("Oficio eliminado correctamente", "success");
      loadProsecutorDocs();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al eliminar el oficio", "error");
    }
  };

  const handleUploadContract = async () => {
    if (!contractFile) return;
    
    setIsUploadingContract(true);
    try {
      const formData = new FormData();
      formData.append("contract", contractFile);
      
      const response = await updateData(`clients/upload-contract`, clientId, formData, "multipart/form-data");
      
      // Actualizar el estado local inmediatamente con la respuesta del servidor
      if (response.data && (response.data as any).contract) {
        setCurrentContract((response.data as any).contract);
      }
      
      alertTimer("Contrato subido correctamente", "success");
      setContractFile(null);
      onContractUpdate();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al subir el contrato", "error");
    } finally {
      setIsUploadingContract(false);
    }
  };

  const handleDeleteContract = async () => {
    if (!currentContract) return;
    if (!window.confirm("¿Estás seguro de eliminar el contrato principal?")) return;
    
    try {
      const filename = currentContract.match(/\/([^/?#]+)$/)![1];
      await removeFile("clients/delete-contract", clientId, filename);
      
      // Actualizar el estado local inmediatamente
      setCurrentContract(null);
      
      alertTimer("Contrato eliminado correctamente", "success");
      onContractUpdate();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al eliminar el contrato", "error");
    }
  };

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Renovaciones de Contrato
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Cliente: <span className="font-semibold">{clientName}</span>
            {contractNumber && (
              <span className="ml-2">
                | Contrato: <span className="font-semibold">#{contractNumber}</span>
              </span>
            )}
          </p>
        </div>

        {/* Sección de Contrato Principal */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            📄 Contrato Principal
          </h3>
          
          {currentContract ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    📎 {currentContract.replace(/^https:\/\/storagecciodtech\.blob\.core\.windows\.net\/contracts\//, "")}
                  </span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={currentContract}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Ver contrato"
                  >
                    <RiDownloadLine size={20} />
                  </a>
                  <button
                    onClick={handleDeleteContract}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    title="Eliminar contrato"
                  >
                    <RiDeleteBinLine size={20} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reemplazar contrato
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setContractFile(e.target.files?.[0] || null)}
                    className="flex-1 text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                  />
                  {contractFile && (
                    <Button
                      color="blue"
                      onClick={handleUploadContract}
                      isLoading={isUploadingContract}
                    >
                      Subir
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No hay contrato principal cargado
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subir contrato (PDF)
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setContractFile(e.target.files?.[0] || null)}
                    className="flex-1 text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                  />
                  {contractFile && (
                    <Button
                      color="blue"
                      onClick={handleUploadContract}
                      isLoading={isUploadingContract}
                    >
                      Subir
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        {/* Sección de Renovaciones */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          🔄 Renovaciones de Contrato
        </h3>

        {/* Botón agregar */}
        <div className="mb-4">
          <Button
            color="blue"
            onClick={handleAddRenewal}
          >
            + Agregar Renovación
          </Button>
        </div>

        {/* Lista de renovaciones */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {renewals.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <p className="text-lg">No hay renovaciones registradas</p>
              <p className="text-sm mt-2">Haz clic en "Agregar Renovación" para comenzar</p>
            </div>
          ) : (
            renewals.map((renewal, index) => (
              <div
                key={renewal.renewal_id || index}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">
                        Renovación #{index + 1}
                      </span>
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {formatDate(renewal.renewal_date)}
                      </span>
                    </div>
                    {renewal.renewal_duration && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Duración:</span> {renewal.renewal_duration}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRenewal(renewal)}
                      className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                      title="Editar renovación"
                    >
                      <RiEditLine size={20} />
                    </button>
                    <button
                      onClick={async () => {
                        if (!renewal.renewal_id) return;
                        if (!window.confirm("¿Estás seguro de eliminar esta renovación?")) return;
                        
                        try {
                          await deleteRenewal(renewal.renewal_id);
                          alertTimer("Renovación eliminada correctamente", "success");
                          onRefresh();
                        } catch (error) {
                          const err = error as ApiResponse;
                          alertTimer(err.message || "Error al eliminar la renovación", "error");
                        }
                      }}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Eliminar renovación"
                    >
                      <RiDeleteBinLine size={20} />
                    </button>
                  </div>
                </div>

                {renewal.renewal_document && (
                  <div className="mb-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        📄 {renewal.renewal_document}
                      </span>
                      <button
                        onClick={() => {
                          // TODO: Implementar descarga
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Descargar documento"
                      >
                        <RiDownloadLine size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {renewal.notes && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Notas:</span> {renewal.notes}
                    </p>
                  </div>
                )}

                {renewal.created_at && (
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                    Creado: {formatDate(renewal.created_at)}
                    {renewal.updated_at && renewal.updated_at !== renewal.created_at && (
                      <span className="ml-2">
                        | Actualizado: {formatDate(renewal.updated_at)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Separador */}
        <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

        {/* Sección de Oficios de Fiscalía */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          📋 Oficios de Fiscalía
        </h3>

        {/* Botón agregar oficio */}
        <div className="mb-4">
          <Button
            color="blue"
            onClick={handleAddProsecutorDoc}
          >
            + Agregar Oficio
          </Button>
        </div>

        {/* Lista de oficios de fiscalía */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoadingProsecutorDocs ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <p>Cargando oficios...</p>
            </div>
          ) : prosecutorDocs.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <p className="text-lg">No hay oficios de fiscalía registrados</p>
              <p className="text-sm mt-2">Haz clic en "Agregar Oficio" para comenzar</p>
            </div>
          ) : (
            prosecutorDocs.map((doc, index) => (
              <div
                key={doc.prosecutor_doc_id || index}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-semibold text-gray-800 dark:text-white">
                        {doc.document_type}
                      </span>
                      {doc.document_number && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          #{doc.document_number}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <span className="font-medium">Fecha de emisión:</span> {formatDate(doc.issue_date)}
                      </p>
                      {doc.prosecutor_office && (
                        <p>
                          <span className="font-medium">Fiscalía:</span> {doc.prosecutor_office}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProsecutorDoc(doc)}
                      className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                      title="Editar oficio"
                    >
                      <RiEditLine size={20} />
                    </button>
                    <button
                      onClick={() => doc.prosecutor_doc_id && handleDeleteProsecutorDoc(doc.prosecutor_doc_id)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Eliminar oficio"
                    >
                      <RiDeleteBinLine size={20} />
                    </button>
                  </div>
                </div>

                {doc.document_file && (
                  <div className="mb-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        📄 {doc.document_file.replace(/^https:\/\/storagecciodtech\.blob\.core\.windows\.net\/prosecutor-documents\//, "")}
                      </span>
                      <a
                        href={doc.document_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Ver documento"
                      >
                        <RiDownloadLine size={18} />
                      </a>
                    </div>
                  </div>
                )}

                {doc.notes && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Notas:</span> {doc.notes}
                    </p>
                  </div>
                )}

                {doc.created_at && (
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-500">
                    Creado: {formatDate(doc.created_at)}
                    {doc.updated_at && doc.updated_at !== doc.created_at && (
                      <span className="ml-2">
                        | Actualizado: {formatDate(doc.updated_at)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer con botón cerrar */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button color="gray" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>

      {/* Modal para agregar/editar renovación */}
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} toggleModal={handleCloseAddModal}>
          <RenewalFormModal
            clientId={clientId}
            renewal={editingRenewal}
            onClose={handleCloseAddModal}
            onSuccess={() => {
              handleCloseAddModal();
              onRefresh();
            }}
          />
        </Modal>
      )}

      {/* Modal para agregar/editar oficio de fiscalía */}
      {isAddProsecutorModalOpen && (
        <Modal isOpen={isAddProsecutorModalOpen} toggleModal={handleCloseProsecutorModal}>
          <ProsecutorDocFormModal
            clientId={clientId}
            prosecutorDoc={editingProsecutorDoc}
            onClose={handleCloseProsecutorModal}
            onSuccess={() => {
              handleCloseProsecutorModal();
              loadProsecutorDocs();
            }}
          />
        </Modal>
      )}
    </>
  );
};

// Componente separado para el formulario de agregar/editar renovación
type RenewalFormModalProps = {
  clientId: number;
  renewal: IContractRenewal | null;
  onClose: () => void;
  onSuccess: () => void;
};

const RenewalFormModal: FC<RenewalFormModalProps> = ({
  clientId,
  renewal,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    renewal_date: renewal?.renewal_date ? formatDate(renewal.renewal_date) : "",
    renewal_duration: renewal?.renewal_duration || "",
    notes: renewal?.notes || "",
    renewal_document: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (renewal?.renewal_id) {
        // Actualizar renovación existente - updateRenewal ahora acepta JSON
        await updateRenewal(renewal.renewal_id, {
          renewal_date: formData.renewal_date,
          renewal_duration: formData.renewal_duration,
          notes: formData.notes,
        });
        alertTimer("Renovación actualizada correctamente", "success");
      } else {
        // Crear nueva renovación - createRenewal sigue usando FormData
        const formDataToSend = new FormData();
        formDataToSend.append("client_id", clientId.toString());
        formDataToSend.append("renewal_date", formData.renewal_date);
        if (formData.renewal_duration) formDataToSend.append("renewal_duration", formData.renewal_duration);
        if (formData.notes) formDataToSend.append("notes", formData.notes);
        if (formData.renewal_document) formDataToSend.append("renewal_document", formData.renewal_document);
        
        await createRenewal(formDataToSend);
        alertTimer("Renovación creada correctamente", "success");
      }
      
      onSuccess();
    } catch (err) {
      const error = err as ApiResponse;
      setError(error.message || "Error al guardar la renovación");
      alertTimer(error.message || "Error al guardar la renovación", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        {renewal ? "Editar Renovación" : "Nueva Renovación"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de Renovación *
          </label>
          <input
            type="date"
            value={formData.renewal_date}
            onChange={(e) => setFormData({ ...formData, renewal_date: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:[color-scheme:dark]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Duración de la Renovación
          </label>
          <input
            type="text"
            value={formData.renewal_duration}
            onChange={(e) => setFormData({ ...formData, renewal_duration: e.target.value })}
            placeholder="ej: 12 meses"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Documento de Renovación (PDF)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFormData({ ...formData, renewal_document: e.target.files?.[0] || null })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          {renewal?.renewal_document && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Documento actual: {renewal.renewal_document}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notas
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            placeholder="Notas adicionales sobre la renovación..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button color="gray" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button color="blue" type="submit" isLoading={isLoading}>
            {renewal ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Componente separado para el formulario de agregar/editar oficio de fiscalía
type ProsecutorDocFormModalProps = {
  clientId: number;
  prosecutorDoc: IProsecutorDocument | null;
  onClose: () => void;
  onSuccess: () => void;
};

const ProsecutorDocFormModal: FC<ProsecutorDocFormModalProps> = ({
  clientId,
  prosecutorDoc,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    document_type: prosecutorDoc?.document_type || "",
    document_number: prosecutorDoc?.document_number || "",
    issue_date: prosecutorDoc?.issue_date ? formatDate(prosecutorDoc.issue_date) : "",
    prosecutor_office: prosecutorDoc?.prosecutor_office || "",
    notes: prosecutorDoc?.notes || "",
    document_file: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      
      if (!prosecutorDoc) {
        // Crear nuevo oficio
        formDataToSend.append("client_id", clientId.toString());
      }
      
      formDataToSend.append("document_type", formData.document_type);
      formDataToSend.append("issue_date", formData.issue_date);
      if (formData.document_number) formDataToSend.append("document_number", formData.document_number);
      if (formData.prosecutor_office) formDataToSend.append("prosecutor_office", formData.prosecutor_office);
      if (formData.notes) formDataToSend.append("notes", formData.notes);
      if (formData.document_file) formDataToSend.append("document_file", formData.document_file);

      if (prosecutorDoc?.prosecutor_doc_id) {
        // Actualizar oficio existente
        await updateProsecutorDoc(prosecutorDoc.prosecutor_doc_id, formDataToSend);
        alertTimer("Oficio actualizado correctamente", "success");
      } else {
        // Crear nuevo oficio
        await createProsecutorDoc(formDataToSend);
        alertTimer("Oficio creado correctamente", "success");
      }
      
      onSuccess();
    } catch (err) {
      const error = err as ApiResponse;
      setError(error.message || "Error al guardar el oficio");
      alertTimer(error.message || "Error al guardar el oficio", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
        {prosecutorDoc ? "Editar Oficio de Fiscalía" : "Nuevo Oficio de Fiscalía"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 rounded text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Documento *
          </label>
          <input
            type="text"
            value={formData.document_type}
            onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
            placeholder="ej: Oficio de solicitud, Resolución, etc."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número de Documento
          </label>
          <input
            type="text"
            value={formData.document_number}
            onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
            placeholder="ej: OF-2024-001"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de Emisión *
          </label>
          <input
            type="date"
            value={formData.issue_date}
            onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:[color-scheme:dark]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fiscalía
          </label>
          <input
            type="text"
            value={formData.prosecutor_office}
            onChange={(e) => setFormData({ ...formData, prosecutor_office: e.target.value })}
            placeholder="ej: Fiscalía General del Estado"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Documento (PDF)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFormData({ ...formData, document_file: e.target.files?.[0] || null })}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          {prosecutorDoc?.document_file && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Documento actual: {prosecutorDoc.document_file.replace(/^https:\/\/storagecciodtech\.blob\.core\.windows\.net\/prosecutor-documents\//, "")}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notas
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
            placeholder="Notas adicionales sobre el oficio..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button color="gray" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button color="blue" type="submit" isLoading={isLoading}>
            {prosecutorDoc ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
};
