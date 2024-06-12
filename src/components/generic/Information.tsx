import { FC, ReactNode, useMemo } from "react";
import { RiMailLine, RiPhoneLine } from "react-icons/ri";

type Props = {
  column: string;
  text: string;
  // icon: ReactNode;
};

export const Information: FC<Props> = ({ column, text }) => {
  const formatContent = (): ReactNode => {
    switch (true) {
      case column === "Números de contacto": {
        const contacts: string[] = JSON.parse(text);
        return contacts.map((contact, index) => (
          <span key={index} className="flex items-center gap-1 mr-1">
            <RiPhoneLine size={24} className="opacity-30" />
            {contact}
          </span>
        ));
      }
      case column === "Correos para información": {
        const emails: string[] = JSON.parse(text);
        return emails.map((email, index) => (
          <span key={index} className="flex items-center gap-1 mr-1">
            <RiMailLine size={24} className="opacity-30" />
            {email}
          </span>
        ));
      }
      case column.includes("Fecha"): {
        const date = new Date(text);
        const options: Intl.DateTimeFormatOptions = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        return date.toLocaleDateString("es-ES", options);
      }
      default:
        return text;
    }
  };

  const memoText = useMemo(formatContent, [column, text]);
  return (
    <>
      {text && (
        <div className=" min-h-8 flex" title={column}>
          <div className="info-column">{column}</div>
          <div className="info-text">{memoText}</div>
        </div>
      )}
    </>
  );
};
