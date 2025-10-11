import { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Modal } from "../components/generic/Modal";
import { Status } from "../components/generic/Status";
import { AdministrationDashboard } from "../components/administration/AdministrationDashboard";
import { AdministrationForm } from "../components/administration/AdministrationForm";
import { PaymentManagement } from "../components/administration/PaymentManagement";
import {
  IAdministrationClient,
  IPaymentPlanItem,
} from "../interfaces/administration.interface";
import {
  getAdministrationClients,
  updateAdministrationClient,
  updatePaymentPlan,
} from "../services/administration.service";
import { alertTimer } from "../utils/alerts";
import { RiEyeLine, RiMoneyDollarCircleLine, RiFileTextLine } from "react-icons/ri";
import { calculateContractTimeRemaining } from "../utils/format";
import { Spinner } from "../components/generic/Spinner";
import { Button } from "../components/generic/Button";

export const AdministrationPage = () => {
  const [clients, setClients] = useState<IAdministrationClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<IAdministrationClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<IAdministrationClient | null>(null);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  // Modales
  const [isOpenModalEdit, setIsOpenModalEdit] = useState(false);
  const [isOpenModalPayment, setIsOpenModalPayment] = useState(false);
  const [isOpenModalInfo, setIsOpenModalInfo] = useState(false);
  const [modalTitle, setModalTitle] = useState("");

  // Vista actual: 'all', 'pending', 'expiring'
  const [currentView, setCurrentView] = useState<"all" | "pending" | "expiring">("all");

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
            contact_numbers: [],
            invoice_file: "",
            contract_file: client.archivoContrato || "",
            status: client.estado || "Desconocido",
            bracelet_type: "",
            payment_plan: [],
            account_statement: {
              total_sales: parseFloat(client.ventasTotales || "0"),
              total_paid: parseFloat(client.abonos || "0"),
              pending_balance: parseFloat(client.adeudoPendiente || "0"),
              total_travel_expenses: 0,
              total_other_expenses: 0,
              overdue_payments: 0,
              overdue_amount: 0,
            },
            total_contract_amount: parseFloat(client.ventasTotales || "0"),
            investigation_file_number: 0,
            observations: [],
            prospect_id: 0,
            registered_at: client.registered_at || "",
          };
        });
        
        setClients(mappedClients);
        setFilteredClients(mappedClients);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      alertTimer("Error al cargar clientes", "error");
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

  const handleManagePayments = async (client: IAdministrationClient) => {
    setSelectedClient(client);
    setModalTitle(`Gestión de Pagos: ${client.defendant_name}`);
    setIsOpenModalPayment(true);
  };

  const handleViewAccountStatement = async (client: IAdministrationClient) => {
    setSelectedClient(client);
    setModalTitle(`Estado de Cuenta: ${client.defendant_name}`);
    setIsOpenModalInfo(true);
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

  const handleSavePaymentPlan = async (paymentPlan: IPaymentPlanItem[]) => {
    if (!selectedClient) return;

    setIsLoadingForm(true);
    try {
      const response = await updatePaymentPlan(selectedClient.id, paymentPlan);
      if (response.success) {
        alertTimer("Plan de pagos actualizado correctamente", "success");
        await fetchClients();
        setIsOpenModalPayment(false);
        setSelectedClient(null);
      }
    } catch (error: any) {
      console.error("Error updating payment plan:", error);
      alertTimer(error.message || "Error al actualizar plan de pagos", "error");
    } finally {
      setIsLoadingForm(false);
    }
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
      name: "Caso",
      selector: (row) => row.criminal_case,
      sortable: true,
      width: "150px",
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
        const timeRemaining = calculateContractTimeRemaining(
          row.placement_date,
          row.contract_duration
        );
        const colorClass =
          timeRemaining.status === "expired"
            ? "text-red-600 font-bold"
            : timeRemaining.status === "warning"
            ? "text-orange-600 font-semibold"
            : "text-green-600";

        return <span className={colorClass}>{timeRemaining.displayText}</span>;
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
            title="Gestionar pagos"
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
      width: "180px",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard */}
      <AdministrationDashboard
        onPendingPaymentsClick={handlePendingPaymentsClick}
        onExpiringContractsClick={handleExpiringContractsClick}
      />

      {/* Tabla de clientes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {currentView === "all"
              ? "Todos los Clientes"
              : currentView === "pending"
              ? "Clientes con Pagos Pendientes"
              : "Contratos por Vencer"}
          </h2>
          {currentView !== "all" && (
            <button
              onClick={handleResetView}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Ver Todos
            </button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={filteredClients}
          progressPending={isLoadingTable}
          progressComponent={<Spinner />}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 30, 50]}
          noDataComponent={
            <div className="text-center py-8 text-gray-500">
              No hay clientes para mostrar
            </div>
          }
          highlightOnHover
          pointerOnHover
        />
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
        }}
        size="xl"
        backdrop
      >
        {selectedClient && (
          <PaymentManagement
            paymentPlan={selectedClient.payment_plan || []}
            onSave={handleSavePaymentPlan}
            isLoading={isLoadingForm}
            totalContractAmount={selectedClient.total_contract_amount}
          />
        )}
      </Modal>

      {/* Modal de estado de cuenta */}
      <Modal
        title={modalTitle}
        isOpen={isOpenModalInfo}
        toggleModal={() => {
          setIsOpenModalInfo(false);
          setSelectedClient(null);
        }}
        size="md"
        backdrop
      >
        {selectedClient && selectedClient.account_statement && typeof selectedClient.account_statement === 'object' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
              <h3 className="font-bold text-lg mb-3">Resumen Financiero</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ventas Totales</p>
                  <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                    ${selectedClient.account_statement.total_sales?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Pagado</p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-100">
                    ${selectedClient.account_statement.total_paid?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Pendiente</p>
                  <p className="text-xl font-bold text-red-900 dark:text-red-100">
                    ${selectedClient.account_statement.pending_balance?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pagos Vencidos</p>
                  <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                    {selectedClient.account_statement.overdue_payments || 0}
                  </p>
                </div>
              </div>
            </div>

            {selectedClient.account_statement.next_payment_date && (
              <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Próximo Pago</h4>
                <p className="text-sm">
                  Fecha:{" "}
                  {new Date(selectedClient.account_statement.next_payment_date).toLocaleDateString(
                    "es-MX"
                  )}
                </p>
                <p className="text-sm">
                  Monto: ${selectedClient.account_statement.next_payment_amount?.toFixed(2) || '0.00'}
                </p>
              </div>
            )}
          </div>
        )}
        {selectedClient && (!selectedClient.account_statement || typeof selectedClient.account_statement === 'string') && (
          <p className="text-center text-gray-500">No hay información de estado de cuenta disponible</p>
        )}
      </Modal>
    </div>
  );
};
