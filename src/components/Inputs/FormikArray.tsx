import { useField } from "formik";
import { RiSubtractLine } from "react-icons/ri";
import { ErrMessage } from "../generic/ErrMessage";
import { color } from "../../interfaces/form.interface";

type TProps = {
  name: string;
  index: number;
  remove: (index: number) => void;
  length: number;
  placeholder: string;
  correctColor?: "blue" | "green";
  bgTheme?: boolean;
};
export const FormikArray = ({
  name,
  index,
  remove,
  length,
  placeholder,
  correctColor = "green",
  bgTheme = true,
}: TProps) => {
  const [field, meta, helpers] = useField(name);
  const borderColor = meta.touched
    ? meta.error
      ? "input-border-error"
      : color[correctColor].border
    : "input-border-default";
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-0 w-full">
        <input
          {...field}
          placeholder={placeholder}
          onChange={(e) => {
            helpers.setValue(e.target.value);
          }}
          onBlur={() => helpers.setTouched(true)}
          className={`input-array ${borderColor} ${bgTheme ? "app-bg" : ""}`}
          autoComplete="off"
        />
        {length > 1 && (
          <button
            type="button"
            className={`text-xl ${color[correctColor].hover}`}
            onClick={() => remove(index)}
            disabled={length === 1}
          >
            <RiSubtractLine size={20} />
          </button>
        )}
      </div>
      <div>
        {meta.touched && meta.error ? (
          <ErrMessage message={meta.error} />
        ) : null}
      </div>
    </div>
  );
};
