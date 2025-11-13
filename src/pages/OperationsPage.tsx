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
  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("Documentos de");
  const [operationID, setOperationID] = useState<number>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const updateReport = (installation_report: string | null) => {
    setOperationsData((prevData) =>
      prevData.map((operation) =>
        operation.id === operationID
          ? { ...operation, installation_report }
          : operation
      )
    );
  };
  const toggleModal = (value: boolean, remove: boolean = false) => {
    setErrorMessage("");
    if (remove && operationID) updateReport(null);
    setIsOpenModal(value);
  };

  const columns: TableColumn<DataRowOperations>[] = [
    {
      name: "Nombre",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Contrato",
      cell: (row) => <FileDownload file={row.contract} />,
    },
    {
      name: "Reporte de Instalación",
      cell: (row) => <FileDownload file={row.installation_report} />,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <TableActions
          uploadFilesColor={row.installation_report ? "warning" : "gray"}
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
    setIsLoadingTable(true);
    try {
      const res = await getAllData("operations");
      const data: DataRowOperations[] = res.data!;
      setOperationsData(data);
      setErrorMessage("");
    } catch (error) {
      setOperationsData([]);
    } finally {
      setIsLoadingTable(false);
    }
  };
  useEffect(() => {
    getAllOperations();
  }, []);

  const handleUpload = async (data: IFilesForm) => {
    if (!data.installation_report) {
      toggleModal(false);
      return;
    }
    setIsLoadingForm(true);
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
      if (res.success && res.data) {
        const result: { installation_report: string } = res.data;
        updateReport(result.installation_report);
        alertTimer(`La operación se ha actualizado`, "success");
        setErrorMessage("");
      }
    } catch (error) {
      console.log(error);
      const err = error as ApiResponse;
      const errorMsg = err?.message || "Error al actualizar la operación";
      setErrorMessage(errorMsg);
      alertTimer(errorMsg, "error");
    } finally {
      setIsLoadingForm(false);
    }
  };

  return (
    <>
      <TableComponent<DataRowOperations>
        title="Operaciones"
        columns={columns}
        tableData={operationsData}
        isLoading={isLoadingTable}
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
            isLoading={isLoadingForm}
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
