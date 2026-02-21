import { useContext } from "react";
import { SidebarItem } from "./SidebarItem";
import { sidebarStructure } from "./Structure";
import { AuthContext } from "../../context/AuthContext";

interface IProps {
  isExpand: boolean;
}
export const SidebarItems = ({ isExpand }: IProps) => {
  const { user } = useContext(AuthContext);

  const structure =
    user?.role === "Administrativo"
      ? sidebarStructure.filter(
        (el) =>
          el.title === "Prospectos" ||
          el.title === "Clientes" ||
          el.title === "Administración"
      )
      : user?.role === "Seguimiento"
        ? sidebarStructure.filter(
          (el) =>
            el.title === "Prospectos" ||
            el.title === "Clientes" ||
            el.title === "Administración"
        )
        : sidebarStructure;

  return (
    <div className="font-normal">
      {structure.map((item, index) => (
        <SidebarItem key={index} item={item} isExpand={isExpand} />
      ))}
    </div>
  );
};
