import { FC } from "react";
import { Button } from "../generic/Button";
import { Field, FieldArray, Form, Formik } from "formik";
import { FormikInput } from "../Inputs/FormikInput";
import { FormikSelect } from "../Inputs/FormikSelect";
import { carrierSchema } from "../../utils/FormSchema";
import {
  relationshipValues,
  SelectableItem,
} from "../../interfaces/interfaces";
import {
  DataRowCarriers,
  ICarrierForm,
} from "../../interfaces/carriers.interface";
import { formatDate } from "../../utils/format";
import { FormikControlArray } from "../Inputs/FormikControlArray";
import { IClientObservation } from "../../interfaces/clients.interface";

type Props = {
  toggleModal: (param: boolean) => void;
  handleSubmit: (data: ICarrierForm) => void;
  btnText: "Agregar" | "Actualizar";
  carriers: SelectableItem[];
  carrierData: DataRowCarriers | null;
  isLoading: boolean;
};

export const CarrierForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  btnText,
  carriers,
  carrierData = null,
  isLoading,
}) => {
  // Función para procesar observaciones del backend
  const processObservations = (observations: string | IClientObservation[] | undefined): IClientObservation[] => {
    if (!observations) return [];
    if (typeof observations === 'string') {
      return observations.trim() ? [{ date: new Date().toISOString(), observation: observations }] : [];
    }
    if (Array.isArray(observations)) {
      return observations;
    }
    return [];
  };

  const initialData: ICarrierForm = {
    residence_area: "",
    placement_date: "",
    placement_time: "",
    electronic_bracelet: "",
    beacon: "",
    wireless_charger: "",
    information_emails: [""],
    contact_numbers: [{ contact_name: "", phone_number: "", relationship_id: undefined }],
    house_arrest: "",
    installer_name: "",
    observations: [],
    newObservation: "",
    client_id: carriers.length > 0 ? (carriers[0].id as number) : 0,
    relationship_id: 1,
  };

  // Función para manejar el submit con observaciones
  const handleFormSubmit = (values: ICarrierForm) => {
    console.log("Valores del formulario antes del procesamiento:", values);
    
    const formData = { ...values };
    
    // Si hay una nueva observación, agregarla al array
    if (values.newObservation && values.newObservation.trim()) {
      const newObs: IClientObservation = {
        date: new Date().toISOString(),
        observation: values.newObservation.trim()
      };
      formData.observations = values.observations ? [...values.observations, newObs] : [newObs];
      console.log("Nueva observación agregada:", newObs);
    }
    
    // Mapear relationship_id a relationship para el backend
    if (formData.contact_numbers) {
      formData.contact_numbers = formData.contact_numbers.map((contact: any) => ({
        contact_name: contact.contact_name,
        phone_number: contact.phone_number,
        relationship: contact.relationship_id || contact.relationship || ''
      }));
    }
    
    // Remover el campo temporal
    delete formData.newObservation;
    
    console.log("Datos finales a enviar:", formData);
    handleSubmit(formData);
  };

  const client_id_base = carriers.length > 0 ? (carriers[0].id as number) : 0;
  const formikInitialValues: ICarrierForm = carrierData
    ? {
        residence_area: carrierData.residence_area || "",
        placement_date: formatDate(carrierData.placement_date) || "",
        placement_time: carrierData.placement_time || "",
        electronic_bracelet: carrierData.electronic_bracelet || "",
        beacon: carrierData.beacon || "",
        wireless_charger: carrierData.wireless_charger || "",
        information_emails: Array.isArray(carrierData.information_emails) 
          ? carrierData.information_emails 
          : (typeof carrierData.information_emails === 'string' 
              ? (() => {
                  try {
                    return JSON.parse(carrierData.information_emails as string);
                  } catch {
                    return [carrierData.information_emails];
                  }
                })()
              : [""]),
        contact_numbers: carrierData.contact_numbers && Array.isArray(carrierData.contact_numbers)
          ? carrierData.contact_numbers.map(contact => ({
              contact_name: contact.contact_name,
              phone_number: contact.phone_number,
              relationship_id: contact.relationship || contact.relationship_id || contact.relationship_name || undefined
            }))
          : (typeof carrierData.contact_numbers === 'string'
              ? (() => {
                  try {
                    // Si es un JSON con array de números, convertir a contactos
                    const phoneNumbers = JSON.parse(carrierData.contact_numbers as string);
                    return phoneNumbers.map((phone: string, index: number) => ({
                      contact_name: `Contacto ${index + 1}`,
                      phone_number: phone,
                      relationship_id: undefined
                    }));
                  } catch {
                    return [{
                      contact_name: "Contacto 1",
                      phone_number: carrierData.contact_numbers,
                      relationship_id: undefined
                    }];
                  }
                })()
              : [{ contact_name: "", phone_number: "", relationship_id: undefined }]),
        house_arrest: carrierData.house_arrest || "",
        installer_name: carrierData.installer_name || "",
        observations: processObservations(carrierData.observations),
        newObservation: "",
        client_id: carrierData.client_id || client_id_base,
        relationship_id: carrierData.relationship_id || 1,
      }
    : initialData;

  return (
    <>
      {carriers.length > 0 || btnText === "Actualizar" ? (
        <div className="h-full py-2 flex flex-col justify-between">
          <Formik
            initialValues={formikInitialValues}
            validationSchema={carrierSchema}
            onSubmit={handleFormSubmit}
            enableReinitialize={true}
          >
            {({ values }) => (
              <Form className="w-full flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
                  {!carrierData && (
                    <FormikSelect
                      label="Selecciona un Cliente"
                      name="client_id"
                      correctColor="green"
                      options={carriers}
                    />
                  )}
                  <FormikInput
                    type="text"
                    required
                    label="Zona de residencia"
                    name="residence_area"
                    placeholder="Introduce la zona de residencia"
                    correctColor="green"
                  />
                  <FormikInput
                    type="date"
                    required
                    className="dark:[color-scheme:dark]"
                    label="Fecha de colocación"
                    name="placement_date"
                    correctColor="green"
                  />
                  <FormikInput
                    type="time"
                    required
                    className="dark:[color-scheme:dark]"
                    label="Hora de colocación"
                    name="placement_time"
                    correctColor="green"
                  />
                  <FormikInput
                    type="text"
                    required
                    label="Brazalete Electrónico"
                    name="electronic_bracelet"
                    placeholder="Introduce el brazalete electrónico"
                    correctColor="green"
                  />
                  <FormikInput
                    type="text"
                    required
                    label="BEACON"
                    name="beacon"
                    placeholder="Introduce el BEACON"
                    correctColor="green"
                  />
                  <FormikInput
                    type="text"
                    required
                    label="Cargador Inalámbrico"
                    name="wireless_charger"
                    placeholder="Introduce el cargador inalámbrico"
                    correctColor="green"
                  />
                  <FormikInput
                    type="text"
                    required
                    label="Arraigo Domiciliario"
                    name="house_arrest"
                    placeholder="Introduce el arraigo domiciliario"
                    correctColor="green"
                  />
                  <FormikInput
                    type="text"
                    required
                    label="Nombre del Instalador"
                    name="installer_name"
                    placeholder="Introduce el nombre del instalador"
                    correctColor="green"
                  />
                  <FormikSelect
                    label="Selecciona un Parentesco"
                    name="relationship_id"
                    correctColor="green"
                    options={relationshipValues}
                  />
                </div>
                
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 lg:col-span-7 xl:col-span-5">
                    <FieldArray name="information_emails">
                      {({ remove, push }) => (
                        <FormikControlArray
                          title="Correos para información"
                          values={values.information_emails}
                          name="information_emails"
                          remove={remove}
                          push={push}
                        />
                      )}
                    </FieldArray>
                    
                    {/* Contactos múltiples - Similar a ClientForm */}
                    <div className="mt-4">
                      <FieldArray name="contact_numbers">
                        {({ remove, push }) => (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Contactos *
                            </label>
                            {values.contact_numbers.map((_, index) => (
                              <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <FormikInput
                                    type="text"
                                    label="Nombre del contacto"
                                    name={`contact_numbers[${index}].contact_name`}
                                    placeholder="Nombre completo"
                                    correctColor="green"
                                    required
                                  />
                                  <FormikInput
                                    type="text"
                                    label="Teléfono"
                                    name={`contact_numbers[${index}].phone_number`}
                                    placeholder="10 dígitos"
                                    correctColor="green"
                                    required
                                  />
                                  <FormikInput
                                    type="text"
                                    label="Parentesco"
                                    name={`contact_numbers[${index}].relationship_id`}
                                    placeholder="Ej: Familiar, Abogado, Amigo"
                                    correctColor="green"
                                  />
                                </div>
                                {values.contact_numbers.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                                  >
                                    Eliminar contacto
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => push({ contact_name: "", phone_number: "", relationship_id: undefined })}
                              className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              + Agregar contacto
                            </button>
                          </div>
                        )}
                      </FieldArray>
                    </div>
                  </div>
                  
                  <div className="col-span-12 lg:col-span-5 xl:col-span-7">
                    {/* Observaciones Dinámicas - Similar a ClientForm */}
                    <FieldArray name="observations">
                      {({ remove }) => (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="app-text-form">
                              Observaciones ({values.observations?.length || 0})
                            </label>
                          </div>
                          
                          {/* Mostrar observaciones existentes */}
                          {values.observations?.map((observation, index) => {
                            // Verificar si es un objeto IClientObservation
                            if (typeof observation === 'object' && observation !== null && 'date' in observation && 'observation' in observation) {
                              return (
                                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                      Observación #{index + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                        {formatDate(observation.date)}
                                      </span>
                                      {btnText === "Actualizar" && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            console.log(`Eliminando observación ${index}:`, observation);
                                            remove(index);
                                          }}
                                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                                        >
                                          Eliminar
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <Field
                                    as="textarea"
                                    name={`observations.${index}.observation`}
                                    className="textarea"
                                    placeholder="Texto de la observación"
                                    readOnly={btnText === "Agregar"}
                                  />
                                </div>
                              );
                            }
                            return null;
                          })}
                          
                          {/* Campo para nueva observación */}
                          <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                            <label className="app-text-form text-green-600 dark:text-green-400">
                              Nueva Observación
                            </label>
                            <Field
                              as="textarea"
                              name="newObservation"
                              className="textarea"
                              placeholder="Agregar nueva observación..."
                            />
                          </div>
                        </div>
                      )}
                    </FieldArray>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button color="gray" onClick={() => toggleModal(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    color={`${btnText === "Agregar" ? "blue" : "green"}`}
                    spinner
                    isLoading={isLoading}
                  >
                    {btnText}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      ) : (
        <span>Al parecer no hay clientes que puedan ser prospectos</span>
      )}
    </>
  );
};
