import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { TableActions } from "../components/table/TableActions";
import { FormEvent, useEffect, useState } from "react";
import { Modal } from "../components/generic/Modal";
import { OperationForm } from "../components/modalForms/OperationForm";
import { DataRowOperations } from "../interfaces/operations.interface";
import { getAllOperationsAPI } from "../services/operationsService";
import { FileDownload } from "../components/generic/FileDownload";

export const OperationsPage = () => {
  const [operationsData, setOperationsData] = useState<DataRowOperations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("Documentos de");
  const [operationID, setOperationID] = useState<string | null>(null);

  const toggleModal = (value: boolean, id: string | null = null) => {
    setIsOpenModal(value);
    setOperationID(id);
  };

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
          handleUploadFiles={() => {
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
      const res = await getAllOperationsAPI();
      const data: DataRowOperations[] = res.data!;

      if (!data) setOperationsData([]);
      setOperationsData(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getAllOperations();
  }, []);

  const handleUpload = (e: FormEvent<HTMLFormElement>) => {
    console.log(operationID);

    e.preventDefault();
    console.log(e);

    // alert("Adding");
    // toggleModal(false);
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
            handleSubmit={(e) => handleUpload(e)}
          />
        </Modal>
      </div>
    </>
  );
};
// 220
