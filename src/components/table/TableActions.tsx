import { FC } from "react";
// import { Button } from "../common/Button";
import {
  RiDeleteBinLine,
  RiEditLine,
  RiFileListLine,
  RiUpload2Line,
} from "react-icons/ri";
import { Button } from "../generic/Button";

type Props = {
  handleClickUpdate?: () => void;
  handleClickDelete?: () => void;
  handleClickInfo?: () => void;
  handleUploadFiles?: () => void;
};

export const TableActions: FC<Props> = ({
  handleClickUpdate,
  handleClickDelete,
  handleClickInfo,
  handleUploadFiles,
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
  const handleupload = () => {
    if (handleUploadFiles) handleUploadFiles();
  };
  return (
    <div className="flex gap-2 pr-4">
      {handleUploadFiles && (
        <Button
          color="green"
          size="auto"
          onClick={handleupload}
          title="Subir archivos"
          className="size-10 lg:size-auto"
        >
          <RiUpload2Line size={20} />
          <span className="hidden lg:block">Subir archivos</span>
        </Button>
      )}
      {handleClickInfo && (
        <Button
          color="sky"
          size="min"
          onClick={handleInfo}
          title="Ver más información."
        >
          <RiFileListLine size={20} />
        </Button>
      )}
      {handleClickUpdate && (
        <Button
          color="green"
          size="min"
          onClick={handleUpdate}
          title="Editar este registro."
        >
          <RiEditLine size={20} />
        </Button>
      )}
      {handleClickDelete && (
        <Button
          color="warning"
          size="min"
          onClick={handleDelete}
          title="Eliminar este registro."
        >
          <RiDeleteBinLine size={20} />
        </Button>
      )}
    </div>
  );
};
