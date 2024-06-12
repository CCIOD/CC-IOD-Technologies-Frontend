import { useField } from "formik";
import { RiAsterisk } from "react-icons/ri";
import { SelectableItem } from "../../interfaces/interfaces";
import { ErrMessage } from "../generic/ErrMessage";
import { color } from "../../interfaces/form.interface";

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
      ? "input-border-error"
      : color[correctColor].border
    : "input-default";
  const textColor = meta.touched
    ? meta.error
      ? "input-text-error"
      : color[correctColor].text
    : "input-text-default";

  return (
    <div className={`min-h-16 my-1`}>
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={props.id || props.name} className="label">
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
          <div className={`input-required ${textColor}`}>
            <RiAsterisk size={14} />
          </div>
        </div>
      </div>
      {meta.touched && meta.error && <ErrMessage message={meta.error} />}
    </div>
  );
};
