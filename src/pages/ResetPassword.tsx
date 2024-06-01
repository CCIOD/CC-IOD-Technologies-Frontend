import { Form, Formik } from "formik";
import { FormikInput } from "../components/Inputs/FormikInput";
import { Button } from "../components/generic/Button";
import { useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { IPasswordForm } from "../interfaces/users.interface";
import { passwordSchema } from "../utils/FormSchema";

export const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const initialData: IPasswordForm = { password: "" };
  const urlImg = "url('/src/assets/img/brazalete-login.jpeg')";

  return (
    <div
      className="h-screen bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: urlImg }}
    >
      <div className="absolute inset-0 bg-cciod-black-300 bg-opacity-70 flex-center">
        <div className="w-full sm:w-4/5 h-full flex-center flex-col lg:w-[45rem]">
          <div className="w-11/12 xs:w-8/12 md:w-6/12 h-[8rem] flex flex-col justify-center items-center px-6 bg-blue-900 text-cciod-white-200 rounded-t-lg">
            <img src="src/assets/img/Logo-CC-IOD.png" alt="logo" width={220} />
            <h2 className="block font-bold text-lg text-center">
              Reestablece tu contraseña
            </h2>
          </div>
          <div className="w-11/12 xs:w-8/12 md:w-6/12 bg-white rounded-b-lg p-4 h-[15rem] ">
            <Formik
              initialValues={initialData}
              validationSchema={passwordSchema}
              enableReinitialize
              onSubmit={(data) => console.log(data)}
            >
              <Form className="w-full max-w-md flex flex-col">
                <label htmlFor="email" className="font-bold text-blue-900">
                  NUEVA CONTRASEÑA
                </label>
                <FormikInput
                  type={`${showPassword ? "text" : "password"}`}
                  required
                  name="password"
                  placeholder="Introduce una Nueva Contraseña"
                  icon={showPassword ? <RiEyeLine /> : <RiEyeOffLine />}
                  onClickIcon={() => setShowPassword(!showPassword)}
                  bgTheme={false}
                />
                <Button type="submit">GUARDAR NUEVA CONTRASEÑA</Button>
              </Form>
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};
