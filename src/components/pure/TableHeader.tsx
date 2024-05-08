import { ChangeEvent } from "react";
import { RiAddLine, RiCloseLine } from "react-icons/ri";
import { Button } from "./Button";

export const TableHeader = ({
  filterText,
  onFilter,
  onClear,
  title,
}: {
  filterText: string;
  onFilter: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  title: string;
}) => (
  <div className="flex gap-3 justify-normal md:justify-between flex-col md:flex-row items-start md:items-center h-[6rem] md:h-12 mt-4">
    <span className="text-lg font-bold">{title}</span>
    <div className="w-full flex justify-between md:justify-end gap-3">
      <div className="flex">
        <input
          id="search"
          type="text"
          placeholder="Filter By Name"
          aria-label="Search Input"
          value={filterText}
          onChange={onFilter}
          className="outline-none px-2 app-bg2"
        />
        <button className="app-bg3" type="button" onClick={onClear}>
          <RiCloseLine size={24} />
        </button>
      </div>
      <Button title="Agregar nuevo">
        <span className="hidden sm:block">Agregar</span> <RiAddLine size={24} />
      </Button>
    </div>
  </div>
);
