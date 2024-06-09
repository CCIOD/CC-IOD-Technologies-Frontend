import { FC } from "react";
import {
  RiDeleteBinLine,
  RiEditLine,
  RiFileListLine,
  RiLockPasswordLine,
  RiUploadCloudLine,
} from "react-icons/ri";
import { Button } from "../generic/Button";

type Props = {
  handleClickUpdate?: () => void;
  handleClickDelete?: () => void;
  handleClickInfo?: () => void;
  handleUploadFiles?: () => void;
  uploadFilesColor?: "gray" | "warning";
  handleChangePassword?: () => void;
};

export const TableActions: FC<Props> = ({
  handleClickUpdate,
  handleClickDelete,
  handleClickInfo,
  handleUploadFiles,
  handleChangePassword,
  uploadFilesColor = "gray",
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
  const handlePassword = () => {
    if (handleChangePassword) handleChangePassword();
  };
  return (
    <div className="flex gap-2 pr-4">
      {handleUploadFiles && (
        <Button
          color={uploadFilesColor}
          size="min"
          onClick={handleupload}
          title="Subir archivos"
        >
          <RiUploadCloudLine size={24} />
        </Button>
      )}
      {handleClickUpdate && (
        <Button
          color="green"
          size="min"
          onClick={handleUpdate}
          title="Editar este registro."
        >
          <RiEditLine size={24} />
        </Button>
      )}
      {handleChangePassword && (
        <Button
          color="sky"
          size="min"
          onClick={handlePassword}
          title="Cambiar contraseña"
        >
          <RiLockPasswordLine size={24} />
        </Button>
      )}
      {handleClickDelete && (
        <Button
          color="failure"
          size="min"
          onClick={handleDelete}
          title="Eliminar este registro."
        >
          <RiDeleteBinLine size={24} />
        </Button>
      )}
      {handleClickInfo && (
        <Button
          color="purple"
          size="min"
          onClick={handleInfo}
          title="Ver más información."
        >
          <RiFileListLine size={24} />
        </Button>
      )}
    </div>
  );
};
