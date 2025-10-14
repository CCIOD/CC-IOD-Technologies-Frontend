import { ReactElement } from "react";
import {
  RiAdminLine,
  RiUserFollowLine,
  RiUserLocationLine,
  RiUserSearchLine,
} from "react-icons/ri";
import { MdAccountBalance, MdManageAccounts } from "react-icons/md";

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
    icon: <MdManageAccounts className={size} />,
    link: "operaciones",
  },
  {
    title: "Administración",
    icon: <MdAccountBalance className={size} />,
    link: "administracion",
  },
  {
    title: "Usuarios",
    icon: <RiAdminLine className={size} />,
    link: "usuarios",
  },
];
