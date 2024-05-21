import { useField } from "formik";
import { RiAsterisk } from "react-icons/ri";
import { SelectableItem } from "../../interfaces/interfaces";

type TProps = {
  className?: string;
  label?: string;
  handleChange?: (param: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  id?: string;
  correctColor?: "blue" | "green";
  options: SelectableItem[];
  valueText?: boolean;
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

export const FormikSelect = ({
  className,
  label,
  handleChange,
  correctColor = "blue",
  options,
  valueText = false,
  ...props
}: TProps) => {
  const [field, meta, helpers] = useField(props);
  const borderColor = meta.touched
    ? meta.error
      ? "border-red-500"
      : color[correctColor].border
    : "border-gray-500";
  const textColor = meta.touched
    ? meta.error
      ? "text-red-500"
      : color[correctColor].text
    : "text-gray-500";

  return (
    <div className={`min-h-16 my-1`}>
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={props.id || props.name} className="block">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            {...field}
            {...props}
            id={props.id || props.name}
            onChange={(e) => {
              helpers.setValue(e.target.value);
              if (handleChange) handleChange(e);
            }}
            onBlur={() => helpers.setTouched(true)}
            className={`p-2 w-full rounded border outline-none ${borderColor} app-bg`}
          >
            {options.map((option) => (
              <option
                key={option.id}
                value={valueText ? option.name : option.id}
              >
                {option.name}
              </option>
            ))}
          </select>
          <div className={`absolute top-[-1rem] right-0 ${textColor}`}>
            <RiAsterisk size={14} />
          </div>
        </div>
      </div>
      {meta.touched && meta.error && (
        <span className="text-red-500 text-xs">{meta.error}</span>
      )}
    </div>
  );
};
// 107
