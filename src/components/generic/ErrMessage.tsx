import { FC } from "react";

type Props = {
  message: string | undefined;
  center?: boolean;
};

export const ErrMessage: FC<Props> = ({ message, center = true }) => {
  return (
    <>
      {message && (
        <span className={`message-error ${center ? "text-center" : "mb-2"}`}>
          {message}
        </span>
      )}
    </>
  );
};
