import * as yup from "yup";

const errMessages = {
  req: "Este campo es obligatorio",
  text: "Este campo debería ser una cadena de texto",
  number: "Este campo debería ser un número.",
  integer: "Este campo debería ser un número entero",
  positive: "Este campo debería ser un número positivo",
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

export const prospectSchema = yup.object().shape({
  name: yup.string().typeError(errMessages.text).required(errMessages.req),
  email: yup.string().email(errMessages.email).required(errMessages.req),
  phone: yup
    .string()
    .length(10, "El teléfono debe tener exactamente 10 dígitos")
    .matches(/^\d{10}$/, "El teléfono debe ser númerico")
    .required(errMessages.req),
  date: yup.date().required(errMessages.req),
  observations: yup.string().typeError(errMessages.text).optional(),
  status: yup
    .string()
    .oneOf(
      ["Pendiente", "Aprobado"],
      'El estado debe ser "Pendiente" o "Aprobado".'
    )
    .required(errMessages.req),

  relationship_id: yup
    .number()
    .positive(errMessages.positive)
    .integer(errMessages.integer)
    .typeError(errMessages.number)
    .required(errMessages.req),
});

export const clientSchema = yup.object().shape({
  contract_number: yup
    .number()
    .positive(errMessages.positive)
    .integer(errMessages.integer)
    .typeError(errMessages.number)
    .required(errMessages.req),
  contact_numbers: yup
    .array()
    .of(
      yup
        .string()
        .length(10, "Cada número debe tener exactamente 10 dígitos")
        .matches(/^\d{10}$/, "Cada número debe ser únicamente numérico")
        .required(errMessages.req)
    )
    .min(1, "Debe proporcionar al menos un número de contacto")
    .required(errMessages.req),
  court_name: yup
    .string()
    .typeError(errMessages.text)
    .required(errMessages.req),
  criminal_case_number: yup
    .number()
    .positive(errMessages.positive)
    .integer(errMessages.integer)
    .typeError(errMessages.number)
    .required(errMessages.req),
  defendant_name: yup
    .string()
    .typeError(errMessages.text)
    .required(errMessages.req),
  signer_name: yup
    .string()
    .typeError(errMessages.text)
    .required(errMessages.req),
  hearing_date: yup.date().required(errMessages.req),
  // investigation_file_number: yup
  //   .number()
  //   .positive(errMessages.positive)
  //   .integer(errMessages.integer)
  //   .typeError(errMessages.number)
  //   .required(errMessages.req),
  judge_name: yup
    .string()
    .typeError(errMessages.text)
    .required(errMessages.req),
  lawyer_name: yup
    .string()
    .typeError(errMessages.text)
    .required(errMessages.req),
  observations: yup.string().typeError(errMessages.text).optional(),
  prospect_id: yup
    .number()
    .positive(errMessages.positive)
    .integer(errMessages.integer)
    .typeError(errMessages.number)
    .required(errMessages.req),
  status: yup
    .string()
    .oneOf(
      [
        "Pendiente de aprobación",
        "Pendiente de audiencia",
        "Pendiente de colocación",
        "Colocado",
      ],
      'El estado debe ser "Pendiente de aprobación", "Pendiente de audiencia", "Pendiente de colocación" o "Colocado".'
    )
    .required(errMessages.req),
});
export const carrierSchema = yup.object().shape({
  residence_area: yup
    .string()
    .typeError(errMessages.text)
    .required(errMessages.req),
  placement_date: yup.date().required(errMessages.req),
  placement_time: yup.string().required(errMessages.req),
  electronic_bracelet: yup
    .string()
    .typeError(errMessages.text)
    .required(errMessages.req),
  beacon: yup.string().typeError(errMessages.text).required(errMessages.req),
  wireless_charger: yup
    .string()
    .typeError(errMessages.text)
    .required(errMessages.req),
  information_emails: yup
    .array()
    .of(yup.string().email(errMessages.email).required(errMessages.req))
    .min(1, "Debe proporcionar al menos un correo para información")
    .required(errMessages.req),
  house_arrest: yup
    .string()
    .typeError(errMessages.text)
    .required(errMessages.req),
  installer_name: yup
    .string()
    .typeError(errMessages.text)
    .required(errMessages.req),
  observations: yup.string().typeError(errMessages.text).optional(),
  client_id: yup
    .number()
    .positive(errMessages.positive)
    .integer(errMessages.integer)
    .typeError(errMessages.number)
    .required(errMessages.req),
  relationship_id: yup
    .number()
    .positive(errMessages.positive)
    .integer(errMessages.integer)
    .typeError(errMessages.number)
    .oneOf([1, 2], "Seleccione un parentesco válido")
    .required(errMessages.req),
});
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
