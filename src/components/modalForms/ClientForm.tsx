import { FC } from "react";
import { Button } from "../generic/Button";
import { Formik } from "formik";
import { Form } from "react-router-dom";
import { FormikInput } from "../Inputs/FormikInput";
import { FormikSelect } from "../Inputs/FormikSelect";
import { clientSchema } from "../../utils/FormSchema";
import { SelectableItem } from "../../interfaces/interfaces";
import { prospectStatusValues } from "../../interfaces/prospects.interface";
type Props = {
  toggleModal: (param: boolean) => void;
  handleClick: () => void;
  btnText: "Agregar" | "Actualizar";
  prospects: SelectableItem[];
};
export const ClientForm: FC<Props> = ({
  toggleModal,
  handleClick,
  btnText,
  prospects,
}) => {
  return (
    <>
      <div className="h-full py-2 flex flex-col justify-between">
        <div className="w-full h-full">
          <Formik
            initialValues={{}}
            validationSchema={clientSchema}
            // onSubmit={(data) => handleSubmit(data)}
            onSubmit={(data) => console.log(data)}
          >
            <Form className="w-full flex flex-col">
              <div className="grid grid-cols-3 gap-x-4">
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
                  type="number"
                  required
                  label="Número de Causa Penal"
                  name="criminal_case_number"
                  placeholder="Introduce el número de causa penal"
                  correctColor="green"
                />
                <FormikInput
                  type="number"
                  required
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
                  type="text"
                  required
                  label="Números de contacto"
                  name="contact_numbers"
                  placeholder="Introduce los números de contacto"
                  correctColor="green"
                />
                <FormikInput
                  type="date"
                  required
                  label="Fecha"
                  name="hearing_date"
                  correctColor="green"
                />
                <FormikSelect
                  label="Estado"
                  name="status"
                  correctColor="green"
                  options={prospectStatusValues}
                  defaultValue="Selecciona un estado"
                />
                <FormikSelect
                  label="Prospecto"
                  name="prospect_id"
                  correctColor="green"
                  options={prospects}
                  defaultValue="Selecciona un prospecto"
                />
              </div>
              <div>
                <span>Observaciones</span>
                <textarea
                  name=""
                  id=""
                  className="w-full app-bg border min-h-32 max-h-32"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <Button color="gray" onClick={() => toggleModal(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleClick()}
                  color={`${btnText === "Agregar" ? "blue" : "green"}`}
                >
                  {btnText}
                </Button>
              </div>
            </Form>
            {/* {({ setFieldValue }) => (
            )} */}
          </Formik>
        </div>
      </div>
    </>
  );
};
