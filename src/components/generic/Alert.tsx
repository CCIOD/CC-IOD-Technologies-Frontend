import { FC } from "react";

type Props = {
  text: string;
};

export const Alert: FC<Props> = ({ text }) => {
  return (
    <div className="w-full text-center py-1 mb-2 bg-yellow-400 text-yellow-900 font-semibold rounded-md">
      {text}
    </div>
  );
};
