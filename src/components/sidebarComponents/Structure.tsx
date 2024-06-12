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

export const sidebarStructure: ISidebar[] = [
  {
    title: "Prospectos",
    icon: <RiUserSearchLine size={24} />,
    link: "prospectos",
  },
  {
    title: "Clientes",
    icon: <RiUserFollowLine size={24} />,
    link: "clientes",
  },
  {
    title: "Portadores",
    icon: <RiUserLocationLine size={24} />,
    link: "portadores",
  },
  {
    title: "Operaciones",
    icon: <RiSettings3Line size={24} />,
    link: "operaciones",
  },
  {
    title: "Usuarios",
    icon: <RiAdminLine size={24} />,
    link: "usuarios",
  },
];
