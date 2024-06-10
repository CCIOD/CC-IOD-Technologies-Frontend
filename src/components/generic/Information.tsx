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

  const other = useMemo(formatContent, [column, text]);
  return (
    <div className="relative min-h-8" title={column}>
      <div className="absolute bottom-0 right-0 bg-gray-700 text-cciod-white-200 px-2">
        {column}
      </div>
      <div
        className={`text-justify border border-gray-400 dark:border-gray-700 border-opacity-40 min-h-8 flex flex-wrap items-center pl-2 pr-40`}
      >
        {other}
      </div>
    </div>
  );
};
