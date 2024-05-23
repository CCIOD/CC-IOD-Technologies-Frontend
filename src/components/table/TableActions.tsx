import { FC } from "react";
import {
  RiDeleteBinLine,
  RiEditLine,
  RiFileListLine,
  RiUploadCloudLine,
} from "react-icons/ri";
import { Button } from "../generic/Button";

type Props = {
  handleClickUpdate?: () => void;
  handleClickDelete?: () => void;
  handleClickInfo?: () => void;
  handleUploadFiles?: () => void;
  uploadFilesColor?: "green" | "sky";
};

export const TableActions: FC<Props> = ({
  handleClickUpdate,
  handleClickDelete,
  handleClickInfo,
  handleUploadFiles,
  uploadFilesColor = "green",
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
          color={uploadFilesColor}
          size="auto"
          onClick={handleupload}
          title="Subir archivos"
          className="size-10 lg:size-auto"
        >
          <RiUploadCloudLine size={22} />
          <span className="hidden lg:block">
            {uploadFilesColor === "green"
              ? "Subir archivos"
              : "Editar archivos"}
          </span>
        </Button>
      )}
      {handleClickUpdate && (
        <Button
          color="green"
          size="min"
          onClick={handleUpdate}
          title="Editar este registro."
        >
          <RiEditLine size={22} />
        </Button>
      )}
      {handleClickDelete && (
        <Button
          color="failure"
          size="min"
          onClick={handleDelete}
          title="Eliminar este registro."
        >
          <RiDeleteBinLine size={22} />
        </Button>
      )}
      {handleClickInfo && (
        <Button
          color="sky"
          size="min"
          onClick={handleInfo}
          title="Ver más información."
        >
          <RiFileListLine size={22} />
        </Button>
      )}
    </div>
  );
};
