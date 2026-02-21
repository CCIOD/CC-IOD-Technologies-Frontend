import { useState, useEffect, useContext } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Modal } from "../components/generic/Modal";
import { Status } from "../components/generic/Status";
import { AdministrationDashboard } from "../components/administration/AdministrationDashboard";
import { AdministrationForm } from "../components/administration/AdministrationForm";
import { AuthContext } from "../context/AuthContext";
import {
  IAdministrationClient,
} from "../interfaces/administration.interface";
import {
  getAdministrationClients,
  updateAdministrationClient,
  updateOriginalContractAmount,
  updateRenewalAmount,
  getPaymentPlans,
  getPaymentPlanDetails,
  addPaymentsToPlan,
  updatePaymentInPlan,
  deletePaymentFromPlan,
  getPaymentObservations,
  updatePaymentObservations,
} from "../services/administration.service";
import { alertTimer } from "../utils/alerts";
import { RiEyeLine, RiMoneyDollarCircleLine, RiFileTextLine } from "react-icons/ri";
import { Spinner } from "../components/generic/Spinner";
import { Button } from "../components/generic/Button";

export const AdministrationPage = () => {
  const { user } = useContext(AuthContext);
  const isReadOnly = user?.role === "Seguimiento";

  const [clients, setClients] = useState<IAdministrationClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<IAdministrationClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<IAdministrationClient | null>(null);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentPlans, setPaymentPlans] = useState<any[]>([]); // Planes de pago separados
  const [loadingPaymentPlans, setLoadingPaymentPlans] = useState(false);
  const [editingPayment, setEditingPayment] = useState<number | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<{ planId: number; paymentId: number; paymentNumber: number } | null>(null); // ID del pago en edición
  const [editedPaymentData, setEditedPaymentData] = useState<any>({}); // Datos del pago editado

  // Estados para observaciones de pagos
  const [paymentObservations, setPaymentObservations] = useState<string>("");
  const [isEditingObservations, setIsEditingObservations] = useState<boolean>(false);
  const [isSavingObservations, setIsSavingObservations] = useState<boolean>(false);

  // Modales
  const [isOpenModalEdit, setIsOpenModalEdit] = useState(false);
  const [isOpenModalPayment, setIsOpenModalPayment] = useState(false);
  const [isOpenModalInfo, setIsOpenModalInfo] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  // Vista actual: 'all', 'pending', 'expiring'
  const [currentView, setCurrentView] = useState<"all" | "pending" | "expiring">("all");

  // Función helper para ordenar planes por fecha de inicio de menor a mayor
  const sortPaymentPlansByStartDate = (plans: any[]): any[] => {
    return plans.sort((a: any, b: any) => {
      const dateA = a.contract_date || a.fechaInicio || a.fecha_inicio || "";
      const dateB = b.contract_date || b.fechaInicio || b.fecha_inicio || "";

      if (!dateA || !dateB) return 0;

      const timeA = new Date(dateA).getTime();
      const timeB = new Date(dateB).getTime();

      return timeA - timeB;
    });
  };

  const fetchClients = async () => {
    setIsLoadingTable(true);
    try {
      const response = await getAdministrationClients();
      if (response.success && response.data) {
        // Mapear los datos del backend al formato esperado por el frontend
        const mappedClients: IAdministrationClient[] = response.data.map((client: any) => {
          // Calcular payment_day desde fechaColocacion si no viene del backend
          let paymentDay = client.diaPago || 0;
          if (!paymentDay && client.fechaColocacion) {
            try {
              const date = new Date(client.fechaColocacion);
              paymentDay = date.getDate();
            } catch (error) {
              paymentDay = 0;
            }
          }

          return {
            id: client.client_id,
            contract_number: client.numeroContrato || "N/A",
            client_name: client.nombre || "Sin nombre",
            defendant_name: client.nombre || "Sin nombre",
            criminal_case: client.telefono || "N/A", // El backend usa "telefono" para caso criminal
            court_name: "",
            judge_name: "",
            lawyer_name: "",
            signer_name: "",
            placement_date: client.fechaColocacion || "",
            contract_date: client.fechaInicio || "",
            contract_duration: client.periodoContratacion || "",
            payment_frequency: client.frecuenciaPago || "",
            payment_day: paymentDay,
            contact_numbers: (client.contactos || []).map((contact: any) => ({
              contact_name: contact.nombre || "Sin nombre",
              phone_number: contact.telefono || "N/A",
              relationship_name: contact.relacion || "N/A",
            })),
            invoice_file: "",
            contract_file: client.archivoContrato || "",
            status: client.estado || "Desconocido",
            bracelet_type: client.tipoBrazalete || "",
            diasRestantes: client.diasRestantes || null,
            payment_plan: ((client.pagos || [])
              .sort((a: any, b: any) => {
                // Ordenar por fechaCreacion de más viejo a más nuevo
                const dateA = new Date(a.fechaCreacion || 0).getTime();
                const dateB = new Date(b.fechaCreacion || 0).getTime();
                return dateA - dateB;
              })
              .map((pago: any, index: number) => {
                // Convertir fecha ISO a formato YYYY-MM-DD
                const formatDateForInput = (dateString?: string): string => {
                  if (!dateString) return "";
                  try {
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0];
                  } catch {
                    return "";
                  }
                };

                return {
                  payment_id: pago.id,
                  payment_number: index + 1,
                  scheduled_amount: parseFloat(pago.importeProgramado || "0"),
                  scheduled_date: formatDateForInput(pago.fechaProgramada),
                  paid_amount: parseFloat(pago.importePagado || "0"),
                  actual_payment_date: formatDateForInput(pago.fechaPagoReal),
                  travel_expenses: parseFloat(pago.gastosViaje || "0"),
                  travel_expenses_date: formatDateForInput(pago.fechaGastosViaje),
                  other_expenses: parseFloat(pago.otrosGastos || "0"),
                  other_expenses_date: formatDateForInput(pago.fechaOtrosGastos),
                  other_expenses_description: pago.descripcionOtrosGastos || undefined,
                  payment_status: pago.estado || "Pendiente",
                  notes: pago.notas || undefined,
                  created_at: pago.fechaCreacion || undefined,
                  updated_at: pago.fechaActualizacion || undefined,
                };
              })),
            account_statement: {
              total_sales: parseFloat(client.ventasTotales || "0"),
              total_paid: parseFloat(client.abonos || "0"),
              pending_balance: parseFloat(client.adeudoPendiente || "0"),
              total_travel_expenses: 0,
              total_other_expenses: 0,
              overdue_payments: 0,
              overdue_amount: 0,
            },
            total_contract_amount: parseFloat(client.montoOriginalContrato || "0"),
            contract_renewals: (client.renovaciones || []).map((renewal: any) => ({
              renewal_id: renewal.id,
              renewal_date: renewal.fechaRenovacion || "",
              renewal_document: renewal.documentoRenovacion || "",
              renewal_duration: renewal.duracionRenovacion || renewal.periodoRenovacion || "",
              renewal_amount: parseFloat(renewal.montoRenovacion || "0"),
              payment_frequency: renewal.frecuenciaPago || "",
            })),
            investigation_file_number: 0,
            observations: [],
            payment_observations: client.observacionesPago || client.payment_observations || "",
            prospect_id: 0,
            registered_at: client.registered_at || "",
          };
        });

        setClients(mappedClients);
        setFilteredClients(mappedClients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      const errorMsg = (error as any)?.message || "Error al cargar clientes";
      alertTimer(errorMsg, "error");
    } finally {
      setIsLoadingTable(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleEditClient = (client: IAdministrationClient) => {
    setSelectedClient(client);
    setModalTitle(`Editar Cliente: ${client.defendant_name}`);
    setIsOpenModalEdit(true);
  };

  const handleSavePaymentObservations = async () => {
    if (!selectedClient) return;

    if (isReadOnly) {
      alertTimer("No tienes permiso para editar", "error");
      return;
    }

    setIsSavingObservations(true);
    try {
      const response = await updatePaymentObservations(
        selectedClient.id,
        paymentObservations
      );

      if (response.success) {
        alertTimer("Observaciones guardadas exitosamente", "success");
        setIsEditingObservations(false);
      }
    } catch (error) {
      console.error("Error saving payment observations:", error);
      const errorMsg = (error as any)?.message || "Error al guardar las observaciones";
      alertTimer(errorMsg, "error");
    } finally {
      setIsSavingObservations(false);
    }
  };

  const handleManagePayments = async (client: IAdministrationClient) => {
    setSelectedClient(client);
    setModalTitle(`Gestión de Pagos: ${client.defendant_name}`);
    setLoadingPaymentPlans(true);

    // Cargar observaciones de pagos desde el servidor
    setIsEditingObservations(false);
    try {
      const obsResponse = await getPaymentObservations(client.id);
      if (obsResponse.success && obsResponse.data) {
        setPaymentObservations(obsResponse.data.payment_observations || "");
      }
    } catch (error) {
      console.error("Error loading payment observations:", error);
      setPaymentObservations("");
    }
    try {
      const response = await getPaymentPlans(client.id);
      if (response.success && response.data) {
        // Obtener los detalles (pagos) de cada plan
        const plansWithDetails = await Promise.all(
          response.data.map(async (plan: any) => {
            try {
              const detailsResponse = await getPaymentPlanDetails(
                plan.plan_id || plan.id
              );

              // Mapear los pagos del español al inglés
              const mappedPayments = (detailsResponse.data?.pagos || detailsResponse.data?.payments || []).map((pago: any, index: number) => ({
                payment_id: pago.id,
                id: pago.id,
                plan_id: pago.planId,
                payment_number: index + 1,
                payment_type: pago.tipo || pago.payment_type || "Pago",
                scheduled_amount: pago.importeProgramado || pago.scheduled_amount,
                scheduled_date: pago.fechaProgramada || pago.scheduled_date,
                paid_amount: pago.importePagado || pago.paid_amount || 0,
                paid_date: pago.fechaPagoReal || pago.paid_date,
                payment_status: pago.estado || pago.payment_status || "Pendiente",
                description: pago.descripcion || pago.description,
                payment_method: pago.metodoPago || pago.payment_method,
                reference_number: pago.numeroReferencia || pago.reference_number,
                notes: pago.notas || pago.notes,
                travel_expenses: pago.gastosViaje || pago.travel_expenses || 0,
                other_expenses: pago.otrosGastos || pago.other_expenses || 0,
                created_at: pago.fechaCreacion || pago.created_at,
                updated_at: pago.fechaActualizacion || pago.updated_at,
              }));

              return {
                ...plan,
                payments: mappedPayments,
              };
            } catch (error) {
              console.error(
                `Error loading payments for plan ${plan.plan_id || plan.id}:`,
                error
              );
              return {
                ...plan,
                payments: [],
              };
            }
          })
        );
        setPaymentPlans(sortPaymentPlansByStartDate(plansWithDetails));
      } else {
        setPaymentPlans([]);
      }
    } catch (error: any) {
      console.error("Error loading payment plans:", error);
      alertTimer("Error al cargar los planes de pago", "error");
      setPaymentPlans([]);
    } finally {
      setLoadingPaymentPlans(false);
      setIsOpenModalPayment(true);
    }
  };

  const handleViewAccountStatement = async (client: IAdministrationClient) => {
    setSelectedClient(client);
    setModalTitle(`Estado de Cuenta: ${client.defendant_name}`);
    setLoadingPaymentPlans(true);
    setIsOpenModalInfo(true);

    try {
      // Cargar planes de pago del cliente
      const response = await getPaymentPlans(client.id);
      if (response.success && response.data) {
        // Obtener los detalles (pagos) de cada plan
        const plansWithDetails = await Promise.all(
          response.data.map(async (plan: any) => {
            try {
              const detailsResponse = await getPaymentPlanDetails(
                plan.plan_id || plan.id
              );

              // Mapear los pagos del español al inglés
              const mappedPayments = (detailsResponse.data?.pagos || detailsResponse.data?.payments || []).map((pago: any, index: number) => ({
                payment_id: pago.id,
                id: pago.id,
                plan_id: pago.planId,
                payment_number: index + 1,
                payment_type: pago.tipo || pago.payment_type || "Pago",
                scheduled_amount: pago.importeProgramado || pago.scheduled_amount,
                scheduled_date: pago.fechaProgramada || pago.scheduled_date,
                paid_amount: pago.importePagado || pago.paid_amount || 0,
                paid_date: pago.fechaPagoReal || pago.paid_date,
                payment_status: pago.estado || pago.payment_status || "Pendiente",
                description: pago.descripcion || pago.description,
                payment_method: pago.metodoPago || pago.payment_method,
                reference_number: pago.numeroReferencia || pago.reference_number,
                notes: pago.notas || pago.notes,
                travel_expenses: pago.gastosViaje || pago.travel_expenses || 0,
                other_expenses: pago.otrosGastos || pago.other_expenses || 0,
                created_at: pago.fechaCreacion || pago.created_at,
                updated_at: pago.fechaActualizacion || pago.updated_at,
              }));

              return {
                ...plan,
                payments: mappedPayments,
              };
            } catch (error) {
              console.error(
                `Error loading payments for plan ${plan.plan_id || plan.id}:`,
                error
              );
              return {
                ...plan,
                payments: [],
              };
            }
          })
        );
        setPaymentPlans(sortPaymentPlansByStartDate(plansWithDetails));
      } else {
        setPaymentPlans([]);
      }
    } catch (error: any) {
      console.error("Error loading payment plans:", error);
      setPaymentPlans([]);
    } finally {
      setLoadingPaymentPlans(false);
    }
  };

  const handleUpdateClient = async (data: Partial<IAdministrationClient>) => {
    if (!selectedClient) return;

    setIsLoadingForm(true);
    try {
      const response = await updateAdministrationClient(selectedClient.id, data);
      if (response.success) {
        alertTimer("Cliente actualizado correctamente", "success");
        await fetchClients();
        setIsOpenModalEdit(false);
        setSelectedClient(null);
      }
    } catch (error: any) {
      console.error("Error updating client:", error);
      alertTimer(error.message || "Error al actualizar cliente", "error");
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleUpdateOriginalAmount = async (clientId: number, amount: number, paymentFrequency?: string): Promise<void> => {
    try {
      const response = await updateOriginalContractAmount(clientId, amount, paymentFrequency);
      if (response.success) {
        // Actualizar el cliente seleccionado con el nuevo monto y frecuencia
        setSelectedClient((prev) =>
          prev ? { ...prev, total_contract_amount: amount, payment_frequency: paymentFrequency || prev.payment_frequency } : null
        );
        // Recargar la lista de clientes
        await fetchClients();
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateRenewalAmount = async (renewalId: number, amount: number, paymentFrequency?: string): Promise<void> => {
    try {
      const response = await updateRenewalAmount(renewalId, amount, paymentFrequency);
      if (response.success) {
        // Actualizar el cliente seleccionado con el nuevo monto y frecuencia de renovación
        setSelectedClient((prev) => {
          if (!prev || !prev.contract_renewals) return prev;
          return {
            ...prev,
            contract_renewals: prev.contract_renewals.map((renewal) =>
              renewal.renewal_id === renewalId
                ? { ...renewal, renewal_amount: amount, payment_frequency: paymentFrequency || renewal.payment_frequency }
                : renewal
            ),
          };
        });
        // Recargar la lista de clientes
        await fetchClients();
      }
    } catch (error: any) {
      throw error;
    }
  };

  // Función para validar fechas (año entre 2000 y 2100)
  const validateDateYear = (dateString: string): boolean => {
    if (!dateString) return true; // Opcional, puede estar vacío
    const year = parseInt(dateString.split('-')[0], 10);
    return year >= 2000 && year <= 2100;
  };

  const handleAddPayment = async (planId: number, paymentData: any) => {
    if (isReadOnly) {
      alertTimer("No tienes permiso para agregar pagos", "error");
      return;
    }
    // Validar fechas antes de enviar
    if (paymentData.scheduled_date && !validateDateYear(paymentData.scheduled_date)) {
      alertTimer("La fecha programada debe estar entre los años 2000 y 2100", "error");
      setIsLoadingForm(false);
      return;
    }
    if (paymentData.paid_date && !validateDateYear(paymentData.paid_date)) {
      alertTimer("La fecha de pago debe estar entre los años 2000 y 2100", "error");
      setIsLoadingForm(false);
      return;
    }

    setIsLoadingForm(true);
    try {
      const response = await addPaymentsToPlan(planId, paymentData);
      if (response.success) {
        alertTimer("Pago agregado correctamente", "success");
        // Recargar los planes de pago con sus detalles
        if (selectedClient) {
          const plansResponse = await getPaymentPlans(selectedClient.id);
          if (plansResponse.success && plansResponse.data) {
            // Obtener los detalles (pagos) de cada plan
            const plansWithDetails = await Promise.all(
              plansResponse.data.map(async (plan: any) => {
                try {
                  const detailsResponse = await getPaymentPlanDetails(
                    plan.plan_id || plan.id
                  );

                  // Mapear los pagos del español al inglés
                  const mappedPayments = (detailsResponse.data?.pagos || detailsResponse.data?.payments || []).map((pago: any, index: number) => ({
                    payment_id: pago.id,
                    id: pago.id,
                    plan_id: pago.planId,
                    payment_number: index + 1,
                    payment_type: pago.tipo || pago.payment_type || "Pago",
                    scheduled_amount: pago.importeProgramado || pago.scheduled_amount,
                    scheduled_date: pago.fechaProgramada || pago.scheduled_date,
                    paid_amount: pago.importePagado || pago.paid_amount || 0,
                    paid_date: pago.fechaPagoReal || pago.paid_date,
                    payment_status: pago.estado || pago.payment_status || "Pendiente",
                    description: pago.descripcion || pago.description,
                    payment_method: pago.metodoPago || pago.payment_method,
                    reference_number: pago.numeroReferencia || pago.reference_number,
                    notes: pago.notas || pago.notes,
                    travel_expenses: pago.gastosViaje || pago.travel_expenses || 0,
                    other_expenses: pago.otrosGastos || pago.other_expenses || 0,
                    created_at: pago.fechaCreacion || pago.created_at,
                    updated_at: pago.fechaActualizacion || pago.updated_at,
                  }));

                  return {
                    ...plan,
                    payments: mappedPayments,
                  };
                } catch (error) {
                  console.error(
                    `Error loading payments for plan ${plan.plan_id || plan.id}:`,
                    error
                  );
                  return {
                    ...plan,
                    payments: [],
                  };
                }
              })
            );
            setPaymentPlans(sortPaymentPlansByStartDate(plansWithDetails));
          }
        }
      }
    } catch (error: any) {
      console.error("Error adding payment:", error);
      alertTimer(error.message || "Error al agregar pago", "error");
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleEditPayment = (payment: any) => {
    if (isReadOnly) {
      alertTimer("No tienes permiso para editar", "error");
      return;
    }
    setEditingPayment(payment.payment_id || payment.id);
    setEditedPaymentData({ ...payment });
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setEditedPaymentData({});
  };

  const handleSavePayment = async (planId: number, paymentId: number) => {
    if (isReadOnly) {
      alertTimer("No tienes permiso para editar", "error");
      return;
    }
    // Validar fechas antes de guardar
    if (editedPaymentData.scheduled_date && !validateDateYear(editedPaymentData.scheduled_date)) {
      alertTimer("La fecha programada debe estar entre los años 2000 y 2100", "error");
      setIsLoadingForm(false);
      return;
    }
    if (editedPaymentData.paid_date && !validateDateYear(editedPaymentData.paid_date)) {
      alertTimer("La fecha de pago debe estar entre los años 2000 y 2100", "error");
      setIsLoadingForm(false);
      return;
    }

    setIsLoadingForm(true);
    try {
      const response = await updatePaymentInPlan(planId, paymentId, editedPaymentData);
      if (response.success) {
        alertTimer("Pago actualizado correctamente", "success");
        setEditingPayment(null);
        setEditedPaymentData({});

        // Recargar los planes de pago con sus detalles
        if (selectedClient) {
          const plansResponse = await getPaymentPlans(selectedClient.id);
          if (plansResponse.success && plansResponse.data) {
            const plansWithDetails = await Promise.all(
              plansResponse.data.map(async (plan: any) => {
                try {
                  const detailsResponse = await getPaymentPlanDetails(
                    plan.plan_id || plan.id
                  );

                  // Mapear los pagos del español al inglés
                  const mappedPayments = (detailsResponse.data?.pagos || detailsResponse.data?.payments || []).map((pago: any, index: number) => ({
                    payment_id: pago.id,
                    id: pago.id,
                    plan_id: pago.planId,
                    payment_number: index + 1,
                    payment_type: pago.tipo || pago.payment_type || "Pago",
                    scheduled_amount: pago.importeProgramado || pago.scheduled_amount,
                    scheduled_date: pago.fechaProgramada || pago.scheduled_date,
                    paid_amount: pago.importePagado || pago.paid_amount || 0,
                    paid_date: pago.fechaPagoReal || pago.paid_date,
                    payment_status: pago.estado || pago.payment_status || "Pendiente",
                    description: pago.descripcion || pago.description,
                    payment_method: pago.metodoPago || pago.payment_method,
                    reference_number: pago.numeroReferencia || pago.reference_number,
                    notes: pago.notas || pago.notes,
                    travel_expenses: pago.gastosViaje || pago.travel_expenses || 0,
                    other_expenses: pago.otrosGastos || pago.other_expenses || 0,
                    created_at: pago.fechaCreacion || pago.created_at,
                    updated_at: pago.fechaActualizacion || pago.updated_at,
                  }));

                  return {
                    ...plan,
                    payments: mappedPayments,
                  };
                } catch (error) {
                  console.error(
                    `Error loading payments for plan ${plan.plan_id || plan.id}:`,
                    error
                  );
                  return {
                    ...plan,
                    payments: [],
                  };
                }
              })
            );
            setPaymentPlans(sortPaymentPlansByStartDate(plansWithDetails));
          }
        }
      }
    } catch (error: any) {
      console.error("Error updating payment:", error);
      alertTimer(error.message || "Error al actualizar pago", "error");
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handlePaymentFieldChange = (field: string, value: any) => {
    setEditedPaymentData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePendingPaymentsClick = (pendingClients: IAdministrationClient[]) => {
    setFilteredClients(pendingClients);
    setCurrentView("pending");
  };

  const handleExpiringContractsClick = (expiringClients: IAdministrationClient[]) => {
    setFilteredClients(expiringClients);
    setCurrentView("expiring");
  };

  const handleResetView = () => {
    setFilteredClients(clients);
    setCurrentView("all");
    setSearchTerm("");
  };

  const normalizeText = (text: string) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = clients.filter((client) => {
      const searchNormalized = normalizeText(value);
      return (
        normalizeText(client.defendant_name || '').includes(searchNormalized) ||
        client.contract_number?.toString().includes(value) ||
        normalizeText(client.criminal_case || '').includes(searchNormalized) ||
        normalizeText(client.court_name || '').includes(searchNormalized)
      );
    });
    setFilteredClients(filtered);
    setCurrentView("all");
  };

  const columns: TableColumn<IAdministrationClient>[] = [
    {
      name: "Contrato",
      selector: (row) => row.contract_number || "N/A",
      sortable: true,
      width: "100px",
    },
    {
      name: "Cliente",
      selector: (row) => row.defendant_name,
      sortable: true,
      minWidth: "200px",
    },
    {
      name: "Fecha Colocación",
      selector: (row) => row.placement_date,
      sortable: true,
      format: (row) => {
        if (!row.placement_date) return "N/A";
        try {
          return new Date(row.placement_date).toLocaleDateString("es-MX");
        } catch {
          return "Fecha inválida";
        }
      },
      width: "140px",
    },
    {
      name: "Tiempo Restante",
      cell: (row) => {
        const diasRestantes = row.diasRestantes ? Number(row.diasRestantes) : null;
        const status = row.status;
        const normalizedStatus = status?.toString().trim().toLowerCase();

        let colorClass = "text-gray-600";
        let displayText = "N/A";

        if (normalizedStatus === "cancelado" || normalizedStatus === "desinstalado") {
          colorClass = "text-gray-600 font-semibold";
          displayText = status;
          return <span className={colorClass}>{displayText}</span>;
        }

        if (diasRestantes !== null) {
          if (diasRestantes <= 0) {
            colorClass = "text-red-600 font-bold";
            displayText = "Vencido";
          } else if (diasRestantes <= 30) {
            colorClass = "text-red-600 font-bold";
            displayText = `${diasRestantes} días`;
          } else if (diasRestantes <= 90) {
            colorClass = "text-orange-600 font-semibold";
            displayText = `${diasRestantes} días`;
          } else {
            colorClass = "text-green-600";
            displayText = `${diasRestantes} días`;
          }
        }

        return <span className={colorClass}>{displayText}</span>;
      },
      width: "150px",
    },
    {
      name: "Frecuencia de Pago",
      selector: (row) => row.payment_frequency || "N/A",
      sortable: true,
      width: "150px",
    },
    {
      name: "Estado",
      cell: (row) => <Status status={row.status as any} />,
      sortable: true,
      width: "130px",
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="flex gap-2 pr-4">
          <Button
            color="sky"
            size="min"
            onClick={() => handleEditClient(row)}
            title="Ver información"
          >
            <RiEyeLine size={24} />
          </Button>
          <Button
            color="green"
            size="min"
            onClick={() => handleManagePayments(row)}
            disabled={isReadOnly}
            title={isReadOnly ? "Sin permiso para gestionar pagos" : "Gestionar pagos"}
          >
            <RiMoneyDollarCircleLine size={24} />
          </Button>
          <Button
            color="purple"
            size="min"
            onClick={() => handleViewAccountStatement(row)}
            title="Estado de cuenta"
          >
            <RiFileTextLine size={24} />
          </Button>
        </div>
      ),
      width: "220px",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard */}
      <AdministrationDashboard
        onPendingPaymentsClick={handlePendingPaymentsClick}
        onExpiringContractsClick={handleExpiringContractsClick}
        onOverduePaymentsClick={(client) => {
          // Convertir el cliente del dashboard al formato IAdministrationClient
          const administrationClient: IAdministrationClient = {
            id: client.client_id || client.id,
            contract_number: client.numeroContrato || "",
            client_name: client.nombre || client.defendant_name || "",
            defendant_name: client.nombre || client.defendant_name || "",
            criminal_case: "",
            placement_date: "",
            contact_numbers: [],
            status: "",
          };
          handleManagePayments(administrationClient);
        }}
      />

      {/* Tabla de clientes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold">
            {currentView === "all"
              ? "Todos los Clientes"
              : currentView === "pending"
                ? "Clientes con Pagos Pendientes"
                : "Contratos por Vencer"}
          </h2>
          <div className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, contrato, caso o juzgado..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 lg:w-80"
            />
            {currentView !== "all" && (
              <button
                onClick={handleResetView}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap"
              >
                Ver Todos
              </button>
            )}
          </div>
        </div>

        {currentView !== "all" && !searchTerm && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleResetView}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors hidden lg:block"
            >
              Ver Todos
            </button>
          </div>
        )}

        <div className="custom-table">
          <DataTable
            columns={columns}
            data={filteredClients}
            progressPending={isLoadingTable}
            progressComponent={<Spinner />}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            noDataComponent={
              <div className="text-center py-8">
                No hay clientes para mostrar
              </div>
            }
            highlightOnHover
            pointerOnHover
            paginationComponentOptions={{
              rowsPerPageText: "Registros por página",
              rangeSeparatorText: "de",
            }}
          />
        </div>
      </div>

      {/* Modal de edición */}
      <Modal
        title={modalTitle}
        isOpen={isOpenModalEdit}
        toggleModal={() => {
          setIsOpenModalEdit(false);
          setSelectedClient(null);
        }}
        size="lg"
        backdrop
      >
        {selectedClient && (
          <AdministrationForm
            client={selectedClient}
            onSubmit={handleUpdateClient}
            onCancel={() => {
              setIsOpenModalEdit(false);
              setSelectedClient(null);
            }}
            isLoading={isLoadingForm}
            onUpdateOriginalAmount={handleUpdateOriginalAmount}
            onUpdateRenewalAmount={handleUpdateRenewalAmount}
            isReadOnly={isReadOnly}
          />
        )}
      </Modal>

      {/* Modal de gestión de pagos */}
      <Modal
        title={modalTitle}
        isOpen={isOpenModalPayment}
        toggleModal={() => {
          setIsOpenModalPayment(false);
          setSelectedClient(null);
          setPaymentPlans([]);
          setPaymentObservations("");
          setIsEditingObservations(false);
        }}
        size="xl"
        backdrop
      >
        {selectedClient && (
          <div className="space-y-6">
            {isReadOnly && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <span className="font-semibold">⚠️ Modo de solo lectura</span> - No tienes permiso para editar pagos
                </p>
              </div>
            )}
            {/* Sección de Observaciones de Pagos */}
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  📝 Observaciones de Pagos
                </h3>
                <Button
                  color={isEditingObservations ? "blue" : "gray"}
                  onClick={() => {
                    if (isEditingObservations) {
                      handleSavePaymentObservations();
                    } else {
                      setIsEditingObservations(true);
                    }
                  }}
                  isLoading={isSavingObservations}
                  disabled={isReadOnly}
                  size="sm"
                >
                  {isEditingObservations ? "Guardar" : "Editar"}
                </Button>
              </div>
              <div>
                {isEditingObservations && !isReadOnly ? (
                  <textarea
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    rows={6}
                    value={paymentObservations}
                    onChange={(e) => setPaymentObservations(e.target.value)}
                    placeholder="Escriba aquí las observaciones relacionadas con los pagos del cliente..."
                    disabled={isSavingObservations}
                  />
                ) : (
                  <div className="p-3 bg-white dark:bg-gray-700 rounded-lg min-h-[100px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {paymentObservations || "Sin observaciones registradas"}
                  </div>
                )}
              </div>
            </div>

            {loadingPaymentPlans ? (
              <div className="flex items-center justify-center py-8">
                <Spinner />
              </div>
            ) : paymentPlans.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No hay planes de pago registrados.</p>
                <p className="text-sm mt-2">Los planes se crearán automáticamente cuando se establezca el monto del contrato.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Planes de pago organizados por tipo de contrato */}
                {paymentPlans.map((plan: any, index: number) => {
                  // Mapear campos que pueden venir en diferentes formatos
                  const contractType = plan.contract_type || plan.tipo_contrato || plan.tipoContrato;
                  const planId = plan.plan_id || plan.id;
                  const totalAmount = plan.total_amount || plan.montoContrato;
                  const contractDate = plan.contract_date || plan.fechaInicio;
                  const paymentFrequency = plan.payment_frequency || plan.frecuenciaPago || 'No especificada';
                  const payments = plan.payments || [];

                  const isOriginal = contractType === "original" || contractType === "Contrato Original";

                  return (
                    <div key={planId} className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      {/* Encabezado del plan */}
                      <div className={`${isOriginal ? 'bg-blue-100 dark:bg-blue-900' : 'bg-purple-100 dark:bg-purple-900'} p-4`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className={`font-bold text-lg ${isOriginal ? 'text-blue-900 dark:text-blue-100' : 'text-purple-900 dark:text-purple-100'}`}>
                              {isOriginal ? '📋 Contrato Original' : `🔄 Renovación ${index}`}
                            </h3>
                            {contractDate && (
                              <p className={`text-sm ${isOriginal ? 'text-blue-700 dark:text-blue-300' : 'text-purple-700 dark:text-purple-300'}`}>
                                Fecha: {new Date(contractDate).toLocaleDateString('es-ES')}
                              </p>
                            )}
                            <p className={`text-sm ${isOriginal ? 'text-blue-700 dark:text-blue-300' : 'text-purple-700 dark:text-purple-300'}`}>
                              📅 Frecuencia: {paymentFrequency}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs ${isOriginal ? 'text-blue-700 dark:text-blue-300' : 'text-purple-700 dark:text-purple-300'}`}>
                              Plan ID: {planId}
                            </p>
                            <p className={`font-bold text-lg ${isOriginal ? 'text-blue-900 dark:text-blue-100' : 'text-purple-900 dark:text-purple-100'}`}>
                              ${parseFloat(totalAmount || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contenido del plan */}
                      <div className="p-4 bg-white dark:bg-gray-800">
                        {payments && payments.length > 0 ? (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              {payments.length} pagos programados
                            </div>

                            {/* Tabla de pagos compacta */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-300 dark:border-gray-600">
                                    <th className="text-left py-2 px-2 app-text">Pago #</th>
                                    <th className="text-left py-2 px-2 app-text">Fecha Prog.</th>
                                    <th className="text-right py-2 px-2 app-text">Monto Prog.</th>
                                    <th className="text-left py-2 px-2 app-text">Fecha Pago</th>
                                    <th className="text-right py-2 px-2 app-text">Monto Pagado</th>
                                    <th className="text-right py-2 px-2 app-text">Viáticos</th>
                                    <th className="text-right py-2 px-2 app-text">Otros Gastos</th>
                                    <th className="text-left py-2 px-2 app-text">Estado</th>
                                    <th className="text-left py-2 px-2 app-text">Método</th>
                                    <th className="text-left py-2 px-2 app-text">Descripción</th>
                                    <th className="text-center py-2 px-2 app-text">Acciones</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {payments.map((payment: any) => {
                                    const paymentId = payment.payment_id || payment.id;
                                    const isEditing = editingPayment === paymentId;

                                    return (
                                      <tr key={paymentId} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="py-2 px-2 font-medium app-text">{payment.payment_number}</td>

                                        {/* Fecha Programada */}
                                        <td className="py-2 px-2 app-text">
                                          {isEditing ? (
                                            <input
                                              type="date"
                                              value={editedPaymentData.scheduled_date || payment.scheduled_date}
                                              onChange={(e) => handlePaymentFieldChange('scheduled_date', e.target.value)}
                                              className="p-1 w-full text-xs rounded border outline-none app-bg app-text"
                                              min="2000-01-01"
                                              max="2100-12-31"
                                            />
                                          ) : (
                                            payment.scheduled_date ? new Date(payment.scheduled_date).toLocaleDateString('es-ES') : '-'
                                          )}
                                        </td>

                                        {/* Monto Programado */}
                                        <td className="py-2 px-2 text-right app-text">
                                          {isEditing ? (
                                            <input
                                              type="number"
                                              step="0.01"
                                              value={editedPaymentData.scheduled_amount || payment.scheduled_amount}
                                              onChange={(e) => handlePaymentFieldChange('scheduled_amount', parseFloat(e.target.value))}
                                              className="p-1 w-24 text-xs text-right rounded border outline-none app-bg app-text"
                                            />
                                          ) : (
                                            `$${parseFloat(payment.scheduled_amount || 0).toFixed(2)}`
                                          )}
                                        </td>

                                        {/* Fecha de Pago */}
                                        <td className="py-2 px-2 app-text">
                                          {isEditing ? (
                                            <input
                                              type="date"
                                              value={editedPaymentData.paid_date || payment.paid_date || ''}
                                              onChange={(e) => handlePaymentFieldChange('paid_date', e.target.value || null)}
                                              className="p-1 w-full text-xs rounded border outline-none app-bg app-text"
                                              min="2000-01-01"
                                              max="2100-12-31"
                                            />
                                          ) : (
                                            payment.paid_date ? new Date(payment.paid_date).toLocaleDateString('es-ES') : '-'
                                          )}
                                        </td>

                                        {/* Monto Pagado */}
                                        <td className="py-2 px-2 text-right app-text">
                                          {isEditing ? (
                                            <input
                                              type="number"
                                              step="0.01"
                                              value={editedPaymentData.paid_amount !== undefined ? editedPaymentData.paid_amount : payment.paid_amount}
                                              onChange={(e) => handlePaymentFieldChange('paid_amount', parseFloat(e.target.value) || 0)}
                                              className="p-1 w-24 text-xs text-right rounded border outline-none app-bg app-text"
                                            />
                                          ) : (
                                            <span className="font-medium text-green-600 dark:text-green-400">
                                              ${parseFloat(payment.paid_amount || 0).toFixed(2)}
                                            </span>
                                          )}
                                        </td>

                                        {/* Viáticos */}
                                        <td className="py-2 px-2 text-right app-text">
                                          {isEditing ? (
                                            <input
                                              type="number"
                                              step="0.01"
                                              value={editedPaymentData.travel_expenses !== undefined ? editedPaymentData.travel_expenses : (payment.travel_expenses || payment.gastosViaje || 0)}
                                              onChange={(e) => handlePaymentFieldChange('travel_expenses', parseFloat(e.target.value) || 0)}
                                              className="p-1 w-20 text-xs text-right rounded border outline-none app-bg app-text"
                                            />
                                          ) : (
                                            <span className={parseFloat(payment.travel_expenses || payment.gastosViaje || 0) > 0 ? 'font-medium text-orange-600 dark:text-orange-400' : 'text-gray-400'}>
                                              ${parseFloat(payment.travel_expenses || payment.gastosViaje || 0).toFixed(2)}
                                            </span>
                                          )}
                                        </td>

                                        {/* Otros Gastos */}
                                        <td className="py-2 px-2 text-right app-text">
                                          {isEditing ? (
                                            <input
                                              type="number"
                                              step="0.01"
                                              value={editedPaymentData.other_expenses !== undefined ? editedPaymentData.other_expenses : (payment.other_expenses || payment.otrosGastos || 0)}
                                              onChange={(e) => handlePaymentFieldChange('other_expenses', parseFloat(e.target.value) || 0)}
                                              className="p-1 w-20 text-xs text-right rounded border outline-none app-bg app-text"
                                            />
                                          ) : (
                                            <span className={parseFloat(payment.other_expenses || payment.otrosGastos || 0) > 0 ? 'font-medium text-purple-600 dark:text-purple-400' : 'text-gray-400'}>
                                              ${parseFloat(payment.other_expenses || payment.otrosGastos || 0).toFixed(2)}
                                            </span>
                                          )}
                                        </td>

                                        {/* Estado */}
                                        <td className="py-2 px-2 app-text">
                                          {isEditing ? (
                                            <select
                                              value={editedPaymentData.payment_status || payment.payment_status}
                                              onChange={(e) => handlePaymentFieldChange('payment_status', e.target.value)}
                                              className="p-1 w-full text-xs rounded border outline-none app-bg app-text"
                                            >
                                              <option value="Pendiente">Pendiente</option>
                                              <option value="Pagado">Pagado</option>
                                              <option value="Parcial">Parcial</option>
                                              <option value="Vencido">Vencido</option>
                                            </select>
                                          ) : (
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${payment.payment_status === 'Pagado' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                              payment.payment_status === 'Vencido' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                payment.payment_status === 'Parcial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                              }`}>
                                              {payment.payment_status || 'Pendiente'}
                                            </span>
                                          )}
                                        </td>

                                        {/* Método de Pago */}
                                        <td className="py-2 px-2 app-text">
                                          {isEditing ? (
                                            <select
                                              value={editedPaymentData.payment_method || payment.payment_method || 'Transferencia'}
                                              onChange={(e) => handlePaymentFieldChange('payment_method', e.target.value)}
                                              className="p-1 w-full text-xs rounded border outline-none app-bg app-text"
                                            >
                                              <option value="Pendiente">Pendiente</option>
                                              <option value="Transferencia">Transferencia</option>
                                              <option value="Efectivo">Efectivo</option>
                                              <option value="Cheque">Cheque</option>
                                              <option value="Tarjeta">Tarjeta</option>
                                            </select>
                                          ) : (
                                            <span className="text-xs">{payment.payment_method || '-'}</span>
                                          )}
                                        </td>

                                        {/* Descripción */}
                                        <td className="py-2 px-2 app-text">
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editedPaymentData.description || payment.description || ''}
                                              onChange={(e) => handlePaymentFieldChange('description', e.target.value)}
                                              placeholder="Descripción del pago"
                                              className="p-1 w-full text-xs rounded border outline-none app-bg app-text"
                                            />
                                          ) : (
                                            <span className="text-xs">{payment.description || '-'}</span>
                                          )}
                                        </td>

                                        {/* Botones de Acción */}
                                        <td className="py-2 px-2 text-center app-text">
                                          {isEditing ? (
                                            <div className="flex gap-1 justify-center">
                                              <Button
                                                type="button"
                                                color="green"
                                                size="sm"
                                                isLoading={isLoadingForm}
                                                onClick={() => handleSavePayment(planId, paymentId)}
                                              >
                                                Guardar
                                              </Button>
                                              <Button
                                                type="button"
                                                color="gray"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                              >
                                                Cancelar
                                              </Button>
                                            </div>
                                          ) : (
                                            <div className="flex gap-1 justify-center">
                                              <Button
                                                type="button"
                                                color="blue"
                                                size="sm"
                                                onClick={() => handleEditPayment(payment)}
                                                disabled={isReadOnly}
                                              >
                                                Editar
                                              </Button>
                                              <Button
                                                type="button"
                                                color="failure"
                                                size="sm"
                                                onClick={() => {
                                                  setDeletingPayment({
                                                    planId: plan.plan_id || plan.id,
                                                    paymentId: paymentId,
                                                    paymentNumber: payment.payment_number
                                                  });
                                                }}
                                                disabled={isReadOnly}
                                              >
                                                Eliminar
                                              </Button>
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Totales del plan */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-3 border-t border-gray-300 dark:border-gray-600">
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Total Programado</p>
                                <p className="font-bold text-blue-600 dark:text-blue-400">
                                  ${payments.reduce((sum: number, p: any) => sum + parseFloat(p.scheduled_amount || 0), 0).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Total Pagado</p>
                                <p className="font-bold text-green-600 dark:text-green-400">
                                  ${payments.reduce((sum: number, p: any) => sum + parseFloat(p.paid_amount || 0), 0).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Total Viáticos</p>
                                <p className="font-bold text-orange-600 dark:text-orange-400">
                                  ${payments.reduce((sum: number, p: any) => sum + parseFloat(p.travel_expenses || p.gastosViaje || 0), 0).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Otros Gastos</p>
                                <p className="font-bold text-purple-600 dark:text-purple-400">
                                  ${payments.reduce((sum: number, p: any) => sum + parseFloat(p.other_expenses || p.otrosGastos || 0), 0).toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Saldo Pendiente</p>
                                <p className="font-bold text-red-600 dark:text-red-400">
                                  ${(payments.reduce((sum: number, p: any) => sum + parseFloat(p.scheduled_amount || 0), 0) -
                                    payments.reduce((sum: number, p: any) => sum + parseFloat(p.paid_amount || 0), 0)).toFixed(2)}
                                </p>
                              </div>
                            </div>

                            {/* Botón para agregar nuevo pago */}
                            <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
                              <h4 className="font-bold text-sm mb-3 text-gray-700 dark:text-gray-300">Agregar Nuevo Pago</h4>
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  ℹ️ <span className="font-semibold">Frecuencia configurada:</span> {paymentFrequency}
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                  Recuerda programar los pagos según la frecuencia establecida para este plan.
                                </p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="label text-xs app-text">Monto Programado *</label>
                                    <input
                                      type="number"
                                      id={`scheduled_amount_${plan.plan_id || plan.id}`}
                                      placeholder="0.00"
                                      className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                      step="0.01"
                                    />
                                  </div>
                                  <div>
                                    <label className="label text-xs app-text">Fecha Programada *</label>
                                    <input
                                      type="date"
                                      id={`scheduled_date_${plan.plan_id || plan.id}`}
                                      className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="label text-xs app-text">Monto Pagado</label>
                                    <input
                                      type="number"
                                      id={`paid_amount_${plan.plan_id || plan.id}`}
                                      placeholder="0.00"
                                      className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                      step="0.01"
                                      defaultValue="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="label text-xs app-text">Fecha de Pago</label>
                                    <input
                                      type="date"
                                      id={`paid_date_${plan.plan_id || plan.id}`}
                                      className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="label text-xs app-text">Estado del Pago</label>
                                    <select
                                      id={`payment_status_${plan.plan_id || plan.id}`}
                                      className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                      defaultValue="Pendiente"
                                    >
                                      <option value="Pendiente">Pendiente</option>
                                      <option value="Pagado">Pagado</option>
                                      <option value="Parcial">Parcial</option>
                                      <option value="Vencido">Vencido</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="label text-xs app-text">Método de Pago</label>
                                    <select
                                      id={`payment_method_${plan.plan_id || plan.id}`}
                                      className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                      defaultValue="Transferencia"
                                    >
                                      <option value="Pendiente">Pendiente</option>
                                      <option value="Transferencia">Transferencia</option>
                                      <option value="Efectivo">Efectivo</option>
                                      <option value="Cheque">Cheque</option>
                                      <option value="Tarjeta">Tarjeta</option>
                                    </select>
                                  </div>
                                </div>
                                <div>
                                  <label className="label text-xs app-text">Descripción</label>
                                  <input
                                    type="text"
                                    id={`description_${plan.plan_id || plan.id}`}
                                    placeholder="Ej: Pago inicial, segundo pago, etc"
                                    className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                  />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="label text-xs app-text">Viáticos</label>
                                    <input
                                      type="number"
                                      id={`travel_expenses_${plan.plan_id || plan.id}`}
                                      placeholder="0.00"
                                      className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                      step="0.01"
                                      defaultValue="0"
                                    />
                                  </div>
                                  <div>
                                    <label className="label text-xs app-text">Otros Gastos</label>
                                    <input
                                      type="number"
                                      id={`other_expenses_${plan.plan_id || plan.id}`}
                                      placeholder="0.00"
                                      className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                      step="0.01"
                                      defaultValue="0"
                                    />
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  color="blue"
                                  size="sm"
                                  isLoading={isLoadingForm}
                                  disabled={isReadOnly}
                                  onClick={() => {
                                    const planId = plan.plan_id || plan.id;
                                    const scheduledAmount = (document.getElementById(`scheduled_amount_${planId}`) as HTMLInputElement)?.value;
                                    const scheduledDate = (document.getElementById(`scheduled_date_${planId}`) as HTMLInputElement)?.value;
                                    const paidAmount = (document.getElementById(`paid_amount_${planId}`) as HTMLInputElement)?.value;
                                    const paidDate = (document.getElementById(`paid_date_${planId}`) as HTMLInputElement)?.value;
                                    const paymentStatus = (document.getElementById(`payment_status_${planId}`) as HTMLSelectElement)?.value;
                                    const paymentMethod = (document.getElementById(`payment_method_${planId}`) as HTMLSelectElement)?.value;
                                    const description = (document.getElementById(`description_${planId}`) as HTMLInputElement)?.value;
                                    const travelExpenses = (document.getElementById(`travel_expenses_${planId}`) as HTMLInputElement)?.value;
                                    const otherExpenses = (document.getElementById(`other_expenses_${planId}`) as HTMLInputElement)?.value;

                                    if (!scheduledAmount || !scheduledDate) {
                                      alertTimer("Por favor completa los campos requeridos", "error");
                                      return;
                                    }

                                    handleAddPayment(planId, {
                                      payment_type: "Pago",
                                      scheduled_amount: parseFloat(scheduledAmount),
                                      scheduled_date: scheduledDate,
                                      paid_amount: parseFloat(paidAmount) || 0,
                                      paid_date: paidDate || null,
                                      payment_status: paymentStatus,
                                      description: description || "Pago",
                                      payment_method: paymentMethod,
                                      travel_expenses: parseFloat(travelExpenses) || 0,
                                      other_expenses: parseFloat(otherExpenses) || 0,
                                    });
                                  }}
                                >
                                  Agregar Pago
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                              Sin pagos registrados
                            </div>
                            {/* Formulario para agregar primer pago */}
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                              <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">Agregar Nuevo Pago</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="label text-xs app-text">Monto Programado *</label>
                                  <input
                                    type="number"
                                    id={`scheduled_amount_${plan.plan_id || plan.id}`}
                                    placeholder="0.00"
                                    className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                    step="0.01"
                                  />
                                </div>
                                <div>
                                  <label className="label text-xs app-text">Fecha Programada *</label>
                                  <input
                                    type="date"
                                    id={`scheduled_date_${plan.plan_id || plan.id}`}
                                    className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                    min="2000-01-01"
                                    max="2100-12-31"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="label text-xs app-text">Monto Pagado</label>
                                  <input
                                    type="number"
                                    id={`paid_amount_${plan.plan_id || plan.id}`}
                                    placeholder="0.00"
                                    className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                    step="0.01"
                                    defaultValue="0"
                                  />
                                </div>
                                <div>
                                  <label className="label text-xs app-text">Fecha de Pago</label>
                                  <input
                                    type="date"
                                    id={`paid_date_${plan.plan_id || plan.id}`}
                                    className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                    min="2000-01-01"
                                    max="2100-12-31"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="label text-xs app-text">Estado del Pago</label>
                                  <select
                                    id={`payment_status_${plan.plan_id || plan.id}`}
                                    className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                    defaultValue="Pendiente"
                                  >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Pagado">Pagado</option>
                                    <option value="Parcial">Parcial</option>
                                    <option value="Vencido">Vencido</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="label text-xs app-text">Método de Pago</label>
                                  <select
                                    id={`payment_method_${plan.plan_id || plan.id}`}
                                    className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                    defaultValue="Transferencia"
                                  >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Cheque">Cheque</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="label text-xs app-text">Descripción</label>
                                <input
                                  type="text"
                                  id={`description_${plan.plan_id || plan.id}`}
                                  placeholder="Ej: Pago inicial, segundo pago, etc"
                                  className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="label text-xs app-text">Viáticos</label>
                                  <input
                                    type="number"
                                    id={`travel_expenses_${plan.plan_id || plan.id}`}
                                    placeholder="0.00"
                                    className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                    step="0.01"
                                    defaultValue="0"
                                  />
                                </div>
                                <div>
                                  <label className="label text-xs app-text">Otros Gastos</label>
                                  <input
                                    type="number"
                                    id={`other_expenses_${plan.plan_id || plan.id}`}
                                    placeholder="0.00"
                                    className="p-2 w-full text-sm rounded border outline-none app-bg app-text"
                                    step="0.01"
                                    defaultValue="0"
                                  />
                                </div>
                              </div>
                              <Button
                                type="button"
                                color="blue"
                                size="sm"
                                isLoading={isLoadingForm}
                                disabled={isReadOnly}
                                onClick={() => {
                                  const planId = plan.plan_id || plan.id;
                                  const scheduledAmount = (document.getElementById(`scheduled_amount_${planId}`) as HTMLInputElement)?.value;
                                  const scheduledDate = (document.getElementById(`scheduled_date_${planId}`) as HTMLInputElement)?.value;
                                  const paidAmount = (document.getElementById(`paid_amount_${planId}`) as HTMLInputElement)?.value;
                                  const paidDate = (document.getElementById(`paid_date_${planId}`) as HTMLInputElement)?.value;
                                  const paymentStatus = (document.getElementById(`payment_status_${planId}`) as HTMLSelectElement)?.value;
                                  const paymentMethod = (document.getElementById(`payment_method_${planId}`) as HTMLSelectElement)?.value;
                                  const description = (document.getElementById(`description_${planId}`) as HTMLInputElement)?.value;
                                  const travelExpenses = (document.getElementById(`travel_expenses_${planId}`) as HTMLInputElement)?.value;
                                  const otherExpenses = (document.getElementById(`other_expenses_${planId}`) as HTMLInputElement)?.value;

                                  if (!scheduledAmount || !scheduledDate) {
                                    alertTimer("Por favor completa los campos requeridos", "error");
                                    return;
                                  }

                                  handleAddPayment(planId, {
                                    payment_type: "Pago",
                                    scheduled_amount: parseFloat(scheduledAmount),
                                    scheduled_date: scheduledDate,
                                    paid_amount: parseFloat(paidAmount) || 0,
                                    paid_date: paidDate || null,
                                    payment_status: paymentStatus,
                                    description: description || "Pago",
                                    payment_method: paymentMethod,
                                    travel_expenses: parseFloat(travelExpenses) || 0,
                                    other_expenses: parseFloat(otherExpenses) || 0,
                                  });
                                }}
                              >
                                Agregar Pago
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de estado de cuenta */}
      <Modal
        title={modalTitle}
        isOpen={isOpenModalInfo}
        toggleModal={() => {
          setIsOpenModalInfo(false);
          setSelectedClient(null);
          setPaymentPlans([]);
        }}
        size="xl"
        backdrop
      >
        {loadingPaymentPlans ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : selectedClient && paymentPlans.length > 0 ? (
          <div className="space-y-6">
            {/* Resumen general de todos los planes */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg p-6">
              <h3 className="font-bold text-xl mb-4 text-gray-800 dark:text-gray-100">📊 Resumen General</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Contratos</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${paymentPlans.reduce((sum, plan) => sum + parseFloat(plan.total_amount || plan.montoContrato || 0), 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Programado</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${paymentPlans.reduce((sum, plan) => {
                      const payments = plan.payments || [];
                      return sum + payments.reduce((s: number, p: any) => s + parseFloat(p.scheduled_amount || 0), 0);
                    }, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Pagado</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${paymentPlans.reduce((sum, plan) => {
                      const payments = plan.payments || [];
                      return sum + payments.reduce((s: number, p: any) => s + parseFloat(p.paid_amount || 0), 0);
                    }, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Viáticos</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ${paymentPlans.reduce((sum, plan) => {
                      const payments = plan.payments || [];
                      return sum + payments.reduce((s: number, p: any) => s + parseFloat(p.travel_expenses || p.gastosViaje || 0), 0);
                    }, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Otros Gastos</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ${paymentPlans.reduce((sum, plan) => {
                      const payments = plan.payments || [];
                      return sum + payments.reduce((s: number, p: any) => s + parseFloat(p.other_expenses || p.otrosGastos || 0), 0);
                    }, 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Saldo Pendiente</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ${paymentPlans.reduce((sum, plan) => {
                      const payments = plan.payments || [];
                      const scheduled = payments.reduce((s: number, p: any) => s + parseFloat(p.scheduled_amount || 0), 0);
                      const paid = payments.reduce((s: number, p: any) => s + parseFloat(p.paid_amount || 0), 0);
                      return sum + (scheduled - paid);
                    }, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Desglose por plan */}
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">📋 Desglose por Contrato</h3>
              {paymentPlans.map((plan: any, index: number) => {
                const contractType = plan.contract_type || plan.tipo_contrato || plan.tipoContrato;
                const planId = plan.plan_id || plan.id;
                const totalAmount = plan.total_amount || plan.montoContrato;
                const contractDate = plan.contract_date || plan.fechaInicio;
                const paymentFrequency = plan.payment_frequency || plan.frecuenciaPago || 'No especificada';
                const payments = plan.payments || [];
                const isOriginal = contractType === "original" || contractType === "Contrato Original";

                const totalScheduled = payments.reduce((sum: number, p: any) => sum + parseFloat(p.scheduled_amount || 0), 0);
                const totalPaid = payments.reduce((sum: number, p: any) => sum + parseFloat(p.paid_amount || 0), 0);
                const totalPending = totalScheduled - totalPaid;
                const totalTravelExpenses = payments.reduce((sum: number, p: any) => sum + parseFloat(p.travel_expenses || p.gastosViaje || 0), 0);
                const totalOtherExpenses = payments.reduce((sum: number, p: any) => sum + parseFloat(p.other_expenses || p.otrosGastos || 0), 0);

                // Próximo pago pendiente
                const nextPayment = payments
                  .filter((p: any) => p.payment_status !== 'Pagado' && p.scheduled_date)
                  .sort((a: any, b: any) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())[0];

                // Pagos vencidos
                const today = new Date();
                const overduePayments = payments.filter((p: any) =>
                  p.payment_status !== 'Pagado' &&
                  p.scheduled_date &&
                  new Date(p.scheduled_date) < today
                );

                return (
                  <div key={planId} className={`border-2 ${isOriginal ? 'border-blue-300 dark:border-blue-700' : 'border-purple-300 dark:border-purple-700'} rounded-lg overflow-hidden`}>
                    <div className={`${isOriginal ? 'bg-blue-100 dark:bg-blue-900' : 'bg-purple-100 dark:bg-purple-900'} p-4`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className={`font-bold text-lg ${isOriginal ? 'text-blue-900 dark:text-blue-100' : 'text-purple-900 dark:text-purple-100'}`}>
                            {isOriginal ? '📋 Contrato Original' : `🔄 Renovación ${index}`}
                          </h4>
                          {contractDate && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              Fecha: {new Date(contractDate).toLocaleDateString('es-ES')}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            📅 Frecuencia de Pago: <span className="font-semibold">{paymentFrequency}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Monto Contrato</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            ${parseFloat(totalAmount || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800">
                      {/* Resumen del plan */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Programado</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            ${totalScheduled.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Pagado</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            ${totalPaid.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Viáticos</p>
                          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            ${totalTravelExpenses.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Otros Gastos</p>
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            ${totalOtherExpenses.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Pendiente</p>
                          <p className="text-lg font-bold text-red-600 dark:text-red-400">
                            ${totalPending.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Info adicional */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Total de pagos:</span>
                          <span className="font-semibold">{payments.length}</span>
                        </div>
                        {overduePayments.length > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Pagos vencidos:</span>
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              {overduePayments.length}
                            </span>
                          </div>
                        )}
                        {nextPayment && (
                          <div className="bg-yellow-50 dark:bg-yellow-900 rounded p-3 mt-3">
                            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                              ⏰ Próximo Pago
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                {new Date(nextPayment.scheduled_date).toLocaleDateString('es-ES')}
                              </span>
                              <span className="font-bold text-yellow-900 dark:text-yellow-100">
                                ${parseFloat(nextPayment.scheduled_amount || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : selectedClient ? (
          <p className="text-center text-gray-500 py-8">No hay información de estado de cuenta disponible</p>
        ) : null}
      </Modal>

      {/* Modal de confirmación para eliminar pago */}
      <Modal
        title="Confirmar Eliminación"
        isOpen={!!deletingPayment}
        toggleModal={() => setDeletingPayment(null)}
        size="sm"
        backdrop
      >
        {deletingPayment && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                ¿Eliminar Pago #{deletingPayment.paymentNumber}?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Esta acción no se puede deshacer. El pago será eliminado permanentemente del sistema.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                color="gray"
                onClick={() => setDeletingPayment(null)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                color="failure"
                isLoading={isLoadingForm}
                onClick={async () => {
                  if (isReadOnly) {
                    alertTimer("No tienes permiso para eliminar pagos", "error");
                    return;
                  }
                  try {
                    setIsLoadingForm(true);
                    await deletePaymentFromPlan(deletingPayment.planId, deletingPayment.paymentId);
                    alertTimer('Pago eliminado correctamente', 'success');
                    setDeletingPayment(null);

                    // Recargar planes de pago
                    if (selectedClient) {
                      const plansResponse = await getPaymentPlans(selectedClient.id);
                      if (plansResponse.success && plansResponse.data) {
                        const plansWithDetails = await Promise.all(
                          plansResponse.data.map(async (plan: any) => {
                            try {
                              const detailsResponse = await getPaymentPlanDetails(plan.plan_id || plan.id);
                              const mappedPayments = (detailsResponse.data?.pagos || detailsResponse.data?.payments || []).map((pago: any, index: number) => ({
                                payment_id: pago.id,
                                id: pago.id,
                                plan_id: pago.planId,
                                payment_number: index + 1,
                                payment_type: pago.tipo || pago.payment_type || "Pago",
                                scheduled_amount: pago.importeProgramado || pago.scheduled_amount,
                                scheduled_date: pago.fechaProgramada || pago.scheduled_date,
                                paid_amount: pago.importePagado || pago.paid_amount || 0,
                                paid_date: pago.fechaPagoReal || pago.paid_date,
                                payment_status: pago.estado || pago.payment_status || "Pendiente",
                                description: pago.descripcion || pago.description,
                                payment_method: pago.metodoPago || pago.payment_method,
                                reference_number: pago.numeroReferencia || pago.reference_number,
                                notes: pago.notas || pago.notes,
                                travel_expenses: pago.gastosViaje || pago.travel_expenses || 0,
                                other_expenses: pago.otrosGastos || pago.other_expenses || 0,
                                created_at: pago.fechaCreacion || pago.created_at,
                                updated_at: pago.fechaActualizacion || pago.updated_at,
                              }));
                              return { ...plan, payments: mappedPayments };
                            } catch (error) {
                              return { ...plan, payments: [] };
                            }
                          })
                        );
                        setPaymentPlans(sortPaymentPlansByStartDate(plansWithDetails));
                      }
                    }
                  } catch (error: any) {
                    alertTimer(error?.message || 'Error al eliminar el pago', 'error');
                  } finally {
                    setIsLoadingForm(false);
                  }
                }}
              >
                Sí, Eliminar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de vigencia de contrato */}
    </div>
  );
};

