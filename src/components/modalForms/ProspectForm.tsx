import { FC } from "react";
import { Button } from "../generic/Button";
import { Field, Form, Formik, FieldArray } from "formik";
import { FormikInput } from "../Inputs/FormikInput";
import { FormikSelect } from "../Inputs/FormikSelect";
import { prospectSchema } from "../../utils/FormSchema";
import { formatDate } from "../../utils/format";
import {
  DataRowProspects,
  IProspectForm,
  prospectStatusValues,
  IObservation,
} from "../../interfaces/prospects.interface";

type Props = {
  toggleModal: (param: boolean) => void;
  handleSubmit: (data: IProspectForm) => void;
  btnText: "Agregar" | "Actualizar";
  prospectData: DataRowProspects | null;
  isLoading: boolean;
};

export const ProspectForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  btnText,
  prospectData = null,
  isLoading,
}) => {
  const initialData: IProspectForm = {
    name: "",
    email: "",
    phone: "",
    date: "",
    observations: [],
    status: "Pendiente",
    relationship_id: "",
    newObservation: "",
  };
  
  // Función para procesar observaciones del backend
  const processObservations = (observations: string | IObservation[] | undefined): IObservation[] => {
    if (!observations) return [];
    if (typeof observations === 'string') {
      return observations.trim() ? [{ date: new Date().toISOString(), observation: observations }] : [];
    }
    if (Array.isArray(observations)) {
      return observations;
    }
    return [];
  };

  const formikInitialValues: IProspectForm = prospectData
    ? {
        name: prospectData.name || "",
        email: prospectData.email || "",
        phone: prospectData.phone || "",
        date: formatDate(prospectData.date) || "",
        observations: processObservations(prospectData.observations),
        status: prospectData.status || "Pendiente",
        relationship_id: (prospectData as any).relationship || prospectData.relationship_id?.toString() || "",
        newObservation: "",
      }
    : initialData;

  // Función para manejar el submit con observaciones
  const handleFormSubmit = (values: IProspectForm) => {
    console.log("Valores del formulario antes del procesamiento:", values);
    
    const formData = { ...values };
    
    // Si hay una nueva observación, agregarla al array
    if (values.newObservation && values.newObservation.trim()) {
      const newObs: IObservation = {
        date: new Date().toISOString(),
        observation: values.newObservation.trim()
      };
      formData.observations = [...values.observations, newObs];
      console.log("Nueva observación agregada:", newObs);
    }
    
    // Transformar relationship_id a relationship (texto)
    const relationshipMap: { [key: number]: string } = {
      1: "Familiar",
      2: "Abogado"
    };
    
    if (formData.relationship_id) {
      (formData as any).relationship = typeof formData.relationship_id === 'number' 
        ? relationshipMap[formData.relationship_id] || "Familiar"
        : formData.relationship_id; // Si ya es texto, mantenerlo
      delete (formData as any).relationship_id;
    }
    
    // Remover el campo temporal
    delete formData.newObservation;
    
    console.log("Datos finales a enviar:", formData);
    handleSubmit(formData);
  };

  return (
    <>
      <div className="h-full py-2 flex flex-col justify-between">
        <Formik
          initialValues={formikInitialValues}
          validationSchema={prospectSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize={true}
        >
          <Form className="w-full flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4">
              <FormikInput
                type="text"
                required
                label="Nombre"
                name="name"
                placeholder="Introduce un nombre"
                correctColor="green"
              />
              <FormikInput
                type="text"
                required
                label="Correo electrónico"
                name="email"
                placeholder="Introduce el correo"
                correctColor="green"
              />
              <FormikInput
                type="text"
                required
                label="Número de teléfono"
                name="phone"
                placeholder="Introduce el número de teléfono"
                correctColor="green"
              />
              <FormikInput
                type="date"
                required
                className="dark:[color-scheme:dark]"
                label="Fecha"
                name="date"
                correctColor="green"
              />
              <FormikSelect
                label="Selecciona un Estado"
                name="status"
                correctColor="green"
                options={prospectStatusValues}
                valueText
              />
              <FormikInput
                type="text"
                label="Parentesco"
                name="relationship_id"
                correctColor="green"
                placeholder="Ej: Familiar, Abogado, Amigo"
              />
            </div>
            
            {/* Observaciones Existentes */}
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
        </Formik>
      </div>
    </>
  );
};
// 210
