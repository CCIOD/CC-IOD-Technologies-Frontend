import { FC } from "react";
import { Button } from "../generic/Button";
import { Form, Formik } from "formik";
import { FormikInput } from "../Inputs/FormikInput";
import { INameForm } from "../../interfaces/users.interface";
import { updateAdminSchema } from "../../utils/FormSchema";
import { UserProfile } from "../../interfaces/auth.interfaces";

type Props = {
  toggleModal: (param: boolean) => void;
  handleSubmit: (data: INameForm) => void;
  adminData: UserProfile | null;
  isLoading: boolean;
};

export const AdminForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  adminData,
  isLoading,
}) => {
  const initialData: INameForm = {
    name: adminData ? adminData.name : "",
  };

  return (
    <>
      <div className="h-full py-2 flex flex-col justify-between">
        <Formik
          initialValues={initialData}
          validationSchema={updateAdminSchema}
          onSubmit={(data) => handleSubmit(data)}
          enableReinitialize={true}
        >
          <Form className="w-full flex flex-col">
            <div className="grid grid-cols-1 gap-x-4">
              <FormikInput
                type="text"
                required
                label="Nombre"
                name="name"
                placeholder="Introduce un nombre"
                correctColor="green"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={() => toggleModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" color="blue" spinner isLoading={isLoading}>
                Guardar
              </Button>
            </div>
          </Form>
        </Formik>
      </div>
    </>
  );
};
