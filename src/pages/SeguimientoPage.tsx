import { useEffect, useMemo, useState } from "react";
import {
  RiAlarmWarningLine,
  RiCheckLine,
  RiEyeLine,
  RiGridLine,
  RiListUnordered,
  RiPhoneLine,
  RiRadarLine,
  RiSearchLine,
  RiUserLocationLine,
} from "react-icons/ri";
import { DataRowCarriers } from "../interfaces/carriers.interface";
import { TClientStatus } from "../interfaces/clients.interface";
import { getAllData } from "../services/api.service";
import { listAlertsAPI } from "../services/alerts.service";
import { IAlert } from "../interfaces/alerts.interface";
import { Modal } from "../components/generic/Modal";
import { ApiResponse } from "../interfaces/interfaces";
import { alertTimer } from "../utils/alerts";

type Tab = "todos" | "alertados" | "activos" | "suspendidos";
type View = "table" | "cards";

const tabs: { id: Tab; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "alertados", label: "Con alertas" },
  { id: "activos", label: "Activos" },
  { id: "suspendidos", label: "Suspendidos" },
];

const statusBadge = (status?: TClientStatus) => {
  const normalized = status?.toLowerCase() ?? "";
  if (normalized === "colocado")
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
        Activo
      </span>
    );
  if (normalized === "desinstalado")
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
        Desinstalado
      </span>
    );
  if (normalized === "cancelado")
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
        Cancelado
      </span>
    );
  if (normalized.startsWith("pendiente"))
    return (
      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
        {status}
      </span>
    );
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
      {status || "—"}
    </span>
  );
};

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "??";
};

/**
 * El backend a veces devuelve information_emails / contact_numbers / observations
 * como string (CSV o JSON) en lugar de array. Normaliza a array siempre.
 */
const toArray = <T,>(val: unknown): T[] => {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === "string" && val.trim()) {
    // Intenta parsear como JSON; si falla, asume CSV.
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return val.split(",").map((s) => s.trim()).filter(Boolean) as unknown as T[];
    }
  }
  return [];
};

const normalizeCarrier = (c: DataRowCarriers): DataRowCarriers => ({
  ...c,
  information_emails: toArray<string>(c.information_emails),
  contact_numbers: toArray(c.contact_numbers),
  observations: toArray(c.observations),
});

