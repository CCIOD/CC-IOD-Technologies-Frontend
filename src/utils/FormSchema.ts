import * as yup from "yup";

const errMessages = {
  req: "Este campo es obligatorio",
  text: "Este campo debería ser una cadena de texto",
  number: "Este campo debería ser un número.",
  email: "Debes introducir un correo electrónico válido.",
  password:
    "La contraseña debe contener mínimo 8 caracteres, una letra minúscula, mayúscula y carácter especial.",
  // password: "La contraseña debe contener un dígito del 1 al 9, una letra minúscula, una letra mayúscula, un carácter especial, sin espacios y debe tener mínimo 8 caracteres.",
  select: "Debe completar el campo de selección para continuar.",
};

export const loginSchema = yup
  .object()
  .shape({
    email: yup.string().email(errMessages.email).required(errMessages.req),
    password: yup
      .string()
      .min(8, errMessages.password)
      .required(errMessages.req)
      .matches(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,}$/,
        errMessages.password
      ),
  })
  .required();

export const operationSchema = yup.object().shape({
  contract: yup
    .mixed()
    .nullable()
    .test(
      "fileType",
      "Solo se aceptan archivos PDF",
      (value) => !value || (value && (value as File).type === "application/pdf")
    )
    .test(
      "fileSize",
      "El archivo es demasiado grande (máximo 5 MB)",
      (value) => !value || (value && (value as File).size <= 5000000)
    ),
  installation_report: yup
    .mixed()
    .nullable()
    .test(
      "fileType",
      "Solo se aceptan archivos PDF",
      (value) => !value || (value && (value as File).type === "application/pdf")
    )
    .test(
      "fileSize",
      "El archivo es demasiado grande (máximo 5 MB)",
      (value) => !value || (value && (value as File).size <= 5000000)
    ),
});
