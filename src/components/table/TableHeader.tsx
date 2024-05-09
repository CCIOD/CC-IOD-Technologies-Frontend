import { ChangeEvent, useState } from "react";
import { RiAddLine, RiCloseLine, RiSearchLine } from "react-icons/ri";
import { Button } from "../pure/Button";
import { SelectorFilter } from "./SelectorFilter";

type DataFilter = {
  id: number;
  name: string;
};
export const TableHeader = ({
  filterText,
  onSelectorFilter,
  title,
  dataFilters,
  onClear,
  onInputFilter,
}: {
  filterText?: string;
  onSelectorFilter?: (e: DataFilter) => void;
  onInputFilter?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  title: string;
  dataFilters?: DataFilter[] | null;
}) => {
  const initialFilterSelect = dataFilters
    ? dataFilters[0]
    : { id: 1, name: "Sin filtros" };
  const [selectedPerson, setSelectedPerson] =
    useState<DataFilter>(initialFilterSelect);

  const handleChange = (e: DataFilter) => {
    setSelectedPerson(e);
    if (onSelectorFilter) onSelectorFilter(e);
  };

  return (
    <div className="flex gap-3 justify-normal lg:justify-between flex-col lg:flex-row items-start lg:items-center h-auto lg:h-12 mt-4">
      <span className="text-lg font-bold">{title}</span>
      <div className="w-full flex flex-wrap justify-between lg:justify-end gap-3">
        <div className="relative w-full xs:w-[12.5rem]">
          <input
            id="search"
            type="text"
            placeholder="Buscar por nombre"
            aria-label="Search Input"
            value={filterText}
            onChange={onInputFilter}
            className="w-full h-full py-2 outline-none bg-transparent pl-2 border app-border2 rounded-md pr-7 !border-opacity-70"
          />
          <button
            className="absolute right-1 h-full opacity-70"
            type="button"
            onClick={onClear}
          >
            {filterText ? (
              <RiCloseLine size={20} />
            ) : (
              <RiSearchLine size={20} />
            )}
          </button>
        </div>
        <SelectorFilter
          handleChange={handleChange}
          selectedPerson={selectedPerson}
          dataFilters={dataFilters ? dataFilters : null}
        />
        <Button title="Agregar nuevo">
          <span>Agregar</span> <RiAddLine size={20} />
        </Button>
      </div>
    </div>
  );
};
// 107
