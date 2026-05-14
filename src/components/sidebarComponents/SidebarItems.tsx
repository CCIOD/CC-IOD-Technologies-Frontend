import { useContext } from "react";
import { SidebarItem } from "./SidebarItem";
import { sidebarStructure } from "./Structure";
import { AuthContext } from "../../context/AuthContext";
import { UserRole } from "../../interfaces/auth.interfaces";

interface IProps {
  isExpand: boolean;
}

// Mapa de qué módulos puede ver cada rol. Si cambian las reglas, ajustar aquí.
const visibleByRole: Record<UserRole, string[]> = {
  Administrador: [
    "Prospectos",
    "Clientes",
    "Portadores",
    "Seguimiento",
    "Operaciones",
    "Administración",
    "Alertas",
    "Bitácora",
    "Reportes Semanales",
    "Protocolos",
    "Control de Acceso",
    "Auditoría",
    "Usuarios",
    "Documentos",
    "Mi seguridad",
  ],
  Director: [
    "Prospectos",
    "Clientes",
    "Portadores",
    "Seguimiento",
    "Operaciones",
    "Administración",
    "Alertas",
    "Bitácora",
    "Reportes Semanales",
    "Protocolos",
    "Control de Acceso",
    "Auditoría",
    "Usuarios",
    "Mi seguridad",
  ],
  Administrativo: ["Prospectos", "Clientes", "Administración", "Mi seguridad"],
  Seguimiento: ["Prospectos", "Clientes", "Administración", "Mi seguridad"],
  Contador: ["Administración", "Mi seguridad"],
  // Monitorista solo opera el centro de monitoreo
  Monitorista: [
    "Seguimiento",
    "Alertas",
    "Bitácora",
    "Reportes Semanales",
    "Mi seguridad",
  ],
};

export const SidebarItems = ({ isExpand }: IProps) => {
  const { user } = useContext(AuthContext);
  const allowed = user?.role ? visibleByRole[user.role] ?? [] : [];
  const structure = sidebarStructure.filter((el) => allowed.includes(el.title));

  return (
    <div className="font-normal">
      {structure.map((item, index) => (
        <SidebarItem key={index} item={item} isExpand={isExpand} />
      ))}
    </div>
  );
};
