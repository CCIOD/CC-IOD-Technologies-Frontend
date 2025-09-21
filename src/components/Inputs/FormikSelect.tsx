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
  required?: boolean;
};

export const FormikSelect = ({
  className,
  label,
  handleChange,
  correctColor = "blue",
  options,
  valueText = false,
  required = false,
  ...props
}: TProps) => {
  const [field, meta, helpers] = useField(props);
  
  // Mostrar error si el campo fue tocado O si hay un error (para arrays)
  const shouldShowError = (meta.touched || meta.error) && meta.error;
  
  const borderColor = shouldShowError
    ? "input-border-error"
    : meta.touched && !meta.error
    ? color[correctColor].border
    : "input-default";
    
  const textColor = shouldShowError
    ? "input-text-error"
    : meta.touched && !meta.error
    ? color[correctColor].text
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
          {required && (
            <div className={`input-required ${textColor}`}>
              <RiAsterisk size={14} />
            </div>
          )}
        </div>
      </div>
      {shouldShowError && <ErrMessage message={meta.error} />}
    </div>
  );
};
