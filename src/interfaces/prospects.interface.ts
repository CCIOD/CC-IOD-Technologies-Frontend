import { faker } from "@faker-js/faker";

export type TStatus = "Pendiente" | "Aprobado";

export interface DataRowProspects {
  id: string;
  name: string;
  email: string;
  address: string;
  status: TStatus;
}

export interface DataFilter {
  id: number | string;
  name: string;
  status?: string;
}

// Pruebas locales
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

export const fakeUsers = createUsers(2000);
