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
  contract_number: yup.number().positive("El número de contrato debe ser positivo").integer("El número de contrato debe ser un número entero").optional(),
  contact_numbers: contactNumbersValidation, // Nueva estructura de contactos
  court_name: stringValidation,
  criminal_case: stringValidation,
  defendant_name: stringValidation,
  signer_name: stringValidation,
  placement_date: yup.string().when('status', {
    is: 'Colocado',
    then: (schema) => schema.required('La fecha de colocación es obligatoria cuando el estado es "Colocado"'),
    otherwise: (schema) => schema.optional()
  }), // Renombrado de hearing_date
  audiences: yup.array().of(
    yup.object().shape({
      hearing_id: yup.number().optional(),
      hearing_date: dateValidation,
      hearing_location: stringValidation,
      attendees: yup.array().of(yup.string().required()).min(1, "Debe agregar al menos un asistente"),
      notes: yup.string().optional(),
    })
  ).optional(),
  newAudience: yup.object().shape({
    hearing_date: yup.string().optional(),
    hearing_location: yup.string().optional(),
    attendees: yup.array().of(yup.string()).optional(),
    notes: yup.string().optional(),
  }).optional(),
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
  contract_folio: yup.string().optional(), // Folio del contrato
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
    then: (schema) => schema
      .oneOf(["Mensual", "Bimestral", "Trimestral", "Semestral", "Contado"], 
        'La frecuencia de pago debe ser: Mensual, Bimestral, Trimestral, Semestral o Contado')
      .required('La frecuencia de pago es obligatoria cuando el estado es "Colocado"'),
    otherwise: (schema) => schema.optional()
  }),
  bracelet_type: yup.string().when('status', {
    is: 'Colocado',
    then: (schema) => schema
      .oneOf(["B1", "G2", "Otro"], 
        'El tipo de brazalete debe ser: B1, G2 o Otro')
      .required('El tipo de brazalete es obligatorio cuando el estado es "Colocado"'),
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
    "Cancelado",
  ]),
  cancellation_reason: yup.string().when('status', {
    is: 'Cancelado',
    then: (schema) => schema.required('El motivo de cancelación es obligatorio cuando el estado es "Cancelado"'),
    otherwise: (schema) => schema.optional()
  }),
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
