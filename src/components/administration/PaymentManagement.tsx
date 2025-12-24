import { useState } from "react";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import { IPaymentPlanItem, TPaymentStatus } from "../../interfaces/administration.interface";
import { FormikInput } from "../Inputs/FormikInput";
import { FormikSelect } from "../Inputs/FormikSelect";
import { Button } from "../generic/Button";
import { FaPlus, FaTrash, FaSave } from "react-icons/fa";

interface PaymentManagementProps {
  paymentPlan: IPaymentPlanItem[];
  onSave: (paymentPlan: IPaymentPlanItem[]) => Promise<void>;
  isLoading?: boolean;
  totalContractAmount?: number;
  paymentFrequency?: string;
  planId?: number; // ID del plan de pago en el nuevo sistema
  contractType?: "original" | "renewal"; // Tipo de contrato (original o renovación)
}

const paymentStatusOptions = [
  { id: "", name: "Selecciona el estado" },
  { id: "Pendiente", name: "Pendiente" },
  { id: "Pagado", name: "Pagado" },
  { id: "Vencido", name: "Vencido" },
  { id: "Parcial", name: "Parcial" },
];

const validationSchema = Yup.object().shape({
  payment_plan: Yup.array().of(
    Yup.object().shape({
      scheduled_amount: Yup.number()
        .required("El importe es requerido")
        .min(0, "El importe debe ser mayor a 0"),
      scheduled_date: Yup.string().required("La fecha programada es requerida"),
      paid_amount: Yup.number().min(0, "El importe pagado debe ser mayor o igual a 0"),
      travel_expenses: Yup.number().min(0, "Los viáticos deben ser mayor o igual a 0"),
      other_expenses: Yup.number().min(0, "Los otros gastos deben ser mayor o igual a 0"),
    })
  ),
});

