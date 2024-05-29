import { FC } from "react";
import { Button } from "../generic/Button";
import { Field, Form, Formik } from "formik";
import { FormikInput } from "../Inputs/FormikInput";
import { FormikSelect } from "../Inputs/FormikSelect";
import { prospectSchema } from "../../utils/FormSchema";
import { formatDate } from "../../utils/format";
import {
  DataRowProspects,
  IProspectForm,
  prospectStatusValues,
} from "../../interfaces/prospects.interface";
import { relationshipValues } from "../../interfaces/interfaces";

type Props = {
  toggleModal: (param: boolean) => void;
  handleSubmit: (data: IProspectForm) => void;
  btnText: "Agregar" | "Actualizar";
  prospectData: DataRowProspects | null;
};

export const ProspectForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  btnText,
  prospectData = null,
}) => {
  const initialData: IProspectForm = {
    name: "",
    email: "",
    phone: "",
    date: "",
    observations: "",
    status: "Pendiente",
    relationship_id: 1,
  };
  const formikInitialValues: IProspectForm = prospectData
    ? {
        name: prospectData.name || "",
        email: prospectData.email || "",
        phone: prospectData.phone || "",
        date: formatDate(prospectData.date) || "",
        observations: prospectData.observations || "",
        status: prospectData.status || "Pendiente",
        relationship_id: prospectData.relationship_id || 1,
      }
    : initialData;

  return (
    <>
      <div className="h-full py-2 flex flex-col justify-between">
        <Formik
          initialValues={formikInitialValues}
          validationSchema={prospectSchema}
          onSubmit={(data) => handleSubmit(data)}
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
              <FormikSelect
                label="Selecciona un Parentesco"
                name="relationship_id"
                correctColor="green"
                options={relationshipValues}
              />
            </div>
            <div>
              <label>Observaciones</label>
              <Field
                as="textarea"
                name="observations"
                className="w-full min-h-32 max-h-32 app-bg border"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={() => toggleModal(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                color={`${btnText === "Agregar" ? "blue" : "green"}`}
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
