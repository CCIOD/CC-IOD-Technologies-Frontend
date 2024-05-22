import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState } from "react";
import { Modal } from "../components/generic/Modal";
import { alertTimer, confirmChange } from "../utils/alerts";
import { ApiResponse, SelectableItem } from "../interfaces/interfaces";
import {
  createData,
  deleteData,
  getAllData,
  getDataById,
  updateData,
} from "../services/api.service";
import { Alert } from "../components/generic/Alert";
import { ErrMessage } from "../components/generic/ErrMessage";
import {
  DataRowCarriers,
  ICarrierForm,
} from "../interfaces/carriers.interface";
import { CardInfo } from "../components/CarriersComponent/CardInfo";
import { CarrierForm } from "../components/modalForms/CarrierForm";
import { formatTime12to24 } from "../utils/format";

export const CarriersPage = () => {
  const [carriersData, setCarriersData] = useState<DataRowCarriers[]>([]);
  const [carrierData, setCarrierData] = useState<DataRowCarriers | null>(null);
  const [carrierInfo, setCarrierInfo] = useState<DataRowCarriers>();
  const [carrierID, setCarrierID] = useState<number | null>(null);
  const [clientsForCarrier, setClientsForCarrier] = useState<SelectableItem[]>(
    []
  );

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("Agregar Cliente");
  const [isOpenModalInfo, setIsOpenModalInfo] = useState<boolean>(false);
  const [titleModalInfo, setTitleModalInfo] = useState<string>("Información");

  const [isLoading, setIsLoading] = useState(true);
  const [action, setAction] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const toggleModal = (value: boolean, id: number | null = null) => {
    if (!id) setTitleModal(`Agregar cliente`);
    setIsOpenModal(value);
    setCarrierID(id);
  };
  const toggleModalInfo = (value: boolean) => setIsOpenModalInfo(value);

  const getAllCarriers = async () => {
    setIsLoading(true);
    try {
      const res = await getAllData("carriers");
      const data: DataRowCarriers[] = res.data!;
      console.log(data);

      if (!data) setCarriersData([]);
      setCarriersData(data);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };
  const getClientsForCarrier = async () => {
    try {
      const res = await getAllData("clients/approved-without-carrier");

      const data: DataRowCarriers[] = res.data!;
      console.log(data);
      if (!data) setClientsForCarrier([]);
      setClientsForCarrier(data);
    } catch (error) {
      console.log(error);
    }
  };
  const getCarrierById = async (id: number) => {
    try {
      const res = await getDataById("carriers", id);
      const data: DataRowCarriers = res.data!;
      if (!data) setCarrierData(null);
      setCarrierData(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllCarriers();
    getClientsForCarrier();
  }, [action]);

  const handleCreate = async (data: ICarrierForm) => {
    try {
      const res = await createData("carriers", {
        ...data,
        placement_time: formatTime12to24(data.placement_time),
      });
      console.log(res);

      if (res.success) {
        toggleModal(false);
        setAction(!action);
        alertTimer(`El cliente se ha agregado`, "success");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      console.log(error);

      alertTimer(`Ha ocurrido un error.`, "error");
    }
  };
  const handleUpdate = async (data: ICarrierForm) => {
    try {
      const res = await updateData("carriers", carrierID as number, {
        ...data,
        placement_time: formatTime12to24(data.placement_time),
      });

      if (res.success) {
        toggleModal(false);
        setAction(!action);
        alertTimer(`El cliente se ha actualizado`, "success");
      }
    } catch (error) {
      console.log(data.relationship_id);

      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      console.log(error);

      alertTimer(`Ha ocurrido un error.`, "error");
    }
  };

  const handleDelete = (id: number) => {
    const confirm = confirmChange({
      title: "Eliminar Cliente",
      text: `¿Está seguro de querer eliminar el Cliente con el ID ${id}?. Este cambio es irreversible.`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    confirm.then(async (res) => {
      if (res.success) {
        try {
          const response = await deleteData("carriers", id);
          if (response.success)
            alertTimer("El cliente ha sido eliminado", "success");
          setAction(!action);
        } catch (error) {
          const err = error as ApiResponse;
          alertTimer(err.message, "error");
        }
      }
    });
  };

  const columns: TableColumn<DataRowCarriers>[] = [
    {
      name: "Nombre",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Zona de Residencia",
      selector: (row) => row.residence_area,
    },
    {
      name: "Brazalete Electrónico",
      selector: (row) => row.electronic_bracelet,
    },
    {
      name: "BEACON",
      selector: (row) => row.beacon,
    },
    {
      name: "Cargador Inalámbrico",
      selector: (row) => row.wireless_charger,
    },
    {
      name: "Nombre del Instalador",
      selector: (row) => row.installer_name,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <TableActions
          handleClickInfo={() => {
            toggleModalInfo(true);
            const client = carriersData.filter((el) => el.id === row.id);
            setCarrierInfo(client[0]);
            setTitleModalInfo(`Información de ${row.name}`);
          }}
          handleClickUpdate={() => {
            setTitleModal(`Editar información de ${row.name}`);
            toggleModal(true, row.id);
            getCarrierById(row.id);
          }}
          handleClickDelete={() => handleDelete(row.id)}
        />
      ),
    },
  ];

  return (
    <>
      {clientsForCarrier.length > 0 && (
        <Alert
          length={clientsForCarrier.length}
          text1="Cliente"
          text2="Portador"
        />
      )}
      <TableComponent<DataRowCarriers>
        title="Clientes"
        columns={columns}
        tableData={carriersData}
        handleOpenModal={(value) => {
          toggleModal(value);
          setCarrierData(null);
        }}
        isLoading={isLoading}
      />
      <Modal
        title={titleModal}
        isOpen={isOpenModal}
        toggleModal={toggleModal}
        backdrop
        size="full"
      >
        <CarrierForm
          toggleModal={toggleModal}
          btnText={carrierID ? "Actualizar" : "Agregar"}
          handleSubmit={(d) => (carrierID ? handleUpdate(d) : handleCreate(d))}
          carriers={clientsForCarrier}
          carrierData={carrierData}
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
        {carrierInfo ? (
          <CardInfo
            placement_date={carrierInfo.placement_date}
            placement_time={carrierInfo.placement_time}
            information_emails={carrierInfo.information_emails}
            house_arrest={carrierInfo.house_arrest}
            relationship={carrierInfo.relationship_name}
            observations={carrierInfo.observations}
          />
        ) : (
          <span>No hay nada para mostrar</span>
        )}
      </Modal>
    </>
  );
};
