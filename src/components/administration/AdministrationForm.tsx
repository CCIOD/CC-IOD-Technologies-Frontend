import { Formik, Form } from "formik";
import * as Yup from "yup";
import { IAdministrationClient } from "../../interfaces/administration.interface";
import { FormikInput } from "../Inputs/FormikInput";
import { FormikSelect } from "../Inputs/FormikSelect";
import { Button } from "../generic/Button";
import { FaSave } from "react-icons/fa";
import { paymentFrequencyValues } from "../../interfaces/clients.interface";

interface AdministrationFormProps {
  client: IAdministrationClient;
  onSubmit: (data: Partial<IAdministrationClient>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const validationSchema = Yup.object().shape({
  contract_number: Yup.number().min(1, "El número de contrato debe ser mayor a 0"),
  defendant_name: Yup.string().required("El nombre del cliente es requerido"),
  contract_start_date: Yup.string(),
  contract_duration: Yup.string(),
  payment_frequency: Yup.string(),
  total_contract_amount: Yup.number().min(0, "El monto debe ser mayor o igual a 0"),
});

export const AdministrationForm = ({
  client,
  onSubmit,
  onCancel,
  isLoading = false,
}: AdministrationFormProps) => {
  // Función para formatear fecha ISO a YYYY-MM-DD
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return "";
    }
  };

  // Función para obtener el valor correcto de payment_frequency
  const getPaymentFrequencyValue = (frequency?: string): string => {
    if (!frequency) return "";
    // Si viene como texto, intentar encontrar el match en el array
    const match = paymentFrequencyValues.find(
      (item) => item.name.toLowerCase() === frequency.toLowerCase()
    );
    return match ? match.name : frequency;
  };

  const initialValues = {
    contract_number: client.contract_number || undefined,
    defendant_name: client.defendant_name || "",
    criminal_case: client.criminal_case || "",
    placement_date: formatDateForInput(client.placement_date),
    contract_date: formatDateForInput(client.contract_date),
    contract_duration: client.contract_duration || "",
    payment_frequency: getPaymentFrequencyValue(client.payment_frequency),
    total_contract_amount: client.total_contract_amount || 0,
    bracelet_type: client.bracelet_type || "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        await onSubmit(values);
      }}
      enableReinitialize
    >
      {({ values, setFieldValue }) => {
        const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const duration = e.target.value;
          setFieldValue("contract_duration", duration);
        };

        return (
          <Form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikInput
                label="Número de Contrato"
                name="contract_number"
                type="number"
                placeholder="Número de contrato"
                disabled={true}
              />
              <FormikInput
                label="Nombre del Cliente"
                name="defendant_name"
                type="text"
                placeholder="Nombre completo"
                required
                disabled={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormikInput
                label="Fecha de Colocación"
                name="placement_date"
                type="date"
                required
                disabled={true}
              />
              <FormikInput
                label="Fecha del Contrato"
                name="contract_date"
                type="date"
                disabled={true}
              />
              <div>
                <label className="label">Periodo de Contratación (meses)</label>
                <input
                  name="contract_duration"
                  type="number"
                  placeholder="Ej: 12"
                  value={values.contract_duration}
                  onChange={handleDurationChange}
                  className="p-2 w-full rounded border outline-none bg-gray-200 text-gray-500 cursor-not-allowed"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormikSelect
                label="Frecuencia de Pago"
                name="payment_frequency"
                options={paymentFrequencyValues}
                valueText
                required
              />
              <FormikInput
                label="Monto Total del Contrato"
                name="total_contract_amount"
                type="number"
                placeholder="0.00"
              />
              <FormikInput
                label="Tipo de Brazalete"
                name="bracelet_type"
                type="text"
                placeholder="B1, G2, etc."
                disabled={true}
              />
            </div>

            {/* Información de contacto */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-2">Información de Contacto</h4>
              {client.contact_numbers && client.contact_numbers.length > 0 ? (
                <div className="space-y-2">
                  {client.contact_numbers.map((contact, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{contact.contact_name}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {contact.phone_number}
                      </span>
                      {contact.relationship_name && (
                        <span className="text-xs text-gray-500">
                          ({contact.relationship_name})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay contactos registrados</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" onClick={onCancel} color="gray" size="auth">
                Cancelar
              </Button>
              <Button type="submit" color="blue" isLoading={isLoading} size="auth">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <FaSave />
                  <span>Guardar Cambios</span>
                </div>
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
