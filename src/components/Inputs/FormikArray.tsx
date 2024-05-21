import { useField } from "formik";

type TProps = {
  name: string;
  index: number;
  remove: (index: number) => void;
  length: number;
};

export const FormikArray = ({ name, index, remove, length }: TProps) => {
  const [field, meta, helpers] = useField(name);
  return (
    <>
      <div className="flex items-center gap-2">
        <input
          {...field}
          placeholder="0000000000"
          className="app-bg border w-24 rounded-md p-1"
          onChange={(e) => {
            helpers.setValue(e.target.value);
          }}
          onBlur={() => helpers.setTouched(true)}
        />
        <button
          type="button"
          className="mx-1 text-xl"
          onClick={() => remove(index)}
          disabled={length === 1}
        >
          -
        </button>
      </div>
      <div>
        {meta.touched && meta.error ? (
          <div className="text-xs text-red-500">{meta.error}</div>
        ) : null}
      </div>
    </>
  );
};
