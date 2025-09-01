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
  contract_number: integerValidation,
  contact_numbers: contactNumbersValidation,
  court_name: stringValidation,
  criminal_case: stringValidation,
  defendant_name: stringValidation,
  signer_name: stringValidation,
  hearing_date: dateValidation,
  judge_name: stringValidation,
  lawyer_name: stringValidation,
  observations: observationValidation,
  newObservation: yup.string().optional(),
  prospect_id: integerValidation,
  status: createStatusValidation([
    "Pendiente de aprobación",
    "Pendiente de audiencia",
    "Pendiente de colocación",
    "Colocado",
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
