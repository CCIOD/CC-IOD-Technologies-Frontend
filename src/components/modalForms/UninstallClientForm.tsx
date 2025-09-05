import React from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Modal } from "../generic/Modal";
import { Button } from "../generic/Button";
import { FormikInput } from "../Inputs/FormikInput";
import { ErrMessage } from "../generic/ErrMessage";
import { DataRowClients } from "../../interfaces/clients.interface";
import apiClient from "../../api/Client";

interface UninstallClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  client: DataRowClients | null;
  onUninstallSuccess: (updatedClient: DataRowClients) => void;
  isLoading: boolean;
  errorMessage: string;
}

interface UninstallFormData {
  uninstall_reason: string;
  uninstall_date: string;
}

const uninstallValidationSchema = Yup.object({
  uninstall_reason: Yup.string()
    .max(500, "El motivo no puede exceder 500 caracteres"),
  uninstall_date: Yup.date()
    .required("La fecha de desinstalación es requerida")
    .max(new Date(), "La fecha no puede ser futura"),
});

const UninstallClientForm: React.FC<UninstallClientFormProps> = ({
  isOpen,
  onClose,
  client,
  onUninstallSuccess,
  isLoading,
  errorMessage
}) => {
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const initialValues: UninstallFormData = {
    uninstall_reason: "",
    uninstall_date: getCurrentDate(),
  };

  const handleSubmit = async (values: UninstallFormData) => {
    if (!client) return;

    try {
      const response = await apiClient.put(`clients/uninstall/${client.id}`, {
        uninstall_reason: values.uninstall_reason || undefined,
        uninstall_date: new Date(values.uninstall_date).toISOString()
      });

      if (response.data.success) {
        onUninstallSuccess(response.data.data);
      } else {
        throw new Error(response.data.message || 'Error al desinstalar cliente');
      }
    } catch (error) {
      console.error('Error uninstalling client:', error);
      throw error;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggleModal={onClose}
      title={`Desinstalar Cliente: ${client?.contract_number || ''}`}
      size="lg"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={uninstallValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="space-y-4">
              {/* Información del cliente */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Información del Cliente
                </h4>
                <p className="text-sm text-gray-600">
                  <strong>Nombre:</strong> {client?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Número de Causa Penal:</strong> {client?.criminal_case}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Estado Actual:</strong> {client?.status}
                </p>
              </div>

              {/* Advertencia */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Advertencia:</strong> Esta acción cambiará el estado del cliente a "Desinstalado". 
                      Esta operación se puede revertir posteriormente si es necesario.
                    </p>
                  </div>
                </div>
              </div>

              {/* Motivo de desinstalación */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de Desinstalación
                </label>
                <Field name="uninstall_reason">
                  {({ field, meta }: { field: React.InputHTMLAttributes<HTMLTextAreaElement>; meta: { touched: boolean; error?: string } }) => (
                    <div>
                      <textarea
                        {...field}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Cumplimiento de condena judicial, solicitud del cliente, etc."
                        rows={4}
                      />
                      {meta.touched && meta.error && (
                        <ErrMessage message={meta.error} />
                      )}
                    </div>
                  )}
                </Field>
              </div>

              {/* Fecha de desinstalación */}
              <FormikInput
                name="uninstall_date"
                label="Fecha de Desinstalación"
                type="date"
                required={true}
              />

              {/* Mensaje de error */}
              {errorMessage && <ErrMessage message={errorMessage} />}

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  color="gray"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="failure"
                  isLoading={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? "Desinstalando..." : "Desinstalar Cliente"}
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default UninstallClientForm;
