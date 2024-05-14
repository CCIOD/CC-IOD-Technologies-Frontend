import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { Status } from "../components/pure/Status";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState } from "react";
import { getAllProspectsAPI } from "../services/prospectsService";
import { Modal } from "../components/pure/Modal";
import { alertTimer, confirmChange } from "../utils/alerts";
import { ProspectForm } from "../components/modalForms/ProspectForm";
import {
  DataFilter,
  DataRowProspects,
  fakeUsers,
} from "../interfaces/prospects.interface";
import { DataRowClients } from "../interfaces/clients.interface";
// import { DataRowClients } from "../interfaces/clients.interface";

const dataFilters: DataFilter[] = [
  { id: 1, name: "Sin filtros" },
  { id: 2, name: "Pendiente" },
  { id: 3, name: "Aprobado" },
];

export const ProspectsPage = () => {
  const [prospectsData, setProspectsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("Agregar Prospecto");
  const [prospectID, setProspectID] = useState<string | null>(null);

  const toggleModal = (value: boolean, id: string | null = null) => {
    const title = id ? `Editar Prospecto con el ID ${id}` : "Agregar Prospecto";
    if (value) setTitleModal(`${title}`);
    setIsOpenModal(value);
    setProspectID(id);
  };

  const handleInfo = (id: string) => alert(`Info: ${id}`);
  const handleDelete = (id: string) => {
    const confirm = confirmChange({
      title: "Eliminar Prospecto",
      text: `¿Está seguro de querer eliminar el Prospecto con el ID ${id}?`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    confirm.then((res) => {
      if (res.success) alertTimer("El prospecto ha sido eliminado", "success");
    });
  };

  const columns: TableColumn<DataRowProspects | DataRowClients>[] = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Address",
      selector: (row) => row.address,
    },
    {
      name: "Status",
      cell: (row) => <Status status={row.status} />,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <TableActions
          handleClickInfo={() => handleInfo(row.id)}
          handleClickUpdate={() => toggleModal(true, row.id)}
          handleClickDelete={() => handleDelete(row.id)}
        />
      ),
    },
  ];

  const getAllProspects = async () => {
    setIsLoading(true);
    try {
      const { data } = await getAllProspectsAPI();
      if (!data) setProspectsData([]);
      console.log(prospectsData);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getAllProspects();
  }, []);

  const handleAdd = () => {
    alert("Adding");
    toggleModal(false);
  };
  const handleUpdate = () => {
    alert("Updating");
    toggleModal(false);
  };

  return (
    <>
      <TableComponent
        title="Prospectos"
        columns={columns}
        tableData={fakeUsers}
        dataFilters={dataFilters}
        isLoading={isLoading}
        handleOpenModal={toggleModal}
      />
      <div>
        <Modal
          title={titleModal}
          isOpen={isOpenModal}
          toggleModal={toggleModal}
          backdrop
        >
          <ProspectForm
            toggleModal={toggleModal}
            btnText={prospectID ? "Actualizar" : "Agregar"}
            handleClick={prospectID ? handleUpdate : handleAdd}
          />
        </Modal>
      </div>
    </>
  );
};
