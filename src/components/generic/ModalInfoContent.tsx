import { FC } from "react";
import { Information } from "../generic/Information";

interface cardInfo {
  column: string;
  text: string;
}
type Props = {
  data: cardInfo[];
};

export const ModalInfoContent: FC<Props> = ({ data }) => {
  return (
    <div className="flex flex-col gap-2">
      {data.map((info, index) => (
        <Information key={index} column={info.column} text={info.text} />
      ))}
    </div>
  );
};
