import { FC, useState } from "react";
import { Button } from "../generic/Button";
import { Form, Formik } from "formik";
import { FormikInput } from "../Inputs/FormikInput";
import { passwordSchema } from "../../utils/FormSchema";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { IPasswordForm } from "../../interfaces/users.interface";

type Props = {
  toggleModal: (param: boolean) => void;
  handleSubmit: (data: IPasswordForm) => void;
  isLoading: boolean;
};

export const ChangePasswordForm: FC<Props> = ({
  toggleModal,
  handleSubmit,
  isLoading,
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const initialData: IPasswordForm = {
    password: "",
  };

  return (
    <>
      <div className="h-full py-2 flex flex-col justify-between">
        <Formik
          initialValues={initialData}
          validationSchema={passwordSchema}
          onSubmit={(data) => handleSubmit(data)}
          enableReinitialize={true}
        >
          <Form className="w-full flex flex-col">
            <FormikInput
              type={`${showPassword ? "text" : "password"}`}
              required
              name="password"
              placeholder="Introduce una contraseña"
              icon={showPassword ? <RiEyeLine /> : <RiEyeOffLine />}
              onClickIcon={() => setShowPassword(!showPassword)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button color="gray" onClick={() => toggleModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" spinner isLoading={isLoading}>
                Actualizar
              </Button>
            </div>
          </Form>
        </Formik>
      </div>
    </>
  );
};
// 210
