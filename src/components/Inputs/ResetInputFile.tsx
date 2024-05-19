import { FC } from "react";
import { Button } from "../generic/Button";
import { RiFileCloseLine } from "react-icons/ri";

type Props = {
  filename: string;
  handleClick: () => void;
};

export const ResetInputFile: FC<Props> = ({ filename, handleClick }) => {
  return (
    <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 px-2 pb-1">
      <span>{filename ? filename.match(/\/([^/?#]+)$/)![1] : ""}</span>
      <Button
        size="sm"
        className="w-7"
        color="failure"
        title="Eliminar"
        onClick={handleClick}
      >
        <RiFileCloseLine size={20} />
      </Button>
    </div>
  );
};
