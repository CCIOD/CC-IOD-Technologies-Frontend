import { FC, useEffect, useState } from "react";
import { Button } from "../generic/Button";
import { InputFile } from "../Inputs/InputFile";
import { Form, Formik } from "formik";
import { contractSchema, reportSchema } from "../../utils/FormSchema";
import { ResetInputFile } from "../Inputs/ResetInputFile";
import { alertTimer } from "../../utils/alerts";
import { ApiResponse, IFilesForm } from "../../interfaces/interfaces";
import { removeFile } from "../../services/api.service";
import { RiUploadLine } from "react-icons/ri";

type Props = {
  toggleModal: (param: boolean, remove?: boolean) => void;
  handleSubmit: (data: IFilesForm) => void;
  data: {
    id: number | null;
    filename: string | null;
    name: "contract" | "installation_report";
  };
  endpointDelete: string;
  isLoading: boolean;
};
export const UploadFilesForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  data,
  endpointDelete,
  isLoading,
}) => {
  const [contractInput, setContractInput] = useState<string>(
    `Selecciona un ${data.name === "contract" ? "contrato" : "reporte"}`
  );
  const [isCreated, setIsCreated] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const initialData: IFilesForm = {
    contract: null,
    installation_report: null,
  };

  useEffect(() => {
    setIsCreated(data.filename ? true : false);
    setIsUpdating(false);
  }, [data]);

  const handleDeleteFile = async () => {
    try {
      const res = await removeFile(
        endpointDelete,
        data.id!,
        data.filename!.match(/\/([^/?#]+)$/)![1]
      );
      if (res.success) {
        alertTimer(`El Documento se ha eliminado.`, "success");
        toggleModal(false, true);
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
          validationSchema={
            data.name === "contract" ? contractSchema : reportSchema
          }
          onSubmit={(data) => handleSubmit(data)}
        >
          {({ setFieldValue }) => (
            <Form className="w-full flex flex-col gap-4">
              {isCreated && !isUpdating ? (
                <>
                  <ResetInputFile
                    filename={data.filename ? data.filename : ""}
                    handleClick={handleDeleteFile}
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <Button color="gray" onClick={() => toggleModal(false)}>
                      Cerrar
                    </Button>
                    <Button
                      color="blue"
                      title="Actualizar documento"
                      onClick={() => setIsUpdating(true)}
                    >
                      <RiUploadLine size={16} className="mr-1" />
                      Actualizar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {isUpdating && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Selecciona el nuevo archivo para reemplazar el actual.
                    </p>
                  )}
                  <InputFile
                    name={data.name}
                    type="file"
                    text={contractInput}
                    onChange={(e) => {
                      const file = e.target?.files![0];
                      if (file) setContractInput(file.name);
                      setFieldValue(data.name, file);
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      color="gray"
                      onClick={() => {
                        if (isUpdating) {
                          setIsUpdating(false);
                        } else {
                          toggleModal(false);
                        }
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      color="green"
                      spinner
                      isLoading={isLoading}
                    >
                      Guardar
                    </Button>
                  </div>
                </>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
