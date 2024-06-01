import { FC } from "react";
import { Button } from "../generic/Button";
import { Form, Formik } from "formik";
import { FormikInput } from "../Inputs/FormikInput";
import { DataRowUsers, IAdminForm } from "../../interfaces/users.interface";
import { updateAdminSchema } from "../../utils/FormSchema";
import { Alert } from "../generic/Alert";

type Props = {
  toggleModal: (param: boolean) => void;
  handleSubmit: (data: IAdminForm) => void;
  adminData: DataRowUsers | null;
};

export const AdminForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  adminData,
}) => {
  const initialData: IAdminForm = {
    name: adminData ? adminData.name : "",
    email: adminData ? adminData.email : "",
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
              <FormikInput
                type="text"
                required
                label="Correo electrónico"
                name="email"
                placeholder="Introduce el correo"
                correctColor="green"
              />
            </div>
            <Alert
              text1="Para ver los cambios reflejados tiene que volver a iniciar sesión."
              color="blue"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={() => toggleModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" color="blue">
                Guardar
              </Button>
            </div>
          </Form>
        </Formik>
      </div>
    </>
  );
};
