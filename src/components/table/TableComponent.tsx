import { FC, useMemo, useState } from "react";
import DataTable, {
  createTheme,
  TableColumn,
} from "react-data-table-component";
import { TableHeader } from "./TableHeader";
import { DataRow } from "../../interfaces/tableData.interface";
type DataFilter = {
  id: number;
  name: string;
};
type Props = {
  title: string;
  columns: TableColumn<DataRow>[];
  tableData: DataRow[];
  dataFilters?: DataFilter[] | null;
  isLoading?: boolean;
};
export const TableComponent: FC<Props> = ({
  title,
  columns,
  tableData,
  dataFilters = null,
  isLoading,
}) => {
  const [filterText, setFilterText] = useState<string>("");
  const [filterSelect, setFilterSelect] = useState<string>("Sin filtros");
  const [resetPaginationToggle, setResetPaginationToggle] =
    useState<boolean>(false);
  // const [isLoading, setIsLoading] = useState(true);

  const filteredItems = tableData.filter((item) => {
    if (filterSelect === "Sin filtros") {
      return (
        item.status &&
        item.status.toLowerCase().includes("") &&
        item.name &&
        item.name.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    return (
      item.status &&
      item.status.toLowerCase() === filterSelect.toLowerCase() &&
      item.name &&
      item.name.toLowerCase().includes(filterText.toLowerCase())
    );
  });

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
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
        />
      </div>
    );
  }, [filterText, resetPaginationToggle, title, dataFilters]);

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
        data={filteredItems}
        pagination
        paginationResetDefaultPage={resetPaginationToggle}
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
