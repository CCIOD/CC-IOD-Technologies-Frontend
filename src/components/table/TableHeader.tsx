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
  secondaryFilterText?: string;
  onSecondaryFilter?: (e: ChangeEvent<HTMLInputElement>) => void;
  onSecondaryClear?: () => void;
  secondaryFilterPlaceholder?: string;
};
export const TableHeader: FC<Props> = ({
  filterText,
  onSelectorFilter,
  title,
  dataFilters,
  onClear,
  onInputFilter,
  handleClickAdd,
  secondaryFilterText,
  onSecondaryFilter,
  onSecondaryClear,
  secondaryFilterPlaceholder = "Buscar por No. contrato",
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

  const secondaryFilterIcon = secondaryFilterText ? (
    <RiCloseLine size={24} />
  ) : (
    <RiSearchLine size={20} />
  );

  return (
    <div className="w-full flex gap-3 justify-normal lg:justify-between flex-col lg:flex-row items-start lg:items-center h-auto lg:h-10 mt-4">
      <span className="text-xl font-bold">{title}</span>
      <div className="w-full flex flex-wrap justify-between lg:justify-end gap-3">
        <div className="relative w-full xs:w-[12.5rem]">
          <input
            id="search"
            role="search"
            type="text"
            placeholder="Buscar por nombre"
            aria-label="Search Input"
            value={filterText}
            onChange={onInputFilter}
            className="w-full h-9 outline-none bg-transparent pl-2 app-bg3 rounded-md pr-7 !border-opacity-70 placeholder:app-text-form placeholder:text-opacity-75"
          />
          <button
            className="absolute right-1 h-full opacity-70"
            type="button"
            onClick={onClear}
          >
            {filterIcon}
          </button>
        </div>
        {onSecondaryFilter && (
          <div className="relative w-full xs:w-[12.5rem]">
            <input
              id="search-contract"
              role="search"
              type="text"
              placeholder={secondaryFilterPlaceholder}
              aria-label="Contract Number Search"
              value={secondaryFilterText}
              onChange={onSecondaryFilter}
              className="w-full h-9 outline-none bg-transparent pl-2 app-bg3 rounded-md pr-7 !border-opacity-70 placeholder:app-text-form placeholder:text-opacity-75"
            />
            <button
              className="absolute right-1 h-full opacity-70"
              type="button"
              onClick={onSecondaryClear}
            >
              {secondaryFilterIcon}
            </button>
          </div>
        )}
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
