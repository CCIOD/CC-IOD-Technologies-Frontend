import { FC, useState } from "react";
import { Button } from "../generic/Button";
import { Modal } from "../generic/Modal";
import { ICarrierAct } from "../../interfaces/carrier-acts.interface";
import { DataRowCarriers } from "../../interfaces/carriers.interface";
import { confirmChange } from "../../utils/alerts";
import { RiDeleteBinLine, RiFileTextLine, RiEyeLine } from "react-icons/ri";

interface Props {
  carrierData: DataRowCarriers;
  acts: ICarrierAct[];
  onDeleteAct: (actId: number) => void;
  isLoading: boolean;
}

export const CarrierActsList: FC<Props> = ({
  carrierData,
  acts,
  onDeleteAct,
  isLoading,
}) => {
  const [selectedAct, setSelectedAct] = useState<ICarrierAct | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleDeleteAct = async (act: ICarrierAct) => {
    const confirmed = await confirmChange({
      title: "Eliminar Acta",
      text: `¿Está seguro de eliminar el acta "${act.act_title}"? Esta acción no se puede deshacer.`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "#dc2626"
    });
    
    if (confirmed.success) {
      onDeleteAct(act.act_id);
    }
  };

  const handleViewDocument = (act: ICarrierAct) => {
    window.open(act.act_document_url, "_blank");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleViewModal = (value: boolean) => {
    setIsViewModalOpen(value);
    if (!value) {
      setSelectedAct(null);
    }
  };

  const showActDetails = (act: ICarrierAct) => {
    setSelectedAct(act);
    setIsViewModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando actas...</span>
      </div>
    );
  }

  if (acts.length === 0) {
    return (
      <div className="text-center py-8">
        <RiFileTextLine size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Sin actas registradas
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          No hay actas disponibles para este portador.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
            Actas de: {carrierData.name}
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Total de actas: {acts.length}
          </p>
        </div>

        <div className="grid gap-4">
          {acts.map((act) => (
            <div
              key={act.act_id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {act.act_title}
                  </h4>
                  
                  {act.act_description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                      {act.act_description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      <strong>Subido por:</strong> {act.uploaded_by_name}
                    </span>
                    <span>
                      <strong>Fecha:</strong> {formatDate(act.upload_date)}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    size="min"
                    color="blue"
                    onClick={() => showActDetails(act)}
                    title="Ver detalles"
                  >
                    <RiEyeLine size={20} />
                  </Button>
                  
                  <Button
                    size="min"
                    color="green"
                    onClick={() => handleViewDocument(act)}
                    title="Abrir documento"
                  >
                    <RiFileTextLine size={20} />
                  </Button>
                  
                  <Button
                    size="min"
                    color="failure"
                    onClick={() => handleDeleteAct(act)}
                    title="Eliminar acta"
                  >
                    <RiDeleteBinLine size={20} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para ver detalles del acta */}
      <Modal
        title="Detalles del Acta"
        isOpen={isViewModalOpen}
        toggleModal={toggleViewModal}
        backdrop
        closeOnClickOutside
        size="lg"
      >
        {selectedAct && (
          <div className="px-6 pb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {selectedAct.act_title}
                </p>
              </div>

              {selectedAct.act_description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedAct.act_description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subido por
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {selectedAct.uploaded_by_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de subida
                  </label>
                  <p className="text-gray-900 dark:text-gray-100">
                    {formatDate(selectedAct.upload_date)}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-3">
                  <Button
                    color="blue"
                    onClick={() => handleViewDocument(selectedAct)}
                  >
                    <RiFileTextLine size={20} className="mr-2" />
                    Abrir Documento
                  </Button>
                  
                  <Button
                    color="gray"
                    onClick={() => toggleViewModal(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
