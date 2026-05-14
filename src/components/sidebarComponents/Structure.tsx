import { ReactElement } from "react";
import {
  RiAdminLine,
  RiUserFollowLine,
  RiUserLocationLine,
  RiUserSearchLine,
  RiAlarmWarningLine,
  RiFileList3Line,
  RiFileChartLine,
  RiShieldKeyholeLine,
  RiHistoryLine,
  RiBookOpenLine,
  RiRadarLine,
  RiShieldCheckLine,
  RiFolderOpenLine,
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
    title: "Seguimiento",
    icon: <RiRadarLine className={size} />,
    link: "seguimiento",
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
    title: "Alertas",
    icon: <RiAlarmWarningLine className={size} />,
    link: "alertas",
  },
  {
    title: "Bitácora",
    icon: <RiFileList3Line className={size} />,
    link: "bitacora",
  },
  {
    title: "Reportes Semanales",
    icon: <RiFileChartLine className={size} />,
    link: "reportes-semanales",
  },
  {
    title: "Protocolos",
    icon: <RiBookOpenLine className={size} />,
    link: "protocolos",
  },
  {
    title: "Control de Acceso",
    icon: <RiShieldKeyholeLine className={size} />,
    link: "control-acceso",
  },
  {
    title: "Auditoría",
    icon: <RiHistoryLine className={size} />,
    link: "auditoria",
  },
  {
    title: "Usuarios",
    icon: <RiAdminLine className={size} />,
    link: "usuarios",
  },
  {
    title: "Documentos",
    icon: <RiFolderOpenLine className={size} />,
    link: "documentos",
  },
  {
    title: "Mi seguridad",
    icon: <RiShieldCheckLine className={size} />,
    link: "seguridad",
  },
];
