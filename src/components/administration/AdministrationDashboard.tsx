import { useEffect, useState } from "react";
import {
  IAdministrationClient,
  IDashboardMetrics,
  IExpiringContract,
} from "../../interfaces/administration.interface";
import { getDashboardSummary } from "../../services/administration.service";
import { FaMoneyBillWave, FaExclamationTriangle, FaChartLine, FaChevronDown, FaChevronUp, FaCalendarAlt } from "react-icons/fa";
import { Spinner } from "../generic/Spinner";

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  clients?: any[];
  isExpandable?: boolean;
}

const DashboardCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  clients = [],
  isExpandable = false,
}: DashboardCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <div
        className={`p-6 ${isExpandable && clients.length > 0 ? "cursor-pointer" : ""}`}
        onClick={() => isExpandable && clients.length > 0 && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className={`p-3 rounded-full ${color.replace("text-", "bg-")} bg-opacity-10`}>
              <div className={`${color} text-2xl`}>{icon}</div>
            </div>
            {isExpandable && clients.length > 0 && (
              <div className={`${color}`}>
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Lista expandible de clientes */}
      {isExpanded && clients.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2 max-h-64 overflow-y-auto">
          {clients.map((client: any, index: number) => (
            <div
              key={index}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
            >
              <p className="font-semibold text-gray-800 dark:text-white">
                {client.nombre || client.defendant_name || "Sin nombre"}
              </p>
              {client.numeroContrato && (
                <p className="text-gray-600 dark:text-gray-400">
                  Contrato: {client.numeroContrato}
                </p>
              )}
              {client.monto && (
                <p className={`font-medium ${color}`}>
                  Monto: ${parseFloat(client.monto).toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ContractExpirationCardProps {
  vencidos: number;
  proximosVencer: number;
  contratosVencidos: IExpiringContract[];
  contratosProximosVencer: IExpiringContract[];
}

const ContractExpirationCard = ({
  vencidos,
  proximosVencer,
  contratosVencidos,
  contratosProximosVencer,
}: ContractExpirationCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const totalContratos = vencidos + proximosVencer;

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <div
        className={`p-6 ${totalContratos > 0 ? "cursor-pointer" : ""}`}
        onClick={() => totalContratos > 0 && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Contratos por Vencer
            </p>
            <p className="text-3xl font-bold text-orange-600">{totalContratos}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {vencidos} vencidos, {proximosVencer} próximos 30 días
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-orange-600 bg-opacity-10">
              <div className="text-orange-600 text-2xl">
                <FaCalendarAlt />
              </div>
            </div>
            {totalContratos > 0 && (
              <div className="text-orange-600">
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lista expandible de contratos */}
      {isExpanded && totalContratos > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Contratos Vencidos */}
          {contratosVencidos.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                <FaExclamationTriangle />
                Vencidos ({vencidos})
              </h4>
              <div className="space-y-2">
                {contratosVencidos.map((contrato) => (
                  <div
                    key={contrato.id}
                    className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-500"
                  >
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {contrato.nombre}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Contrato: {contrato.numeroContrato}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Venció: {formatDate(contrato.fechaVencimiento)}
                    </p>
                    {contrato.diasVencido && (
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        Hace {contrato.diasVencido.days} días
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contratos Próximos a Vencer */}
          {contratosProximosVencer.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                <FaCalendarAlt />
                Próximos 30 Días ({proximosVencer})
              </h4>
              <div className="space-y-2">
                {contratosProximosVencer.map((contrato) => (
                  <div
                    key={contrato.id}
                    className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500"
                  >
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {contrato.nombre}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Contrato: {contrato.numeroContrato}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Vence: {formatDate(contrato.fechaVencimiento)}
                    </p>
                    {contrato.diasRestantes && (
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                        En {contrato.diasRestantes.days} días
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface AdministrationDashboardProps {
  onPendingPaymentsClick?: (clients: IAdministrationClient[]) => void;
  onExpiringContractsClick?: (clients: IAdministrationClient[]) => void;
}

export const AdministrationDashboard = ({}: AdministrationDashboardProps = {}) => {
  const [metrics, setMetrics] = useState<IDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDashboardSummary();
      if (response.success && response.data) {
        setMetrics(response.data);
      } else {
        setError("No se pudieron cargar las métricas");
      }
    } catch (err: any) {
      console.error("Error fetching metrics:", err);
      setError(err.message || "Error al cargar las métricas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg">
        <p className="font-semibold">Error al cargar el dashboard</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Valores seguros con defaults desde la estructura del backend
  const pagosPendientes = metrics.pagosPendientes || {
    cantidad: 0,
    total: 0,
  };
  
  const pagosVencidos = metrics.pagosVencidos || {
    cantidad: 0,
    adeudo: 0,
  };
  
  const contratosPorVencer = metrics.contratosPorVencer || {
    vencidos: 0,
    proximos30Dias: 0,
  };
  
  const ingresosDelMes = metrics.ingresosDelMes || {
    total: 0,
    cantidadPagos: 0,
  };
  
  const resumen = metrics.resumen || {
    totalClientesActivos: 0,
    adeudoTotalPendiente: 0,
  };
  
  const clientesMayorAdeudo = metrics.clientesMayorAdeudo || [];
  const contratosVencidosDetalle = metrics.contratosVencidosDetalle || [];
  const contratosProximosVencer = metrics.contratosProximosVencer || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Dashboard Administrativo
        </h2>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pagos Pendientes */}
        <DashboardCard
          title="Pagos Pendientes"
          value={pagosPendientes.cantidad}
          subtitle={`Total: ${formatCurrency(pagosPendientes.total)}`}
          icon={<FaMoneyBillWave />}
          color="text-yellow-600"
          clients={[]}
          isExpandable={false}
        />

        {/* Pagos Vencidos */}
        <DashboardCard
          title="Pagos Vencidos"
          value={pagosVencidos.cantidad}
          subtitle={`Adeudo: ${formatCurrency(pagosVencidos.adeudo)}`}
          icon={<FaExclamationTriangle />}
          color="text-red-600"
          clients={clientesMayorAdeudo}
          isExpandable={clientesMayorAdeudo.length > 0}
        />

        {/* Contratos por vencer */}
        <ContractExpirationCard
          vencidos={contratosPorVencer.vencidos}
          proximosVencer={contratosPorVencer.proximos30Dias}
          contratosVencidos={contratosVencidosDetalle}
          contratosProximosVencer={contratosProximosVencer}
        />

        {/* Ingresos del mes */}
        <DashboardCard
          title="Ingresos del Mes"
          value={formatCurrency(ingresosDelMes.total)}
          subtitle={`${ingresosDelMes.cantidadPagos} pagos recibidos`}
          icon={<FaChartLine />}
          color="text-green-600"
          isExpandable={false}
        />
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <FaChartLine />
            <p className="text-sm font-medium">
              Total de clientes activos: {resumen.totalClientesActivos}
            </p>
          </div>
          {metrics.fechaActualizacion && (
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Última actualización: {new Date(metrics.fechaActualizacion).toLocaleString('es-MX')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
