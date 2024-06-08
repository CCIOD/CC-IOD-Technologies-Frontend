import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { Status } from "../components/generic/Status";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState } from "react";
import { Modal } from "../components/generic/Modal";
import { alertTimer, confirmChange } from "../utils/alerts";
import {
  dataFilters,
  DataRowClients,
  IClientForm,
} from "../interfaces/clients.interface";
import { ClientForm } from "../components/modalForms/ClientForm";
import {
  ApiResponse,
  IFilesForm,
  SelectableItem,
} from "../interfaces/interfaces";
import {
  createData,
  deleteData,
  getAllData,
  updateData,
} from "../services/api.service";
import { Alert } from "../components/generic/Alert";
import { ErrMessage } from "../components/generic/ErrMessage";
import { ModalInfoContent } from "../components/generic/ModalInfoContent";
import { UploadFilesForm } from "../components/modalForms/UploadFilesForm";
import { FileDownload } from "../components/generic/FileDownload";

export const ClientsPage = () => {
  const [clientsData, setClientsData] = useState<DataRowClients[]>([]);
  const [clientData, setClientData] = useState<DataRowClients | null>(null);
  const [clientInfo, setClientInfo] = useState<DataRowClients>();
  const [clientID, setClientID] = useState<number | null>(null);
  const [prospectsForClient, setProspectsForClient] = useState<
    SelectableItem[]
  >([]);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("");
  const [isOpenModalInfo, setIsOpenModalInfo] = useState<boolean>(false);
  const [titleModalInfo, setTitleModalInfo] = useState<string>("");
  const [isOpenModalContract, setIsOpenModalContract] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [action, setAction] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const toggleAction = () => setAction(!action);
  const toggleModal = (value: boolean) => setIsOpenModal(value);
  const toggleModalInfo = (value: boolean) => setIsOpenModalInfo(value);
  const toggleModalContract = (value: boolean) => setIsOpenModalContract(value);

  const getAllClients = async () => {
    setIsLoading(true);
    try {
      const res = await getAllData("clients");
      const data: DataRowClients[] = res.data!;
      if (!data) setClientsData([]);
      setClientsData(data);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };
  const getProspectsForClient = async () => {
    try {
      const res = await getAllData("prospects/approved-without-client");
      const data: DataRowClients[] = res.data!;
      if (!data) setProspectsForClient([]);
      setProspectsForClient(data);
    } catch (error) {
      const { message } = error as ApiResponse;
      if (message === "No se encontró ningún prospecto que pueda ser cliente")
        setProspectsForClient([]);
    }
  };
  useEffect(() => {
    getAllClients();
    getProspectsForClient();
  }, [action]);

  const handleCreate = async (data: IClientForm) => {
    setIsLoading(true);
    try {
      const res = await createData("clients", {
        ...data,
        investigation_file_number: data.investigation_file_number
          ? data.investigation_file_number
          : 0,
      });
      if (res.success) {
        toggleModal(false);
        setAction(!action);
        alertTimer(`El cliente se ha agregado`, "success");
        setErrorMessage("");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
    }
    setIsLoading(false);
  };
  const handleUpdate = async (data: IClientForm) => {
    setIsLoading(true);
    try {
      const res = await updateData("clients", clientID as number, {
        ...data,
        investigation_file_number: data.investigation_file_number
          ? data.investigation_file_number
          : 0,
      });
      if (res.success) {
        toggleModal(false);
        setAction(!action);
        alertTimer(`El cliente se ha actualizado`, "success");
        setErrorMessage("");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
    }
    setIsLoading(false);
  };

  const handleDelete = (id: number) => {
    const confirm = confirmChange({
      title: "Eliminar Cliente",
      text: `¿Está seguro de querer eliminar el Cliente con el ID ${id}?. Este cambio es irreversible.`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    confirm.then(async (res) => {
      if (res.success) {
        try {
          const response = await deleteData("clients", id);
          if (response.success)
            alertTimer("El cliente ha sido eliminado", "success");
          setAction(!action);
        } catch (error) {
          const err = error as ApiResponse;
          alertTimer(err.message, "error");
        }
      }
    });
  };

  const columns: TableColumn<DataRowClients>[] = [
    {
      name: "No. Contrato",
      selector: (row) => row.contract_number,
    },
    {
      name: "Nombre",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "No. Causa penal",
      selector: (row) => row.criminal_case,
    },
    {
      name: "No. Carpeta de  investigación",
      cell: (row) =>
        row.investigation_file_number ? (
          <span>{row.investigation_file_number}</span>
        ) : (
          <span>N/A</span>
        ),
    },
    {
      name: "Juez",
      selector: (row) => row.judge_name,
    },
    {
      name: "Juzgado",
      selector: (row) => row.court_name,
    },
    {
      name: "Contrato",
      cell: (row) => <FileDownload file={row.contract} text="Ver" />,
    },
    {
      name: "Status",
      cell: (row) => <Status status={row.status} />,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <TableActions
          uploadFilesColor={row.contract ? "purple" : "gray"}
          handleClickInfo={() => {
            toggleModalInfo(true);
            setClientInfo(row);
            setTitleModalInfo(`Información de ${row.name}`);
          }}
          handleClickUpdate={() => {
            setTitleModal(`Editar información de ${row.name}`);
            toggleModal(true);
            setClientID(row.id);
            setClientData(row);
          }}
          handleUploadFiles={() => {
            toggleModalContract(true);
            setClientID(row.id);
            setClientData(row);
          }}
          handleClickDelete={() => handleDelete(row.id)}
        />
      ),
    },
  ];

  const handleUpload = async (data: IFilesForm) => {
    if (!data.contract) {
      toggleModalContract(false);
      return;
    }
    setIsLoading(true);
    const formData = new FormData();
    formData.append("contract", data.contract as File);
    try {
      const res = await updateData(
        "clients/upload-contract",
        clientID as number,
        formData,
        "multipart/form-data"
      );
      toggleModalContract(false);
      if (res.success) {
        setAction(!action);
        alertTimer(`El contrato se ha subido`, "success");
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
      {prospectsForClient.length > 0 && (
        <Alert
          length={prospectsForClient.length}
          text1="Prospecto"
          text2="Cliente"
        />
      )}
      <TableComponent<DataRowClients>
        title="Clientes"
        columns={columns}
        tableData={clientsData}
        dataFilters={dataFilters}
        handleOpenModal={(value) => {
          toggleModal(value);
          setTitleModal("Agregar Cliente");
          setClientData(null);
        }}
        isLoading={isLoading}
      />
      <Modal
        title={titleModal}
        isOpen={isOpenModal}
        toggleModal={toggleModal}
        backdrop
        size="full"
      >
        <ClientForm
          toggleModal={toggleModal}
          btnText={clientID ? "Actualizar" : "Agregar"}
          handleSubmit={(d) => (clientID ? handleUpdate(d) : handleCreate(d))}
          prospects={prospectsForClient}
          clientData={clientData}
          isLoading={isLoading}
        />
        <ErrMessage message={errorMessage} />
      </Modal>
      <Modal
        title={titleModalInfo}
        isOpen={isOpenModalInfo}
        toggleModal={toggleModalInfo}
        backdrop
        closeOnClickOutside
        size="sm"
      >
        {clientInfo ? (
          <ModalInfoContent
            data={[
              {
                column: "Abogado",
                text: clientInfo.lawyer_name,
              },
              {
                column: "Firmante",
                text: clientInfo.signer_name,
              },
              {
                column: "Números de contacto",
                text: clientInfo.contact_numbers,
              },
              {
                column: "Fecha de audiencia",
                text: clientInfo.hearing_date,
              },
              {
                column: "Observaciones",
                text: clientInfo.observations,
              },
            ]}
          />
        ) : (
          <span>No hay nada para mostrar</span>
        )}
      </Modal>
      <Modal
        title={clientData ? "Cambiar contrato" : "Subir contrato"}
        size="sm"
        isOpen={isOpenModalContract}
        toggleModal={toggleModalContract}
        backdrop
      >
        <UploadFilesForm
          toggleModal={toggleModalContract}
          handleSubmit={(data) => handleUpload(data)}
          endpointDelete="clients/delete-contract"
          data={{
            id: clientData ? clientData.id : null,
            name: "contract",
            filename: clientData ? clientData.contract : null,
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
    </>
  );
};
// 343
