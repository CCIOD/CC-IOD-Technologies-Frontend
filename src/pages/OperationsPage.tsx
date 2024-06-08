import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState } from "react";
import { Modal } from "../components/generic/Modal";
import { UploadFilesForm } from "../components/modalForms/UploadFilesForm";
import { DataRowOperations } from "../interfaces/operations.interface";
import { FileDownload } from "../components/generic/FileDownload";
import { alertTimer } from "../utils/alerts";
import { ApiResponse, IFilesForm } from "../interfaces/interfaces";
import { getAllData, updateData } from "../services/api.service";

export const OperationsPage = () => {
  const [operationsData, setOperationsData] = useState<DataRowOperations[]>([]);
  const [operationData, setOperationData] = useState<DataRowOperations | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("Documentos de");
  const [operationID, setOperationID] = useState<number>();
  const [action, setAction] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const toggleModal = (value: boolean) => setIsOpenModal(value);
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
          uploadFilesColor={row.installation_report ? "purple" : "gray"}
          handleUploadFiles={() => {
            setOperationData(row);
            toggleModal(true);
            setOperationID(row.id);
            setTitleModal(`Archivos de ${row.name}`);
          }}
        />
      ),
    },
  ];

  const getAllOperations = async () => {
    setIsLoading(true);
    try {
      const res = await getAllData("operations");
      const data: DataRowOperations[] = res.data!;
      if (!data) setOperationsData([]);
      setOperationsData(data);
      setErrorMessage("");
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    getAllOperations();
  }, [action]);

  const handleUpload = async (data: IFilesForm) => {
    if (!data.installation_report) {
      toggleModal(false);
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("installation_report", data.installation_report as File);
    try {
      const res = await updateData(
        "operations",
        operationID as number,
        formData,
        "multipart/form-data"
      );
      toggleModal(false);
      if (res.success) {
        setAction(!action);
        alertTimer(`La operación se ha actualizado`, "success");
        setErrorMessage("");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
    }
    setIsLoading(false);
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
          <UploadFilesForm
            toggleModal={toggleModal}
            handleSubmit={(data) => handleUpload(data)}
            endpointDelete="operations/delete-file"
            data={{
              id: operationData ? operationData.id : null,
              name: "installation_report",
              filename: operationData
                ? operationData.installation_report
                : null,
            }}
            toggleAction={toggleAction}
            isLoading={isLoading}
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
