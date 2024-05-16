import { useField } from 'formik';
import { ReactNode } from 'react';
import { RiAsterisk } from 'react-icons/ri';

type TProps = {
  className?: string;
  label?: string;
  handleChange?: (param: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  placeholder: string;
  id?: string;
  type: string;
  icon?: ReactNode,
  required?: boolean,
  correctColor?: "blue" | "green",
  onClickIcon? : () => void
}
type TColor = {
  [param: string]: {
    border: string;
    text: string;
  }
}
const color: TColor = {
  blue: {
    border: "border-blue-500",
    text: "text-blue-500",
  },
  green: {
    border: "border-green-500",
    text: "text-green-500",
  }
}

export const FormikInput = ({
  className, label, handleChange, icon, required = false,
  correctColor = "blue", onClickIcon, ...props }: TProps) => {
  const [field, meta, helpers] = useField(props);
  const borderColor = meta.touched
    ? (meta.error ? 'border-red-500'
    : color[correctColor].border) : 'border-gray-500';
  const textColor = meta.touched
    ? (meta.error ? 'text-red-500' : color[correctColor].text) : 'text-gray-500';

  const handleClickIcon = () => {
    if(onClickIcon) onClickIcon();
  }
  return (
    <div className={`min-h-16 my-1`}>
      <div className={`relative w-full ${className}`}>
        {label && (
          <label htmlFor={props.id || props.name} className='mb-2 block'>{label}</label>
        )}
        <input {...field} {...props}
          onChange={(e) => {
            helpers.setValue(e.target.value)
            if (handleChange) handleChange(e);
          }}
          onBlur={() => helpers.setTouched(true)}
          className={`p-2 w-full rounded border outline-none ${borderColor}`}
          autoComplete='off' />
        {icon && (
          <div className={`absolute bottom-3 right-2 text-xl ${textColor} ${props.name === "password" ? "cursor-pointer" : ""}`} onClick={handleClickIcon}>
            {icon}
          </div>
        )}
        {required && (
          <div className={`absolute top-[-1rem] right-0 ${textColor}`}>
            <RiAsterisk size={14}  />
          </div>
        )}
      </div>
      {(meta.touched && meta.error) && (
        <span className='text-red-500 text-xs'>{meta.error}</span>
      )}
    </div>
  );
};