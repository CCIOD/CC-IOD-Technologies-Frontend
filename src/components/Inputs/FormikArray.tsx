import { useField } from "formik";
import { RiSubtractLine } from "react-icons/ri";

type TProps = {
  name: string;
  index: number;
  remove: (index: number) => void;
  length: number;
  placeholder: string;
};

export const FormikArray = ({
  name,
  index,
  remove,
  length,
  placeholder,
}: TProps) => {
  const [field, meta, helpers] = useField(name);
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <input
          {...field}
          placeholder={placeholder}
          className="app-bg border w-24 rounded-md p-1"
          onChange={(e) => {
            helpers.setValue(e.target.value);
          }}
          onBlur={() => helpers.setTouched(true)}
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
