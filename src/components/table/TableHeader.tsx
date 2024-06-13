import { ChangeEvent, FC, useState } from "react";
import { RiCloseLine, RiSearchLine } from "react-icons/ri";
import { SelectorFilter } from "./SelectorFilter";
import { Button } from "../generic/Button";
import { SelectableItem } from "../../interfaces/interfaces";
type Props = {
  filterText?: string;
  onSelectorFilter?: (e: SelectableItem) => void;
  onInputFilter?: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  title: string;
  dataFilters?: SelectableItem[] | null;
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
    useState<SelectableItem>(initialFilter);

  const handleChange = (e: SelectableItem) => {
    setSelectedFilter(e);
    if (onSelectorFilter) onSelectorFilter(e);
  };
  const filterIcon = filterText ? (
    <RiCloseLine size={24} />
  ) : (
    <RiSearchLine size={20} />
  );

  return (
    <div className="w-full flex gap-3 justify-normal lg:justify-between flex-col lg:flex-row items-start lg:items-center h-auto lg:h-10 mt-4 !bg-red-500">
      <span className="text-xl font-bold">{title}</span>
      <div className="w-full flex flex-wrap justify-between lg:justify-end gap-3">
        <div className="relative w-full xs:w-[12.5rem]">
          <input
            id="search"
            type="text"
            placeholder="Buscar por nombre"
            aria-label="Search Input"
            value={filterText}
            onChange={onInputFilter}
            className="w-full h-9 outline-none bg-transparent pl-2 app-bg2 rounded-md pr-7 !border-opacity-70"
          />
          <button
            className="absolute right-1 h-full opacity-70"
            type="button"
            onClick={onClear}
          >
            {filterIcon}
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
            Agregar
          </Button>
        )}
      </div>
    </div>
  );
};
