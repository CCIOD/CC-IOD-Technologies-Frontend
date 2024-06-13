import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { Status } from "../components/generic/Status";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState } from "react";
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
} from "../interfaces/prospects.interface";
import { formatDate } from "../utils/format";
import { ErrMessage } from "../components/generic/ErrMessage";
import { ProspectForm } from "../components/modalForms/ProspectForm";
import { ModalInfoContent } from "../components/generic/ModalInfoContent";

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

  const toggleModal = (value: boolean) => {
    setErrorMessage("");
    setIsOpenModal(value);
  };

  const toggleModalInfo = (value: boolean) => setIsOpenModalInfo(value);

  const getAllProspects = async () => {
    setIsLoadingTable(true);
    try {
      const res = await getAllData("prospects");
      const data: DataRowProspects[] = res.data!;

      setProspectsData(data);
    } catch (error) {
      setProspectsData([]);
    } finally {
      setIsLoadingTable(false);
    }
  };
  useEffect(() => {
    getAllProspects();
  }, []);

  const handleCreate = async (data: IProspectForm) => {
    setIsLoadingForm(true);
    try {
      const res = await createData("prospects", data);
      toggleModal(false);
      console.log(res.data);

      setProspectsData((prev) => [...prev, res.data!]);
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
      const res = await updateData("prospects", prospectID as number, data);
      if (res.success) {
        const updatedProspectData: DataRowProspects = res.data!;
        setProspectsData((prev) =>
          prev.map((prospects) =>
            prospects.id === prospectID
              ? { ...prospects, ...updatedProspectData }
              : prospects
          )
        );
        alertTimer(`El prospecto se ha actualizado`, "success");
        setErrorMessage("");
        toggleModal(false);
      }
    } catch (error) {
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

  const columns: TableColumn<DataRowProspects>[] = [
    {
      name: "Nombre",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Correo",
      selector: (row) => row.email,
      wrap: true,
    },
    {
      name: "Teléfono",
      selector: (row) => row.phone,
    },
    {
      name: "Fecha",
      selector: (row) => formatDate(row.date),
    },
    {
      name: "Status",
      cell: (row) => <Status status={row.status} />,
      width: "150px",
    },
    {
      name: "Parentesco",
      selector: (row) => row.relationship_name,
      width: "110px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <TableActions
          handleClickInfo={
            row.observations
              ? () => {
                  toggleModalInfo(true);
                  setProspectInfo(row);
                  setTitleModalInfo(`Información de ${row.name}`);
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
        tableData={prospectsData}
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
        <ErrMessage message={errorMessage} />
      </Modal>
      <Modal
        title={titleModalInfo}
        isOpen={isOpenModalInfo}
        toggleModal={toggleModalInfo}
        backdrop
        closeOnClickOutside
        size="sm"
      >
        {prospectInfo ? (
          <ModalInfoContent
            data={[
              { column: "Observaciones", text: prospectInfo.observations },
            ]}
          />
        ) : (
          <span>No hay nada para mostrar</span>
        )}
      </Modal>
    </>
  );
};
// 230
