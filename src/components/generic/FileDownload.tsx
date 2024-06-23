import { FC } from "react";
import { RiDownloadCloudLine } from "react-icons/ri";

type Props = {
  file: string | null;
};

export const FileDownload: FC<Props> = ({ file }) => {
  return (
    <>
      {file ? (
        <a href={file} className="btn btn-blue py-1 text-sm" download>
          <RiDownloadCloudLine size={22} />
          <span>Descargar</span>
        </a>
      ) : (
        <span>No hay ningún archivo.</span>
      )}
    </>
  );
};
