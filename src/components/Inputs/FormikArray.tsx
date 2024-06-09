import { useField } from "formik";
import { RiSubtractLine } from "react-icons/ri";

type TProps = {
  name: string;
  index: number;
  remove: (index: number) => void;
  length: number;
  placeholder: string;
  correctColor?: "blue" | "green";
  bgTheme?: boolean;
};
type TColor = {
  [param: string]: {
    border: string;
    text: string;
  };
};
const color: TColor = {
  blue: {
    border: "border-blue-500",
    text: "text-blue-500",
  },
  green: {
    border: "border-green-500",
    text: "text-green-500",
  },
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
      ? "border-red-500"
      : color[correctColor].border
    : "border-gray-500";
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
          className={`py-2 px-1 rounded border w-64 xl:w-32 2xl:w-44 text-sm outline-none ${borderColor} ${
            bgTheme ? "app-bg" : ""
          }`}
          autoComplete="off"
        />
        {length > 1 && (
          <button
            type="button"
            className="text-xl hover:text-green-500"
            onClick={() => remove(index)}
            disabled={length === 1}
          >
            <RiSubtractLine size={20} />
          </button>
        )}
      </div>
      <div>
        {meta.touched && meta.error ? (
          <div className="text-xs text-red-500">{meta.error}</div>
        ) : null}
      </div>
    </div>
  );
};
