import { useField } from "formik";
import { ReactNode } from "react";
import { RiAsterisk } from "react-icons/ri";
import { ErrMessage } from "../generic/ErrMessage";
import { color } from "../../interfaces/form.interface";

type TProps = {
  className?: string;
  label?: string;
  handleChange?: (param: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  placeholder?: string;
  id?: string;
  type: "text" | "number" | "hidden" | "password" | "date" | "time";
  icon?: ReactNode;
  required?: boolean;
  correctColor?: "blue" | "green";
  onClickIcon?: () => void;
  bgTheme?: boolean;
  disabled?: boolean;
};

export const FormikInput = ({
  className,
  label,
  handleChange,
  icon,
  required = false,
  correctColor = "blue",
  onClickIcon,
  bgTheme = true,
  disabled = false,
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

  const cursorPass = props.name === "password" ? "cursor-pointer" : "";
  const bg = bgTheme ? "app-bg" : "";
  
  // Agregar estilo para campo deshabilitado
  const disabledStyle = disabled ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "";
  
  const handleClickIcon = () => {
    if (onClickIcon) onClickIcon();
  };
  return (
    <div className={`min-h-16 my-1`}>
      <div className={`w-full ${className}`}>
        {label && (
          <label htmlFor={props.id || props.name} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            {...field}
            {...props}
            id={props.id || props.name}
            disabled={disabled}
            onChange={(e) => {
              helpers.setValue(e.target.value);
              if (handleChange) handleChange(e);
            }}
            onBlur={() => helpers.setTouched(true)}
            className={`p-2 w-full rounded border outline-none ${borderColor} ${disabled ? disabledStyle : bg}`}
            autoComplete="off"
          />
          {icon && (
            <div
              className={`password-icon ${textColor} ${cursorPass}`}
              onClick={handleClickIcon}
            >
              {icon}
            </div>
          )}
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
