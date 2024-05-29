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
  bgTheme = true
}: TProps) => {
  const [field, meta, helpers] = useField(name);
  const borderColor = meta.touched
    ? meta.error 
      ? "border-red-500"
      : color[correctColor].border
    : "border-gray-500";    
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-0">
        <input
          {...field}
          placeholder={placeholder}
          // className="app-bg border min-w-24 w-28 rounded-md p-1 text-sm"
          onChange={(e) => {
            helpers.setValue(e.target.value);
          }}
          onBlur={() => helpers.setTouched(true)}
          className={`p-2 w-full rounded border outline-none ${borderColor} ${
            bgTheme ? "app-bg" : ""
          }`}
          autoComplete="off"
        />
        <button
          type="button"
          className="text-xl"
          onClick={() => remove(index)}
          disabled={length === 1}
        >
          <RiSubtractLine size={24} />
        </button>
      </div>
      <div>
        {meta.touched && meta.error ? (
          <div className="text-xs text-red-500">{meta.error}</div>
        ) : null}
      </div>
    </div>
  );
};