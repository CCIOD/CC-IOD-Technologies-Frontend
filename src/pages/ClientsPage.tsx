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
import { ApiResponse, SelectableItem } from "../interfaces/interfaces";
import {
  createData,
  deleteData,
  getAllData,
  getDataById,
  updateData,
} from "../services/api.service";
import { Alert } from "../components/generic/Alert";
import { ErrMessage } from "../components/generic/ErrMessage";
import { ModalInfoContent } from "../components/generic/ModalInfoContent";

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

  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const toggleModal = (value: boolean, id: number | null = null) => {
    if (!id) setTitleModal(`Agregar cliente`);
    setIsOpenModal(value);
    setClientID(id);
  };
  const toggleModalInfo = (value: boolean) => setIsOpenModalInfo(value);

  const getAllClients = async () => {
    setIsLoading(true);
    try {
      const res = await getAllData("clients");
      const data: DataRowClients[] = res.data!;
      if (!data) setClientsData([]);
      setClientsData(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
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
      console.log(error);
    }
  };
  const getClientById = async (id: number) => {
    try {
      const res = await getDataById("clients", id);
      const data: DataRowClients = res.data!;
      if (!data) setClientData(null);
      setClientData(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllClients();
    getProspectsForClient();
  }, [action]);

  const handleCreate = async (data: IClientForm) => {
    try {
      const res = await createData("clients", data);
      if (res.success) {
        toggleModal(false);
        setAction(!action);
        alertTimer(`El cliente se ha agregado`, "success");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
    }
  };
  const handleUpdate = async (data: IClientForm) => {
    try {
      const res = await updateData("clients", clientID as number, data);
      if (res.success) {
        toggleModal(false);
        setAction(!action);
        alertTimer(`El cliente se ha actualizado`, "success");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
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
      selector: (row) => row.criminal_case_number,
    },
    {
      name: "No. Carpeta de  investigación",
      selector: (row) => row.investigation_file_number,
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
      name: "Abogado",
      selector: (row) => row.lawyer_name,
    },
    {
      name: "Status",
      cell: (row) => <Status status={row.status} />,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <TableActions
          handleClickInfo={() => {
            toggleModalInfo(true);
            const client = clientsData.filter((el) => el.id === row.id);
            setClientInfo(client[0]);
            setTitleModalInfo(`Información de ${row.name}`);
          }}
          handleClickUpdate={() => {
            setTitleModal(`Editar información de ${row.name}`);
            toggleModal(true, row.id);
            getClientById(row.id);
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
          toggleModal(value);
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
    </>
  );
};
