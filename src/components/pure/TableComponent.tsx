import React, { FC, useState } from "react";
import DataTable, {
  createTheme,
  TableColumn,
} from "react-data-table-component";
import { TableHeader } from "./TableHeader";
import { DataRow } from "../../interfaces/tableData.interface";

type Props = {
  title: string;
  columns: TableColumn<DataRow>[];
  tableData: DataRow[];
};
export const TableComponent: FC<Props> = ({ title, columns, tableData }) => {
  const [filterText, setFilterText] = useState<string>("");
  const [resetPaginationToggle, setResetPaginationToggle] =
    useState<boolean>(false);
  const filteredItems = tableData.filter(
    (item) =>
      item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponentMemo = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };

    return (
      <div className="w-full">
        <TableHeader
          onFilter={(e) => setFilterText(e.target.value)}
          onClear={handleClear}
          filterText={filterText}
          title={title}
        />
      </div>
    );
  }, [filterText, resetPaginationToggle, title]);

  createTheme("solarized", {
    button: {
      default: "rgb(59 130 246)",
      hover: "rgba(59, 130, 246,.29)",
      focus: "rgba(255,255,255,.12)",
      disabled: "#93c5fd",
    },
  });

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
      />
    </div>
  );
};

// 190
