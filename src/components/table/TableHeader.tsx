import { ChangeEvent, FC, useState } from "react";
import { RiAddLine, RiCloseLine, RiSearchLine } from "react-icons/ri";
import { SelectorFilter } from "./SelectorFilter";
import { DataFilter } from "../../interfaces/prospects.interface";
import { Button } from "../pure/Button";
type Props = {
  filterText?: string;
  onSelectorFilter?: (e: DataFilter) => void;
  onInputFilter?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  title: string;
  dataFilters?: DataFilter[] | null;
  handleClickAdd?: (value: boolean) => void;
};
export const TableHeader: FC<Props> = ({
  filterText,
  onSelectorFilter,
  title,
  dataFilters,
  onClear,
  onInputFilter,
  handleClickAdd,
}) => {
  const initialFilter = dataFilters
    ? dataFilters[0]
    : { id: 1, name: "Sin filtros" };
  const [selectedFilter, setSelectedFilter] =
    useState<DataFilter>(initialFilter);

  const handleChange = (e: DataFilter) => {
    setSelectedFilter(e);
    if (onSelectorFilter) onSelectorFilter(e);
  };

  return (
    <div className="flex gap-3 justify-normal lg:justify-between flex-col lg:flex-row items-start lg:items-center h-auto lg:h-10 mt-4">
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
            className="w-full h-10 outline-none bg-transparent pl-2 border app-border2 rounded-md pr-7 !border-opacity-70"
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
        {dataFilters && (
          <SelectorFilter
            handleChange={handleChange}
            selectedFilter={selectedFilter}
            dataFilters={dataFilters ? dataFilters : null}
          />
        )}
        {handleClickAdd && (
          <Button
            title="Agregar nuevo"
            size="md"
            onClick={() => handleClickAdd(true)}
          >
            <span>Agregar</span> <RiAddLine size={20} />
          </Button>
        )}
      </div>
    </div>
  );
};
