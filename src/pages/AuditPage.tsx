import { useEffect, useMemo, useState } from "react";
import {
  RiAlarmWarningLine,
  RiHistoryLine,
  RiShieldKeyholeLine,
  RiUserLine,
  RiSendPlaneFill,
  RiCloseCircleLine,
} from "react-icons/ri";
import {
  AuditSource,
  IAuditSummary,
  IUnifiedAuditEntry,
  getAuditSummaryAPI,
  listUnifiedAuditAPI,
} from "../services/audit.service";

const sourceMeta: Record<AuditSource, { label: string; color: string }> = {
  clients: { label: "Clientes", color: "bg-blue-100 text-blue-700" },
  alerts: { label: "Alertas", color: "bg-red-100 text-red-700" },
  access: { label: "Accesos", color: "bg-purple-100 text-purple-700" },
};

const allSources: AuditSource[] = ["clients", "alerts", "access"];

export const AuditPage = () => {
  const [summary, setSummary] = useState<IAuditSummary | null>(null);
  const [rows, setRows] = useState<IUnifiedAuditEntry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const [sources, setSources] = useState<AuditSource[]>(allSources);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [actionType, setActionType] = useState<string>("");
  const [offset, setOffset] = useState<number>(0);
  const limit = 50;

  const load = async () => {
    setLoading(true);
    try {
      const r = await listUnifiedAuditAPI({
        source: sources.join(","),
        from: from || undefined,
        to: to || undefined,
        action_type: actionType || undefined,
        limit,
        offset,
      });
      setRows(r.data || []);
      setTotal(r.total || 0);
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const r = await getAuditSummaryAPI({
        from: from || undefined,
        to: to || undefined,
      });
      setSummary(r.data || null);
    } catch {
      setSummary(null);
    }
  };

  useEffect(() => {
    setOffset(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources, from, to, actionType]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources, from, to, actionType, offset]);

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const toggleSource = (s: AuditSource) => {
    setSources((prev) =>
      prev.includes(s) ? (prev.length > 1 ? prev.filter((x) => x !== s) : prev) : [...prev, s],
    );
  };

  const maxDayCount = useMemo(
    () =>
      summary?.per_day.reduce(
        (acc, d) => Math.max(acc, parseInt(d.events, 10) || 0),
        0,
      ) || 1,
    [summary],
  );

  const pageEnd = Math.min(offset + limit, total);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold app-text flex items-center gap-2">
          <RiHistoryLine /> Auditoría
        </h1>
        <p className="text-sm text-gray-500">
          Vista consolidada de cambios en clientes, alertas e intentos de acceso.
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi
          icon={<RiUserLine />}
          label="Cambios en clientes"
          value={summary?.totals.clients ?? "—"}
          color="bg-blue-50 text-blue-700"
        />
        <Kpi
          icon={<RiAlarmWarningLine />}
          label="Cambios en alertas"
          value={summary?.totals.alerts ?? "—"}
          color="bg-red-50 text-red-700"
        />
        <Kpi
          icon={<RiShieldKeyholeLine />}
          label="Intentos de acceso"
          value={summary?.totals.access ?? "—"}
          color="bg-purple-50 text-purple-700"
        />
        <Kpi
          icon={<RiCloseCircleLine />}
          label="Accesos denegados"
          value={summary?.totals.access_denied ?? "—"}
          color="bg-orange-50 text-orange-700"
        />
        <Kpi
          icon={<RiSendPlaneFill />}
          label="Alertas reportadas"
          value={summary?.totals.alerts_reported ?? "—"}
          color="bg-green-50 text-green-700"
        />
      </div>

      {/* Top users + per day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="app-bg app-text rounded-lg border app-border3 p-4">
          <h2 className="font-semibold text-sm mb-2">Top usuarios por actividad</h2>
          {!summary?.top_users?.length ? (
            <p className="text-xs text-gray-500">Sin datos en el rango.</p>
          ) : (
            <ul className="space-y-2">
              {summary.top_users.map((u, i) => {
                const max = Math.max(
                  ...summary.top_users.map((x) => parseInt(x.events, 10) || 0),
                );
                const pct = ((parseInt(u.events, 10) || 0) / max) * 100;
                return (
                  <li key={u.user_id ?? i} className="text-xs">
                    <div className="flex justify-between mb-0.5">
                      <span>{u.name || "Sistema / sin usuario"}</span>
                      <span className="text-gray-500">{u.events} eventos</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1A3B8F] rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="app-bg app-text rounded-lg border app-border3 p-4">
          <h2 className="font-semibold text-sm mb-2">Eventos por día (últimos 30)</h2>
          {!summary?.per_day?.length ? (
            <p className="text-xs text-gray-500">Sin datos en el rango.</p>
          ) : (
            <div className="flex items-end gap-1 h-24">
              {[...summary.per_day].reverse().map((d) => {
                const count = parseInt(d.events, 10) || 0;
                const h = (count / maxDayCount) * 100;
                return (
                  <div
                    key={d.day}
                    title={`${new Date(d.day).toLocaleDateString("es-MX")}: ${count} eventos`}
                    className="flex-1 bg-[#1A3B8F]/80 rounded-t hover:bg-[#1A3B8F] transition cursor-help"
                    style={{ height: `${Math.max(h, 4)}%` }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="app-bg app-text rounded-lg border app-border3 p-3 flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-[10px] font-medium text-gray-500">Fuentes</label>
          <div className="flex gap-1">
            {allSources.map((s) => (
              <button
                key={s}
                onClick={() => toggleSource(s)}
                className={[
                  "px-3 py-1.5 rounded text-xs font-medium border transition",
                  sources.includes(s)
                    ? sourceMeta[s].color + " border-current"
                    : "bg-gray-50 text-gray-500 border-gray-200",
                ].join(" ")}
              >
                {sourceMeta[s].label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-[10px] font-medium text-gray-500">
            Acción (action_type)
          </label>
          <input
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            placeholder="CREATE, UPDATE, REPORT, success…"
            className="w-full h-[36px] border border-gray-300 rounded px-2 text-sm focus:outline-none focus:border-[#1A3B8F]"
          />
        </div>
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
      </div>

      {/* Feed */}
      <div className="app-bg app-text rounded-lg border app-border3 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold app-text">Feed consolidado</h2>
          <span className="text-xs text-gray-500">
            {total > 0 ? `${offset + 1}–${pageEnd} de ${total}` : "0 registros"}
          </span>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Cargando…</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No hay registros con los filtros actuales.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs">
                <tr>
                  <th className="text-left px-3 py-2">Fecha</th>
                  <th className="text-left px-3 py-2">Fuente</th>
                  <th className="text-left px-3 py-2">Acción</th>
                  <th className="text-left px-3 py-2">Usuario</th>
                  <th className="text-left px-3 py-2">Sujeto</th>
                  <th className="text-left px-3 py-2">Cambio</th>
                  <th className="text-left px-3 py-2">IP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={`${r.source}-${r.subject_id ?? "x"}-${r.created_at}-${i}`}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString("es-MX")}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${sourceMeta[r.source].color}`}
                      >
                        {sourceMeta[r.source].label}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.action_type}</td>
                    <td className="px-3 py-2 text-xs">{r.user_name ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">
                      {r.subject_label ?? "—"}
                      {r.subject_id && (
                        <span className="text-gray-400"> #{r.subject_id}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs max-w-[280px]">
                      {r.field_name ? (
                        <>
                          <span className="text-gray-500">{r.field_name}:</span>{" "}
                          <span className="line-through text-gray-500">
                            {r.old_value || "—"}
                          </span>{" "}
                          → <span className="text-gray-900">{r.new_value || "—"}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">{r.new_value || ""}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.ip_address ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Paginación */}
            {total > limit && (
              <div className="px-4 py-2 border-t bg-gray-50 flex justify-between items-center text-xs">
                <button
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - limit))}
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Anteriores
                </button>
                <span className="text-gray-500">
                  Página {Math.floor(offset / limit) + 1} de{" "}
                  {Math.ceil(total / limit)}
                </span>
                <button
                  disabled={pageEnd >= total}
                  onClick={() => setOffset(offset + limit)}
                  className="px-3 py-1 rounded border border-gray-300 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguientes →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface KpiProps {
  icon: JSX.Element;
  label: string;
  value: number | string;
  color: string;
}

const Kpi = ({ icon, label, value, color }: KpiProps) => (
  <div className={`${color} rounded-lg border border-gray-200 p-3 flex items-center gap-3`}>
    <div className="text-xl">{icon}</div>
    <div>
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="text-[11px] mt-1 opacity-80">{label}</div>
    </div>
  </div>
);
