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
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);

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
  
  const pagosAcumuladosAnio = metrics.pagosAcumuladosAnio || {};
  
  const totalAcumuladoHistorico = metrics.totalAcumuladoHistorico || {
    total: 0,
    cantidadPagos: 0,
  };
  
  const resumen = metrics.resumen || {
    totalClientesActivos: 0,
    adeudoTotalPendiente: 0,
    totalPendientesInstalacion: 0,
    totalPendientesAudiencia: 0,
    totalPendientesAprobacion: 0,
  };
  
  const clientesMayorAdeudo = metrics.clientesMayorAdeudo || [];
  const contratosVencidosDetalle = metrics.contratosVencidosDetalle || [];
  const contratosProximosVencer = metrics.contratosProximosVencer || [];
  const clientesPorBrazalete = metrics.clientesPorBrazalete || [];
  const clientesPorTipoVenta = metrics.clientesPorTipoVenta || { Contado: 0, Crédito: 0 };

  return (
    <div className="space-y-6">
      {/* Header con botón de colapsar */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
      >
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          onClick={() => setIsDashboardExpanded(!isDashboardExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                📊 Dashboard Administrativo
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({isDashboardExpanded ? 'Click para ocultar' : 'Click para expandir'})
              </span>
            </div>
            <div className="flex items-center gap-4">
              {metrics?.fechaActualizacion && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Última actualización: {new Date(metrics.fechaActualizacion).toLocaleString('es-MX')}
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchMetrics();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Actualizar
              </button>
              {isDashboardExpanded ? (
                <FaChevronUp className="text-2xl text-gray-600 dark:text-gray-400" />
              ) : (
                <FaChevronDown className="text-2xl text-gray-600 dark:text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {/* Vista previa compacta cuando está colapsado */}
        {!isDashboardExpanded && (
          <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {/* Mini card - Pagos Pendientes */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                <FaMoneyBillWave className="mx-auto text-yellow-600 dark:text-yellow-400 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                  {pagosPendientes.cantidad}
                </p>
              </div>

              {/* Mini card - Pagos Vencidos */}
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                <FaExclamationTriangle className="mx-auto text-red-600 dark:text-red-400 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Vencidos</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {pagosVencidos.cantidad}
                </p>
              </div>

              {/* Mini card - Contratos Vencidos */}
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                <FaCalendarAlt className="mx-auto text-orange-600 dark:text-orange-400 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">C. Vencidos</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {contratosPorVencer.vencidos}
                </p>
              </div>

              {/* Mini card - Ingresos del Mes */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <FaChartLine className="mx-auto text-green-600 dark:text-green-400 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Ing. Mes</p>
                <p className="text-xs font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(ingresosDelMes.total)}
                </p>
              </div>

              {/* Mini card - Pendientes Instalación */}
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                <FaCalendarAlt className="mx-auto text-orange-600 dark:text-orange-400 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">P. Install.</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {resumen.totalPendientesInstalacion || 0}
                </p>
              </div>

              {/* Mini card - Pendientes Audiencia */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                <FaCalendarAlt className="mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">P. Audiencia</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {resumen.totalPendientesAudiencia || 0}
                </p>
              </div>

              {/* Mini card - Pendientes Aprobación */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
                <FaExclamationTriangle className="mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">P. Aprob.</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {resumen.totalPendientesAprobacion || 0}
                </p>
              </div>

              {/* Mini card - Pagos Acumulados Histórico */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center">
                <FaChartLine className="mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Histórico</p>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalAcumuladoHistorico.total)}
                </p>
              </div>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
              👆 Click arriba para ver detalles completos
            </p>
          </div>
        )}
      </div>

      {/* Contenido colapsable */}
      {isDashboardExpanded && (
        <div className="space-y-6 animate-fadeIn">
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

      {/* Segunda fila de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pendientes de Instalación */}
        <DashboardCard
          title="Pendientes de Instalación"
          value={resumen.totalPendientesInstalacion || 0}
          subtitle="Clientes sin colocación"
          icon={<FaCalendarAlt />}
          color="text-orange-600"
          isExpandable={false}
        />

        {/* Pendientes de Audiencia */}
        <DashboardCard
          title="Pendientes de Audiencia"
          value={resumen.totalPendientesAudiencia || 0}
          subtitle="Audiencias programadas"
          icon={<FaCalendarAlt />}
          color="text-purple-600"
          isExpandable={false}
        />

        {/* Pendientes de Aprobación */}
        <DashboardCard
          title="Pendientes de Aprobación"
          value={resumen.totalPendientesAprobacion || 0}
          subtitle="Prospectos en espera"
          icon={<FaExclamationTriangle />}
          color="text-amber-600"
          isExpandable={false}
        />

        {/* Pagos Acumulados del Año */}
        <DashboardCard
          title="Total Acumulado Histórico"
          value={formatCurrency(totalAcumuladoHistorico.total)}
          subtitle={`${totalAcumuladoHistorico.cantidadPagos} pagos totales`}
          icon={<FaChartLine />}
          color="text-emerald-600"
          isExpandable={false}
        />
      </div>

      {/* Tercera fila - Pagos por año */}
      {Object.keys(pagosAcumuladosAnio).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            Pagos Acumulados por Año
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(pagosAcumuladosAnio)
              .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
              .map(([year, data]: [string, any]) => (
                <div key={year} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      📅 {year}
                    </p>
                    <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
                      {data.cantidadPagos} pagos
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(data.total)}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Clientes por tipo de brazalete */}
      {clientesPorBrazalete && clientesPorBrazalete.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
            Clientes por Tipo de Brazalete
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clientesPorBrazalete.map((item: any, index: number) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.tipoBrazalete}</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{item.total}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clientes por tipo de venta */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
          Clientes por Tipo de Venta
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
            <p className="text-sm text-green-700 dark:text-green-300">Contado</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {clientesPorTipoVenta.Contado || 0}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">Crédito</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {clientesPorTipoVenta.Crédito || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Resumen de clientes activos */}
      <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <FaChartLine />
          <p className="text-sm font-medium">
            Total de clientes activos: {resumen.totalClientesActivos}
          </p>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};
