import Swal, { SweetAlertIcon } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const ReactSwal = withReactContent(Swal);
export const alertTimer = (
  title: string,
  icon: SweetAlertIcon,
  timer: number = 1500
) => {
  return ReactSwal.fire({
    position: "bottom-end",
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
    confirmButtonText: "Cerrar sesión",
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
    cancelButtonText: "Cancelar",
    confirmButtonText,
    confirmButtonColor,
    allowOutsideClick: false,
    customClass: {
      popup: "app-bg app-text",
      confirmButton:
        "sweet-border !border-red-500 dark:!border-transparent !bg-red-50 !text-red-700 hover:!bg-red-100 dark:!bg-red-500 dark:hover:!bg-red-600 dark:!text-cciod-white-100 !outline-none",
      cancelButton:
        "sweet-border !border-gray-500 dark:!border-transparent !bg-transparent !text-gray-700 hover:!bg-gray-200 dark:!bg-gray-500 dark:hover:!bg-gray-600 dark:!text-cciod-white-100",
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
