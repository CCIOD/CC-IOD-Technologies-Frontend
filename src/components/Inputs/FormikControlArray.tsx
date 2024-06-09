import { Button } from "../generic/Button";
import { RiAddFill } from "react-icons/ri";
import { FormikArray } from "./FormikArray";
import { FC } from "react";

type Props = {
  title: string;
  values: string[];
  push: (value: string) => void;
  remove: (value: number) => void;
  name: string;
};

export const FormikControlArray: FC<Props> = ({
  title,
  values,
  push,
  remove,
  name,
}) => {
  return (
    <div>
      <span className="app-text-form">{title}</span>
      <div className="flex gap-2">
        <Button type="button" size="min" color="green" onClick={() => push("")}>
          <RiAddFill size={20} />
        </Button>
        <div className="flex gap-2 flex-wrap justify-normal 2xl:justify-between pr-6 w-full">
          {values.map((_: string, index: number) => (
            <FormikArray
              placeholder="Email"
              key={index}
              name={`${name}.${index}`}
              index={index}
              remove={remove}
              length={values.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
