import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState } from "react";
import { Modal } from "../components/generic/Modal";
import { OperationForm } from "../components/modalForms/OperationForm";
import {
  DataRowOperations,
  IOperationForm,
} from "../interfaces/operations.interface";
import {
  getAllOperationsFromApi,
  getOperationByIdFromApi,
  updateOperationFromApi,
} from "../services/operationsService";
import { FileDownload } from "../components/generic/FileDownload";
import { alertTimer } from "../utils/alerts";
import { ApiResponse } from "../interfaces/interfaces";

export const OperationsPage = () => {
  const [operationsData, setOperationsData] = useState<DataRowOperations[]>([]);
  const [operationData, setOperationData] = useState<DataRowOperations | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("Documentos de");
  const [operationID, setOperationID] = useState<number>();
  const [action, setAction] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const toggleModal = (value: boolean, id?: number) => {
    setIsOpenModal(value);
    setOperationID(id);
  };
  const toggleAction = () => setAction(!action);

  const columns: TableColumn<DataRowOperations>[] = [
    {
      name: "Nombre",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Contrato",
      cell: (row) => <FileDownload file={row.contract} text="Ver contrato" />,
      sortable: true,
    },
    {
      name: "Reporte de Instalación",
      cell: (row) => (
        <FileDownload file={row.installation_report} text="Ver reporte" />
      ),
    },
    {
      name: "Acciones",
      cell: (row) => (
        <TableActions
          uploadFilesColor={
            row.contract || row.installation_report ? "sky" : "green"
          }
          handleUploadFiles={() => {
            getOperationById(row.id);
            toggleModal(true, row.id);
            setTitleModal(`Archivos de ${row.name}`);
          }}
        />
      ),
    },
  ];

  const getAllOperations = async () => {
    setIsLoading(true);
    try {
      const res = await getAllOperationsFromApi();
      const data: DataRowOperations[] = res.data!;
      if (!data) setOperationsData([]);
      setOperationsData(data);
      setIsLoading(false);
      setErrorMessage("");
    } catch (error) {
      setIsLoading(false);
    }
  };
  const getOperationById = async (id: number) => {
    try {
      const res = await getOperationByIdFromApi(id);
      const data: DataRowOperations = res.data!;

      if (!data) setOperationsData([]);
      setOperationData(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllOperations();
  }, [action]);

  const handleUpload = async (data: IOperationForm) => {
    if (!data.contract && !data.installation_report) {
      toggleModal(false);
      return;
    }
    const formData = new FormData();
    formData.append("contract", data.contract as File);
    formData.append("installation_report", data.installation_report as File);

    try {
      const res = await updateOperationFromApi(operationID as number, formData);
      console.log(res);
      toggleModal(false);
      if (res.success) {
        setAction(!action);
        alertTimer(`La operación se ha actualizado`, "success");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      console.error("Error al subir los datos:", error);
    }
  };

  return (
    <>
      <TableComponent<DataRowOperations>
        title="Operaciones"
        columns={columns}
        tableData={operationsData}
        isLoading={isLoading}
      />
      <div>
        <Modal
          title={titleModal}
          size="sm"
          isOpen={isOpenModal}
          toggleModal={toggleModal}
          backdrop
        >
          <OperationForm
            toggleModal={toggleModal}
            btnText="Guardar"
            handleSubmit={(data) => handleUpload(data)}
            operationData={operationData}
            toggleAction={toggleAction}
          />
          {errorMessage && (
            <span className="block w-full mt-2 text-center text-sm text-red-500">
              {errorMessage}
            </span>
          )}
        </Modal>
      </div>
    </>
  );
};
// 220
