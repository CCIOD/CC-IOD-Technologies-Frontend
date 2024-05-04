import { MdOutlineEmail } from "react-icons/md"
import { RiLockPasswordLine } from "react-icons/ri"
import { NavLink } from "react-router-dom"

export const SignInPage = () => {
  return (
    <div className="h-screen flex justify-center items-center bg-no-repeat bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/brazalete-login.jpeg')" }}>
      <div className="absolute inset-0 bg-cciod-black-300 bg-opacity-70 flex justify-center items-center">
        <div className="w-4/5 h-full flex flex-col justify-center items-center md:flex-row md:w-2/5">
          <div className="w-3/4 h-1/4 p-7 bg-blue-900 text-cciod-white-200 rounded-t-lg flex flex-col justify-evenly items-center md:w-3/5 md:h-2/4  md:rounded-none md:rounded-l-lg">
            <img src="src/assets/Logo-CC-IOD.png" alt="logo" className="-mt-6" />

            <h2 className="font-bold text-3xl md:text-4xl">Bienvenidos</h2>
            <p className="text-base text-center mt-4 md:text-lg">Para comenzar, por favor ingrese sus datos.</p>
          </div>

          <div className="w-3/4 h-2/4 bg-white rounded-b-lg p-8 md:h-2/4 md:rounded-none md:rounded-r-lg md:w-3/4">
            <form action="" className="w-full max-w-md flex flex-col">
              <h2 className="text-4xl font-bold text-blue-900 mb-4 mt-4 text-center md:mt-10">Iniciar Sesión</h2>
              <div className="relative w-full">
                <MdOutlineEmail className="absolute top-2/4 right-2" size={24}/>
                <input type="email" placeholder="example@gmail.com" className="mt-6 p-2 w-full rounded border border-black" />
              </div>
              <div className="relative w-full">
                <RiLockPasswordLine className="absolute top-2/4 right-2" size={24}/>
                <input type="password" placeholder="********" className="mt-6 p-2 w-full rounded border border-black" />
              </div>
              <input type="submit" className="bg-blue-900 p-2 w-full mt-10 font-medium rounded text-cciod-white-200 cursor-pointer" value="INGRESAR" />
              <NavLink
                to="/recover-password"
                className="mt-8 text-center"
              >
                ¿Olvidaste tu contraseña?
              </NavLink>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
