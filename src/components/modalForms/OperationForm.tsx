import { FC, FormEvent, useState } from "react";
import { Button } from "../pure/Button";
import { InputFile } from "../pure/InputFile";

type Props = {
  toggleModal: (param: boolean) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  btnText: "Guardar";
};
export const OperationForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  btnText,
}) => {
  const [contractInput, setContractInput] = useState("Selecciona un contrato");
  const [reportInput, setReportInput] = useState("Selecciona un reporte");
  return (
    <>
      <div className="h-full py-2 flex flex-col justify-between">
        <div className="w-full h-full">
          <form
            className="w-full flex flex-col gap-4"
            onSubmit={(e) => handleSubmit(e)}
          >
            <InputFile
              name="contract"
              text={contractInput}
              onChange={(e) => {
                const file = e.target?.files![0];
                if (file) setContractInput(file.name);
              }}
            />
            <InputFile
              name="installation_report"
              text={reportInput}
              onChange={(e) => {
                const file = e.target?.files![0];
                if (file) setReportInput(file.name);
              }}
            />
          </form>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button color="gray" onClick={() => toggleModal(false)}>
            Cancelar
          </Button>
          <Button type="submit" color="green">
            {btnText}
          </Button>
        </div>
      </div>
    </>
  );
};
