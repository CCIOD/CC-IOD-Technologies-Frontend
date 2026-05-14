import { useEffect, useMemo, useState } from "react";
import {
  RiAlarmWarningLine,
  RiCheckLine,
  RiEditLine,
  RiEyeLine,
  RiFileList3Line,
  RiInformationLine,
  RiLockLine,
  RiSearchLine,
} from "react-icons/ri";
import {
  IAlert,
  IAlertProtocol,
} from "../interfaces/alerts.interface";
import {
  getAlertAPI,
  listAlertProtocolsAPI,
  listAlertsAPI,
} from "../services/alerts.service";
import { Modal } from "../components/generic/Modal";
import { AlertActions } from "../components/generic/AlertActions";
import { alertTimer } from "../utils/alerts";
import { ApiResponse } from "../interfaces/interfaces";

type ReportFilter = "all" | "reported" | "unreported";

const formatId = (id: number) => `ALR-${id.toString().padStart(5, "0")}`;

const reportedBadge = (alert: IAlert) =>
  alert.reported_to_authority ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
      <RiLockLine /> Reportada
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
      <RiCheckLine /> Sin reportar
    </span>
  );

const stateBadge = (alert: IAlert) =>
  alert.status === "activa" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
      <RiAlarmWarningLine /> Activa
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
      Desactivada
    </span>
  );

