import { TableComponent } from "../components/table/TableComponent";
import { TableColumn } from "react-data-table-component";
import { Status } from "../components/generic/Status";
import { TableActions } from "../components/table/TableActions";
import { useEffect, useState, useCallback } from "react";
import { Modal } from "../components/generic/Modal";
import { Button } from "../components/generic/Button";
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
import { formatTime12to24, calculateContractTimeRemaining } from "../utils/format";
import { ModalInfoContent } from "../components/generic/ModalInfoContent";
import { ObservationsList } from "../components/generic/ObservationsList";
import { IClientObservation, ClientContact, DataRowClients, TClientStatus } from "../interfaces/clients.interface";
import UninstallClientForm from "../components/modalForms/UninstallClientForm";
import { RiShutDownLine, RiFileTextLine } from "react-icons/ri";
// import { CarrierActForm } from "../components/modalForms/CarrierActForm";
import { CarrierActsList } from "../components/carrier-acts/CarrierActsList";
import { carrierActsService } from "../services/carrier-acts.service";
import { ICarrierAct, ICarrierActForm } from "../interfaces/carrier-acts.interface";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FormikInput } from "../components/Inputs/FormikInput";

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

  // Estados para modal de desinstalación
  const [isOpenUninstallModal, setIsOpenUninstallModal] = useState<boolean>(false);
  const [clientToUninstall, setClientToUninstall] = useState<DataRowClients | null>(null);
  const [uninstallLoading, setUninstallLoading] = useState<boolean>(false);
  const [uninstallError, setUninstallError] = useState<string>("");

  // Estados para manejo de actas
  const [isOpenActModal, setIsOpenActModal] = useState<boolean>(false);
  const [isOpenActListModal, setIsOpenActListModal] = useState<boolean>(false);
  const [selectedCarrierForActs, setSelectedCarrierForActs] = useState<DataRowCarriers | null>(null);
  const [carrierActs, setCarrierActs] = useState<ICarrierAct[]>([]);
  const [actLoading, setActLoading] = useState<boolean>(false);
  const [actError, setActError] = useState<string>("");

  const toggleModal = (value: boolean) => {
    setErrorMessage("");
    setIsOpenModal(value);
  };
  const toggleModalInfo = (value: boolean) => setIsOpenModalInfo(value);

  const toggleUninstallModal = (value: boolean) => {
    setUninstallError("");
    setIsOpenUninstallModal(value);
    if (!value) {
      setClientToUninstall(null);
    }
  };

  // Función para procesar observaciones del backend
  const processObservations = useCallback((observations: string | IClientObservation[] | undefined): IClientObservation[] => {
    if (!observations) return [];
    if (typeof observations === 'string') {
      return observations.trim() ? [{ date: new Date().toISOString(), observation: observations }] : [];
    }
    if (Array.isArray(observations)) {
      return observations;
    }
    return [];
  }, []);

  // Función para procesar datos de carriers
  const processCarrierData = useCallback((data: (DataRowCarriers & { 
    information_emails?: string | string[];
    contact_numbers?: string | ClientContact[];
    client_contacts?: ClientContact[];
    client_observations?: IClientObservation[];
    observations?: string | IClientObservation[];
    contract_duration?: string; // Duración del contrato del cliente
  })[]): DataRowCarriers[] => {
    return data.map(carrier => {
      // Procesar information_emails
      let processedEmails: string[] = [];
      if (typeof carrier.information_emails === 'string') {
        try {
          processedEmails = JSON.parse(carrier.information_emails);
        } catch {
          processedEmails = [carrier.information_emails];
        }
      } else if (Array.isArray(carrier.information_emails)) {
        processedEmails = carrier.information_emails;
      }

      // Procesar contact_numbers - usar client_contacts si está disponible
      let processedContacts: ClientContact[] = [];
      if (carrier.client_contacts && Array.isArray(carrier.client_contacts)) {
        // Usar los contactos del cliente si están disponibles
        processedContacts = carrier.client_contacts;
      } else if (carrier.contact_numbers) {
        if (typeof carrier.contact_numbers === 'string') {
          try {
            // Si es un string JSON con array de números, convertir a formato de contactos
            const phoneNumbers = JSON.parse(carrier.contact_numbers);
            processedContacts = phoneNumbers.map((phone: string, index: number) => ({
              contact_name: `Contacto ${index + 1}`,
              phone_number: phone,
              relationship_id: undefined,
              relationship_name: undefined
            }));
          } catch {
            // Si no es JSON válido, crear un contacto con el string
            processedContacts = [{
              contact_name: "Contacto 1",
              phone_number: carrier.contact_numbers,
              relationship_id: undefined,
              relationship_name: undefined
            }];
          }
        } else if (Array.isArray(carrier.contact_numbers)) {
          processedContacts = carrier.contact_numbers;
        }
      } else {
        processedContacts = [];
      }

      // Procesar observaciones - usar client_observations si está disponible
      let processedObservations: IClientObservation[] = [];
      if (carrier.client_observations && Array.isArray(carrier.client_observations)) {
        processedObservations = carrier.client_observations;
      } else {
        processedObservations = processObservations(carrier.observations);
      }

      return {
        ...carrier,
        information_emails: processedEmails,
        contact_numbers: processedContacts,
        observations: processedObservations,
        contract_duration: carrier.contract_duration || undefined // Preservar la duración del contrato
      };
    });
  }, [processObservations]);

  // Función para procesar las observaciones cuando se crea o actualiza un carrier
  const processObservationsForSubmit = (formData: ICarrierForm): ICarrierForm => {
    console.log("Processing observations:", formData.observations);
    
    if (!formData.observations || formData.observations.length === 0) {
      return { ...formData, observations: [] };
    }

    const processedObservations = formData.observations.map((obs: IClientObservation | string) => {
      if (typeof obs === 'string') {
        // Si es un string, crear un objeto de observación con fecha actual
        return {
          date: new Date().toISOString(),
          observation: obs
        };
      } else {
        // Si ya es un objeto, mantenerlo como está
        return obs;
      }
    }).filter((obs: IClientObservation) => obs.observation && obs.observation.trim() !== '');

    console.log("Processed observations:", processedObservations);
    return { ...formData, observations: processedObservations };
  };

  // Función para limpiar los datos antes de enviar al backend
  const cleanDataForSubmit = (data: ICarrierForm): ICarrierForm => {
    const cleanedData = { ...data };
    
    // Limpiar contact_numbers - convertir relationship_id a número y remover relationship_name
    if (cleanedData.contact_numbers && Array.isArray(cleanedData.contact_numbers)) {
      cleanedData.contact_numbers = cleanedData.contact_numbers.map(contact => {
        const cleanedContact: {
          contact_name: string;
          phone_number: string;
          relationship_id?: number;
        } = {
          contact_name: contact.contact_name,
          phone_number: contact.phone_number
        };
        
        // Solo agregar relationship_id si es válido y convertirlo a número
        if (contact.relationship_id !== undefined && contact.relationship_id !== null) {
          const relationshipId = typeof contact.relationship_id === 'string' 
            ? parseInt(contact.relationship_id, 10) 
            : Number(contact.relationship_id);
          
          if (!isNaN(relationshipId) && relationshipId > 0) {
            cleanedContact.relationship_id = relationshipId;
          }
        }
        
        // No incluir relationship_name
        return cleanedContact;
      });
    }
    
    return cleanedData;
  };

  const getAllCarriers = useCallback(async () => {
    setIsLoadingTable(true);
    try {
      const res = await getAllData("carriers");
      const rawData = res.data!;
      const processedData = processCarrierData(rawData);
      setCarriersData(processedData);
    } catch (error) {
      setCarriersData([]);
    } finally {
      setIsLoadingTable(false);
    }
  }, [processCarrierData]);
  
  const getClientsForCarrier = useCallback(async () => {
    try {
      const res = await getAllData("clients/approved-without-carrier");
      const data: DataRowCarriers[] = res.data!;
      setClientsForCarrier(data);
    } catch (error) {
      setClientsForCarrier([]);
    }
  }, []);
  useEffect(() => {
    getAllCarriers();
  }, [getAllCarriers]);
  useEffect(() => {
    getClientsForCarrier();
  }, [carriersData, getClientsForCarrier]);

  const handleCreate = async (data: ICarrierForm) => {
    setIsLoading(true);
    try {
      const processedData = processObservationsForSubmit(data);
      const cleanedData = cleanDataForSubmit(processedData);
      console.log("Creating carrier with cleaned data:", cleanedData);
      
      const res = await createData("carriers", {
        ...cleanedData,
        placement_time: formatTime12to24(cleanedData.placement_time),
      });
      
      if (res) {
        toggleModal(false);
        // Procesar los datos recibidos del backend
        const processedCarrier = processCarrierData([res.data!])[0];
        setCarriersData((prev) => [...prev, processedCarrier]);
        alertTimer(`El portador se ha agregado`, "success");
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error creating carrier:", error);
      handleError(error as ApiResponse);
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdate = async (data: ICarrierForm) => {
    if (!carrierID) return;
    
    setIsLoading(true);
    try {
      const processedData = processObservationsForSubmit(data);
      const cleanedData = cleanDataForSubmit(processedData);
      console.log("Updating carrier with cleaned data:", cleanedData);
      
      const res = await updateData("carriers", carrierID, {
        ...cleanedData,
        placement_time: formatTime12to24(cleanedData.placement_time),
      });
      
      if (res.success) {
        // Procesar los datos actualizados
        const processedCarrier = processCarrierData([res.data!])[0];
        setCarriersData((prev) =>
          prev.map((carrier) =>
            carrier.id === carrierID
              ? { ...carrier, ...processedCarrier }
              : carrier
          )
        );
        toggleModal(false);
        alertTimer(`El portador se ha actualizado`, "success");
        setErrorMessage("");
        
        // Recargar los datos para asegurar consistencia
        await getAllCarriers();
      }
    } catch (error) {
      console.error("Error updating carrier:", error);
      handleError(error as ApiResponse);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener información del cliente y abrir modal de desinstalación
  const handleUninstallClient = async (carrier: DataRowCarriers) => {
    try {
      setUninstallLoading(true);
      setUninstallError("");

      // Obtener información completa del cliente
      const res = await getAllData(`clients/${carrier.client_id}`);
      if (res.success && res.data) {
        const clientData = res.data as DataRowClients;
        
        // Verificar que el cliente esté en estado "Colocado"
        if (clientData.status !== "Colocado") {
          alertTimer("Solo se pueden desinstalar clientes que están colocados", "error");
          return;
        }

        setClientToUninstall(clientData);
        toggleUninstallModal(true);
      } else {
        alertTimer("No se pudo obtener la información del cliente", "error");
      }
    } catch (error) {
      console.error("Error getting client info:", error);
      alertTimer("Error al obtener información del cliente", "error");
    } finally {
      setUninstallLoading(false);
    }
  };

  // Función para manejar el éxito de la desinstalación
  const handleUninstallSuccess = async (updatedClient: DataRowClients) => {
    try {
      alertTimer(`Cliente ${updatedClient.defendant_name} desinstalado correctamente`, "success");
      toggleUninstallModal(false);
      
      // Recargar los datos de portadores para reflejar el cambio
      await getAllCarriers();
    } catch (error) {
      console.error("Error after uninstall:", error);
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
  // Función para abrir modal de información con datos actualizados
  const handleShowCarrierInfo = async (carrier: DataRowCarriers) => {
    try {
      // Obtener información actualizada del portador desde el servidor
      const res = await getAllData(`carriers/${carrier.id}`);
      if (res.success && res.data) {
        // Procesar los datos actualizados
        const updatedCarrierData = processCarrierData([res.data])[0];
        setCarrierInfo(updatedCarrierData);
      } else {
        // Si no se puede obtener datos actualizados, usar los datos existentes
        setCarrierInfo(carrier);
      }
    } catch (error) {
      console.error("Error getting updated carrier info:", error);
      // En caso de error, usar los datos existentes
      setCarrierInfo(carrier);
    } finally {
      setTitleModalInfo(`Información de ${carrier.name}`);
      toggleModalInfo(true);
    }
  };

  const handleError = (error: ApiResponse) => {
    const errorMsg = error?.message || "Ha ocurrido un error";
    setErrorMessage(errorMsg);
    alertTimer(errorMsg, "error");
  };

  // Funciones para manejo de actas
  const toggleActModal = (value: boolean) => {
    setActError("");
    setIsOpenActModal(value);
    if (!value) {
      setSelectedCarrierForActs(null);
    }
  };

  const toggleActListModal = (value: boolean) => {
    setIsOpenActListModal(value);
    if (!value) {
      setSelectedCarrierForActs(null);
      setCarrierActs([]);
    }
  };

  const handleShowActForm = (carrier: DataRowCarriers) => {
    setSelectedCarrierForActs(carrier);
    setIsOpenActModal(true);
  };

  const handleShowActsList = async (carrier: DataRowCarriers) => {
    setSelectedCarrierForActs(carrier);
    setActLoading(true);
    try {
      const acts = await carrierActsService.getCarrierActs(carrier.id);
      setCarrierActs(acts);
      setIsOpenActListModal(true);
    } catch (error) {
      console.error("Error loading carrier acts:", error);
      alertTimer("Error al cargar las actas del portador", "error");
    } finally {
      setActLoading(false);
    }
  };

  const handleUploadAct = async (actData: ICarrierActForm) => {
    if (!selectedCarrierForActs) return;
    
    setActLoading(true);
    try {
      const result = await carrierActsService.uploadCarrierAct(selectedCarrierForActs.id, actData);
      if (result.success) {
        alertTimer("Acta subida exitosamente", "success");
        toggleActModal(false);
      } else {
        setActError(result.message || "Error al subir el acta");
      }
    } catch (error) {
      console.error("Error uploading act:", error);
      setActError("Error al subir el acta");
    } finally {
      setActLoading(false);
    }
  };

  const handleDeleteAct = async (actId: number) => {
    try {
      await carrierActsService.deleteCarrierAct(actId);
      alertTimer("Acta eliminada exitosamente", "success");
      
      // Recargar las actas
      if (selectedCarrierForActs) {
        const updatedActs = await carrierActsService.getCarrierActs(selectedCarrierForActs.id);
        setCarrierActs(updatedActs);
      }
    } catch (error) {
      console.error("Error deleting act:", error);
      alertTimer("Error al eliminar el acta", "error");
    }
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
      name: "Tiempo Restante Contrato",
      cell: (row) => {
        const timeRemaining = calculateContractTimeRemaining(
          row.placement_date,
          row.contract_duration
        );
        
        return (
          <div className="text-center">
            <span 
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                timeRemaining.status === 'expired' 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : timeRemaining.status === 'warning'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : timeRemaining.status === 'active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}
              title={`Días totales restantes: ${timeRemaining.totalDaysRemaining}`}
            >
              {timeRemaining.displayText}
            </span>
          </div>
        );
      },
      sortable: true,
      sortFunction: (rowA, rowB) => {
        const timeA = calculateContractTimeRemaining(rowA.placement_date, rowA.contract_duration);
        const timeB = calculateContractTimeRemaining(rowB.placement_date, rowB.contract_duration);
        return timeA.totalDaysRemaining - timeB.totalDaysRemaining;
      },
      width: "180px",
      wrap: true,
    },
    {
      name: "Nom. Instalador",
      selector: (row) => row.installer_name,
      wrap: true,
    },
    {
      name: "Estado",
      cell: (row) => row.client_status ? <Status status={row.client_status as TClientStatus} /> : <span className="text-gray-400">-</span>,
      width: "180px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="flex gap-2 pr-4">
          {/* Botón desinstalar - solo para clientes colocados */}
          {row.client_id && (
            <Button
              color="warning"
              size="min"
              onClick={() => handleUninstallClient(row)}
              title="Desinstalar cliente"
            >
              <RiShutDownLine size={24} />
            </Button>
          )}
          
          {/* Botón de actas */}
          <Button
            color="purple"
            size="min"
            onClick={() => handleShowActsList(row)}
            title="Gestionar actas"
          >
            <RiFileTextLine size={24} />
          </Button>
          
          <TableActions
            handleClickInfo={() => handleShowCarrierInfo(row)}
            handleClickUpdate={() => {
              setTitleModal(`Editar información de ${row.name}`);
              toggleModal(true);
              setCarrierID(row.id);
              setCarrierData(row);
            }}
            handleClickDelete={() => handleDelete(row.id)}
          />
        </div>
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
        {carrierInfo ? (
          <div className="space-y-6">
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
                  text: Array.isArray(carrierInfo.information_emails) 
                    ? carrierInfo.information_emails.join(", ") 
                    : carrierInfo.information_emails as string,
                },
                {
                  column: "Números de contacto",
                  text: Array.isArray(carrierInfo.contact_numbers)
                    ? carrierInfo.contact_numbers.map(c => `${c.contact_name}: ${c.phone_number}`).join(", ")
                    : carrierInfo.contact_numbers as string,
                },
                {
                  column: "Arraigo domiciliario",
                  text: carrierInfo.house_arrest,
                },
                {
                  column: "Parentesco",
                  text: carrierInfo.relationship_name,
                },
              ]}
            />
            {/* Mostrar observaciones usando el componente ObservationsList */}
            {carrierInfo.observations && carrierInfo.observations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Observaciones
                </h3>
                <ObservationsList observations={carrierInfo.observations} />
              </div>
            )}
          </div>
        ) : (
          <span>No hay nada para mostrar</span>
        )}
      </Modal>
      
      {/* Modal de desinstalación de cliente */}
      <UninstallClientForm
        isOpen={isOpenUninstallModal}
        onClose={() => toggleUninstallModal(false)}
        client={clientToUninstall}
        onUninstallSuccess={handleUninstallSuccess}
        isLoading={uninstallLoading}
        errorMessage={uninstallError}
      />

      {/* Modal para subir acta */}
      <Modal
        title="Subir Acta"
        isOpen={isOpenActModal}
        toggleModal={toggleActModal}
        backdrop
        size="lg"
      >
        {selectedCarrierForActs && (
          <div className="px-6 pb-6">
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                Subir Acta para: {selectedCarrierForActs.name}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Portador ID: {selectedCarrierForActs.id}
              </p>
            </div>
            
            <Formik
              initialValues={{
                act_title: "",
                act_description: "",
                act_document: null as File | null,
              }}
              validationSchema={Yup.object({
                act_title: Yup.string()
                  .required("El título del acta es requerido")
                  .min(3, "El título debe tener al menos 3 caracteres")
                  .max(100, "El título no puede exceder los 100 caracteres"),
                act_description: Yup.string()
                  .max(500, "La descripción no puede exceder los 500 caracteres"),
                act_document: Yup.mixed()
                  .required("El documento es requerido")
                  .test(
                    "fileType",
                    "Solo se permiten archivos PDF",
                    (value) => {
                      if (!value) return false;
                      return (value as File).type === "application/pdf";
                    }
                  )
                  .test(
                    "fileSize",
                    "El archivo no puede ser mayor a 20MB",
                    (value) => {
                      if (!value) return false;
                      return (value as File).size <= 20 * 1024 * 1024; // 20MB
                    }
                  ),
              })}
              onSubmit={(values) => {
                handleUploadAct(values);
              }}
            >
              {({ setFieldValue, errors, touched, values }) => (
                <Form className="space-y-4">
                  <FormikInput
                    label="Título del Acta *"
                    name="act_title"
                    type="text"
                    placeholder="Ej: Acta de instalación de dispositivo"
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Descripción
                    </label>
                    <textarea
                      name="act_description"
                      placeholder="Descripción detallada del acta (opcional)"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                      onChange={(e) => setFieldValue("act_description", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Documento del Acta (PDF) *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFieldValue("act_document", file);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                    {errors.act_document && touched.act_document && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.act_document}
                      </p>
                    )}
                    {values.act_document && (
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <div className="flex items-center space-x-2">
                          <div className="text-green-600 dark:text-green-400">
                            📄
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                              {values.act_document.name}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              Tamaño: {(values.act_document.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        ⚠️
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Información importante
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Solo se permiten archivos PDF</li>
                            <li>Tamaño máximo: 20MB</li>
                            <li>El documento se almacenará de forma segura</li>
                            <li>Una vez subido, el acta quedará registrada permanentemente</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      color="blue"
                      isLoading={actLoading}
                    >
                      {actLoading ? "Subiendo..." : "Subir Acta"}
                    </Button>
                    <Button
                      type="button"
                      color="gray"
                      onClick={() => toggleActModal(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
        <ErrMessage message={actError} center />
      </Modal>

      {/* Modal para listar actas */}
      <Modal
        title="Gestión de Actas"
        isOpen={isOpenActListModal}
        toggleModal={toggleActListModal}
        backdrop
        size="full"
      >
        {selectedCarrierForActs && (
          <div className="px-6 pb-6">
            {/* Botón para agregar nueva acta */}
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Actas de {selectedCarrierForActs.name}
              </h3>
              <Button
                color="blue"
                onClick={() => {
                  toggleActListModal(false);
                  handleShowActForm(selectedCarrierForActs);
                }}
              >
                <RiFileTextLine size={20} className="mr-2" />
                Nueva Acta
              </Button>
            </div>
            
            <CarrierActsList
              carrierData={selectedCarrierForActs}
              acts={carrierActs}
              onDeleteAct={handleDeleteAct}
              isLoading={actLoading}
            />
          </div>
        )}
      </Modal>
    </>
  );
};
// 281
