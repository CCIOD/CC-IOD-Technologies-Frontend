import { FC, useState } from "react";
import { Button } from "../generic/Button";
import { Form, Formik } from "formik";
import { FormikInput } from "../Inputs/FormikInput";
import { FormikSelect } from "../Inputs/FormikSelect";
import { registerSchema, updateUserSchema } from "../../utils/FormSchema";
import {
  DataRowUsers,
  IUserForm,
  userStatusValues,
} from "../../interfaces/users.interface";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";

type Props = {
  toggleModal: (param: boolean) => void;
  handleSubmit: (data: IUserForm) => void;
  btnText: "Agregar" | "Actualizar";
  userData: DataRowUsers | null;
};

export const UserForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  btnText,
  userData = null,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const initialData: IUserForm = {
    name: "",
    email: "",
    password: "",
    role_id: 2,
  };
  const formikInitialValues: IUserForm = userData
    ? {
        name: userData.name || "",
        email: userData.email || "",
        password: userData.password || "",
        role_id: userData.role_id || 2,
      }
    : initialData;

  return (
    <>
      <div className="h-full py-2 flex flex-col justify-between">
        <Formik
          initialValues={formikInitialValues}
          validationSchema={userData ? updateUserSchema : registerSchema}
          onSubmit={(data) => handleSubmit(data)}
          enableReinitialize={true}
        >
          <Form className="w-full flex flex-col">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
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
              {!userData && (
                <FormikInput
                  type={`${showPassword ? "text" : "password"}`}
                  required
                  label="Contraseña"
                  name="password"
                  placeholder="Introduce una contraseña"
                  icon={showPassword ? <RiEyeLine /> : <RiEyeOffLine />}
                  onClickIcon={() => setShowPassword(!showPassword)}
                  correctColor="green"
                />
              )}
              <FormikSelect
                label="Selecciona un Rol"
                name="role_id"
                correctColor="green"
                options={userStatusValues}
              />
              {/* {userData && userData.id !== 1 && (
              )} */}
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
