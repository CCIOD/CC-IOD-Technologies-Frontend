import { FC } from "react";

type Props = {
  message: string | undefined;
};

export const ErrMessage: FC<Props> = ({ message }) => {
  return <>{message && <span className="message-error">{message}</span>}</>;
};
