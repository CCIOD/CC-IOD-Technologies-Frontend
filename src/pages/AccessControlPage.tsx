import { Fragment, useEffect, useState } from "react";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiFingerprintLine,
  RiHistoryLine,
  RiShieldKeyholeLine,
  RiSmartphoneLine,
  RiTeamLine,
} from "react-icons/ri";
import { getOrCreateDeviceToken } from "../utils/deviceToken";
import { alertTimer, confirmChange } from "../utils/alerts";
import { ApiResponse } from "../interfaces/interfaces";
import {
  createDeviceAPI,
  createIpWhitelistAPI,
  deleteDeviceAPI,
  deleteIpWhitelistAPI,
  IAccessAttempt,
  IAuthorizedDevice,
  IIpWhitelist,
  IMonitoristaReportRow,
  IMonitoristaSession,
  listAttemptsAPI,
  listDevicesAPI,
  listIpWhitelistAPI,
  listMonitoristaSessionsAPI,
  listMonitoristasReportAPI,
  updateDeviceAPI,
  updateIpWhitelistAPI,
} from "../services/accessControl.service";

type Tab = "ips" | "devices" | "attempts" | "monitoristas";

const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
  { id: "monitoristas", label: "Monitoristas", icon: <RiTeamLine /> },
  { id: "ips", label: "IPs autorizadas", icon: <RiShieldKeyholeLine /> },
  { id: "devices", label: "Dispositivos", icon: <RiSmartphoneLine /> },
  { id: "attempts", label: "Intentos de acceso", icon: <RiHistoryLine /> },
];

const outcomeStyles: Record<string, string> = {
  success: "bg-green-50 text-green-700 border-green-200",
  denied_password: "bg-red-50 text-red-700 border-red-200",
  denied_pin: "bg-red-50 text-red-700 border-red-200",
  denied_ip: "bg-orange-50 text-orange-700 border-orange-200",
  denied_device: "bg-orange-50 text-orange-700 border-orange-200",
  denied_user: "bg-gray-50 text-gray-700 border-gray-200",
  denied_webauthn: "bg-red-50 text-red-700 border-red-200",
};

export const AccessControlPage = () => {
  const [tab, setTab] = useState<Tab>("monitoristas");

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold app-text">Control de Acceso</h1>
        <p className="text-sm text-gray-500">
          Restringe el inicio de sesión por IP, dispositivo autorizado y revisa
          los intentos registrados.
        </p>
      </header>

      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              "px-4 py-2 -mb-px border-b-2 text-sm font-medium flex items-center gap-2 transition",
              tab === t.id
                ? "border-[#1A3B8F] text-[#1A3B8F]"
                : "border-transparent text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "monitoristas" && <MonitoristasReportTab />}
      {tab === "ips" && <IpWhitelistTab />}
      {tab === "devices" && <DevicesTab />}
      {tab === "attempts" && <AttemptsTab />}
    </div>
  );
};

// =============================================================================
// Reporte agregado por monitorista
// =============================================================================

/**
 * Devuelve un string humano del tipo "hace 2h 15m" o "hace 3 días".
 * Devuelve "Nunca" si el timestamp es null.
 */
const timeSince = (iso: string | null): string => {
  if (!iso) return "Nunca";
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 0) return "Justo ahora";
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `Hace ${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `Hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `Hace ${hr}h ${min % 60}m`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `Hace ${days} día${days !== 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Hace ${months} mes${months !== 1 ? "es" : ""}`;
  const years = Math.floor(days / 365);
  return `Hace ${years} año${years !== 1 ? "s" : ""}`;
};

const methodLabel = (m: string | null): string => {
  if (!m) return "—";
  if (m === "password") return "Contraseña";
  if (m === "pin") return "PIN";
  if (m === "webauthn") return "Huella";
  return m;
};

