import { FC, ReactNode, useMemo } from "react";
import { RiMailLine, RiPhoneLine } from "react-icons/ri";

type Props = {
  column: string;
  text: string;
  // icon: ReactNode;
};

export const Information: FC<Props> = ({ column, text }) => {
  const formatContent = (): ReactNode => {
    const tryParseJSON = (jsonString: string): string[] | null => {
      try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    };

    switch (true) {
      case column === "Números de contacto": {
        const contacts = tryParseJSON(text);
        if (contacts) {
          return contacts.map((contact, index) => (
            <span key={index} className="flex items-center gap-1 mr-1">
              <RiPhoneLine size={24} className="opacity-30" />
              {contact}
            </span>
          ));
        } else {
          // Si no es JSON válido, tratar como texto simple
          return (
            <span className="flex items-center gap-1 mr-1">
              <RiPhoneLine size={24} className="opacity-30" />
              {text}
            </span>
          );
        }
      }
      case column === "Correos para información": {
        const emails = tryParseJSON(text);
        if (emails) {
          return emails.map((email, index) => (
            <span key={index} className="flex items-center gap-1 mr-1">
              <RiMailLine size={24} className="opacity-30" />
              {email}
            </span>
          ));
        } else {
          // Si no es JSON válido, tratar como texto simple
          return (
            <span className="flex items-center gap-1 mr-1">
              <RiMailLine size={24} className="opacity-30" />
              {text}
            </span>
          );
        }
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
        <div
          className={`information ${
            column === "Observaciones" ? "md:col-span-2" : ""
          }`}
          title={column}
        >
          <div className="info-column">{column}</div>
          <div className="info-text">{memoText}</div>
        </div>
      )}
    </>
  );
};
