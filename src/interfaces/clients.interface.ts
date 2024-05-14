import { faker } from "@faker-js/faker";

export type TStatus =
  | "Pendiente de aprobación"
  | "Pendiente de audiencia"
  | "Pendiente de colocación"
  | "Colocado";

export interface DataRowClients {
  id: string;
  name: string;
  email: string;
  address: string;
  status: TStatus;
}

export interface DataFilter {
  id: number;
  name: string;
}

// Pruebas locales
const status = [
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
  status: status[Math.floor(Math.random() * status.length)] as TStatus,
});

const createUsers = (numUsers = 5) =>
  new Array(numUsers).fill(undefined).map(createUser);

export const fakeUsers = createUsers(2000);
