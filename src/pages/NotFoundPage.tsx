import { NavLink } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <div className="bg-blue-950 h-screen flex-center">
      <div className="w-6/12 flex-center flex-col gap-4 text-center">
        <h2 className="text-[10rem] font-extrabold text-blue-700">404</h2>
        <p className="text-5xl font-bold text-blue-200">Algo salió mal aquí.</p>
        <p className="text-lg text-blue-200">
          Lo sentimos, no podemos encontrar esa página. Visita el Panel para
          navegar por las secciones disponibles.
        </p>
        <NavLink
          to="/"
          className="bg-green-500 hover:bg-green-600 text-gray-100 p-3 rounded-md"
        >
          Regresar al Panel
        </NavLink>
      </div>
    </div>
  );
};
