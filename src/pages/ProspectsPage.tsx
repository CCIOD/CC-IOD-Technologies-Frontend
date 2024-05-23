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
  getDataById,
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
  const [prospectsData, seProspectsData] = useState<DataRowProspects[]>([]);
  const [prospectData, setProspectData] = useState<DataRowProspects | null>(
    null
  );
  const [prospectInfo, setProspectInfo] = useState<DataRowProspects>();
  const [prospectID, setprospectID] = useState<number | null>(null);

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("");
  const [isOpenModalInfo, setIsOpenModalInfo] = useState<boolean>(false);
  const [titleModalInfo, setTitleModalInfo] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const toggleModal = (value: boolean, id: number | null = null) => {
    if (!id) setTitleModal(`Agregar prospecto`);
    setIsOpenModal(value);
    setprospectID(id);
  };
  const toggleModalInfo = (value: boolean) => setIsOpenModalInfo(value);

  const getAllProspects = async () => {
    setIsLoading(true);
    try {
      const res = await getAllData("prospects");
      const data: DataRowProspects[] = res.data!;
      if (!data) seProspectsData([]);
      seProspectsData(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  const getProspectById = async (id: number) => {
    try {
      const res = await getDataById("prospects", id);
      const data: DataRowProspects = res.data!;
      if (!data) setProspectData(null);
      setProspectData(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllProspects();
  }, [action]);

  const handleCreate = async (data: IProspectForm) => {
    try {
      const res = await createData("prospects", data);
      if (res.success) {
        toggleModal(false);
        setAction(!action);
        alertTimer(`El prospecto se ha agregado`, "success");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
    }
  };
  const handleUpdate = async (data: IProspectForm) => {
    try {
      const res = await updateData("prospects", prospectID as number, data);
      if (res.success) {
        toggleModal(false);
        setAction(!action);
        alertTimer(`El prospecto se ha actualizado`, "success");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
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
          if (response.success)
            alertTimer("El prospecto ha sido eliminado", "success");
          setAction(!action);
        } catch (error) {
          const err = error as ApiResponse;
          alertTimer(err.message, "error");
        }
      }
    });
  };

  const columns: TableColumn<DataRowProspects>[] = [
    {
      name: "Nombre",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Correo",
      selector: (row) => row.email,
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
    },
    {
      name: "Parentesco",
      selector: (row) => row.relationship_name,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <TableActions
          handleClickInfo={
            row.observations
              ? () => {
                  toggleModalInfo(true);
                  const client = prospectsData.filter((el) => el.id === row.id);
                  setProspectInfo(client[0]);
                  setTitleModalInfo(`Información de ${row.name}`);
                }
              : undefined
          }
          handleClickUpdate={() => {
            setTitleModal(`Editar información de ${row.name}`);
            toggleModal(true, row.id);
            getProspectById(row.id);
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
          toggleModal(value);
          setProspectData(null);
        }}
        isLoading={isLoading}
      />
      <Modal
        title={titleModal}
        isOpen={isOpenModal}
        toggleModal={toggleModal}
        backdrop
        // size="full"
      >
        <ProspectForm
          toggleModal={toggleModal}
          btnText={prospectID ? "Actualizar" : "Agregar"}
          handleSubmit={(data) =>
            prospectID ? handleUpdate(data) : handleCreate(data)
          }
          prospectData={prospectData}
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
// 253
