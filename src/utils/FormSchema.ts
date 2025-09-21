import * as yup from "yup";
import {
  contactNumbersValidation,
  createStatusValidation,
  dateValidation,
  emailValidation,
  fileValidation,
  informationEmailsValidation,
  integerValidation,
  observationValidation,
  passwordValidation,
  phoneValidation,
  roleValidation,
  stringValidation,
} from "./validations";

export const emailSchema = yup
  .object()
  .shape({ email: emailValidation })
  .required();
export const passwordSchema = yup
  .object()
  .shape({ password: passwordValidation })
  .required();
export const loginSchema = yup
  .object()
  .shape({
    email: emailValidation,
    password: passwordValidation,
  })
  .required();
export const registerSchema = yup
  .object()
  .shape({
    name: stringValidation,
    email: emailValidation,
    password: passwordValidation,
    role_id: roleValidation,
  })
  .required();
export const updateUserSchema = yup
  .object()
  .shape({
    name: stringValidation,
    email: emailValidation,
    role_id: roleValidation,
  })
  .required();
export const updateAdminSchema = yup
  .object()
  .shape({ name: stringValidation })
  .required();

export const prospectSchema = yup.object().shape({
  name: stringValidation,
  email: emailValidation,
  phone: phoneValidation,
  date: dateValidation,
  observations: observationValidation,
  newObservation: yup.string().optional(),
  status: createStatusValidation(["Pendiente", "Aprobado"]),
  relationship_id: integerValidation.oneOf(
    [1, 2],
    "Seleccione un parentesco válido"
  ),
});

export const clientSchema = yup.object().shape({
  contract_number: yup.string().optional(), // Cambió de number a string
  contact_numbers: contactNumbersValidation, // Nueva estructura de contactos
  court_name: stringValidation,
  criminal_case: stringValidation,
  defendant_name: stringValidation,
  signer_name: stringValidation,
  hearing_date: dateValidation,
  judge_name: stringValidation,
  lawyer_name: stringValidation,
  investigation_file_number: yup.number().optional(),
  
  // Campos que se vuelven obligatorios cuando el estado es "Colocado"
  contract_date: yup.string().when('status', {
    is: 'Colocado',
    then: (schema) => schema.required('La fecha del contrato es obligatoria cuando el estado es "Colocado"'),
    otherwise: (schema) => schema.optional()
  }),
  contract_document: yup.string().optional(),
  contract_duration: yup.string().when('status', {
    is: 'Colocado',
    then: (schema) => schema.required('La duración del contrato es obligatoria cuando el estado es "Colocado"'),
    otherwise: (schema) => schema.optional()
  }),
  payment_day: yup.number().when('status', {
    is: 'Colocado',
    then: (schema) => schema
      .min(1, "El día de pago debe estar entre 1 y 31")
      .max(31, "El día de pago debe estar entre 1 y 31")
      .required('El día de pago es obligatorio cuando el estado es "Colocado"'),
    otherwise: (schema) => schema.optional()
  }),
  payment_frequency: yup.string().when('status', {
    is: 'Colocado',
    then: (schema) => schema.required('La frecuencia de pago es obligatoria cuando el estado es "Colocado"'),
    otherwise: (schema) => schema.optional()
  }),
  
  observations: observationValidation,
  newObservation: yup.string().optional(),
  prospect_id: yup.number().optional(),
  status: createStatusValidation([
    "Pendiente de aprobación",
    "Pendiente de audiencia",
    "Pendiente de colocación",
    "Colocado",
    "Desinstalado",
  ]),
});
export const carrierSchema = yup.object().shape({
  residence_area: stringValidation,
  placement_date: dateValidation,
  placement_time: stringValidation,
  electronic_bracelet: stringValidation,
  beacon: stringValidation,
  wireless_charger: stringValidation,
  information_emails: informationEmailsValidation,
  contact_numbers: contactNumbersValidation,
  house_arrest: stringValidation,
  installer_name: stringValidation,
  observations: observationValidation,
  client_id: integerValidation,
  relationship_id: integerValidation.oneOf(
    [1, 2],
    "Seleccione un parentesco válido"
  ),
});
export const contractSchema = yup.object().shape({ contract: fileValidation });
export const reportSchema = yup
  .object()
  .shape({ installation_report: fileValidation });
