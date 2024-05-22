import { FC } from "react";
import { Information } from "../generic/Information";
import { LuClipboardSignature } from "react-icons/lu";
import {
  RiCalendar2Line,
  RiContactsBook2Line,
  RiFileInfoLine,
} from "react-icons/ri";

type Props = {
  placement_date: string;
  placement_time: string;
  information_emails: string;
  house_arrest: string;
  relationship: string;
  observations: string;
};

export const CardInfo: FC<Props> = ({
  placement_date,
  placement_time,
  information_emails,
  house_arrest,
  relationship,
  observations,
}) => {
  return (
    <div className="flex flex-col gap-2 mt-4">
      <Information
        column="Fecha de colocación"
        text={placement_date}
        icon={<LuClipboardSignature size={22} />}
      />
      <Information
        column="Hora de colocación"
        text={placement_time}
        icon={<LuClipboardSignature size={22} />}
      />
      <Information
        column="Correos de contacto"
        text={information_emails}
        icon={<RiContactsBook2Line size={22} />}
      />
      <Information
        column="Arraigo domiciliario"
        text={house_arrest}
        icon={<RiCalendar2Line size={22} />}
      />
      <Information
        column="Parentesco"
        text={relationship}
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
