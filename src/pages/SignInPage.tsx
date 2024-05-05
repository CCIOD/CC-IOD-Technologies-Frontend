import { Form, Formik } from "formik";
import { NavLink } from "react-router-dom"
import { loginSchema } from "../utils/FormSchema";
import { FormikInput } from "../components/pure/FormikInput";
import { RiEyeLine, RiEyeOffLine, RiMailLine } from "react-icons/ri";
import { useState } from "react";
import { User } from "../interfaces/Auth.interface";

export const SignInPage = () => {
  const initialData: User = { email: '', password: '' };
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const formData = (values: User) => console.log(values);
  const togglePassword = () => setShowPassword(!showPassword)
  return (
    <div className="h-screen flex justify-center items-center bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: "url('/src/assets/brazalete-login.jpeg')" }}>
      <div className="absolute inset-0 bg-cciod-fblack-300 bg-opacity-70 flex justify-center items-center">
        <div className="w-full sm:w-4/5 h-full flex flex-col justify-center items-center md:flex-row lg:w-[40rem]">
          <div className="w-3/4 px-6 bg-blue-900 text-cciod-white-200 rounded-t-lg text-center pt-8 md:w-3/5 md:h-[25rem]  md:rounded-none md:rounded-l-lg">
            <img src="src/assets/Logo-CC-IOD.png" alt="logo" />
            <h2 className="hidden md:block font-bold text-3xl md:text-4xl mt-6">Bienvenido</h2>
            <p className="hidden md:block text-center mt-4 md:text-lg">
              Para comenzar, por favor ingrese sus datos.
            </p>
          </div>

          <div className="w-3/4 bg-white rounded-b-lg place-content-center px-8 pb-4 md:px-4 md:h-[25rem] md:rounded-none md:rounded-r-lg md:w-3/4">
            <h2 className="text-2xl font-bold text-blue-900 text-center my-6 md:my-2">Iniciar Sesión</h2>
            <Formik initialValues={initialData} validationSchema={loginSchema} enableReinitialize
              onSubmit={(values) => formData(values)}>
                <Form>
                <div className="w-full max-w-md flex flex-col">
                  <FormikInput type="text" required name="email" placeholder="example@gmail.com"
                    icon={<RiMailLine />} />
                  <FormikInput type={`${showPassword ? "text" : "password"}`} required name="password"
                    placeholder="Introduce una contraseña"
                    icon={showPassword ? <RiEyeLine /> : <RiEyeOffLine />} onClickIcon={togglePassword}/>
                  <button type="submit" className="bg-blue-900 p-2 w-full my-4 font-medium rounded text-cciod-white-200 cursor-pointer">INGRESAR</button>
                </div>
              </Form>
            </Formik>
            <div className="text-center">
              <NavLink to="/recover-password" className="underline">
                ¿Olvidaste tu contraseña?
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
