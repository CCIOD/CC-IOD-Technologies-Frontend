import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { Status } from "../components/generic/Status";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState, useCallback } from "react";
import { Modal } from "../components/generic/Modal";
import { alertTimer, confirmChange } from "../utils/alerts";
import { ApiResponse } from "../interfaces/interfaces";
import {
  createData,
  deleteData,
  getAllData,
  updateData,
} from "../services/api.service";
import {
  dataFilters,
  DataRowProspects,
  IProspectForm,
  IObservation,
} from "../interfaces/prospects.interface";
import { formatDate } from "../utils/format";
import { ErrMessage } from "../components/generic/ErrMessage";
import { ProspectForm } from "../components/modalForms/ProspectForm";
import { ObservationsList } from "../components/generic/ObservationsList";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa"; // Importar íconos para el ordenamiento

export const ProspectsPage = () => {
  const [prospectsData, setProspectsData] = useState<DataRowProspects[]>([]);
  const [prospectData, setProspectData] = useState<DataRowProspects | null>(
    null
  );
  const [prospectInfo, setProspectInfo] = useState<DataRowProspects>();
  const [prospectID, setprospectID] = useState<number | null>(null);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("");
  const [isOpenModalInfo, setIsOpenModalInfo] = useState<boolean>(false);
  const [titleModalInfo, setTitleModalInfo] = useState<string>("");

  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const [sortConfig, setSortConfig] = useState<{ key: keyof DataRowProspects; direction: string } | null>(null);

  const toggleModal = (value: boolean) => {
    setErrorMessage("");
    setIsOpenModal(value);
  };

  const toggleModalInfo = (value: boolean) => setIsOpenModalInfo(value);

  // Función para procesar observaciones del backend
  const processObservations = useCallback((observations: string | IObservation[] | undefined): IObservation[] => {
    if (!observations) return [];
    if (typeof observations === 'string') {
      return observations.trim() ? [{ date: new Date().toISOString(), observation: observations }] : [];
    }
    if (Array.isArray(observations)) {
      return observations;
    }
    return [];
  }, []);

  // Función para procesar datos de prospectos
  const processProspectData = useCallback((data: (DataRowProspects & { observations?: string | IObservation[] })[]): DataRowProspects[] => {
    return data.map(prospect => ({
      ...prospect,
      observations: processObservations(prospect.observations)
    }));
  }, [processObservations]);

  const getAllProspects = useCallback(async () => {
    setIsLoadingTable(true);
    try {
      const res = await getAllData("prospects");
      const rawData = res.data!;
      const processedData = processProspectData(rawData);

      // Ordenar los datos por fecha en orden descendente
      const sortedData = processedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setProspectsData(sortedData);
    } catch (error) {
      setProspectsData([]);
    } finally {
      setIsLoadingTable(false);
    }
  }, [processProspectData]);
  
  useEffect(() => {
    getAllProspects();
  }, [getAllProspects]);

  const handleCreate = async (data: IProspectForm) => {
    setIsLoadingForm(true);
    try {
      // Temporalmente omitir la validación de tipos para compatibilidad
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await createData("prospects", data as any);
      toggleModal(false);
      console.log(res.data);

      // Recargar todos los prospectos para obtener los datos actualizados
      await getAllProspects();
      alertTimer(`El prospecto se ha agregado`, "success");
      setErrorMessage("");
    } catch (error) {
      handleError(error as ApiResponse);
    } finally {
      setIsLoadingForm(false);
    }
  };
  const handleUpdate = async (data: IProspectForm) => {
    setIsLoadingForm(true);
    try {
      console.log("Datos enviados para actualización:", data);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await updateData("prospects", prospectID as number, data as any);
      
      console.log("Respuesta del servidor:", res);
      
      if (res.success) {
        // Procesar los datos actualizados
        const processedProspect = processProspectData([res.data!])[0];
        setProspectsData((prev) =>
          prev.map((prospects) =>
            prospects.id === prospectID
              ? { ...prospects, ...processedProspect }
              : prospects
          )
        );
        alertTimer(`El prospecto se ha actualizado correctamente`, "success");
        setErrorMessage("");
        toggleModal(false);
        
        // Recargar los datos para asegurar consistencia
        await getAllProspects();
      } else {
        throw new Error(res.message || "Error al actualizar el prospecto");
      }
    } catch (error) {
      console.error("Error en handleUpdate:", error);
      handleError(error as ApiResponse);
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleDelete = (id: number) => {
    const confirm = confirmChange({
      title: "Eliminar Prospecto",
      text: `¿Está seguro de querer eliminar el Prospecto con el ID ${id}?. Este cambio es irreversible.`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    confirm.then(async (res) => {
      if (res.success) {
        try {
          const response = await deleteData("prospects", id);
          if (response.success) {
            setProspectsData((prev) =>
              prev.filter((prospect) => prospect.id !== id)
            );
            alertTimer("El prospecto ha sido eliminado", "success");
          }
        } catch (error) {
          const err = error as ApiResponse;
          alertTimer(err.message, "error");
        }
      }
    });
  };

  const handleError = (error: ApiResponse) => {
    if (error) setErrorMessage(error.message!);
    alertTimer("Ha ocurrido un error", "error");
  };

  const handleSort = (key: keyof DataRowProspects) => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedData = [...prospectsData].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    const aValue = a[key];
    const bValue = b[key];
    
    // Manejar valores undefined o null
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === "asc" ? 1 : -1;
    if (bValue == null) return direction === "asc" ? -1 : 1;
    
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const columns: TableColumn<DataRowProspects>[] = [
    {
      name: (
        <div className="flex items-center">
          Nombre
          <button onClick={() => handleSort("name")} className="ml-2">
            {sortConfig?.key === "name" ? (
              sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
            ) : (
              <FaSort />
            )}
          </button>
        </div>
      ),
      selector: (row) => row.name,
      sortable: false,
      wrap: true,
    },
    {
      name: (
        <div className="flex items-center">
          Correo
          <button onClick={() => handleSort("email")} className="ml-2">
            {sortConfig?.key === "email" ? (
              sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
            ) : (
              <FaSort />
            )}
          </button>
        </div>
      ),
      selector: (row) => row.email,
      wrap: true,
    },
    {
      name: (
        <div className="flex items-center">
          Teléfono
          <button onClick={() => handleSort("phone")} className="ml-2">
            {sortConfig?.key === "phone" ? (
              sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
            ) : (
              <FaSort />
            )}
          </button>
        </div>
      ),
      selector: (row) => row.phone,
    },
    {
      name: (
        <div className="flex items-center">
          Fecha
          <button onClick={() => handleSort("date")} className="ml-2">
            {sortConfig?.key === "date" ? (
              sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
            ) : (
              <FaSort />
            )}
          </button>
        </div>
      ),
      selector: (row) => formatDate(row.date),
    },
    {
      name: "Status",
      cell: (row) => <Status status={row.status} />,
      width: "150px",
    },
    {
      name: (
        <div className="flex items-center">
          Parentesco
          <button onClick={() => handleSort("relationship_name")} className="ml-2">
            {sortConfig?.key === "relationship_name" ? (
              sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />
            ) : (
              <FaSort />
            )}
          </button>
        </div>
      ),
      selector: (row) => row.relationship_name,
      width: "110px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <TableActions
          handleClickInfo={
            row.observations && row.observations.length > 0
              ? () => {
                  toggleModalInfo(true);
                  setProspectInfo(row);
                  setTitleModalInfo(`Observaciones de ${row.name}`);
                }
              : undefined
          }
          handleClickUpdate={() => {
            setTitleModal(`Editar información de ${row.name}`);
            toggleModal(true);
            setprospectID(row.id);
            setProspectData(row);
          }}
          handleClickDelete={() => handleDelete(row.id)}
        />
      ),
    },
  ];

  return (
    <>
      <TableComponent<DataRowProspects>
        title="Prospectos"
        columns={columns}
        tableData={sortedData} // Usar los datos ordenados
        dataFilters={dataFilters}
        handleOpenModal={(value) => {
          setTitleModal("Agregar Prospecto");
          toggleModal(value);
          setProspectData(null);
          setprospectID(null);
        }}
        isLoading={isLoadingTable}
      />
      <Modal
        title={titleModal}
        isOpen={isOpenModal}
        toggleModal={toggleModal}
        backdrop
      >
        <ProspectForm
          toggleModal={toggleModal}
          btnText={prospectID ? "Actualizar" : "Agregar"}
          handleSubmit={(data) =>
            prospectID ? handleUpdate(data) : handleCreate(data)
          }
          prospectData={prospectData}
          isLoading={isLoadingForm}
        />
        <ErrMessage message={errorMessage} center />
      </Modal>
      <Modal
        title={titleModalInfo}
        isOpen={isOpenModalInfo}
        toggleModal={toggleModalInfo}
        backdrop
        closeOnClickOutside
        size="lg"
      >
        {prospectInfo && prospectInfo.observations && prospectInfo.observations.length > 0 ? (
          <ObservationsList observations={prospectInfo.observations} />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>No hay observaciones registradas para este prospecto</p>
          </div>
        )}
      </Modal>
    </>
  );
};
// 230
