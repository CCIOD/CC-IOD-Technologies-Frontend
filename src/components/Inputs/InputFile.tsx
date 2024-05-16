import { ChangeEvent } from "react";

type Props = {
  text: string;
  name: "contract" | "installation_report";
  id?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};
export const InputFile = ({ text, name, id, onChange }: Props) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };
  return (
    <div
      className={`relative h-10 app-border3 rounded-md overflow-hidden
              after:content-[attr(data-text)] after:absolute after:size-full after:pl-2 after:flex after:items-center after:inset-0
              before:content-['Explorar'] before:absolute before:right-0 before:h-full before:bg-green-500 before:text-cciod-white-100 before:px-2 before:flex before:items-center hover:before:bg-green-600 transition duration-100 ease-out`}
      data-text={text}
    >
      <input
        id={id ? id : name}
        name={name}
        accept="application/pdf"
        type="file"
        className="opacity-0 absolute inset-0 z-10 size-full m-0 p-0 block cursor-pointer"
        onChange={(e) => handleChange(e)}
      />
    </div>
  );
};
