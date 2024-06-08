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
  updateData,
} from "../services/api.service";
import { Alert } from "../components/generic/Alert";
import { ErrMessage } from "../components/generic/ErrMessage";
import {
  DataRowCarriers,
  ICarrierForm,
} from "../interfaces/carriers.interface";
import { CarrierForm } from "../components/modalForms/CarrierForm";
import { formatTime12to24 } from "../utils/format";
import { ModalInfoContent } from "../components/generic/ModalInfoContent";

export const CarriersPage = () => {
  const [carriersData, setCarriersData] = useState<DataRowCarriers[]>([]);
  const [carrierData, setCarrierData] = useState<DataRowCarriers | null>(null);
  const [carrierInfo, setCarrierInfo] = useState<DataRowCarriers>();
  const [carrierID, setCarrierID] = useState<number | null>(null);
  const [clientsForCarrier, setClientsForCarrier] = useState<SelectableItem[]>(
    []
  );

  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [titleModal, setTitleModal] = useState<string>("");
  const [isOpenModalInfo, setIsOpenModalInfo] = useState<boolean>(false);
  const [titleModalInfo, setTitleModalInfo] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [action, setAction] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const toggleModal = (value: boolean) => setIsOpenModal(value);
  const toggleModalInfo = (value: boolean) => setIsOpenModalInfo(value);

  const getAllCarriers = async () => {
    setIsLoading(true);
    try {
      const res = await getAllData("carriers");
      const data: DataRowCarriers[] = res.data!;
      if (!data) setCarriersData([]);
      setCarriersData(data);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };
  const getClientsForCarrier = async () => {
    try {
      const res = await getAllData("clients/approved-without-carrier");
      const data: DataRowCarriers[] = res.data!;
      if (!data) setClientsForCarrier([]);
      setClientsForCarrier(data);
    } catch (error) {
      const { message } = error as ApiResponse;
      if (message === "No se encontró ningún cliente que pueda ser portador")
        setClientsForCarrier([]);
    }
  };
  useEffect(() => {
    getAllCarriers();
    getClientsForCarrier();
  }, [action]);

  const handleCreate = async (data: ICarrierForm) => {
    setIsLoading(true);
    try {
      const res = await createData("carriers", {
        ...data,
        placement_time: formatTime12to24(data.placement_time),
      });

      if (res.success) {
        toggleModal(false);
        setAction(!action);
        alertTimer(`El portador se ha agregado`, "success");
        setErrorMessage("");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
    }
    setIsLoading(false);
  };
  const handleUpdate = async (data: ICarrierForm) => {
    setIsLoading(true);
    try {
      const res = await updateData("carriers", carrierID as number, {
        ...data,
        placement_time: formatTime12to24(data.placement_time),
      });

      if (res.success) {
        toggleModal(false);
        setAction(!action);
        alertTimer(`El portador se ha actualizado`, "success");
        setErrorMessage("");
      }
    } catch (error) {
      const err = error as ApiResponse;
      if (err) setErrorMessage(err.message!);
      alertTimer(`Ha ocurrido un error.`, "error");
    }
    setIsLoading(false);
  };

  const handleDelete = (id: number) => {
    const confirm = confirmChange({
      title: "Eliminar Portador",
      text: `¿Está seguro de querer eliminar el Portador con el ID ${id}?. Este cambio es irreversible.`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    confirm.then(async (res) => {
      if (res.success) {
        try {
          const response = await deleteData("carriers", id);
          if (response.success)
            alertTimer("El portador ha sido eliminado", "success");
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
            setCarrierInfo(row);
            setTitleModalInfo(`Información de ${row.name}`);
          }}
          handleClickUpdate={() => {
            setTitleModal(`Editar información de ${row.name}`);
            toggleModal(true);
            setCarrierID(row.id);
            setCarrierData(row);
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
        title="Portadores"
        columns={columns}
        tableData={carriersData}
        handleOpenModal={(value) => {
          if (clientsForCarrier.length === 0) {
            alertTimer("No hay clientes disponibles", "error");
            return;
          }
          toggleModal(value);
          setCarrierData(null);
          setTitleModal("Agregar Portador");
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
          isLoading={isLoading}
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
          <ModalInfoContent
            data={[
              {
                column: "Fecha de colocación",
                text: carrierInfo.placement_date,
              },
              {
                column: "Hora de colocación",
                text: carrierInfo.placement_time,
              },
              {
                column: "Correos para información",
                text: carrierInfo.information_emails,
              },
              {
                column: "Números de contacto",
                text: carrierInfo.contact_numbers,
              },
              {
                column: "Arraigo domiciliario",
                text: carrierInfo.house_arrest,
              },
              {
                column: "Parentesco",
                text: carrierInfo.relationship_name,
              },
              {
                column: "Observaciones",
                text: carrierInfo.observations,
              },
            ]}
          />
        ) : (
          <span>No hay nada para mostrar</span>
        )}
      </Modal>
    </>
  );
};
