import { faker } from "@faker-js/faker";
import { SelectableItem } from "./interfaces";

export type TProspectStatus = "Pendiente" | "Aprobado";

export const prospectStatusValues: SelectableItem[] = [
  { id: 1, name: "Pendiente" },
  { id: 2, name: "Aprobado" },
];

export interface DataRowProspects {
  id: string;
  name: string;
  email: string;
  address: string;
  status: TProspectStatus;
}

// Pruebas locales
const status = ["Pendiente", "Aprobado"];

const createUser = () => ({
  id: faker.string.uuid(),
  name: faker.internet.userName(),
  email: faker.internet.email(),
  address: faker.location.streetAddress(),
  status: status[Math.floor(Math.random() * status.length)] as TProspectStatus,
});

const createUsers = (numUsers = 5) =>
  new Array(numUsers).fill(undefined).map(createUser);

export const fakeUsers = createUsers(2000);
