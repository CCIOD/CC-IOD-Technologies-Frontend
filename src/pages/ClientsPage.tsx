import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { Status } from "../components/generic/Status";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState } from "react";
import { Modal } from "../components/generic/Modal";
import { alertTimer, confirmChange } from "../utils/alerts";
import { DataRowClients } from "../interfaces/clients.interface";
import { ClientForm } from "../components/modalForms/ClientForm";
import { getAllClientsFromApi } from "../services/clientsService";
import { DataFilter } from "../interfaces/prospects.interface";
import { Information } from "../components/generic/Information";
import {
  RiCalendar2Line,
  RiContactsBook2Line,
  RiFileInfoLine,
} from "react-icons/ri";
import { LuClipboardSignature } from "react-icons/lu";

const dataFilters: DataFilter[] = [
  { id: 1, name: "Sin filtros" },
  { id: 2, name: "Pendiente de aprobación" },
  { id: 3, name: "Pendiente de audiencia" },
  { id: 4, name: "Pendiente de colocación" },
  { id: 5, name: "Colocado" },
];

export const ClientsPage = () => {
  const [clientsData, setClientsData] = useState<DataRowClients[]>([]);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("Agregar Cliente");
  const [isOpenModalInfo, setIsOpenModalInfo] = useState<boolean>(false);
  const [titleModalInfo, setTitleModalInfo] = useState<string>("Información");
  const [clientID, setClientID] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState<DataRowClients>();

  const toggleModal = (value: boolean, id: number | null = null) => {
    const title = id ? `Editar Cliente con el ID ${id}` : "Agregar Cliente";
    if (value) setTitleModal(`${title}`);
    setIsOpenModal(value);
    setClientID(id);
  };
  const toggleModalInfo = (value: boolean) => setIsOpenModalInfo(value);

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
          handleClickUpdate={() => toggleModal(true, row.id)}
          handleClickDelete={() => handleDelete(row.id)}
        />
      ),
    },
  ];

  const handleAdd = () => {
    alert("Adding");
    toggleModal(false);
  };
  const handleUpdate = () => {
    alert("Updating");
    toggleModal(false);
  };

  const getAllClients = async () => {
    setIsLoading(true);
    try {
      const res = await getAllClientsFromApi();
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
  useEffect(() => {
    getAllClients();
  }, []);

  return (
    <>
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
        >
          <ClientForm
            toggleModal={toggleModal}
            btnText={clientID ? "Actualizar" : "Agregar"}
            handleClick={clientID ? handleUpdate : handleAdd}
          />
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
