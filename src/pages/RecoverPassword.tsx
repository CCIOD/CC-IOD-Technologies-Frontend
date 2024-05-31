import { Form, Formik} from "formik";
import { NavLink } from "react-router-dom";
import { FormikInput } from "../components/Inputs/FormikInput";
import { RiMailLine } from "react-icons/ri";
import { Button } from "../components/generic/Button";
import { recoverPasswordSchema } from "../utils/FormSchema";
import { RecoveryForm } from "../interfaces/auth.interface";

export const RecoverPassword = () => {

  const initialData: RecoveryForm = {email: ""}

  const urlImg = "url('/src/assets/img/brazalete-login.jpeg')";
  return (
    <div
      className="h-screen bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: urlImg }}
    >
      <div className="absolute inset-0 bg-cciod-black-300 bg-opacity-70 flex-center">
        <div className="w-full sm:w-4/5 h-full flex-center flex-col lg:w-[45rem]">
          <div className="w-3/4 h-[15rem] flex flex-col justify-center items-center px-6 bg-blue-900 text-cciod-white-200 rounded-t-lg">
            <img src="src/assets/img/Logo-CC-IOD.png" alt="logo" width={400}/>
            <h2 className="block font-bold text-3xl text-center">
              Recupera tu Acceso
            </h2>
          </div>
          <div className="w-3/4 bg-white rounded-b-lg  px-8 pb-4 h-[18rem] flex flex-col justify-center items-center">
            <Formik
              initialValues={initialData}
              validationSchema={recoverPasswordSchema}
              enableReinitialize
              onSubmit={(data) => console.log(data)}
            >
              <Form className="w-full max-w-md flex flex-col">
                <label htmlFor="email" className="font-bold text-blue-900">EMAIL</label>
              <FormikInput
                  type="text"
                  required
                  name="email"
                  placeholder="Email de Registro"
                  icon={<RiMailLine />}
                  bgTheme={false}
                />
                <Button type="submit">ENVIAR INSTRUCCIONES</Button>
              </Form>
            </Formik>
            <div className="text-center my-4">
              <NavLink
                to="/sign-in"
                className="underline hover:text-blue-900"
              >
                ¿Ya tienes una cuenta? Inicia Sesión
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};