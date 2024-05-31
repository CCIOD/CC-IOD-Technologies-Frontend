import { Form, Formik } from "formik";
import { FormikInput } from "../components/Inputs/FormikInput";
import { Button } from "../components/generic/Button";
import { useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { forgetPasswordSchema } from "../utils/FormSchema";
import { ForgetForm } from "../interfaces/auth.interface";

export const ForgetPassword = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const initialData: ForgetForm = {password: ""}
  const urlImg = "url('/src/assets/img/brazalete-login.jpeg')";

  return (
    <div
      className="h-screen bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: urlImg}}
    >
      <div className="absolute inset-0 bg-cciod-black-300 bg-opacity-70 flex-center">
        <div className="w-full sm:w-4/5 h-full flex-center flex-col lg:w-[45rem]">
          <div className="w-3/4 h-[15rem] flex flex-col justify-center items-center px-6 bg-blue-900 text-cciod-white-200 rounded-t-lg ">
            <img src="src/assets/img/Logo-CC-IOD.png" alt="logo"  width={400}/>
            <h2 className="block font-bold text-3xl text-center">
              Reestablece tu contraseña
            </h2>
          </div>
          <div className="w-3/4 bg-white rounded-b-lg  px-8 pb-4 h-[18rem] flex justify-center items-center">
            <Formik
              initialValues={initialData}
              validationSchema={forgetPasswordSchema}
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
