import { FC } from "react";
import { RiDownloadCloudLine } from "react-icons/ri";

type Props = {
  file: string | null;
  text: string;
};

export const FileDownload: FC<Props> = ({ file, text }) => {
  return (
    <>
      {file ? (
        <a
          href={file}
          className="btn btn-blue py-1 font-bold"
          target="_blank"
          rel="noopener noreferrer"
        >
          <RiDownloadCloudLine size={22} />
          <span>{text}</span>
        </a>
      ) : (
        <span>No hay ningún archivo.</span>
      )}
    </>
  );
};
