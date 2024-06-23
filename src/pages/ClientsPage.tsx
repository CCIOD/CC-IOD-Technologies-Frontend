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

  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const toggleModal = (value: boolean) => {
    setErrorMessage("");
    setIsOpenModal(value);
  };
  const toggleModalInfo = (value: boolean) => setIsOpenModalInfo(value);
  const toggleModalContract = (value: boolean, remove: boolean = false) => {
    setErrorMessage("");
    if (remove && clientID) {
      setClientsData((prevData) =>
        prevData.map((client) =>
          client.id === clientID ? { ...client, contract: "" } : client
        )
      );
    }
    setIsOpenModalContract(value);
  };

  const getAllClients = async () => {
    setIsLoadingTable(true);
    try {
      const res = await getAllData("clients");
      const data: DataRowClients[] = res.data!;
      setClientsData(data);
    } catch (error) {
      setClientsData([]);
    } finally {
      setIsLoadingTable(false);
    }
  };
  const getProspectsForClient = async () => {
    try {
      const res = await getAllData("prospects/approved-without-client");
      const data: DataRowClients[] = res.data!;
      setProspectsForClient(data);
    } catch (error) {
      setProspectsForClient([]);
    }
  };
  useEffect(() => {
    getAllClients();
  }, []);
  useEffect(() => {
    getProspectsForClient();
  }, [clientsData]);

  const handleCreate = async (data: IClientForm) => {
    setIsLoadingForm(true);
    try {
      const res = await createData("clients", {
        ...data,
        investigation_file_number: data.investigation_file_number
          ? data.investigation_file_number
          : 0,
      });
      toggleModal(false);
      setClientsData((prev) => [...prev, res.data!]);
      alertTimer(`El cliente se ha agregado`, "success");
      setErrorMessage("");
    } catch (error) {
      handleError(error as ApiResponse);
    } finally {
      setIsLoadingForm(false);
    }
  };
  const handleUpdate = async (data: IClientForm) => {
    setIsLoadingForm(true);
    console.log(data);
    try {
      const res = await updateData("clients", clientID as number, {
        ...data,
        investigation_file_number: data.investigation_file_number
          ? data.investigation_file_number
          : null,
      });
      if (res.success) {
        const updateClientData: DataRowClients = res.data!;
        toggleModal(false);
        setClientsData((prev) =>
          prev.map((client) =>
            client.id === clientID ? { ...client, ...updateClientData } : client
          )
        );
        alertTimer(`El cliente se ha actualizado`, "success");
        setErrorMessage("");
      }
    } catch (error) {
      handleError(error as ApiResponse);
    } finally {
      setIsLoadingForm(false);
    }
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
          if (response.success) {
            setClientsData((prev) => prev.filter((client) => client.id !== id));
            alertTimer("El cliente ha sido eliminado", "success");
          }
        } catch (error) {
          const err = error as ApiResponse;
          alertTimer(err.message, "error");
        }
      }
    });
  };

  const handleUpload = async (data: IFilesForm) => {
    if (!data.contract) {
      toggleModalContract(false);
      return;
    }
    setIsLoadingForm(true);
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
        const result: { contract: string } = res.data!;
        setClientsData((prevData) =>
          prevData.map((client) =>
            client.id === clientID
              ? { ...client, contract: result.contract }
              : client
          )
        );
        // console.log(clientsData);

        alertTimer(`El contrato se ha subido`, "success");
        setErrorMessage("");
      }
    } catch (error) {
      handleError(error as ApiResponse);
    } finally {
      setIsLoadingForm(false);
    }
  };
  const handleError = (error: ApiResponse) => {
    if (error) setErrorMessage(error.message!);
    alertTimer("Ha ocurrido un error", "error");
  };
  const columns: TableColumn<DataRowClients>[] = [
    {
      name: "No.",
      cell: (row) => (
        <span title="Número de contrato">{row.contract_number}</span>
      ),
      width: "80px",
    },
    {
      name: "Nombre",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "No. Causa penal",
      selector: (row) => row.criminal_case,
      // width: "120px",
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
      wrap: true,
    },
    {
      name: "Juzgado",
      selector: (row) => row.court_name,
      wrap: true,
    },
    {
      name: "Contrato",
      cell: (row) => <FileDownload file={row.contract} />,
      // cell: (row) => row.contract,
    },
    {
      name: "Estado",
      cell: (row) => <Status status={row.status} />,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <TableActions
          uploadFilesColor={row.contract ? "warning" : "gray"}
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
          if (prospectsForClient.length === 0) {
            alertTimer("No hay Prospectos disponibles", "error");
            return;
          }
          toggleModal(value);
          setTitleModal("Agregar Cliente");
          setClientData(null);
          setClientID(null);
        }}
        isLoading={isLoadingTable}
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
          isLoading={isLoadingForm}
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
          isLoading={isLoadingForm}
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