export const PaymentManagement = ({
  paymentPlan,
  onSave,
  isLoading = false,
  totalContractAmount = 0,
  paymentFrequency = "",
}: PaymentManagementProps) => {
  const [expandedPayments, setExpandedPayments] = useState<number[]>([]);

  const togglePayment = (index: number) => {
    setExpandedPayments((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Función para convertir fecha ISO a formato YYYY-MM-DD
  const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return "";
    }
  };

  // Normalizar los pagos para asegurar que las fechas estén en formato correcto
  const normalizedPaymentPlan = paymentPlan.map((payment) => ({
    ...payment,
    scheduled_date: formatDateForInput(payment.scheduled_date),
    actual_payment_date: formatDateForInput(payment.actual_payment_date),
    travel_expenses_date: formatDateForInput(payment.travel_expenses_date),
    other_expenses_date: formatDateForInput(payment.other_expenses_date),
  }));

  const initialValues = {
    payment_plan: normalizedPaymentPlan.length > 0 ? normalizedPaymentPlan : [],
  };

  const getPaymentStatusColor = (status?: TPaymentStatus) => {
    switch (status) {
      case "Pagado":
        return "bg-green-100 text-green-800";
      case "Vencido":
        return "bg-red-100 text-red-800";
      case "Parcial":
        return "bg-yellow-100 text-yellow-800";
      case "Pendiente":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateTotals = (payments: IPaymentPlanItem[]) => {
    if (!payments || !Array.isArray(payments)) {
      return { totalScheduled: 0, totalPaid: 0, totalTravel: 0, totalOther: 0 };
    }
    const totalScheduled = payments.reduce((sum, p) => sum + (Number(p.scheduled_amount) || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (Number(p.paid_amount) || 0), 0);
    const totalTravel = payments.reduce((sum, p) => sum + (Number(p.travel_expenses) || 0), 0);
    const totalOther = payments.reduce((sum, p) => sum + (Number(p.other_expenses) || 0), 0);

    return { totalScheduled, totalPaid, totalTravel, totalOther };
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        await onSave(values.payment_plan);
      }}
      enableReinitialize
    >
      {({ values }) => {
        const totals = calculateTotals(values.payment_plan);

        return (
          <Form className="space-y-6">
            {/* Información de Frecuencia de Pago */}
            {paymentFrequency && (
              <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-100">
                  <span className="font-semibold">📋 Frecuencia de Pago:</span> {paymentFrequency}
                </p>
              </div>
            )}

            {/* Resumen financiero */}
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Monto del Contrato</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  ${(Number(totalContractAmount) || 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Programado</p>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  ${totals.totalScheduled.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Pagado</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  ${totals.totalPaid.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Saldo Pendiente</p>
                <p className="text-lg font-bold text-red-900 dark:text-red-100">
                  ${(totals.totalScheduled - totals.totalPaid).toFixed(2)}
                </p>
              </div>
            </div>

            <FieldArray name="payment_plan">
              {({ push, remove }) => (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Plan de Pagos</h3>
                    <Button
                      type="button"
                      onClick={() => {
                        const newPayment: IPaymentPlanItem = {
                          payment_number: values.payment_plan.length + 1,
                          scheduled_amount: 0,
                          scheduled_date: new Date().toISOString().split("T")[0],
                          payment_status: "Pendiente",
                        };
                        push(newPayment);
                        setExpandedPayments([...expandedPayments, values.payment_plan.length]);
                      }}
                      color="blue"
                      size="auth"
                    >
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <FaPlus />
                        <span>Agregar Pago</span>
                      </div>
                    </Button>
                  </div>

                  {values.payment_plan.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No hay pagos programados. Haz clic en "Agregar Pago" para comenzar.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {values.payment_plan.map((payment, index) => (
                        <div
                          key={index}
                          className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden"
                        >
                          {/* Cabecera del pago */}
                          <div
                            className="bg-gray-50 dark:bg-gray-700 p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => togglePayment(index)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-lg">Pago #{payment.payment_number}</span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                    payment.payment_status
                                  )}`}
                                >
                                  {payment.payment_status || "Pendiente"}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Programado: ${(Number(payment.scheduled_amount) || 0).toFixed(2)}
                                  </p>
                                  <p className="text-sm font-medium text-green-600">
                                    Pagado: ${(Number(payment.paid_amount) || 0).toFixed(2)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    remove(index);
                                    setExpandedPayments(expandedPayments.filter((i) => i !== index));
                                  }}
                                  className="text-red-600 hover:text-red-800 p-2"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Detalles del pago (expandible) */}
                          {expandedPayments.includes(index) && (
                            <div className="p-4 bg-white dark:bg-gray-800 space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormikInput
                                  label="Importe Programado"
                                  name={`payment_plan.${index}.scheduled_amount`}
                                  type="number"
                                  placeholder="0.00"
                                />
                                <FormikInput
                                  label="Fecha Programada"
                                  name={`payment_plan.${index}.scheduled_date`}
                                  type="date"
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormikInput
                                  label="Importe Pagado"
                                  name={`payment_plan.${index}.paid_amount`}
                                  type="number"
                                  placeholder="0.00"
                                />
                                <FormikInput
                                  label="Fecha de Pago Real"
                                  name={`payment_plan.${index}.actual_payment_date`}
                                  type="date"
                                />
                              </div>

                              <FormikSelect
                                label="Estado del Pago"
                                name={`payment_plan.${index}.payment_status`}
                                options={paymentStatusOptions}
                              />

                              <div className="border-t pt-4 mt-4">
                                <h4 className="font-medium mb-3 text-sm text-gray-700 dark:text-gray-300">
                                  Gastos Adicionales
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormikInput
                                    label="Viáticos"
                                    name={`payment_plan.${index}.travel_expenses`}
                                    type="number"
                                    placeholder="0.00"
                                  />
                                  <FormikInput
                                    label="Fecha de Viáticos"
                                    name={`payment_plan.${index}.travel_expenses_date`}
                                    type="date"
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                  <FormikInput
                                    label="Otros Gastos"
                                    name={`payment_plan.${index}.other_expenses`}
                                    type="number"
                                    placeholder="0.00"
                                  />
                                  <FormikInput
                                    label="Fecha de Otros Gastos"
                                    name={`payment_plan.${index}.other_expenses_date`}
                                    type="date"
                                  />
                                </div>

                                <div className="mt-3">
                                  <label className="label">Descripción de Otros Gastos</label>
                                  <input
                                    type="text"
                                    name={`payment_plan.${index}.other_expenses_description`}
                                    placeholder="Ej: Compra de cargador, cambio de dispositivo, BACON"
                                    className="p-2 w-full rounded border outline-none app-bg"
                                    onChange={(e) => {
                                      payment.other_expenses_description = e.target.value;
                                    }}
                                    defaultValue={payment.other_expenses_description}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="label">Notas</label>
                                <textarea
                                  name={`payment_plan.${index}.notes`}
                                  rows={2}
                                  placeholder="Notas adicionales sobre este pago"
                                  className="p-2 w-full rounded border outline-none app-bg"
                                  onChange={(e) => {
                                    payment.notes = e.target.value;
                                  }}
                                  defaultValue={payment.notes}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </FieldArray>

            {/* Totales adicionales */}
            {totals.totalTravel > 0 || totals.totalOther > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium mb-2">Gastos Adicionales Totales</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Total Viáticos:</p>
                    <p className="font-bold">${totals.totalTravel.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Total Otros Gastos:</p>
                    <p className="font-bold">${totals.totalOther.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Botón de guardar */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                type="submit"
                color="blue"
                isLoading={isLoading}
                size="auth"
              >
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <FaSave />
                  <span>Guardar Plan de Pagos</span>
                </div>
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};
