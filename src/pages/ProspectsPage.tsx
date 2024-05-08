import { TableComponent } from "../components/pure/TableComponent";
import { TableColumn } from "react-data-table-component";
import { faker } from "@faker-js/faker";
import { DataRow, TStatus } from "../interfaces/tableData.interface";
import { Status } from "../components/pure/Status";
import { TableActions } from "../components/pure/TableActions";

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

const states = [
  "Pendiente",
  "Aprobado",
  "Pendiente de aprobación",
  "Pendiente de audiencia",
  "Pendiente de colocación",
  "Colocado",
];

const createUser = () => ({
  id: faker.string.uuid(),
  name: faker.internet.userName(),
  email: faker.internet.email(),
  address: faker.location.streetAddress(),
  // status: "Pendiente de aprobación" as TStatus,
  status: states[Math.floor(Math.random() * states.length)] as TStatus,
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

export const ProspectsPage = () => {
  return (
    <>
      <TableComponent
        title="Prospectos"
        columns={columns}
        tableData={fakeUsers}
      />
    </>
  );
};
// 101