export const BitacoraPage = () => {
  const [rows, setRows] = useState<IAlert[]>([]);
  const [protocols, setProtocols] = useState<IAlertProtocol[]>([]);
  const [reportFilter, setReportFilter] = useState<ReportFilter>("all");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Modal detalle
  const [detail, setDetail] = useState<IAlert | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (reportFilter === "reported") filters.reported = true;
      if (reportFilter === "unreported") filters.reported = false;
      if (typeFilter) filters.alert_type = typeFilter;
      if (from) filters.from = from;
      if (to) filters.to = to;
      const r = await listAlertsAPI(filters);
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
  }, [reportFilter, typeFilter, from, to]);

  useEffect(() => {
    (async () => {
      try {
        const r = await listAlertProtocolsAPI();
        setProtocols(r.data?.filter((p) => p.is_active) ?? []);
      } catch {
        setProtocols([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter(
      (r) =>
        r.subject_name?.toLowerCase().includes(term) ||
        r.bracelet_serial?.toLowerCase().includes(term) ||
        r.generated_message?.toLowerCase().includes(term) ||
        r.protocol_label?.toLowerCase().includes(term) ||
        r.alert_type?.toLowerCase().includes(term) ||
        r.activated_by_name?.toLowerCase().includes(term),
    );
  }, [rows, search]);

  const openDetail = async (row: IAlert) => {
    try {
      const r = await getAlertAPI(row.alert_id);
      setDetail(r.data!);
      setIsOpenDetail(true);
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al cargar detalle", "error");
    }
  };

  const totalRows = rows.length;
  const reportedCount = rows.filter((r) => r.reported_to_authority).length;

  return (
    <>
      <div className="space-y-4">
        <header className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold app-text flex items-center gap-2">
              <RiFileList3Line /> Bitácora de Alertas
            </h1>
            <p className="text-sm text-gray-500">
              Registro histórico de todas las alertas — reportadas y no reportadas.
            </p>
          </div>
        </header>

        {/* Banner info */}
        <div className="flex gap-2 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-md p-3 text-xs">
          <RiInformationLine className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Las alertas reportadas a la autoridad no pueden editarse ni
            desactivarse. Solo se pueden consultar. Cualquier cambio queda
            registrado en el historial.
          </span>
        </div>

        {/* Toolbar */}
        <div className="app-bg app-text rounded-lg border app-border3 p-3 flex flex-wrap gap-2 items-end">
          <div className="relative flex-1 min-w-[200px]">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por portador, brazalete, tipo, mensaje u operador…"
              className="w-full pl-9 pr-3 h-[36px] border border-gray-300 rounded text-sm focus:outline-none focus:border-[#1A3B8F]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500">
              Estado
            </label>
            <select
              value={reportFilter}
              onChange={(e) => setReportFilter(e.target.value as ReportFilter)}
              className="h-[36px] border border-gray-300 rounded px-2 text-sm focus:outline-none focus:border-[#1A3B8F]"
            >
              <option value="all">Todas ({totalRows})</option>
              <option value="reported">Reportadas ({reportedCount})</option>
              <option value="unreported">No reportadas ({totalRows - reportedCount})</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-500">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-[36px] border border-gray-300 rounded px-2 text-sm focus:outline-none focus:border-[#1A3B8F]"
            >
              <option value="">Todos</option>
              {protocols.map((p) => (
                <option key={p.protocol_id} value={p.alert_type}>
                  {p.label}
                </option>
              ))}
            </select>
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

        {/* Tabla */}
        <div className="app-bg app-text rounded-lg border app-border3 overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Cargando bitácora…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No hay registros con los filtros actuales.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs">
                  <tr>
                    <th className="text-left px-3 py-2">Portador</th>
                    <th className="text-left px-3 py-2">Tipo</th>
                    <th className="text-left px-3 py-2">Mensaje</th>
                    <th className="text-left px-3 py-2">Activada</th>
                    <th className="text-left px-3 py-2">Estado</th>
                    <th className="text-left px-3 py-2">Reporte</th>
                    <th className="text-center px-3 py-2">Editable</th>
                    <th className="text-right px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.alert_id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="font-medium">
                          {r.subject_name || (
                            <span className="text-gray-400 italic">
                              Sin portador asignado
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          {r.bracelet_serial || formatId(r.alert_id)}
                        </div>
                      </td>
                      <td className="px-3 py-2">{r.protocol_label || r.alert_type}</td>
                      <td className="px-3 py-2 max-w-[280px] truncate text-gray-700">
                        {r.generated_message}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div>{new Date(r.activated_at).toLocaleString("es-MX")}</div>
                        <div className="text-gray-500">{r.activated_by_name}</div>
                      </td>
                      <td className="px-3 py-2">{stateBadge(r)}</td>
                      <td className="px-3 py-2">{reportedBadge(r)}</td>
                      <td className="px-3 py-2 text-center">
                        {r.locked ? (
                          <RiLockLine className="inline text-orange-600" title="Bloqueada" />
                        ) : (
                          <RiEditLine className="inline text-green-600" title="Editable" />
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => openDetail(r)}
                          className="text-gray-500 hover:text-[#1A3B8F] p-1"
                          title="Ver detalle e historial"
                        >
                          <RiEyeLine />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 text-xs text-gray-500 border-t bg-gray-50">
                Mostrando {filtered.length} de {totalRows} registros
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal detalle */}
      <Modal
        isOpen={isOpenDetail}
        toggleModal={setIsOpenDetail}
        title={detail ? `Detalle ${formatId(detail.alert_id)}` : "Detalle"}
        size="md"
        backdrop
        closeOnClickOutside
      >
        {detail && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {stateBadge(detail)}
              {reportedBadge(detail)}
              <span className="text-xs text-gray-500">{detail.protocol_label}</span>
              {detail.subject_name && (
                <span className="text-xs text-gray-700">
                  · Portador: <b>{detail.subject_name}</b>
                  {detail.bracelet_serial && (
                    <span className="text-gray-500"> ({detail.bracelet_serial})</span>
                  )}
                </span>
              )}
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm font-mono whitespace-pre-wrap">
              {detail.generated_message}
            </div>
            <AlertActions
              message={detail.generated_message}
              whatsappNumber={detail.authority_whatsapp}
              email={detail.authority_email}
              emailSubject={`Alerta — ${detail.protocol_label || detail.alert_type} · ${detail.subject_name ?? ""}`.trim()}
            />
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <dt className="text-gray-500">Activada</dt>
              <dd>
                {new Date(detail.activated_at).toLocaleString("es-MX")} —{" "}
                {detail.activated_by_name}
              </dd>
              {detail.deactivated_at && (
                <>
                  <dt className="text-gray-500">Desactivada</dt>
                  <dd>
                    {new Date(detail.deactivated_at).toLocaleString("es-MX")} —{" "}
                    {detail.deactivated_by_name}
                  </dd>
                </>
              )}
              {detail.reported_at && (
                <>
                  <dt className="text-gray-500">Reportada</dt>
                  <dd>
                    {new Date(detail.reported_at).toLocaleString("es-MX")} —{" "}
                    {detail.reported_by_name}
                  </dd>
                </>
              )}
              {detail.zona_inclusion && (
                <>
                  <dt className="text-gray-500">Zona inclusión</dt>
                  <dd>{detail.zona_inclusion}</dd>
                </>
              )}
              {detail.zona_exclusion && (
                <>
                  <dt className="text-gray-500">Zona exclusión</dt>
                  <dd>{detail.zona_exclusion}</dd>
                </>
              )}
              {detail.correa && (
                <>
                  <dt className="text-gray-500">Correa</dt>
                  <dd>{detail.correa}</dd>
                </>
              )}
              {detail.info_operativa && (
                <>
                  <dt className="text-gray-500">Info operativa</dt>
                  <dd className="whitespace-pre-wrap">{detail.info_operativa}</dd>
                </>
              )}
              {detail.report_document && (
                <>
                  <dt className="text-gray-500">Reporte</dt>
                  <dd>
                    <a
                      href={detail.report_document}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#1A3B8F] hover:underline"
                    >
                      Descargar PDF →
                    </a>
                  </dd>
                </>
              )}
            </dl>
            {detail.audit_log && detail.audit_log.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-600 mt-2 mb-1 uppercase tracking-wide">
                  Historial de cambios
                </h3>
                <ul className="text-xs space-y-1 max-h-[280px] overflow-auto border-t border-gray-100 pt-1">
                  {detail.audit_log.map((entry) => (
                    <li key={entry.audit_id} className="border-b border-gray-100 py-1">
                      <span
                        className={[
                          "inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold mr-1",
                          entry.action_type === "REPORT"
                            ? "bg-orange-100 text-orange-700"
                            : entry.action_type === "DEACTIVATE"
                              ? "bg-gray-200 text-gray-700"
                              : entry.action_type === "CREATE"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700",
                        ].join(" ")}
                      >
                        {entry.action_type}
                      </span>
                      {entry.field_name && (
                        <>
                          <span className="text-gray-500">{entry.field_name}:</span>{" "}
                          <span className="text-gray-700 line-through">
                            {entry.old_value || "—"}
                          </span>{" "}
                          →{" "}
                          <span className="text-gray-900">
                            {entry.new_value || "—"}
                          </span>
                        </>
                      )}
                      <div className="text-gray-400 mt-0.5">
                        {new Date(entry.created_at).toLocaleString("es-MX")} —{" "}
                        {entry.user_name}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};
