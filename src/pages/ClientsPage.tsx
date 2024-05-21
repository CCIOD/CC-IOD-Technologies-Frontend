import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { Status } from "../components/generic/Status";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState } from "react";
import { Modal } from "../components/generic/Modal";
import { alertTimer, confirmChange } from "../utils/alerts";
import { DataRowClients, IClientForm } from "../interfaces/clients.interface";
import { ClientForm } from "../components/modalForms/ClientForm";
import { Information } from "../components/generic/Information";
import {
  RiCalendar2Line,
  RiContactsBook2Line,
  RiFileInfoLine,
} from "react-icons/ri";
import { LuClipboardSignature } from "react-icons/lu";
import { ApiResponse, SelectableItem } from "../interfaces/interfaces";
import {
  createData,
  getAllData,
  getDataById,
  updateData,
} from "../services/api.service";

const dataFilters: SelectableItem[] = [
  { id: 1, name: "Sin filtros" },
  { id: 2, name: "Pendiente de aprobación" },
  { id: 3, name: "Pendiente de audiencia" },
  { id: 4, name: "Pendiente de colocación" },
  { id: 5, name: "Colocado" },
];

export const ClientsPage = () => {
  const [clientsData, setClientsData] = useState<DataRowClients[]>([]);
  const [clientData, setClientData] = useState<DataRowClients | null>(null);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("Agregar Cliente");
  const [isOpenModalInfo, setIsOpenModalInfo] = useState<boolean>(false);
  const [titleModalInfo, setTitleModalInfo] = useState<string>("Información");
  const [clientID, setClientID] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState<DataRowClients>();
  const [action, setAction] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  // -----------------
  const [prospectsForClient, setProspectsForClient] = useState<
    SelectableItem[]
  >([]);

  const toggleModal = (value: boolean, id: number | null = null) => {
    const title = id ? `Editar Cliente con el ID ${id}` : "Agregar Cliente";
    if (value) setTitleModal(`${title}`);
    setIsOpenModal(value);
    setClientID(id);
  };
  const toggleModalInfo = (value: boolean) => setIsOpenModalInfo(value);
  // const toggleAction = () => setAction(!action);

  const handleDelete = (id: number) => {
    const confirm = confirmChange({
      title: "Eliminar Cliente",
      text: `¿Está seguro de querer eliminar el Cliente con el ID ${id}?`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    confirm.then((res) => {
      if (res.success) alertTimer("El cliente ha sido eliminado", "success");
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
            toggleModal(true, row.id);
            getClientById(row.id);
          }}
          handleClickDelete={() => handleDelete(row.id)}
        />
      ),
    },
  ];

  const handleAdd = async (data: IClientForm) => {
    console.log(data);
    try {
      const res = await createData("clients", data);
      console.log(res);
      toggleModal(false);
      if (res.success) {
        setAction(!action);
        alertTimer(`El cliente se ha agregado`, "success");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
      console.error("Error al subir los datos:", error);
    }
  };
  const handleUpdate = async (data: IClientForm) => {
    console.log(data);

    try {
      const res = await updateData("clients", clientID as number, data);
      console.log(res);
      toggleModal(false);
      if (res.success) {
        setAction(!action);
        alertTimer(`El cliente se ha actualizado`, "success");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
      console.error("Error al actualizar los datos:", error);
    }
  };

  const getAllClients = async () => {
    setIsLoading(true);
    try {
      const res = await getAllData("clients");
      const data: DataRowClients[] = res.data!;
      // console.log(data);

      if (!data) setClientsData([]);
      setClientsData(data);
      // setOperationsData(data);
      setIsLoading(false);
      // setErrorMessage("");
    } catch (error) {
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
      setIsLoading(false);
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

  return (
    <>
      {prospectsForClient && (
        <div className="w-full text-center py-1 mb-2 bg-yellow-400 text-yellow-900 font-semibold rounded-md">
          Hay {prospectsForClient.length} Prospecto(s) pendientes de registrarse
          como Clientes.
        </div>
      )}
      <TableComponent<DataRowClients>
        title="Clientes"
        columns={columns}
        tableData={clientsData}
        dataFilters={dataFilters}
        handleOpenModal={toggleModal}
        isLoading={isLoading}
      />
      <div>
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
            handleSubmit={(data) =>
              clientID ? handleUpdate(data) : handleAdd(data)
            }
            prospects={prospectsForClient}
            clientData={clientData}
          />
          {errorMessage && (
            <span className="block w-full mt-2 text-center text-sm text-red-500">
              {errorMessage}
            </span>
          )}
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
            <div className="flex flex-col gap-2">
              <Information
                column="Firmante"
                text={clientInfo.signer_name}
                icon={<LuClipboardSignature size={22} />}
              />
              <Information
                column="Números de contacto"
                text={clientInfo.contact_numbers}
                icon={<RiContactsBook2Line size={22} />}
              />
              <Information
                column="Fecha de audiencia"
                text={clientInfo.hearing_date}
                icon={<RiCalendar2Line size={22} />}
              />
              <Information
                column="Observaciones"
                text={clientInfo.observations}
                icon={<RiFileInfoLine size={22} />}
              />
            </div>
          ) : (
            <span>No hay nada para mostrar</span>
          )}
        </Modal>
      </div>
    </>
  );
};
// 188
