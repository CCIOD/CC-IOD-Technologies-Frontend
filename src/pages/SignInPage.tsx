import { Form, Formik } from "formik";
import { NavLink, useNavigate } from "react-router-dom";
import { loginSchema } from "../utils/FormSchema";
import { FormikInput } from "../components/Inputs/FormikInput";
import { RiEyeLine, RiEyeOffLine, RiMailLine } from "react-icons/ri";
import { useContext, useEffect, useState } from "react";
import { Button } from "../components/generic/Button";
import { AuthContext } from "../context/AuthContext";
import { UserForm } from "../interfaces/auth.interfaces";
import { ErrMessage } from "../components/generic/ErrMessage";

export const SignInPage = () => {
  const { loginUser, formError, isLoading, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const initialData: UserForm = { email: "", password: "" };
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const urlImg = "url('/assets/img/brazalete-login.jpeg')";

  useEffect(() => {
    if (user) navigate("/dashboard/");
  }, [navigate, user]);

  return (
    <div
      className="h-screen bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: urlImg }}
    >
      <div className="absolute inset-0 bg-cciod-black-300 bg-opacity-70 flex-center">
        <div className="w-full sm:w-4/5 h-full flex-center flex-col md:flex-row lg:w-[40rem]">
          <div className="w-3/4 px-6 bg-blue-900 text-cciod-white-200 rounded-t-lg text-center pt-8 md:w-3/5 md:h-[25rem] md:rounded-none md:rounded-l-lg">
            <img src="assets/img/Logo-CC-IOD.png" alt="logo" />
            <h2 className="hidden md:block font-bold text-3xl md:text-4xl mt-6">
              Bienvenido
            </h2>
            <p className="hidden md:block text-center mt-4 md:text-lg">
              Para comenzar, por favor ingrese sus datos.
            </p>
          </div>

          <div className="w-3/4 bg-white rounded-b-lg place-content-center px-8 pb-4 md:px-4 md:h-[25rem] md:rounded-none md:rounded-r-lg md:w-3/4">
            <h2 className="text-2xl font-bold text-blue-900 text-center my-6 md:my-2">
              Iniciar Sesión
            </h2>
            <Formik
              initialValues={initialData}
              validationSchema={loginSchema}
              enableReinitialize
              onSubmit={(data) => loginUser(data)}
            >
              <Form className="w-full max-w-md flex flex-col">
                <FormikInput
                  type="text"
                  required
                  name="email"
                  placeholder="example@gmail.com"
                  icon={<RiMailLine />}
                  bgTheme={false}
                />
                <FormikInput
                  type={`${showPassword ? "text" : "password"}`}
                  required
                  name="password"
                  placeholder="Introduce una contraseña"
                  icon={showPassword ? <RiEyeLine /> : <RiEyeOffLine />}
                  onClickIcon={() => setShowPassword(!showPassword)}
                  bgTheme={false}
                />
                {formError && <ErrMessage message={formError} center={false} />}
                <Button
                  type="submit"
                  spinner
                  isLoading={isLoading}
                  size="auth"
                  darkMode
                >
                  INGRESAR
                </Button>
              </Form>
            </Formik>
            <div className="text-center my-2">
              <NavLink
                to="/forgot-password"
                className="underline hover:text-blue-900"
              >
                ¿Olvidaste tu contraseña?
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