const MonitoristasReportTab = () => {
  const [rows, setRows] = useState<IMonitoristaReportRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  // tick interno para refrescar el "tiempo desde" cada minuto sin pegar al backend
  const [, setTick] = useState<number>(0);
  // Cache de sesiones por user_id (lazy load al expandir)
  const [sessions, setSessions] = useState<Record<number, IMonitoristaSession[]>>({});
  const [sessionsLoading, setSessionsLoading] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await listMonitoristasReportAPI({
        from: from || undefined,
        to: to || undefined,
      });
      setRows(r.data || []);
      // Limpia cache de sesiones si cambia el rango
      setSessions({});
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const loadSessions = async (userId: number) => {
    if (sessions[userId]) return; // ya cargado
    setSessionsLoading((p) => ({ ...p, [userId]: true }));
    try {
      const r = await listMonitoristaSessionsAPI(userId, {
        from: from || undefined,
        to: to || undefined,
        limit: 100,
      });
      setSessions((p) => ({ ...p, [userId]: r.data || [] }));
    } catch {
      setSessions((p) => ({ ...p, [userId]: [] }));
    } finally {
      setSessionsLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  const toggleExpand = (userId: number) => {
    if (expanded === userId) {
      setExpanded(null);
    } else {
      setExpanded(userId);
      loadSessions(userId);
    }
  };

  const activeNow = rows.filter(
    (r) =>
      r.last_login_at &&
      Date.now() - new Date(r.last_login_at).getTime() < 60 * 60 * 1000,
  ).length;
  const totalLogins = rows.reduce((acc, r) => acc + r.total_logins, 0);
  const totalFailed = rows.reduce((acc, r) => acc + r.failed_in_range, 0);

  const rangeLabel = from || to ? "(rango seleccionado)" : "(histórico)";

  return (
    <div className="space-y-3">
      {/* Filtros de fecha */}
      <div className="app-bg2 rounded-lg border border-gray-200 p-3 flex flex-wrap items-end gap-2">
        <div>
          <label className="block text-[10px] font-medium text-gray-500">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-[36px] border border-gray-300 rounded px-2 text-sm focus:outline-none focus:border-[#1A3B8F]"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500">Hasta</label>
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
            className="h-[36px] border border-gray-300 rounded px-2 text-sm focus:outline-none focus:border-[#1A3B8F]"
          />
        </div>
        {(from || to) && (
          <button
            type="button"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
            className="h-[36px] text-xs text-gray-600 hover:text-gray-900 px-2"
          >
            Limpiar filtros
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={load}
          className="h-[36px] text-xs text-[#1A3B8F] border border-[#1A3B8F] rounded px-3 hover:bg-[#1A3B8F] hover:text-white"
          type="button"
        >
          Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Kpi label="Monitoristas" value={rows.length} color="bg-blue-50 text-blue-700" />
        <Kpi
          label="Activos (última hora)"
          value={activeNow}
          color="bg-green-50 text-green-700"
        />
        <Kpi
          label={`Logins ${rangeLabel}`}
          value={totalLogins}
          color="bg-gray-50 text-gray-700"
        />
        <Kpi
          label={`Fallidos ${rangeLabel}`}
          value={totalFailed}
          color="bg-red-50 text-red-700"
        />
      </div>

      <div className="app-bg2 rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold app-text">Reporte de monitoristas</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Click en una fila para ver sus sesiones individuales.
          </p>
        </div>
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Cargando…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No hay usuarios con rol Monitorista registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs">
                <tr>
                  <th className="px-2 py-2 w-6"></th>
                  <th className="text-left px-3 py-2">Monitorista</th>
                  <th className="text-left px-3 py-2">Último inicio</th>
                  <th className="text-left px-3 py-2">Desde el último</th>
                  <th className="text-left px-3 py-2">Método</th>
                  <th className="text-left px-3 py-2">IP</th>
                  <th className="text-center px-3 py-2">Logins</th>
                  <th className="text-center px-3 py-2">Fallidos</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isRecent =
                    r.last_login_at &&
                    Date.now() - new Date(r.last_login_at).getTime() <
                      60 * 60 * 1000;
                  const isOpen = expanded === r.user_id;
                  return (
                    <Fragment key={r.user_id}>
                      <tr
                        onClick={() => toggleExpand(r.user_id)}
                        className={[
                          "border-t border-gray-100 hover:bg-gray-50 cursor-pointer",
                          isOpen ? "bg-blue-50/50" : "",
                        ].join(" ")}
                      >
                        <td className="px-2 py-2 text-gray-400">
                          {isOpen ? <RiArrowDownSLine /> : <RiArrowRightSLine />}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {isRecent && (
                              <span
                                className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                                title="Activo en la última hora"
                              />
                            )}
                            <div>
                              <div className="font-medium">{r.name}</div>
                              <div className="text-[10px] text-gray-500">
                                {r.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {r.last_login_at ? (
                            new Date(r.last_login_at).toLocaleString("es-MX")
                          ) : (
                            <span className="text-gray-400">Nunca</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <span
                            className={
                              isRecent ? "text-green-700 font-medium" : "text-gray-600"
                            }
                          >
                            {timeSince(r.last_login_at)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {methodLabel(r.last_method)}
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px]">
                          {r.last_ip ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-center">{r.total_logins}</td>
                        <td className="px-3 py-2 text-center">
                          {r.failed_in_range > 0 ? (
                            <span className="text-red-700 font-medium">
                              {r.failed_in_range}
                            </span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-blue-50/20">
                          <td colSpan={8} className="px-4 py-3">
                            <SessionsDetail
                              loading={!!sessionsLoading[r.user_id]}
                              sessions={sessions[r.user_id] ?? []}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

interface SessionsDetailProps {
  loading: boolean;
  sessions: IMonitoristaSession[];
}

const SessionsDetail = ({ loading, sessions }: SessionsDetailProps) => {
  if (loading) {
    return <div className="text-xs text-gray-500">Cargando sesiones…</div>;
  }
  if (sessions.length === 0) {
    return (
      <div className="text-xs text-gray-500 italic">
        Este monitorista no tiene sesiones registradas en el rango seleccionado.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-gray-600">
          <tr>
            <th className="text-left px-2 py-1">Fecha</th>
            <th className="text-left px-2 py-1">Método</th>
            <th className="text-left px-2 py-1">Resultado</th>
            <th className="text-left px-2 py-1">IP</th>
            <th className="text-left px-2 py-1">Dispositivo</th>
            <th className="text-left px-2 py-1">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.attempt_id} className="border-t border-blue-100">
              <td className="px-2 py-1 whitespace-nowrap">
                {new Date(s.attempted_at).toLocaleString("es-MX")}
              </td>
              <td className="px-2 py-1">{methodLabel(s.method)}</td>
              <td className="px-2 py-1">
                <span
                  className={[
                    "inline-block border rounded-full px-2 py-0.5 text-[10px]",
                    outcomeStyles[s.outcome] ||
                      "bg-gray-50 text-gray-600 border-gray-200",
                  ].join(" ")}
                >
                  {s.outcome}
                </span>
              </td>
              <td className="px-2 py-1 font-mono">{s.ip_address ?? "—"}</td>
              <td className="px-2 py-1 font-mono text-[10px] truncate max-w-[140px]">
                {s.device_token ?? "—"}
              </td>
              <td className="px-2 py-1 max-w-[220px] truncate">
                {s.failure_reason ?? ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface KpiProps {
  label: string;
  value: number;
  color: string;
}

const Kpi = ({ label, value, color }: KpiProps) => (
  <div
    className={`rounded-lg border border-gray-200 p-3 ${color}`}
  >
    <div className="text-2xl font-bold leading-none">{value}</div>
    <div className="text-[11px] mt-1 opacity-80">{label}</div>
  </div>
);

// =============================================================================
// IP Whitelist
// =============================================================================

const IpWhitelistTab = () => {
  const [rows, setRows] = useState<IIpWhitelist[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editing, setEditing] = useState<IIpWhitelist | null>(null);
  const [form, setForm] = useState<{ cidr: string; label: string; is_active: boolean }>({
    cidr: "",
    label: "",
    is_active: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const r = await listIpWhitelistAPI();
      setRows(r.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ cidr: "", label: "", is_active: true });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateIpWhitelistAPI(editing.ip_whitelist_id, form);
        alertTimer("IP actualizada", "success");
      } else {
        await createIpWhitelistAPI(form);
        alertTimer("IP agregada a la lista blanca", "success");
      }
      resetForm();
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al guardar", "error");
    }
  };

  const remove = async (row: IIpWhitelist) => {
    const c = await confirmChange({
      title: "Eliminar IP",
      text: `Se eliminará ${row.cidr} (${row.label}). El acceso desde ese rango quedará bloqueado.`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    if (!c.success) return;
    try {
      await deleteIpWhitelistAPI(row.ip_whitelist_id);
      alertTimer("Entrada eliminada", "success");
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al eliminar", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <form
        onSubmit={submit}
        className="lg:col-span-1 app-bg2 rounded-lg border border-gray-200 p-4 space-y-3"
      >
        <h2 className="font-semibold app-text">
          {editing ? `Editar IP #${editing.ip_whitelist_id}` : "Agregar IP"}
        </h2>
        <div>
          <label className="text-xs font-medium text-gray-600">CIDR</label>
          <input
            required
            value={form.cidr}
            onChange={(e) => setForm({ ...form, cidr: e.target.value })}
            placeholder="192.168.1.0/24 o 203.0.113.5/32"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1A3B8F]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Etiqueta</label>
          <input
            required
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Centro de monitoreo - Oficina central"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1A3B8F]"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Activa
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-[#1A3B8F] text-white text-sm font-semibold py-2 rounded hover:bg-[#0F2660]"
          >
            {editing ? "Guardar cambios" : "Agregar"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="lg:col-span-2 app-bg2 rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold app-text">Lista blanca</h2>
          <span className="text-xs text-gray-500">{rows.length} entradas</span>
        </div>
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Cargando…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No hay IPs autorizadas. Agrega la primera para empezar a restringir
            el acceso del rol Monitorista.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2">CIDR</th>
                <th className="text-left px-4 py-2">Etiqueta</th>
                <th className="text-left px-4 py-2">Estado</th>
                <th className="text-right px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ip_whitelist_id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-mono">{r.cidr}</td>
                  <td className="px-4 py-2">{r.label}</td>
                  <td className="px-4 py-2">
                    {r.is_active ? (
                      <span className="text-green-700 text-xs">Activa</span>
                    ) : (
                      <span className="text-gray-500 text-xs">Inactiva</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => {
                        setEditing(r);
                        setForm({
                          cidr: r.cidr,
                          label: r.label,
                          is_active: r.is_active,
                        });
                      }}
                      className="text-gray-500 hover:text-[#1A3B8F] p-1"
                      title="Editar"
                    >
                      <RiEdit2Line />
                    </button>
                    <button
                      onClick={() => remove(r)}
                      className="text-gray-500 hover:text-red-600 p-1"
                      title="Eliminar"
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// Devices
// =============================================================================

const DevicesTab = () => {
  const [rows, setRows] = useState<IAuthorizedDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editing, setEditing] = useState<IAuthorizedDevice | null>(null);
  const [form, setForm] = useState<{
    device_token: string;
    label: string;
    is_active: boolean;
  }>({
    device_token: "",
    label: "",
    is_active: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const r = await listDevicesAPI();
      setRows(r.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ device_token: "", label: "", is_active: true });
  };

  const prefillFromThisDevice = () => {
    const token = getOrCreateDeviceToken();
    const browser = (navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge)/) || [
      "Browser",
    ])[0];
    setEditing(null);
    setForm({
      device_token: token,
      label: `Este equipo (${browser})`,
      is_active: true,
    });
    alertTimer(
      "Token de este equipo cargado en el formulario. Revisa la etiqueta y guarda.",
      "info",
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateDeviceAPI(editing.device_id, form);
        alertTimer("Dispositivo actualizado", "success");
      } else {
        await createDeviceAPI(form);
        alertTimer("Dispositivo autorizado", "success");
      }
      resetForm();
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al guardar", "error");
    }
  };

  const remove = async (row: IAuthorizedDevice) => {
    const c = await confirmChange({
      title: "Eliminar dispositivo",
      text: `Se desautorizará el dispositivo "${row.label}".`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    if (!c.success) return;
    try {
      await deleteDeviceAPI(row.device_id);
      alertTimer("Dispositivo eliminado", "success");
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al eliminar", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <form
        onSubmit={submit}
        className="lg:col-span-1 app-bg2 rounded-lg border border-gray-200 p-4 space-y-3"
      >
        <h2 className="font-semibold app-text">
          {editing ? `Editar dispositivo #${editing.device_id}` : "Agregar dispositivo"}
        </h2>
        {!editing && (
          <button
            type="button"
            onClick={prefillFromThisDevice}
            className="w-full inline-flex items-center justify-center gap-1.5 border border-[#1A3B8F] text-[#1A3B8F] text-xs font-semibold px-3 py-1.5 rounded hover:bg-[#1A3B8F] hover:text-white"
            title="Carga el token del navegador actual en el formulario"
          >
            <RiFingerprintLine /> Registrar este equipo
          </button>
        )}
        <div>
          <label className="text-xs font-medium text-gray-600">device_token</label>
          <input
            required
            value={form.device_token}
            onChange={(e) => setForm({ ...form, device_token: e.target.value })}
            placeholder="Identificador único del equipo"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#1A3B8F]"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            El equipo enviará este token en el header X-Device-Id.
          </p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Etiqueta</label>
          <input
            required
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="PC Monitoreo 03"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1A3B8F]"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          />
          Activo
        </label>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-[#1A3B8F] text-white text-sm font-semibold py-2 rounded hover:bg-[#0F2660]"
          >
            {editing ? "Guardar cambios" : (
              <span className="inline-flex items-center gap-1 justify-center">
                <RiAddLine /> Agregar
              </span>
            )}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="lg:col-span-2 app-bg2 rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold app-text">Dispositivos autorizados</h2>
          <span className="text-xs text-gray-500">{rows.length} dispositivos</span>
        </div>
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Cargando…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No hay dispositivos registrados.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-2">Etiqueta</th>
                <th className="text-left px-4 py-2">Token</th>
                <th className="text-left px-4 py-2">Estado</th>
                <th className="text-right px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.device_id} className="border-t border-gray-100">
                  <td className="px-4 py-2">{r.label}</td>
                  <td className="px-4 py-2 font-mono text-xs truncate max-w-[180px]">
                    {r.device_token}
                  </td>
                  <td className="px-4 py-2">
                    {r.is_active ? (
                      <span className="text-green-700 text-xs">Activo</span>
                    ) : (
                      <span className="text-gray-500 text-xs">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => {
                        setEditing(r);
                        setForm({
                          device_token: r.device_token,
                          label: r.label,
                          is_active: r.is_active,
                        });
                      }}
                      className="text-gray-500 hover:text-[#1A3B8F] p-1"
                      title="Editar"
                    >
                      <RiEdit2Line />
                    </button>
                    <button
                      onClick={() => remove(r)}
                      className="text-gray-500 hover:text-red-600 p-1"
                      title="Eliminar"
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// Attempts (read-only)
// =============================================================================

const AttemptsTab = () => {
  const [rows, setRows] = useState<IAccessAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<{ outcome: string; method: string }>({
    outcome: "",
    method: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const r = await listAttemptsAPI({
        outcome: filter.outcome || undefined,
        method: filter.method || undefined,
        limit: 200,
      });
      setRows(r.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.outcome, filter.method]);

  return (
    <div className="app-bg2 rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap gap-2 items-center">
        <h2 className="font-semibold app-text flex-1">Intentos registrados</h2>
        <select
          value={filter.outcome}
          onChange={(e) => setFilter({ ...filter, outcome: e.target.value })}
          className="border border-gray-300 rounded px-2 py-1 text-xs"
        >
          <option value="">Todos los resultados</option>
          <option value="success">Éxito</option>
          <option value="denied_password">Contraseña incorrecta</option>
          <option value="denied_pin">PIN incorrecto</option>
          <option value="denied_ip">IP no autorizada</option>
          <option value="denied_device">Dispositivo no autorizado</option>
          <option value="denied_user">Usuario no encontrado</option>
          <option value="denied_webauthn">WebAuthn fallido</option>
        </select>
        <select
          value={filter.method}
          onChange={(e) => setFilter({ ...filter, method: e.target.value })}
          className="border border-gray-300 rounded px-2 py-1 text-xs"
        >
          <option value="">Todos los métodos</option>
          <option value="password">Contraseña</option>
          <option value="pin">PIN</option>
          <option value="webauthn">WebAuthn</option>
        </select>
      </div>
      {loading ? (
        <div className="p-4 text-sm text-gray-500">Cargando…</div>
      ) : rows.length === 0 ? (
        <div className="p-6 text-center text-sm text-gray-500">
          No hay intentos registrados con esos filtros.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">Fecha</th>
                <th className="text-left px-3 py-2">Usuario</th>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">IP</th>
                <th className="text-left px-3 py-2">Método</th>
                <th className="text-left px-3 py-2">Resultado</th>
                <th className="text-left px-3 py-2">Motivo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.attempt_id} className="border-t border-gray-100">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(r.attempted_at).toLocaleString("es-MX")}
                  </td>
                  <td className="px-3 py-2">{r.user_name ?? "—"}</td>
                  <td className="px-3 py-2">{r.email ?? "—"}</td>
                  <td className="px-3 py-2 font-mono">{r.ip_address ?? "—"}</td>
                  <td className="px-3 py-2">{r.method}</td>
                  <td className="px-3 py-2">
                    <span
                      className={[
                        "inline-block border rounded-full px-2 py-0.5 text-[10px]",
                        outcomeStyles[r.outcome] ||
                          "bg-gray-50 text-gray-600 border-gray-200",
                      ].join(" ")}
                    >
                      {r.outcome}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-[280px] truncate">
                    {r.failure_reason ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
