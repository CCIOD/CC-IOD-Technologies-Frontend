import { FC } from "react";
import { Button } from "../pure/Button";
import { RiDeleteBinLine, RiEditLine, RiFileListLine } from "react-icons/ri";

type Props = {
  handleClickUpdate?: () => void;
  handleClickDelete?: () => void;
  handleClickInfo?: () => void;
};

export const TableActions: FC<Props> = ({
  handleClickUpdate,
  handleClickDelete,
  handleClickInfo,
}) => {
  const handleUpdate = () => {
    if (handleClickUpdate) handleClickUpdate();
  };
  const handleDelete = () => {
    if (handleClickDelete) handleClickDelete();
  };
  const handleInfo = () => {
    if (handleClickInfo) handleClickInfo();
  };
  return (
    <div className="flex gap-2 pr-4">
      {handleClickInfo && (
        <Button color="sky" onClick={handleInfo} title="Ver más información.">
          <RiFileListLine size={20} />
        </Button>
      )}
      {handleClickUpdate && (
        <Button
          color="green"
          onClick={handleUpdate}
          title="Editar este registro."
        >
          <RiEditLine size={20} />
        </Button>
      )}
      {handleClickDelete && (
        <Button
          color="warning"
          onClick={handleDelete}
          title="Eliminar este registro."
        >
          <RiDeleteBinLine size={20} />
        </Button>
      )}
    </div>
  );
};