export const SeguimientoPage = () => {
  const [carriers, setCarriers] = useState<DataRowCarriers[]>([]);
  const [alertsByCarrier, setAlertsByCarrier] = useState<Map<number, IAlert[]>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [tab, setTab] = useState<Tab>("todos");
  const [view, setView] = useState<View>("cards");
  const [search, setSearch] = useState<string>("");

  // Modal detalle
  const [detail, setDetail] = useState<DataRowCarriers | null>(null);
  const [detailAlerts, setDetailAlerts] = useState<IAlert[]>([]);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const [carriersRes, alertsRes] = await Promise.all([
        getAllData("carriers"),
        listAlertsAPI({ status: "activa" }),
      ]);
      const data: DataRowCarriers[] = (carriersRes.data || []).map(normalizeCarrier);
      setCarriers(data);

      const byCarrier = new Map<number, IAlert[]>();
      (alertsRes.data || []).forEach((a) => {
        if (a.carrier_id) {
          const arr = byCarrier.get(a.carrier_id) ?? [];
          arr.push(a);
          byCarrier.set(a.carrier_id, arr);
        }
      });
      setAlertsByCarrier(byCarrier);
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al cargar portadores", "error");
      setCarriers([]);
      setAlertsByCarrier(new Map());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const alertados = carriers.filter((c) => (alertsByCarrier.get(c.id) ?? []).length > 0).length;
    const activos = carriers.filter((c) => c.client_status?.toLowerCase() === "colocado").length;
    const suspendidos = carriers.filter((c) =>
      ["desinstalado", "cancelado"].includes((c.client_status ?? "").toLowerCase()),
    ).length;
    return { total: carriers.length, alertados, activos, suspendidos };
  }, [carriers, alertsByCarrier]);

  const filtered = useMemo(() => {
    let rows = carriers;
    if (tab === "alertados") {
      rows = rows.filter((c) => (alertsByCarrier.get(c.id) ?? []).length > 0);
    } else if (tab === "activos") {
      rows = rows.filter((c) => c.client_status?.toLowerCase() === "colocado");
    } else if (tab === "suspendidos") {
      rows = rows.filter((c) =>
        ["desinstalado", "cancelado"].includes((c.client_status ?? "").toLowerCase()),
      );
    }
    const term = search.trim().toLowerCase();
    if (term) {
      rows = rows.filter(
        (c) =>
          c.name?.toLowerCase().includes(term) ||
          c.electronic_bracelet?.toLowerCase().includes(term) ||
          c.residence_area?.toLowerCase().includes(term),
      );
    }
    return rows;
  }, [carriers, alertsByCarrier, tab, search]);

  const openDetail = async (row: DataRowCarriers) => {
    setDetail(normalizeCarrier(row));
    setIsOpenDetail(true);
    try {
      const r = await listAlertsAPI({ carrier_id: row.id });
      setDetailAlerts(r.data || []);
    } catch {
      setDetailAlerts([]);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <header className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold app-text flex items-center gap-2">
              <RiUserLocationLine /> Seguimiento de Portadores
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vista operativa con alertas en vivo. {counts.alertados > 0 && (
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {counts.alertados} portador(es) con alertas activas.
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-cciod-black-100 rounded p-0.5">
            <button
              onClick={() => setView("table")}
              className={[
                "px-2.5 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1",
                view === "table" ? "bg-white dark:bg-cciod-black-200 shadow text-[#1A3B8F] dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
              ].join(" ")}
            >
              <RiListUnordered /> Tabla
            </button>
            <button
              onClick={() => setView("cards")}
              className={[
                "px-2.5 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1",
                view === "cards" ? "bg-white dark:bg-cciod-black-200 shadow text-[#1A3B8F] dark:text-blue-400" : "text-gray-500 dark:text-gray-400",
              ].join(" ")}
            >
              <RiGridLine /> Tarjetas
            </button>
          </div>
        </header>

        {/* Tabs con counts */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 flex-wrap">
          {tabs.map((t) => {
            const count =
              t.id === "todos"
                ? counts.total
                : t.id === "alertados"
                  ? counts.alertados
                  : t.id === "activos"
                    ? counts.activos
                    : counts.suspendidos;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  "px-3 py-2 -mb-px border-b-2 text-sm font-medium transition",
                  tab === t.id
                    ? "border-[#1A3B8F] text-[#1A3B8F] dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
                ].join(" ")}
              >
                {t.label}{" "}
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nombre, brazalete, zona…"
            className="w-full pl-9 pr-3 h-[36px] border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400 app-bg app-text dark:placeholder:text-gray-500"
          />
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Cargando portadores…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400 app-bg app-text rounded-lg border app-border3">
            No hay portadores con los filtros actuales.
          </div>
        ) : view === "table" ? (
          <div className="app-bg app-text rounded-lg border app-border3 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-cciod-black-100 text-gray-600 dark:text-gray-300 text-xs">
                  <tr>
                    <th className="text-left px-3 py-2">Portador</th>
                    <th className="text-left px-3 py-2">Brazalete</th>
                    <th className="text-left px-3 py-2">Zona residencia</th>
                    <th className="text-left px-3 py-2">Estado</th>
                    <th className="text-center px-3 py-2">Alertas</th>
                    <th className="text-right px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const alerts = alertsByCarrier.get(c.id) ?? [];
                    return (
                      <tr key={c.id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-cciod-black-100/60">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#1A3B8F] to-[#2D52B0] text-white text-xs font-bold flex-center">
                              {initials(c.name)}
                            </div>
                            <div>
                              <div className="font-medium">{c.name}</div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                                Instalador: {c.installer_name || "—"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          {c.electronic_bracelet || "—"}
                        </td>
                        <td className="px-3 py-2 text-xs">{c.residence_area || "—"}</td>
                        <td className="px-3 py-2">{statusBadge(c.client_status)}</td>
                        <td className="px-3 py-2 text-center">
                          {alerts.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                              <RiAlarmWarningLine /> {alerts.length}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 text-xs">
                              <RiCheckLine /> OK
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => openDetail(c)}
                            className="text-gray-500 dark:text-gray-400 hover:text-[#1A3B8F] dark:hover:text-blue-400 p-1"
                            title="Ver detalle"
                          >
                            <RiEyeLine />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((c) => {
              const alerts = alertsByCarrier.get(c.id) ?? [];
              return (
                <button
                  key={c.id}
                  onClick={() => openDetail(c)}
                  className="text-left app-bg app-text rounded-lg border app-border3 p-3 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1A3B8F] to-[#2D52B0] text-white text-sm font-bold flex-center">
                      {initials(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {c.electronic_bracelet}
                      </div>
                    </div>
                    {alerts.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                        <RiAlarmWarningLine /> {alerts.length}
                      </span>
                    ) : (
                      <RiCheckLine className="text-green-600 dark:text-green-400" />
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <RiRadarLine /> {c.residence_area || "Sin zona"}
                    </div>
                    {c.contact_numbers?.[0] && (
                      <div className="flex items-center gap-1 truncate">
                        <RiPhoneLine />{" "}
                        {c.contact_numbers[0].contact_name}: {c.contact_numbers[0].phone_number}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    {statusBadge(c.client_status)}
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {c.placement_date ? `Colocado: ${c.placement_date}` : ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal detalle */}
      <Modal
        isOpen={isOpenDetail}
        toggleModal={setIsOpenDetail}
        title={detail ? `Detalle: ${detail.name}` : "Detalle"}
        size="lg"
        backdrop
        closeOnClickOutside
      >
        {detail && (
          <div className="space-y-4">
            <header className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1A3B8F] to-[#2D52B0] text-white text-lg font-bold flex-center">
                {initials(detail.name)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{detail.name}</h3>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Brazalete <span className="font-mono">{detail.electronic_bracelet}</span> ·
                  Beacon <span className="font-mono">{detail.beacon || "—"}</span>
                </div>
              </div>
              {statusBadge(detail.client_status)}
            </header>

            {/* Alertas activas asociadas */}
            <section>
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
                Alertas activas ({detailAlerts.filter((a) => a.status === "activa").length})
              </h4>
              {detailAlerts.length === 0 ? (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Sin alertas asociadas a este portador.
                </div>
              ) : (
                <ul className="space-y-1.5 max-h-[180px] overflow-auto">
                  {detailAlerts.map((a) => (
                    <li
                      key={a.alert_id}
                      className={[
                        "border rounded p-2 text-xs",
                        a.status === "activa"
                          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                          : "bg-gray-50 dark:bg-cciod-black-100 border-gray-200 dark:border-gray-700",
                      ].join(" ")}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">
                          {a.protocol_label || a.alert_type}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {new Date(a.activated_at).toLocaleString("es-MX")}
                        </span>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">{a.generated_message}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <h4 className="font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                  Información
                </h4>
                <dl className="space-y-0.5">
                  <Pair label="Zona de residencia" value={detail.residence_area} />
                  <Pair label="Cargador inalámbrico" value={detail.wireless_charger} />
                  <Pair
                    label="Colocación"
                    value={
                      detail.placement_date
                        ? `${detail.placement_date} ${detail.placement_time}`
                        : "—"
                    }
                  />
                  <Pair label="Instalador" value={detail.installer_name} />
                  <Pair label="Arraigo domiciliario" value={detail.house_arrest} />
                  <Pair label="Duración contrato" value={detail.contract_duration} />
                </dl>
              </div>
              <div>
                <h4 className="font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                  Contactos
                </h4>
                {detail.contact_numbers?.length ? (
                  <ul className="space-y-1">
                    {detail.contact_numbers.map((c, i) => (
                      <li key={i} className="flex justify-between">
                        <span>
                          {c.contact_name}
                          {c.relationship_name && (
                            <span className="text-gray-400 dark:text-gray-500"> · {c.relationship_name}</span>
                          )}
                        </span>
                        <span className="font-mono">{c.phone_number}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">Sin contactos</span>
                )}
                <h4 className="font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mt-3 mb-1">
                  Correos de información
                </h4>
                {detail.information_emails?.length ? (
                  <ul className="space-y-0.5">
                    {detail.information_emails.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">Sin correos</span>
                )}
              </div>
            </section>

            {detail.observations && detail.observations.length > 0 && (
              <section>
                <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
                  Observaciones
                </h4>
                <ul className="space-y-1 max-h-[140px] overflow-auto">
                  {detail.observations.map((o, i) => (
                    <li
                      key={i}
                      className="text-xs border-l-2 border-gray-200 dark:border-gray-700 pl-2"
                    >
                      <div className="text-gray-500 dark:text-gray-400">
                        {o.date && new Date(o.date).toLocaleDateString("es-MX")}
                      </div>
                      <div>{o.observation}</div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

const Pair = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex justify-between gap-2">
    <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="text-right">{value || <span className="text-gray-400 dark:text-gray-500">—</span>}</dd>
  </div>
);
