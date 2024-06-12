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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {data.map((info, index) => (
        <Information key={index} column={info.column} text={info.text} />
      ))}
    </div>
  );
};
