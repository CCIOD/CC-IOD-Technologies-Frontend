import { FC, useEffect, useState } from "react";
import { Button } from "../generic/Button";
import { InputFile } from "../Inputs/InputFile";
import { Form, Formik } from "formik";
import { operationSchema } from "../../utils/FormSchema";
import {
  DataRowOperations,
  IOperationForm,
} from "../../interfaces/operations.interface";
import { ResetInputFile } from "../Inputs/ResetInputFile";
import { deleteFileFromApi } from "../../services/operationsService";
import { ApiResponse } from "../../interfaces/response.interface";
import { alertTimer } from "../../utils/alerts";

type Props = {
  toggleModal: (param: boolean) => void;
  handleSubmit: (data: IOperationForm) => void;
  btnText: "Guardar";
  operationData: DataRowOperations | null;
  toggleAction: () => void;
};
export const OperationForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  btnText,
  operationData,
  toggleAction,
}) => {
  const [contractInput, setContractInput] = useState<string>(
    "Selecciona un contrato"
  );
  const [reportInput, setReportInput] = useState<string>(
    "Selecciona un reporte"
  );
  const [isContract, setIsContract] = useState<boolean>(false);
  const [isReport, setIsReport] = useState<boolean>(false);

  const initialData: IOperationForm = {
    contract: null,
    installation_report: null,
  };

  useEffect(() => {
    if (operationData) {
      setIsContract(operationData.contract ? true : false);
      setIsReport(operationData.installation_report ? true : false);
    }
  }, [operationData]);

  const handleDeleteFile = async (file: "contract" | "installation_report") => {
    try {
      const res = await deleteFileFromApi(operationData!.id, file);
      if (res.success) {
        file === "contract" ? setIsContract(false) : setIsReport(false);
        const name =
          file === "contract" ? "contrato" : "reporte de instalación";
        toggleAction();
        alertTimer(`El ${name} se ha eliminado.`, "success");
      }
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message, "error");
    }
  };

  return (
    <div className="h-full py-2 flex flex-col justify-between">
      <div className="w-full h-full">
        <Formik
          initialValues={initialData}
          validationSchema={operationSchema}
          onSubmit={(data) => handleSubmit(data)}
        >
          {({ setFieldValue }) => (
            <Form className="w-full flex flex-col gap-4">
              {isContract ? (
                <ResetInputFile
                  filename={
                    operationData?.contract ? operationData?.contract : ""
                  }
                  handleClick={() => handleDeleteFile("contract")}
                />
              ) : (
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
              )}
              {isReport ? (
                <ResetInputFile
                  filename={
                    operationData?.installation_report
                      ? operationData?.installation_report
                      : ""
                  }
                  handleClick={() => handleDeleteFile("installation_report")}
                />
              ) : (
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
              )}
              {(!isContract || !isReport) && (
                <div className="flex justify-end gap-2">
                  <Button color="gray" onClick={() => toggleModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" color="green">
                    {btnText}
                  </Button>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
// 136
