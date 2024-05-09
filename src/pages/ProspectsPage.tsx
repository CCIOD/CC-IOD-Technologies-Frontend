import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { faker } from "@faker-js/faker";
import { DataRow, TStatus } from "../interfaces/tableData.interface";
import { Status } from "../components/pure/Status";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState } from "react";
import { getAllProspectsAPI } from "../services/prospectsService";

const columns: TableColumn<DataRow>[] = [
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
    sortable: true,
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
        handleClickUpdate={() => handleUpdate(row.id)}
        handleClickDelete={() => handleDelete(row.id)}
      />
    ),
  },
];

const status = ["Pendiente", "Aprobado"];

const createUser = () => ({
  id: faker.string.uuid(),
  name: faker.internet.userName(),
  email: faker.internet.email(),
  address: faker.location.streetAddress(),
  status: status[Math.floor(Math.random() * status.length)] as TStatus,
});

const createUsers = (numUsers = 5) =>
  new Array(numUsers).fill(undefined).map(createUser);

const fakeUsers = createUsers(2000);
const handleInfo = (id: string) => {
  console.log(`Información del usuario: ${id}`);
};
const handleUpdate = (id: string) => {
  console.log(`Usuario a editar: ${id}`);
};
const handleDelete = (id: string) => {
  console.log(`Usuario a eliminar: ${id}`);
};

type DataFilter = {
  id: number;
  name: string;
};
const dataFilters: DataFilter[] = [
  { id: 1, name: "Sin filtros" },
  { id: 2, name: "Pendiente" },
  { id: 3, name: "Aprobado" },
];

export const ProspectsPage = () => {
  const [prospectsData, setProspectsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllProspects = async () => {
    setIsLoading(true);
    try {
      const { data } = await getAllProspectsAPI();
      if (!data) setProspectsData([]);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getAllProspects();
  }, []);

  return (
    <>
      <TableComponent
        title="Prospectos"
        columns={columns}
        tableData={fakeUsers}
        // tableData={prospectsData}
        dataFilters={dataFilters}
        isLoading={isLoading}
      />
    </>
  );
};
