import { Form, Formik } from "formik";
import { NavLink, useNavigate } from "react-router-dom";
import { FormikInput } from "../components/Inputs/FormikInput";
import { RiMailLine } from "react-icons/ri";
import { Button } from "../components/generic/Button";
import { emailSchema } from "../utils/FormSchema";
import { IEmailForm } from "../interfaces/users.interface";
import { sendEmailAPI } from "../services/auth.service";
import { alertTimer } from "../utils/alerts";
import { useState } from "react";
import { ApiResponse } from "../interfaces/interfaces";

export const ForgotPassword = () => {
  const [formErr, setFormErr] = useState<string>("");
  const navigate = useNavigate();

  const initialData: IEmailForm = { email: "" };
  const urlImg = "url('/src/assets/img/brazalete-login.jpeg')";

  const handleSendEmail = async (email: string) => {
    try {
      const res = await sendEmailAPI(email);
      if (res.success) {
        alertTimer(
          `Se ha enviado un correo para reestablecer la contraseña.`,
          "success"
        );
        setFormErr("");
        navigate("/");
      }
    } catch (error) {
      const err = error as ApiResponse;
      setFormErr(err.message);
    }
  };
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
              Recupera tu Acceso
            </h2>
          </div>
          <div className="w-11/12 xs:w-8/12 md:w-6/12 bg-white rounded-b-lg p-4 h-[15rem] ">
            <Formik
              initialValues={initialData}
              validationSchema={emailSchema}
              enableReinitialize
              onSubmit={(data) => handleSendEmail(data.email)}
            >
              <Form className="w-full max-w-md flex flex-col">
                <label htmlFor="email" className="font-bold text-blue-900">
                  EMAIL
                </label>
                <FormikInput
                  type="text"
                  required
                  name="email"
                  placeholder="Email de Registro"
                  icon={<RiMailLine />}
                  bgTheme={false}
                />
                {formErr && (
                  <span className="text-sm text-red-500 mb-2">{formErr}</span>
                )}
                <Button type="submit">ENVIAR INSTRUCCIONES</Button>
              </Form>
            </Formik>
            <div className="text-center my-4">
              <NavLink to="/sign-in" className="underline hover:text-blue-900">
                ¿Ya tienes una cuenta? Inicia Sesión
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
