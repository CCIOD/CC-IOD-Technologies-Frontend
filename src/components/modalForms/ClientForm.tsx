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
} from "../../interfaces/clients.interface";
import { formatDate } from "../../utils/format";
import { FormikControlArray } from "../Inputs/FormikControlArray";

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
    contact_numbers: [""],
    contract_number: 0,
    court_name: "",
    criminal_case: "",
    defendant_name: "",
    hearing_date: "",
    investigation_file_number: 0,
    judge_name: "",
    lawyer_name: "",
    observations: [],
    newObservation: "",
    prospect_id: prospects.length > 0 ? (prospects[0].id as number) : 0,
    signer_name: "",
    status: "Pendiente de aprobación",
  };

  // Función para manejar el submit con observaciones
  const handleFormSubmit = (values: IClientForm) => {
    console.log("Valores del formulario antes del procesamiento:", values);
    
    const formData = { ...values };
    
    // Si hay una nueva observación, agregarla al array
    if (values.newObservation && values.newObservation.trim()) {
      const newObs: IClientObservation = {
        date: new Date().toISOString(),
        observation: values.newObservation.trim()
      };
      formData.observations = [...values.observations, newObs];
      console.log("Nueva observación agregada:", newObs);
    }
    
    // Remover el campo temporal
    delete formData.newObservation;
    
    console.log("Datos finales a enviar:", formData);
    handleSubmit(formData);
  };

  const propect_id_base =
    prospects.length > 0 ? (prospects[0].id as number) : 0;
  const formikInitialValues: IClientForm = clientData
    ? {
        defendant_name: clientData.name || "",
        contact_numbers: clientData.contact_numbers
          ? JSON.parse(clientData.contact_numbers)
          : [],
        court_name: clientData.court_name || "",
        contract_number: clientData.contract_number || 0,
        criminal_case: clientData.criminal_case || "",
        hearing_date: formatDate(clientData.hearing_date) || "",
        investigation_file_number: clientData.investigation_file_number || 0,
        judge_name: clientData.judge_name || "",
        lawyer_name: clientData.lawyer_name || "",
        observations: processObservations(clientData.observations),
        newObservation: "",
        prospect_id: clientData.prospect_id || propect_id_base,
        signer_name: clientData.signer_name || "",
        status: clientData.status || "Pendiente de aprobación",
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
            {({ values }) => (
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
                    required
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
                    label="Número de Causa Penal"
                    name="criminal_case"
                    placeholder="Introduce la causa penal"
                    correctColor="green"
                  />
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
                    label="Fecha"
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
                  <div className="mt-2 col-span-2">
                    <FieldArray name="contact_numbers">
                      {({ remove, push }) => (
                        <FormikControlArray
                          title="Números de contacto"
                          values={values.contact_numbers}
                          name="contact_numbers"
                          remove={remove}
                          push={push}
                        />
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
                          Observaciones ({formikInitialValues.observations.length})
                        </label>
                      </div>
                      
                      {/* Mostrar observaciones existentes */}
                      {formikInitialValues.observations.map((observation, index) => (
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
                                  onClick={() => remove(index)}
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
                      ))}
                      
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
        <span>Al parecer no hay prospectos que puedan ser clientes</span>
      )}
    </>
  );
};
