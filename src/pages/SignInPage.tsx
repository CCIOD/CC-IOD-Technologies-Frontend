import { RiAtFill } from "react-icons/ri"
import { NavLink } from "react-router-dom"

export const SignInPage = () => {
  return (
    <div className="h-screen flex justify-center items-center bg-no-repeat bg-cover bg-center" style={{ backgroundImage: "url('/src/assets/brazalete-login.jpeg')" }}>
      <div className="absolute inset-0 bg-cciod-black-300 bg-opacity-70 flex justify-center items-center">
        <div className="w-2/5 flex flex-col md:flex-row">
          <div className="w-3/5 p-7 bg-blue-900 text-cciod-white-200 rounded-l-lg flex flex-col justify-evenly items-center">
            <img src="src/assets/Logo-CC-IOD.png" alt="logo" className="-mt-6" />

            <h2 className="font-bold text-4xl">Bienvenidos</h2>
            <p className="text-xl text-center">Para comenzar, por favor ingrese sus datos.</p>
          </div>

          <div className="w-3/4 bg-white rounded-r-lg p-8">
            <form action="" className="w-full max-w-md flex flex-col items-center">
              <h2 className="text-4xl font-bold text-blue-900 mb-8 mt-6 text-center">Crea una Cuenta</h2>
              <div className="relative w-full">
                <RiAtFill className="absolute top-1/4 right-2" size={20} />
                <input type="text" placeholder="Nombre de Usuario" className="p-2 w-full rounded text-black border border-black" />
              </div>
              <input type="email" placeholder="example@gmail.com" className="mt-6 p-2 w-full rounded border border-black" />
              <input type="password" placeholder="****" className="mt-6 p-2 w-full rounded border border-black" />

              <input type="submit" className="bg-blue-900 p-2 w-full mt-10 font-medium rounded text-cciod-white-200 cursor-pointer" value="INICIAR SESIÓN" />
              <NavLink
                to="/recover-password"
                className="mt-4"
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
