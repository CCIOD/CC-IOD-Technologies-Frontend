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

interface IConfirmChanges {
  title: string;
  text: string;
  confirmButtonText: string;
  confirmButtonColor: string;
}
export const confirmChange = async ({
  title,
  text,
  confirmButtonText,
  confirmButtonColor,
}: IConfirmChanges): Promise<{ success: boolean; message: string }> => {
  return ReactSwal.fire({
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    confirmButtonColor,
    customClass: {
      popup: "app-bg app-text",
    },
  }).then((result) => {
    if (result.isConfirmed) {
      return { success: true, message: "confirmed" };
    } else if (result.isDenied) {
      return { success: false, message: "denied" };
    }
    return { success: false, message: "canceled" };
  });
};
