import { FC } from "react";

type Props = {
  message: string | undefined;
};

export const ErrMessage: FC<Props> = ({ message }) => {
  return (
    <>
      {message && (
        <span className="block w-full mt-2 text-center text-sm text-red-500">
          {message}
        </span>
      )}
    </>
  );
};
