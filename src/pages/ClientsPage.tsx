import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { Status } from "../components/pure/Status";
import { TableActions } from "../components/table/TableActions";
import { useState } from "react";
import { Modal } from "../components/pure/Modal";
import { alertTimer, confirmChange } from "../utils/alerts";
import {
  DataFilter,
  DataRowClients,
  fakeUsers,
} from "../interfaces/clients.interface";
import { DataRowProspects } from "../interfaces/prospects.interface";
import { ClientForm } from "../components/modalForms/ClientForm";

const dataFilters: DataFilter[] = [
  { id: 1, name: "Sin filtros" },
  { id: 2, name: "Pendiente de aprobación" },
  { id: 3, name: "Pendiente de audiencia" },
  { id: 4, name: "Pendiente de colocación" },
  { id: 5, name: "Colocado" },
];

export const ClientsPage = () => {
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("Agregar Cliente");
  const [clientID, setClientID] = useState<string | null>(null);

  const toggleModal = (value: boolean, id: string | null = null) => {
    const title = id ? `Editar Cliente con el ID ${id}` : "Agregar Cliente";
    if (value) setTitleModal(`${title}`);
    setIsOpenModal(value);
    setClientID(id);
  };

  const handleInfo = (id: string) => alert(`Info: ${id}`);
  const handleDelete = (id: string) => {
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
        title="Clientes"
        columns={columns}
        tableData={fakeUsers}
        dataFilters={dataFilters}
        handleOpenModal={toggleModal}
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
      </div>
    </>
  );
};
