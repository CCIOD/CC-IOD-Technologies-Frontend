import { FC, ReactNode, useMemo } from "react";
import { RiPhoneLine } from "react-icons/ri";

type Props = {
  column: string;
  text: string;
  icon: ReactNode;
};

export const Information: FC<Props> = ({ column, text, icon }) => {
  const formatContent = (): ReactNode => {
    switch (true) {
      case column === "Números de contacto": {
        const contacts: string[] = JSON.parse(text);
        return contacts.map((contact, index) => (
          <span key={index} className="flex items-center gap-1 mr-1">
            <RiPhoneLine size={20} />
            {contact}
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
  const bg = "bg-gray-500 dark:bg-gray-900";
  return (
    <div className="flex min-h-8">
      <div
        className={`${bg} !bg-opacity-50 w-2/12 xs:w-1/12 flex-center`}
        title={column}
      >
        {icon}
      </div>
      <div
        className={`${bg} bg-opacity-20 w-10/12 xs:w-11/12 flex flex-wrap items-center px-2`}
      >
        {other}
      </div>
    </div>
  );
};
