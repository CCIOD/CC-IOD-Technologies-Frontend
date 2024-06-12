import { useField } from "formik";
import { ChangeEvent } from "react";
import { ErrMessage } from "../generic/ErrMessage";

type Props = {
  text: string;
  name: "contract" | "installation_report";
  id?: string;
  type: "file";
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};
export const InputFile = ({ text, onChange, ...props }: Props) => {
  const [, meta, helpers] = useField(props);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    helpers.setValue(file);
    helpers.setTouched(true);
    onChange(e);
  };
  return (
    <>
      <div
        className={`input-file
              after:content-[attr(data-text)] after:absolute after:size-full after:pl-2 after:flex after:items-center after:inset-0
              before:content-['Explorar'] before:absolute before:rounded-md before:right-0 before:h-full before:border before:border-green-500 before:dark:bg-green-500 before:app-text before:px-2 before:flex before:items-center hover:before:bg-green-100 hover:before:dark:bg-green-600`}
        data-text={text}
      >
        <input
          {...props}
          accept="application/pdf"
          type="file"
          className="opacity-0 absolute inset-0 z-10 size-full m-0 p-0 block cursor-pointer"
          onChange={handleChange}
        />
      </div>
      {meta.touched && meta.error && <ErrMessage message={meta.error} />}
    </>
  );
};
