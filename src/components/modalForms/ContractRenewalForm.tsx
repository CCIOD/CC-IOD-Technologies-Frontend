import { FC, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { FaRedo, FaCalendarAlt, FaClock } from "react-icons/fa";
import { Button } from "../generic/Button";
import { Modal } from "../generic/Modal";
import { Alert } from "../generic/Alert";
import {
  calculateRenewalInfo,
  formatDisplayDate,
  generateRenewalMessage,
  validateContractData,
} from "../../utils/contractValidity";
import { IAdministrationClient } from "../../interfaces/administration.interface";

interface ContractRenewalFormProps {
  client: IAdministrationClient;
  isOpen: boolean;
  toggleModal: (value: boolean) => void;
  onSubmit: (data: {
    clientId: number;
    monthsAdded: number;
    renewalDocument?: File;
    notes?: string;
    currentExpirationDate: string;
    daysRemaining: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Esquema de validación para el formulario de renovación
 */
const renewalValidationSchema = Yup.object().shape({
  months_added: Yup.number()
    .required("Los meses a renovar son requeridos")
    .min(1, "Debe agregar al menos 1 mes")
    .max(60, "No se puede renovar por más de 60 meses")
    .typeError("Debe ser un número válido"),
  renewal_document: Yup.mixed().nullable(),
  notes: Yup.string()
    .max(500, "Las notas no pueden exceder 500 caracteres")
    .nullable(),
});

/**
 * Formulario modal para renovación de contrato
 * - Muestra días restantes actual
 * - Solicita meses a renovar
 * - Permite adjuntar documento de renovación
 * - Calcula y muestra nueva fecha de vencimiento
 */
export const ContractRenewalForm: FC<ContractRenewalFormProps> = ({
  client,
  isOpen,
  toggleModal,
  onSubmit,
  isLoading = false,
}) => {
  const [renewalDocument, setRenewalDocument] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Validar datos del contrato
  const validation = validateContractData(
    client.placement_date,
    client.contract_duration || 0
  );

  if (!validation.isValid) {
    return (
      <Modal
        isOpen={isOpen}
        toggleModal={toggleModal}
        title="Renovar Contrato"
        size="lg"
      >
        <div className="p-6">
          <Alert
            text1={validation.error || "Datos incompletos del contrato"}
            color="red"
          />
        </div>
      </Modal>
    );
  }

  // Calcular información de vigencia actual
  // Nota: Estos valores deberían venir de IContractValidity, usar valores por defecto
  const currentExpirationDate = (client as any).expiration_date || "";
  const daysRemaining = (client as any).days_remaining || 0;
  const renewalMessage = generateRenewalMessage(daysRemaining);

  const handleSubmit = async (values: any) => {
    try {
      setErrorMessage("");

      // Validar que se especificaron meses a renovar
      if (!values.months_added || values.months_added <= 0) {
        setErrorMessage("Debe especificar los meses a renovar");
        return;
      }

      await onSubmit({
        clientId: client.id,
        monthsAdded: values.months_added,
        renewalDocument: renewalDocument || undefined,
        notes: values.notes || undefined,
        currentExpirationDate,
        daysRemaining,
      });

      // Limpiar datos después de envío exitoso
      setRenewalDocument(null);
      setPreviewData(null);
      setErrorMessage("");
      toggleModal(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error al renovar contrato";
      setErrorMessage(errorMsg);
    }
  };

  const handleInitialSubmit = (values: any) => {
    // Calcular preview cuando usuario cambia meses
    if (values.months_added && values.months_added > 0) {
      const renewalInfo = calculateRenewalInfo(
        currentExpirationDate,
        values.months_added,
        client.placement_date,
        client.contract_duration || 0
      );
      setPreviewData(renewalInfo);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggleModal={toggleModal}
      title="Renovar Contrato"
      size="lg"
    >
      <Formik
        initialValues={{
          months_added: 1,
          renewal_document: null,
          notes: "",
        }}
        validationSchema={renewalValidationSchema}
        onSubmit={handleSubmit}
        onChange={(e: any) => {
          if (e.values) {
            handleInitialSubmit(e.values);
          }
        }}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form className="space-y-6 p-6">
            {/* Mensaje Informativo */}
            <Alert
              text1={renewalMessage}
              color="blue"
            />

            {/* Error Message */}
            {errorMessage && (
              <Alert
                text1={errorMessage}
                color="red"
              />
            )}

            {/* Información Actual */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  Fecha de Vencimiento Actual
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {formatDisplayDate(currentExpirationDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  Días Restantes
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {daysRemaining} días
                </p>
              </div>
            </div>

            {/* Meses a Renovar */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                <FaClock className="inline mr-2 text-blue-600" />
                Meses a Renovar *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="months_added"
                  value={values.months_added}
                  onChange={(e) => setFieldValue("months_added", parseInt(e.target.value) || 1)}
                  placeholder="Ingresa los meses a renovar"
                  min={1}
                  max={60}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">meses</span>
              </div>
              {errors.months_added && touched.months_added && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.months_added}
                </p>
              )}
            </div>

            {/* Vista Previa de Cambios */}
            {previewData && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Vista Previa de Renovación
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-800 dark:text-blue-200">Meses Adicionales:</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      {previewData.monthsAdded} mes
                      {previewData.monthsAdded !== 1 ? "es" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-800 dark:text-blue-200">Total de Meses:</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      {previewData.totalMonths} mes
                      {previewData.totalMonths !== 1 ? "es" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
                    <span className="text-blue-800 dark:text-blue-200">Nueva Fecha de Vencimiento:</span>
                    <span className="font-bold text-blue-900 dark:text-blue-100">
                      {formatDisplayDate(previewData.newExpirationDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-800 dark:text-blue-200">Nuevos Días Restantes:</span>
                    <span className="font-bold text-blue-900 dark:text-blue-100">
                      {previewData.daysRemaining} días
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Documento de Renovación */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                <FaCalendarAlt className="inline mr-2 text-blue-600" />
                Documento de Renovación
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && file.size > 10 * 1024 * 1024) {
                    setErrorMessage("El archivo no debe superar 10MB");
                    return;
                  }
                  setRenewalDocument(file);
                  setFieldValue("renewal_document", file);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {renewalDocument && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  ✓ Archivo seleccionado: {renewalDocument.name}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Formatos aceptados: PDF, DOC, DOCX, JPG, PNG (Máximo 10MB)
              </p>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Notas Adicionales
              </label>
              <textarea
                name="notes"
                value={values.notes}
                onChange={(e) => setFieldValue("notes", e.target.value)}
                placeholder="Ingresa cualquier nota relevante sobre la renovación..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              {errors.notes && touched.notes && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.notes}
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                color="gray"
                onClick={() => {
                  toggleModal(false);
                  setErrorMessage("");
                }}
              >
                Cancelar
              </Button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  isSubmitting || isLoading
                    ? "bg-blue-400 text-white cursor-not-allowed opacity-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <FaRedo size={16} />
                {isSubmitting || isLoading ? "Procesando..." : "Confirmar Renovación"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
