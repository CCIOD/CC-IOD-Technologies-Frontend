import { FC, useState } from "react";
import { Button } from "../generic/Button";
import { InputFile } from "../Inputs/InputFile";
import { Form, Formik } from "formik";
import { operationSchema } from "../../utils/FormSchema";
import { IOperationForm } from "../../interfaces/operations.interface";

type Props = {
  toggleModal: (param: boolean) => void;
  handleSubmit: (data: IOperationForm) => void;
  btnText: "Guardar";
};
export const OperationForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  btnText,
}) => {
  const [contractInput, setContractInput] = useState("Selecciona un contrato");
  const [reportInput, setReportInput] = useState("Selecciona un reporte");

  const initialData: IOperationForm = {
    contract: null,
    installation_report: null,
  };

  return (
    <>
      <div className="h-full py-2 flex flex-col justify-between">
        <div className="w-full h-full">
          <Formik
            initialValues={initialData}
            validationSchema={operationSchema}
            onSubmit={(data) => handleSubmit(data)}
          >
            {({ setFieldValue }) => (
              <Form className="w-full flex flex-col gap-4">
                <InputFile
                  name="contract"
                  type="file"
                  text={contractInput}
                  onChange={(e) => {
                    const file = e.target?.files![0];
                    if (file) setContractInput(file.name);
                    setFieldValue("contract", file);
                  }}
                />
                <InputFile
                  name="installation_report"
                  type="file"
                  text={reportInput}
                  onChange={(e) => {
                    const file = e.target?.files![0];
                    if (file) setReportInput(file.name);
                    setFieldValue("installation_report", file);
                  }}
                />
                <div className="flex justify-end gap-2">
                  <Button color="gray" onClick={() => toggleModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" color="green">
                    {btnText}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};
