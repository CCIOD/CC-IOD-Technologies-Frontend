import { FC } from "react";
import { Button } from "../generic/Button";
import { Field, FieldArray, Form, Formik } from "formik";
import { FormikInput } from "../Inputs/FormikInput";
import { FormikSelect } from "../Inputs/FormikSelect";
import { clientSchema } from "../../utils/FormSchema";
import { SelectableItem } from "../../interfaces/interfaces";
import {
  clientStatusValues,
  DataRowClients,
  IClientForm,
  IClientObservation,
  paymentFrequencyValues,
  braceletTypeValues,
  TClientStatus,
} from "../../interfaces/clients.interface";
import { formatDate } from "../../utils/format";

type Props = {
  toggleModal: (param: boolean) => void;
  handleSubmit: (data: IClientForm) => void;
  btnText: "Agregar" | "Actualizar";
  prospects: SelectableItem[];
  clientData: DataRowClients | null;
  isLoading: boolean;
};

export const ClientForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  btnText,
  prospects,
  clientData = null,
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

  const initialData: IClientForm = {
    contact_numbers: [{ contact_name: "", phone_number: "", relationship_id: undefined }],
    contract_number: undefined,
    court_name: "",
    criminal_case: "",
    defendant_name: "",
    hearing_date: "",
    investigation_file_number: undefined,
    judge_name: "",
    lawyer_name: "",
    
    // Nuevos campos
    contract_date: "",
    contract_document: "",
    contract_duration: "",
    contract_folio: "",
    payment_day: undefined,
    payment_frequency: "",
    bracelet_type: "",
    
    observations: [],
    newObservation: "",
    prospect_id: prospects.length > 0 ? (prospects[0].id as number) : undefined,
    signer_name: "",
    status: "Pendiente de aprobación",
  };

  // Función para manejar el submit con observaciones
  const handleFormSubmit = (values: IClientForm) => {
    
    const formData = { ...values };
    
    // Procesar y limpiar datos antes de enviar
    // Convertir strings vacíos a undefined para campos opcionales
    if (formData.contract_date === "") formData.contract_date = undefined;
    if (formData.contract_duration === "") formData.contract_duration = undefined;
    if (formData.contract_document === "") formData.contract_document = undefined;
    if (formData.contract_folio === "") formData.contract_folio = undefined;
    if (formData.payment_frequency === "") formData.payment_frequency = undefined;
    if (formData.bracelet_type === "") formData.bracelet_type = undefined;
    
    // Convertir strings numéricos a números
    if (formData.contract_number && typeof formData.contract_number === 'string') {
      formData.contract_number = parseInt(formData.contract_number, 10) || undefined;
    }
    if (formData.payment_day && typeof formData.payment_day === 'string') {
      formData.payment_day = parseInt(formData.payment_day, 10) || undefined;
    }
    
    // Si hay una nueva observación, agregarla al array
    if (values.newObservation && values.newObservation.trim()) {
      const newObs: IClientObservation = {
        date: new Date().toISOString(),
        observation: values.newObservation.trim()
      };
      formData.observations = values.observations ? [...values.observations, newObs] : [newObs];
    }
    
    // Remover el campo temporal
    delete formData.newObservation;
    
    handleSubmit(formData);
  };

  const propect_id_base =
    prospects.length > 0 ? (prospects[0].id as number) : undefined;
  const formikInitialValues: IClientForm = clientData
    ? {
        defendant_name: clientData.name || "",
        contact_numbers: clientData.contact_numbers || [{ contact_name: "", phone_number: "", relationship_id: undefined }],
        court_name: clientData.court_name || "",
        contract_number: clientData.contract_number || undefined,
        criminal_case: clientData.criminal_case || "",
        hearing_date: formatDate(clientData.hearing_date) || "",
        investigation_file_number: clientData.investigation_file_number || undefined,
        judge_name: clientData.judge_name || "",
        lawyer_name: clientData.lawyer_name || "",
        
        // Nuevos campos
        contract_date: clientData.contract_date ? formatDate(clientData.contract_date) : "",
        contract_document: clientData.contract_document || "",
        contract_duration: clientData.contract_duration || "",
        contract_folio: clientData.contract_folio || "",
        payment_day: clientData.payment_day || undefined,
        payment_frequency: clientData.payment_frequency || "",
        bracelet_type: clientData.bracelet_type || "",
        
        observations: processObservations(clientData.observations),
        newObservation: "",
        prospect_id: clientData.prospect_id || propect_id_base,
        signer_name: clientData.signer_name || "",
        status: (clientData.status || "Pendiente de aprobación") as TClientStatus,
      }
    : initialData;


  return (
    <>
      {prospects.length > 0 || btnText === "Actualizar" ? (
        <div className="h-full py-2 flex flex-col justify-between">
          <Formik
            initialValues={formikInitialValues}
            validationSchema={clientSchema}
            onSubmit={handleFormSubmit}
            enableReinitialize={true}
          >
            {({ values, errors, isValid }) => {
              
              // Mostrar errores específicos en la consola
              if (!isValid && Object.keys(errors).length > 0) {
              }
              
              return (
              <Form className="w-full flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
                  {!clientData && (
                    <FormikSelect
                      label="Selecciona un Prospecto"
                      name="prospect_id"
                      correctColor="green"
                      options={prospects}
                    />
                  )}
                  <FormikInput
                    type="number"
                    label="Número de Contrato"
                    name="contract_number"
                    placeholder="Introduce el número de contrato"
                    correctColor="green"
                  />
                  <FormikInput
                    type="text"
                    required
                    label="Nombre del Imputado"
                    name="defendant_name"
                    placeholder="Introduce el nombre del imputado"
                    correctColor="green"
                  />
                  <FormikInput
                    type="text"
                    required
                    label="Causa Penal"
                    name="criminal_case"
                    placeholder="Introduce la causa penal"
                    correctColor="green"
                  />
                  {/* Mostrar solo el nombre del archivo, no editable */}
                  <div className="mb-2">
                    <label className="label">Documento del Contrato</label>
                    <input
                      type="text"
                      className="p-2 w-full rounded border outline-none bg-gray-100 text-gray-700"
                      value={
                        ((values.contract_document && values.contract_document !== "")
                          ? values.contract_document
                          : (clientData?.contract || "")
                        ).replace(
                          /^https:\/\/storagecciodtech\.blob\.core\.windows\.net\/contracts\//,
                          ""
                        )
                      }
                      readOnly
                      tabIndex={-1}
                    />
                  </div>
                  <FormikInput
                    type="number"
                    label="Número de Carpeta de Investigación"
                    name="investigation_file_number"
                    placeholder="Introduce el número de carpeta de investigación"
                    correctColor="green"
                  />
                  <FormikInput
                    type="text"
                    required
                    label="Nombre del Juez"
                    name="judge_name"
                    placeholder="Introduce el nombre del juez"
                    correctColor="green"
                  />
                  <FormikInput
                    type="text"
                    required
                    label="Nombre del Juzgado"
                    name="court_name"
                    placeholder="Introduce el nombre del juzgado"
                    correctColor="green"
                  />
                  <FormikInput
                    type="text"
                    required
                    label="Nombre del Abogado"
                    name="lawyer_name"
                    placeholder="Introduce el nombre del abogado"
                    correctColor="green"
                  />
                  <FormikInput
                    type="text"
                    required
                    label="Nombre de quién firma el contrato"
                    name="signer_name"
                    placeholder="Introduce el nombre de quién firma el contrato"
                    correctColor="green"
                  />
                  <FormikInput
                    type="date"
                    required
                    className="dark:[color-scheme:dark]"
                    label="Fecha de Audiencia"
                    name="hearing_date"
                    correctColor="green"
                  />
                  <FormikSelect
                    label="Selecciona un Estado"
                    name="status"
                    correctColor="green"
                    options={clientStatusValues}
                    valueText
                  />
                  
                  {/* Nuevos campos */}
                  <FormikInput
                    type="date"
                    className="dark:[color-scheme:dark]"
                    label="Fecha del Contrato"
                    name="contract_date"
                    correctColor="green"
                    required={values.status === "Colocado"}
                  />
                  <FormikInput
                    type="text"
                    label="Duración del Contrato"
                    name="contract_duration"
                    placeholder="ej: 12 meses"
                    correctColor="green"
                    required={values.status === "Colocado"}
                  />
                  <FormikInput
                    type="number"
                    label="Día de Pago"
                    name="payment_day"
                    placeholder="1-31"
                    correctColor="green"
                    required={values.status === "Colocado"}
                  />
                  <FormikSelect
                    label="Frecuencia de Pago"
                    name="payment_frequency"
                    correctColor="green"
                    options={paymentFrequencyValues}
                    valueText
                    required={values.status === "Colocado"}
                  />
                  <FormikInput
                    type="text"
                    label="Contrato"
                    name="contract_folio"
                    placeholder="Introduce el contrato"
                    correctColor="green"
                  />
                  <FormikSelect
                    label="Tipo de Brazalete"
                    name="bracelet_type"
                    correctColor="green"
                    options={braceletTypeValues}
                    valueText
                    required={values.status === "Colocado"}
                  />
                  
                  <div className="mt-2 col-span-2">
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
                                  type="number"
                                  label="Parentesco (ID)"
                                  name={`contact_numbers[${index}].relationship_id`}
                                  placeholder="1=Familiar, 2=Abogado"
                                  correctColor="green"
                                  required
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
                
                {/* Observaciones Dinámicas */}
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
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button color="gray" onClick={() => toggleModal(false)}>
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    color={btnText === "Agregar" ? "blue" : "green"}
                    spinner
                    isLoading={isLoading}
                  >
                    {btnText}
                  </Button>
                </div>
              </Form>
              );
            }}
          </Formik>
        </div>
      ) : (
        <span>Al parecer no hay prospectos que puedan ser clientes</span>
      )}
    </>
  );
};
