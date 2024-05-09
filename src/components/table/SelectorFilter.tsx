import { Listbox } from "@headlessui/react";
import { FC, Fragment } from "react";
import {
  RiArrowDownSLine,
  RiCheckboxBlankLine,
  RiCheckboxLine,
  RiFilter3Fill,
} from "react-icons/ri";

type DataFilter = {
  id: number;
  name: string;
};
type Props = {
  handleChange: (e: DataFilter) => void;
  selectedPerson: DataFilter;
  dataFilters: DataFilter[] | null;
};
export const SelectorFilter: FC<Props> = ({
  selectedPerson,
  dataFilters,
  handleChange,
}) => {
  return (
    <div className="w-full xs:w-auto">
      <Listbox value={selectedPerson} onChange={(e) => handleChange(e)}>
        <Listbox.Button className={`app-text w-full md:w-[17rem] h-full`}>
          <div className="relative flex items-center gap-1 justify-between">
            <div className="hidden md:flex items-center gap-2">
              <span>Filtrar por</span>
              <RiFilter3Fill size={20} />
            </div>
            <span className="h-full w-full xs:w-40 text-left p-2 !truncate border app-border2 rounded-md pr-6 !border-opacity-70">
              {selectedPerson.name}
            </span>
            <span className="absolute flex-center right-1 opacity-70">
              <RiArrowDownSLine size={20} />
            </span>
          </div>
        </Listbox.Button>
        <Listbox.Options
          className={`absolute top-[8.5rem] xs:top-[6rem] lg:top-[3.5rem] w-9/12  xs:w-40 md:w-[17rem] text-left mt-4 h-auto app-bg3 z-40 rounded-md`}
        >
          {dataFilters &&
            dataFilters.map((filter) => (
              <Listbox.Option key={filter.id} value={filter} as={Fragment}>
                {({ selected }) => (
                  <li
                    className={`flex gap-2 py-1 px-2 cursor-pointer items-center hover:bg-gray-200 hover:text-cciod-black-100 ${
                      selected
                        ? "bg-green-500 !cursor-default hover:!bg-green-500 !text-cciod-white-100"
                        : ""
                    }`}
                  >
                    {selected && <RiCheckboxLine size={20} />}
                    {!selected && <RiCheckboxBlankLine size={20} />}
                    {filter.name}
                  </li>
                )}
              </Listbox.Option>
            ))}
        </Listbox.Options>
      </Listbox>
    </div>
  );
};
