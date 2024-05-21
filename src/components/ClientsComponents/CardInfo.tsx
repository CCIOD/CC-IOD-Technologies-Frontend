import { FC } from "react";
import { Information } from "../generic/Information";
import { LuClipboardSignature } from "react-icons/lu";
import {
  RiCalendar2Line,
  RiContactsBook2Line,
  RiFileInfoLine,
} from "react-icons/ri";

type Props = {
  signer_name: string;
  contact_numbers: string;
  hearing_date: string;
  observations: string;
};

export const CardInfo: FC<Props> = ({
  signer_name,
  contact_numbers,
  hearing_date,
  observations,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Information
        column="Firmante"
        text={signer_name}
        icon={<LuClipboardSignature size={22} />}
      />
      <Information
        column="Números de contacto"
        text={contact_numbers}
        icon={<RiContactsBook2Line size={22} />}
      />
      <Information
        column="Fecha de audiencia"
        text={hearing_date}
        icon={<RiCalendar2Line size={22} />}
      />
      <Information
        column="Observaciones"
        text={observations}
        icon={<RiFileInfoLine size={22} />}
      />
    </div>
  );
};
