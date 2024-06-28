import { Form, Formik } from "formik";
import { FormikInput } from "../components/Inputs/FormikInput";
import { Button } from "../components/generic/Button";
import { useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { IPasswordForm } from "../interfaces/users.interface";
import { passwordSchema } from "../utils/FormSchema";
import { sendResetPasswordAPI } from "../services/auth.service";
import { Params, useNavigate, useParams } from "react-router-dom";
import { ApiResponse } from "../interfaces/interfaces";
import { alertTimer } from "../utils/alerts";
import { ErrMessage } from "../components/generic/ErrMessage";

export const ResetPassword = () => {
  const { token } = useParams<Params>();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formErr, setFormErr] = useState<string>("");

  const initialData: IPasswordForm = { password: "" };
  const urlImg = "url('/assets/img/brazalete-login.webp')";

  const handleResetPassword = async (password: string) => {
    setIsLoading(true);
    try {
      const res = await sendResetPasswordAPI(password, token as string);
      if (res.success) {
        alertTimer(
          `Contraseña actualizada. Inicia sesión a continuación`,
          "success",
          4000
        );
        setFormErr("");
        navigate("/");
      }
    } catch (error) {
      const err = error as ApiResponse;
      setFormErr(err.message);
    } finally {
      setIsLoading(false);
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
            <img src="../assets/img/Logo-CC-IOD.webp" alt="logo" width={220} />
            <h2 className="block font-bold text-lg text-center">
              Reestablece tu contraseña
            </h2>
          </div>
          <div className="w-11/12 xs:w-8/12 md:w-6/12 bg-white rounded-b-lg p-4 h-[14rem] ">
            <Formik
              initialValues={initialData}
              validationSchema={passwordSchema}
              enableReinitialize
              onSubmit={(data) => handleResetPassword(data.password)}
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
                {formErr && <ErrMessage message={formErr} center={false} />}
                <Button
                  type="submit"
                  spinner
                  isLoading={isLoading}
                  size="auth"
                  darkMode
                >
                  GUARDAR NUEVA CONTRASEÑA
                </Button>
              </Form>
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};
