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
          className="flex-center gap-2 bg-blue-900 px-2 py-2 text-white rounded-md hover:bg-blue-800 transition duration-100 w-full"
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
// 58
