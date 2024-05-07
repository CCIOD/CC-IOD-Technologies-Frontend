import Swal, { SweetAlertIcon } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ReactSwal = withReactContent(Swal);
export const alertTimer = (
  title: string,
  icon: SweetAlertIcon,
  timer: number = 1500
) => {
  return ReactSwal.fire({
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer,
    toast: true,
    timerProgressBar: true,
    customClass: {
      popup: "app-bg2 app-text",
    },
  });
};

export const sessionExpired = async (title: string, text: string) => {
  return ReactSwal.fire({
    title,
    text,
    confirmButtonText: "Ir a login",
    confirmButtonColor: "blue",
    allowOutsideClick: false,
    customClass: {
      popup: "app-bg2 app-text",
    },
  }).then(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  });
};
