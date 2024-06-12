import { ReactElement } from "react";
import {
  RiAdminLine,
  RiSettings3Line,
  RiUserFollowLine,
  RiUserLocationLine,
  RiUserSearchLine,
} from "react-icons/ri";

export interface ISidebar {
  title: string;
  icon: ReactElement;
  link: string;
}
const size = "!size-6 !min-w-6"; // size 24
export const sidebarStructure: ISidebar[] = [
  {
    title: "Prospectos",
    icon: <RiUserSearchLine className={size} />,
    link: "prospectos",
  },
  {
    title: "Clientes",
    icon: <RiUserFollowLine className={size} />,
    link: "clientes",
  },
  {
    title: "Portadores",
    icon: <RiUserLocationLine className={size} />,
    link: "portadores",
  },
  {
    title: "Operaciones",
    icon: <RiSettings3Line className={size} />,
    link: "operaciones",
  },
  {
    title: "Usuarios",
    icon: <RiAdminLine className={size} />,
    link: "usuarios",
  },
];
