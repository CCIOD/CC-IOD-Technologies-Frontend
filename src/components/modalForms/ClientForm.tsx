import { FC } from "react";
import { Button } from "../generic/Button";
type Props = {
  toggleModal: (param: boolean) => void;
  handleClick: () => void;
  btnText: "Agregar" | "Actualizar";
};
export const ClientForm: FC<Props> = ({
  toggleModal,
  handleClick,
  btnText,
}) => {
  return (
    <>
      <div className="h-full py-2 flex flex-col justify-between">
        <div className="bg-black/10 w-full h-full">Form</div>
        <div className="flex justify-end gap-2 mt-2">
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
      </div>
    </>
  );
};
