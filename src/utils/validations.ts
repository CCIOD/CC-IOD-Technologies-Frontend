import * as yup from 'yup';

export const errMessages = {
  req: 'Este campo es obligatorio',
  text: 'Este campo debería ser una cadena de texto',
  number: 'Este campo debería ser un número.',
  integer: 'Este campo debería ser un número entero',
  positive: 'Este campo debería ser un número positivo',
  email: 'Debes introducir un correo electrónico válido.',
  password: 'La contraseña debe contener mínimo 8 caracteres, una letra minúscula, mayúscula y carácter especial.',
  select: 'Debe completar el campo de selección para continuar.',
};

export const stringValidation = yup.string().typeError(errMessages.text).required(errMessages.req);
export const emailValidation = yup.string().email(errMessages.email).required(errMessages.req);
export const passwordValidation = yup
  .string()
  .min(8, errMessages.password)
  .required(errMessages.req)
  .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,}$/, errMessages.password);
export const roleValidation = yup
  .number()
  .positive(errMessages.positive)
  .integer(errMessages.integer)
  .typeError(errMessages.number)
  .oneOf([2, 3, 4], 'Seleccione un rol válido.')
  .required(errMessages.req);
export const dateValidation = yup.date().required(errMessages.req);
export const integerValidation = yup
  .number()
  .positive(errMessages.positive)
  .integer(errMessages.integer)
  .typeError(errMessages.number)
  .required(errMessages.req);
export const phoneValidation = yup
  .string()
  .length(10, 'El teléfono debe tener exactamente 10 dígitos')
  .matches(/^\d{10}$/, 'El teléfono debe ser númerico')
  .required(errMessages.req);

export const contactValidation = yup.object().shape({
  contact_name: stringValidation,
  relationship_id: yup
    .mixed()
    .test('is-valid-relationship', 'Ingrese un parentesco válido', (value) => {
      if (!value) return false;
      // Acepta números o texto
      if (typeof value === 'number') return value > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return false;
    })
    .required(errMessages.req),
  phone_number: phoneValidation,
});

export const contactNumbersValidation = yup.array().of(contactValidation).min(1, 'Debe agregar al menos un contacto').required(errMessages.req);

export const paymentDayValidation = yup.number().min(1, 'El día de pago debe estar entre 1 y 31').max(31, 'El día de pago debe estar entre 1 y 31').optional();
export const informationEmailsValidation = yup
  .array()
  .of(emailValidation)
  .min(1, 'Debe proporcionar al menos un correo para información')
  .required(errMessages.req);

export const createStatusValidation = (validValues: string[]) => yup.string().oneOf(validValues, 'Seleccione un estado correcto.').required(errMessages.req);

export const observationValidation = yup
  .array()
  .of(
    yup.object().shape({
      date: yup.string().required('La fecha es requerida'),
      observation: yup.string().required('La observación es requerida'),
    }),
  )
  .optional();

export const contractRenewalValidation = yup
  .array()
  .of(
    yup.object().shape({
      renewal_id: yup.number().optional(),
      renewal_date: yup.string().required('La fecha de renovación es requerida'),
      renewal_document: yup.string().optional(),
      renewal_duration: yup.string().optional(),
      notes: yup.string().optional(),
      created_at: yup.string().optional(),
      updated_at: yup.string().optional(),
    }),
  )
  .optional();

export const fileValidation = yup
  .mixed()
  .nullable()
  .test('fileType', 'Solo se aceptan archivos PDF', (value) => !value || (value && (value as File).type === 'application/pdf'))
  .test('fileSize', 'El archivo es demasiado grande (máximo 20 MB)', (value) => !value || (value && (value as File).size <= 50000000));
