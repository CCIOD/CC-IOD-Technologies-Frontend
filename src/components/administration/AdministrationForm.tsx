import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { IAdministrationClient } from "../../interfaces/administration.interface";
import { FormikInput } from "../Inputs/FormikInput";
import { FormikSelect } from "../Inputs/FormikSelect";
import { Button } from "../generic/Button";
import { FaSave } from "react-icons/fa";
import { paymentFrequencyValues } from "../../interfaces/clients.interface";
import { alertTimer } from "../../utils/alerts";

interface AdministrationFormProps {
  client: IAdministrationClient;
  onSubmit: (data: Partial<IAdministrationClient>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  onUpdateOriginalAmount?: (clientId: number, amount: number) => Promise<void>;
  onUpdateRenewalAmount?: (renewalId: number, amount: number) => Promise<void>;
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
  onUpdateOriginalAmount,
  onUpdateRenewalAmount,
}: AdministrationFormProps) => {
  const [editingAmount, setEditingAmount] = useState(false);
  const [newAmount, setNewAmount] = useState(client.total_contract_amount?.toString() || "");
  const [isSavingAmount, setIsSavingAmount] = useState(false);
  const [editingRenewalId, setEditingRenewalId] = useState<number | null>(null);
  const [renewalAmounts, setRenewalAmounts] = useState<Record<number, string>>(
    client.contract_renewals?.reduce((acc, renewal, index) => {
      acc[index] = renewal.renewal_amount?.toString() || "";
      return acc;
    }, {} as Record<number, string>) || {}
  );
  const [savingRenewalId, setSavingRenewalId] = useState<number | null>(null);

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

  const handleSaveAmount = async () => {
    if (!onUpdateOriginalAmount) {
      alertTimer("Error: función no disponible", "error");
      return;
    }
    
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) {
      alertTimer("Ingresa un monto válido", "error");
      return;
    }

    setIsSavingAmount(true);
    try {
      await onUpdateOriginalAmount(client.id, amount);
      setEditingAmount(false);
      alertTimer("Monto del contrato actualizado correctamente", "success");
    } catch (error) {
      alertTimer((error as any)?.message || "Error al actualizar monto", "error");
    } finally {
      setIsSavingAmount(false);
    }
  };

  const handleSaveRenewalAmount = async (renewalIndex: number, renewalId?: number) => {
    if (!onUpdateRenewalAmount || !renewalId) {
      alertTimer("Error: función o ID no disponible", "error");
      return;
    }

    const amount = parseFloat(renewalAmounts[renewalIndex] || "");
    if (isNaN(amount) || amount < 0) {
      alertTimer("Ingresa un monto válido", "error");
      return;
    }

    setSavingRenewalId(renewalId);
    try {
      await onUpdateRenewalAmount(renewalId, amount);
      setEditingRenewalId(null);
      alertTimer("Monto de renovación actualizado correctamente", "success");
    } catch (error) {
      alertTimer((error as any)?.message || "Error al actualizar monto de renovación", "error");
    } finally {
      setSavingRenewalId(null);
    }
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
                disabled={true}
              />
              <FormikInput
                label="Tipo de Brazalete"
                name="bracelet_type"
                type="text"
                placeholder="B1, G2, etc."
                disabled={true}
              />
            </div>

            {/* Información del Contrato y Renovaciones */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-4 text-lg">Información del Contrato</h4>
              
              {/* Contrato Original */}
              <div className="mb-6">
                <h5 className="font-semibold text-sm mb-3 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <span className="text-base">📋</span> Contrato Original
                </h5>
                <div className="bg-white dark:bg-gray-800 rounded p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Fecha de Colocación</p>
                      <p className="text-sm font-medium">{client.placement_date || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Duración Original (meses)</p>
                      <p className="text-sm font-medium">{client.contract_duration || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Monto del Contrato</p>
                      {editingAmount ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            placeholder="Monto del contrato"
                            className="p-2 flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                          />
                          <Button
                            type="button"
                            color="green"
                            size="min"
                            onClick={handleSaveAmount}
                            isLoading={isSavingAmount}
                            title="Guardar monto"
                          >
                            <FaSave />
                          </Button>
                          <Button
                            type="button"
                            color="gray"
                            size="min"
                            onClick={() => {
                              setEditingAmount(false);
                              setNewAmount(client.total_contract_amount?.toString() || "");
                            }}
                            title="Cancelar"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            placeholder="Monto del contrato"
                            className="p-2 flex-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                            value={client.total_contract_amount || ''}
                            disabled
                          />
                          <Button
                            type="button"
                            color="blue"
                            size="min"
                            onClick={() => setEditingAmount(true)}
                            title="Editar monto"
                          >
                            ✎
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Renovaciones */}
              <div className="mb-4">
                <h5 className="font-semibold text-sm mb-3 text-green-700 dark:text-green-400 flex items-center gap-2">
                  <span className="text-base">🔄</span> Renovaciones
                </h5>
                {client.contract_renewals && client.contract_renewals.length > 0 ? (
                  <div className="space-y-3">
                    {client.contract_renewals.map((renewal, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded p-4 border-l-4 border-green-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Renovación #{index + 1}</p>
                            <p className="text-sm font-medium">{renewal.renewal_date || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Duración (meses)</p>
                            <p className="text-sm font-medium">{renewal.renewal_duration || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Monto de Renovación</p>
                            {editingRenewalId === renewal.renewal_id ? (
                              <div className="flex gap-2 items-center">
                                <input
                                  type="number"
                                  placeholder="Monto de renovación"
                                  className="p-2 flex-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  value={renewalAmounts[index] || ""}
                                  onChange={(e) =>
                                    setRenewalAmounts({ ...renewalAmounts, [index]: e.target.value })
                                  }
                                />
                                <Button
                                  type="button"
                                  color="green"
                                  size="min"
                                  onClick={() => handleSaveRenewalAmount(index, renewal.renewal_id)}
                                  isLoading={savingRenewalId === renewal.renewal_id}
                                  title="Guardar monto"
                                >
                                  <FaSave />
                                </Button>
                                <Button
                                  type="button"
                                  color="gray"
                                  size="min"
                                  onClick={() => {
                                    setEditingRenewalId(null);
                                    setRenewalAmounts({
                                      ...renewalAmounts,
                                      [index]: renewal.renewal_amount?.toString() || "",
                                    });
                                  }}
                                  title="Cancelar"
                                >
                                  ✕
                                </Button>
                              </div>
                            ) : (
                              <div className="flex gap-2 items-center">
                                <input
                                  type="number"
                                  placeholder="Monto de renovación"
                                  className="p-2 flex-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                                  value={renewal.renewal_amount || ""}
                                  disabled
                                />
                                <Button
                                  type="button"
                                  color="blue"
                                  size="min"
                                  onClick={() => {
                                    setEditingRenewalId(renewal.renewal_id || null);
                                    setRenewalAmounts({
                                      ...renewalAmounts,
                                      [index]: renewal.renewal_amount?.toString() || "",
                                    });
                                  }}
                                  title="Editar monto"
                                >
                                  ✎
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hay renovaciones registradas</p>
                )}
              </div>

              {/* Información de Contacto */}
              <div className="mt-6 pt-4 border-t border-gray-300 dark:border-gray-600">
                <h5 className="font-semibold text-sm mb-3 text-purple-700 dark:text-purple-400 flex items-center gap-2">
                  <span className="text-base">📞</span> Información de Contacto
                </h5>
                {client.contact_numbers && client.contact_numbers.length > 0 ? (
                  <div className="space-y-2">
                    {client.contact_numbers.map((contact, index) => (
                      <div key={index} className="flex justify-between items-center text-sm bg-white dark:bg-gray-800 p-2 rounded">
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
