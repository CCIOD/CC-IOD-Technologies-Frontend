import { Alert } from "../components/generic/Alert";

export const UnauthorizedPage = () => {
  return (
    <Alert
      text1="No tienes los permisos para acceder a esta sección."
      color="red"
    />
  );
};
