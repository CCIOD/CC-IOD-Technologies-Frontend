import { Listbox } from "@headlessui/react";
import { FC, Fragment } from "react";
import {
  RiArrowDownSLine,
  RiCheckboxBlankLine,
  RiCheckboxLine,
  RiFilterLine,
  RiFilterOffLine,
} from "react-icons/ri";
import { SelectableItem } from "../../interfaces/interfaces";
import MenuOption from "../generic/MenuOption";

type Props = {
  handleChange: (e: SelectableItem) => void;
  selectedFilter: SelectableItem;
  dataFilters: SelectableItem[] | null;
};
export const SelectorFilter: FC<Props> = ({
  selectedFilter,
  dataFilters,
  handleChange,
}) => {
  const { name, id } = selectedFilter;
  const filtered = id === 1 ? "" : "text-blue-500";
  const bg = id === 1 ? "app-bg3" : "bg-blue-500/10";
  const Icon =
    id === 1 ? <RiFilterOffLine size={24} /> : <RiFilterLine size={24} />;
  return (
    <div className="w-full xs:w-auto">
      <Listbox value={selectedFilter} onChange={(e) => handleChange(e)}>
        <Listbox.Button
          className={`app-text w-full md:w-[14rem] h-9 p-1 rounded-md ${bg}`}
        >
          <div
            className={`filter relative flex items-center gap-2 ${filtered}`}
          >
            <div className="opacity-70" title="Filtrar por">
              {Icon}
            </div>
            <div className="flex items-center justify-between">
              <span className="w-full xs:w-40 text-left !truncate pr-6 !border-opacity-70">
                {name}
              </span>
              <span className="absolute flex-center right-1 opacity-70">
                <RiArrowDownSLine size={24} />
              </span>
            </div>
          </div>
        </Listbox.Button>
        <Listbox.Options
          className={`absolute top-[8.5rem] xs:top-[6rem] lg:top-[3.5rem] z-40 w-9/12 p-1 xs:w-40 md:w-[17rem]  mt-2 origin-top-right rounded-md app-bg3 app-text shadow-lg ring-1 ring-black/5 flex flex-col gap-1`}
        >
          {dataFilters &&
            dataFilters.map((filter) => (
              <Listbox.Option key={filter.id} value={filter} as={Fragment}>
                {({ selected }) => (
                  <MenuOption
                    text={filter.name}
                    icon={
                      selected ? (
                        <RiCheckboxLine size={24} />
                      ) : (
                        <RiCheckboxBlankLine size={24} />
                      )
                    }
                    selected={selected}
                  />
                )}
              </Listbox.Option>
            ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};
