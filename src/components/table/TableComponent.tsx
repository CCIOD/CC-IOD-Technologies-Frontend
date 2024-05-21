import { useMemo, useState } from "react";
import DataTable, {
  createTheme,
  TableColumn,
} from "react-data-table-component";
import { TableHeader } from "./TableHeader";
import { SelectableItem } from "../../interfaces/interfaces";

type Props<T extends SelectableItem> = {
  title: string;
  columns: TableColumn<T>[];
  tableData: T[];
  dataFilters?: SelectableItem[] | null;
  isLoading?: boolean;
  handleOpenModal?: (value: boolean) => void;
};

const hasStatus = <T extends SelectableItem>(
  item: T
): item is T & { status: string } => {
  return item.status !== undefined;
};

export const TableComponent = <T extends SelectableItem>({
  title,
  columns,
  tableData,
  dataFilters = null,
  isLoading,
  handleOpenModal,
}: Props<T>) => {
  const [filterText, setFilterText] = useState<string>("");
  const [filterSelect, setFilterSelect] = useState<string>("Sin filtros");
  const [resetPagination, setResetPagination] = useState<boolean>(false);

  const filteredItems = tableData.filter((item) => {
    if (filterSelect === "Sin filtros") {
      if (hasStatus(item)) {
        return (
          item.status.toLowerCase().includes("") &&
          item.name.toLowerCase().includes(filterText.toLowerCase())
        );
      }
      return (
        item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    if (hasStatus(item)) {
      return (
        item.status.toLowerCase() === filterSelect.toLowerCase() &&
        item.name.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    return (
      item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
    );
  });

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPagination(!resetPagination);
        setFilterText("");
      }
    };

    return (
      <div className="w-full">
        <TableHeader
          onSelectorFilter={(e) => setFilterSelect(e.name)}
          onInputFilter={(e) => setFilterText(e.target.value)}
          onClear={handleClear}
          filterText={filterText}
          title={title}
          dataFilters={dataFilters}
          handleClickAdd={handleOpenModal}
        />
      </div>
    );
  }, [filterText, resetPagination, title, dataFilters, handleOpenModal]);

  createTheme("solarized", {
    button: {
      default: "rgb(59 130 246)",
      hover: "rgba(59, 130, 246,.29)",
      focus: "rgba(255,255,255,.12)",
      disabled: "#93c5fd",
    },
  });

  const paginationComponentOptions = {
    rowsPerPageText: "Registros por página",
    rangeSeparatorText: "de",
  };

  return (
    <div className="custom-table">
      <DataTable
        columns={columns}
        // columns={}
        data={filteredItems}
        pagination
        paginationResetDefaultPage={resetPagination}
        subHeader
        subHeaderComponent={subHeaderComponentMemo}
        persistTableHead
        theme="solarized"
        paginationComponentOptions={paginationComponentOptions}
        noDataComponent="Al parecer no hay nada para mostrar en este momento."
        progressPending={isLoading}
      />
    </div>
  );
};
