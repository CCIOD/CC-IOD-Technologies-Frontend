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

  const [isLoadingTable, setIsLoadingTable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const toggleModal = (value: boolean) => {
    setErrorMessage("");
    setIsOpenModal(value);
  };
  const toggleModalInfo = (value: boolean) => setIsOpenModalInfo(value);

  const getAllCarriers = async () => {
    setIsLoadingTable(true);
    try {
      const res = await getAllData("carriers");
      const data: DataRowCarriers[] = res.data!;
      setCarriersData(data);
    } catch (error) {
      setCarriersData([]);
    } finally {
      setIsLoadingTable(false);
    }
  };
  const getClientsForCarrier = async () => {
    try {
      const res = await getAllData("clients/approved-without-carrier");
      const data: DataRowCarriers[] = res.data!;
      setClientsForCarrier(data);
    } catch (error) {
      setClientsForCarrier([]);
    }
  };
  useEffect(() => {
    getAllCarriers();
  }, []);
  useEffect(() => {
    getClientsForCarrier();
  }, [carriersData]);

  const handleCreate = async (data: ICarrierForm) => {
    setIsLoading(true);
    try {
      const res = await createData("carriers", {
        ...data,
        placement_time: formatTime12to24(data.placement_time),
      });
      toggleModal(false);
      setCarriersData((prev) => [...prev, res.data!]);
      alertTimer(`El portador se ha agregado`, "success");
      setErrorMessage("");
    } catch (error) {
      handleError(error as ApiResponse);
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdate = async (data: ICarrierForm) => {
    setIsLoading(true);
    try {
      const res = await updateData("carriers", carrierID as number, {
        ...data,
        placement_time: formatTime12to24(data.placement_time),
      });
      if (res.success) {
        const updatedCarrierData: DataRowCarriers = res.data!;
        setCarriersData((prev) =>
          prev.map((carrier) =>
            carrier.id === carrierID
              ? { ...carrier, ...updatedCarrierData }
              : carrier
          )
        );
        toggleModal(false);
        alertTimer(`El portador se ha actualizado`, "success");
        setErrorMessage("");
      }
    } catch (error) {
      handleError(error as ApiResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    const confirm = confirmChange({
      title: "Eliminar Portador",
      text: `¿Está seguro de querer eliminar el Portador con el ID ${id}?. Esto también eliminará la operación que corresponde a este Portador.`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    confirm.then(async (res) => {
      if (res.success) {
        try {
          const deleteOp = await deleteData("operations", id);
          if (!deleteOp.success) {
            alertTimer("No se pudo eliminar la operación", "error");
            return;
          }
          const response = await deleteData("carriers", id);
          if (response.success) {
            setCarriersData((prev) =>
              prev.filter((carrier) => carrier.id !== id)
            );
            alertTimer("El portador ha sido eliminado", "success");
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

  const columns: TableColumn<DataRowCarriers>[] = [
    {
      name: "Nombre",
      selector: (row) => row.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Zona de Residencia",
      selector: (row) => row.residence_area,
      wrap: true,
    },
    {
      name: "Brazalete Electrónico",
      selector: (row) => row.electronic_bracelet,
    },
    {
      name: "BEACON",
      selector: (row) => row.beacon,
      width: "120px",
      wrap: true,
    },
    {
      name: "Cargador Inalámbrico",
      selector: (row) => row.wireless_charger,
    },
    {
      name: "Nom. Instalador",
      selector: (row) => row.installer_name,
      wrap: true,
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
          setCarrierID(null);
          setTitleModal("Agregar Portador");
        }}
        isLoading={isLoadingTable}
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
// 281
