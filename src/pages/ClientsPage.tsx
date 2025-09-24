import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { Status } from "../components/generic/Status";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState } from "react";
import { Modal } from "../components/generic/Modal";
import { alertTimer, confirmChange } from "../utils/alerts";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"; // Importar íconos para el ordenamiento
import {
  dataFilters,
  DataRowClients,
  IClientForm,
  IClientObservation,
  TClientStatus,
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
import { ObservationsList } from "../components/generic/ObservationsList";
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
  const [sortConfig, setSortConfig] = useState<{ key: keyof DataRowClients; direction: string } | null>(null);
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

  // Función para procesar las observaciones cuando se crea o actualiza un cliente
  const processObservations = (formData: IClientForm): IClientForm => {
    if (!formData.observations || formData.observations.length === 0) {
      return { ...formData, observations: [] };
    }

    const processedObservations = formData.observations.map((obs: IClientObservation | string) => {
      if (typeof obs === 'string') {
        // Si es un string, crear un objeto de observación con fecha actual
        return {
          date: new Date().toISOString(),
          observation: obs
        };
      } else {
        // Si ya es un objeto, mantenerlo como está
        return obs;
      }
    }).filter((obs: IClientObservation) => obs.observation && obs.observation.trim() !== '');
    return { ...formData, observations: processedObservations };
  };

  // Función para manejar el ordenamiento
  const handleSort = (key: keyof DataRowClients) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Datos ordenados
  const sortedData = [...clientsData].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    const aValue = a[key];
    const bValue = b[key];
    
    // Manejar valores undefined o null
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === "asc" ? 1 : -1;
    if (bValue == null) return direction === "asc" ? -1 : 1;
    
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

    const handleCreate = async (data: IClientForm) => {
    try {
      const processedData = processObservations(data);
      
      const response = await createData("clients", processedData);
      
      if (response) {
        setIsOpenModal(false);
        alertTimer("Cliente creado exitosamente", "success");
        getAllClients();
      }
    } catch (error) {
      console.error("Error creating client:", error);
      alertTimer("Error al crear el cliente", "error");
    }
  };
    const handleUpdate = async (data: IClientForm) => {
    if (!clientData?.id) return;
    
    try {
      const processedData = processObservations(data);
    
      const res = await updateData("clients", clientData.id, processedData);      
      if (res.success) {
        getAllClients(); // Refrescar la lista de clientes
        setIsOpenModal(false);
        alertTimer(`El cliente se ha actualizado`, "success");
        setErrorMessage("");
      }
    } catch (error) {
      handleError(error as ApiResponse);
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
      name: "BRZ",
      cell: (row) => (
        <span title="Número de brazalete">{row.bracelet_type}</span>
      ),
      width: "80px",
    },
    {
      name: (
        <div className="flex items-center">
          Nombre
          <button onClick={() => handleSort("name")} className="ml-2">
            {sortConfig?.key === "name" ? (
              sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
            ) : (
              <FaSort />
            )}
          </button>
        </div>
      ),
      selector: (row) => row.name,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <div className="flex items-center">
        Responsable del contrato
          <button onClick={() => handleSort("signer_name")} className="ml-2">
            {sortConfig?.key === "signer_name" ? (
              sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
            ) : (
              <FaSort />
            )}
          </button>
        </div>
      ),
      selector: (row) => row.signer_name,
      sortable: false,
    },
    {
      name: "Contacto Principal",
      cell: (row) =>
        row.contact_numbers && row.contact_numbers.length > 0 ? (
          <span>{row.contact_numbers[0].contact_name}: {row.contact_numbers[0].phone_number}</span>
        ) : (
          <span>N/A</span>
        ),
    },
    {
      name: (
        <div className="flex items-center">
          Juez
          <button onClick={() => handleSort("judge_name")} className="ml-2">
            {sortConfig?.key === "judge_name" ? (
              sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
            ) : (
              <FaSort />
            )}
          </button>
        </div>
      ),
      selector: (row) => row.judge_name,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <div className="flex items-center">
          Juzgado
          <button onClick={() => handleSort("court_name")} className="ml-2">
            {sortConfig?.key === "court_name" ? (
              sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
            ) : (
              <FaSort />
            )}
          </button>
        </div>
      ),
      selector: (row) => row.court_name,
      sortable: false,
      wrap: true,
    },
    {
      name: "Contrato",
      cell: (row) => <FileDownload file={row.contract || ""} />,
      // cell: (row) => row.contract,
    },
    {
      name: "Estado",
      cell: (row) => <Status status={row.status as TClientStatus} />,
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
        tableData={sortedData}
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
          handleSubmit={(d) => {
            return clientID ? handleUpdate(d) : handleCreate(d);
          }}
          prospects={prospectsForClient}
          clientData={clientData}
          isLoading={isLoadingForm}
        />
        <ErrMessage message={errorMessage} center />
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
          <>
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
                  text: clientInfo.contact_numbers.map(c => `${c.contact_name}: ${c.phone_number}`).join(", "),
                },
                {
                  column: "Fecha de audiencia",
                  text: clientInfo.hearing_date,
                },
              ]}
            />
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Observaciones</h3>
              <ObservationsList observations={clientInfo.observations || []} />
            </div>
          </>
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
            filename: clientData ? clientData.contract || null : null,
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
