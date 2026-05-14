import { useEffect, useMemo, useState } from "react";
import {
  RiAddLine,
  RiAlarmWarningLine,
  RiCheckLine,
  RiEdit2Line,
  RiEyeLine,
  RiLockLine,
  RiSendPlaneFill,
  RiSearchLine,
  RiCloseLine,
} from "react-icons/ri";
import {
  IAlert,
  IAlertCreateForm,
  IAlertEditForm,
  IAlertProtocol,
} from "../interfaces/alerts.interface";
import {
  createAlertAPI,
  deactivateAlertAPI,
  getAlertAPI,
  listAlertProtocolsAPI,
  listAlertsAPI,
  updateAlertAPI,
} from "../services/alerts.service";
import { Modal } from "../components/generic/Modal";
import { AlertForm } from "../components/modalForms/AlertForm";
import { ReportAlertForm } from "../components/modalForms/ReportAlertForm";
import { AlertActions } from "../components/generic/AlertActions";
import { alertTimer, confirmChange } from "../utils/alerts";
import { ApiResponse } from "../interfaces/interfaces";

type Tab = "todas" | "activas" | "reportadas";

const tabs: { id: Tab; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "activas", label: "Activas" },
  { id: "reportadas", label: "Reportadas" },
];

const statusBadge = (alert: IAlert) => {
  if (alert.locked) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
        <RiLockLine /> Reportada
      </span>
    );
  }
  if (alert.status === "activa") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
        <RiAlarmWarningLine /> Activa
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
      <RiCheckLine /> Desactivada
    </span>
  );
};

const formatId = (id: number) => `ALR-${id.toString().padStart(5, "0")}`;

export const AlertsPage = () => {
  const [tab, setTab] = useState<Tab>("todas");
  const [rows, setRows] = useState<IAlert[]>([]);
  const [protocols, setProtocols] = useState<IAlertProtocol[]>([]);
  const [filterType, setFilterType] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Modal create/edit
  const [isOpenForm, setIsOpenForm] = useState<boolean>(false);
  const [editing, setEditing] = useState<IAlert | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>("");

  // Modal detalle
  const [detail, setDetail] = useState<IAlert | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);

  // Modal reportar (con imágenes)
  const [reporting, setReporting] = useState<IAlert | null>(null);
  const [isOpenReport, setIsOpenReport] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = {};
      if (tab === "activas") filters.status = "activa";
      if (tab === "reportadas") filters.reported = true;
      if (filterType) filters.alert_type = filterType;
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
  }, [tab, filterType]);

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

  const openCreate = () => {
    setEditing(null);
    setFormError("");
    setIsOpenForm(true);
  };

  const openEdit = (row: IAlert) => {
    setEditing(row);
    setFormError("");
    setIsOpenForm(true);
  };

  const handleCreate = async (form: IAlertCreateForm) => {
    setFormLoading(true);
    setFormError("");
    try {
      const res = await createAlertAPI(form);
      alertTimer("Alerta creada", "success");
      setIsOpenForm(false);
      load();
      // Abre el detalle del recién creado para que el operador pueda copiar/enviar.
      if (res.data) {
        setDetail(res.data);
        setIsOpenDetail(true);
      }
    } catch (error) {
      const err = error as ApiResponse;
      setFormError(err.message || "Error al crear la alerta");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (form: IAlertEditForm) => {
    if (!editing) return;
    setFormLoading(true);
    setFormError("");
    try {
      await updateAlertAPI(editing.alert_id, form);
      alertTimer("Alerta actualizada", "success");
      setIsOpenForm(false);
      load();
    } catch (error) {
      const err = error as ApiResponse;
      setFormError(err.message || "Error al guardar");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (row: IAlert) => {
    const c = await confirmChange({
      title: "Desactivar alerta",
      text: `${formatId(row.alert_id)} se marcará como desactivada. El cambio queda registrado en la bitácora.`,
      confirmButtonText: "Desactivar",
      confirmButtonColor: "gray",
    });
    if (!c.success) return;
    try {
      await deactivateAlertAPI(row.alert_id);
      alertTimer("Alerta desactivada", "success");
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al desactivar", "error");
    }
  };

  const handleReport = (row: IAlert) => {
    setReporting(row);
    setIsOpenReport(true);
  };

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

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold app-text">Gestión de Alertas</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {rows.length} alertas — el mensaje y los timestamps los administra el servidor.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 bg-[#1A3B8F] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#0F2660] dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <RiAddLine /> CREAR ALERTA
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                "px-4 py-2 -mb-px border-b-2 text-sm font-medium transition",
                tab === t.id
                  ? "border-[#1A3B8F] text-[#1A3B8F] dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por portador, brazalete, tipo o mensaje…"
              className="w-full pl-9 pr-3 h-[36px] border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400 app-bg app-text dark:placeholder:text-gray-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-[36px] border border-gray-300 dark:border-gray-600 rounded px-2 text-sm focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400 app-bg app-text"
          >
            <option value="">Todos los tipos</option>
            {protocols.map((p) => (
              <option key={p.protocol_id} value={p.alert_type}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tabla */}
        <div className="app-bg2 app-text rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-gray-500 dark:text-gray-400">Cargando alertas…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No hay alertas con los filtros actuales.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-cciod-black-100 text-gray-600 dark:text-gray-300 text-xs">
                  <tr>
                    <th className="text-left px-3 py-2">Portador</th>
                    <th className="text-left px-3 py-2">Tipo</th>
                    <th className="text-left px-3 py-2">Mensaje</th>
                    <th className="text-left px-3 py-2">Activada</th>
                    <th className="text-left px-3 py-2">Desactivada</th>
                    <th className="text-left px-3 py-2">Estado</th>
                    <th className="text-right px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.alert_id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-cciod-black-100/60">
                      <td className="px-3 py-2">
                        <div className="font-medium">
                          {r.subject_name || (
                            <span className="text-gray-400 dark:text-gray-500 italic">
                              Sin portador asignado
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                          {r.bracelet_serial || formatId(r.alert_id)}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        {r.protocol_label || r.alert_type}
                      </td>
                      <td className="px-3 py-2 max-w-[320px] truncate text-gray-700 dark:text-gray-300">
                        {r.generated_message}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div>{new Date(r.activated_at).toLocaleString("es-MX")}</div>
                        <div className="text-gray-500 dark:text-gray-400">{r.activated_by_name}</div>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {r.deactivated_at ? (
                          <>
                            <div>{new Date(r.deactivated_at).toLocaleString("es-MX")}</div>
                            <div className="text-gray-500 dark:text-gray-400">{r.deactivated_by_name}</div>
                          </>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2">{statusBadge(r)}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => openDetail(r)}
                          className="text-gray-500 dark:text-gray-400 hover:text-[#1A3B8F] dark:hover:text-blue-400 p-1"
                          title="Ver detalle"
                        >
                          <RiEyeLine />
                        </button>
                        <button
                          onClick={() => openEdit(r)}
                          disabled={r.locked}
                          className="text-gray-500 dark:text-gray-400 hover:text-[#1A3B8F] dark:hover:text-blue-400 p-1 disabled:opacity-30 disabled:hover:text-gray-500"
                          title={r.locked ? "Bloqueada — reportada a autoridad" : "Editar"}
                        >
                          <RiEdit2Line />
                        </button>
                        {r.status === "activa" && !r.locked && (
                          <button
                            onClick={() => handleDeactivate(r)}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-1"
                            title="Desactivar"
                          >
                            <RiCloseLine />
                          </button>
                        )}
                        {!r.locked && !r.reported_to_authority && (
                          <button
                            onClick={() => handleReport(r)}
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 p-1"
                            title="Reportar a autoridad"
                          >
                            <RiSendPlaneFill />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal crear/editar */}
      <Modal
        isOpen={isOpenForm}
        toggleModal={setIsOpenForm}
        title={editing ? `Editar ${formatId(editing.alert_id)}` : "Crear nueva alerta"}
        size="lg"
        backdrop
      >
        <AlertForm
          toggleModal={setIsOpenForm}
          initialAlert={editing}
          isLoading={formLoading}
          errorMessage={formError}
          handleCreate={handleCreate}
          handleUpdate={handleUpdate}
        />
      </Modal>

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
              {statusBadge(detail)}
              <span className="text-xs text-gray-500 dark:text-gray-400">{detail.protocol_label}</span>
              {detail.subject_name && (
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  · Portador: <b>{detail.subject_name}</b>
                  {detail.bracelet_serial && (
                    <span className="text-gray-500 dark:text-gray-400"> ({detail.bracelet_serial})</span>
                  )}
                </span>
              )}
            </div>
            <div className="bg-gray-50 dark:bg-cciod-black-100 border border-gray-200 dark:border-gray-700 rounded p-3 text-sm font-mono whitespace-pre-wrap">
              {detail.generated_message}
            </div>
            <AlertActions
              message={detail.generated_message}
              whatsappNumber={detail.authority_whatsapp}
              email={detail.authority_email}
              emailSubject={`Alerta — ${detail.protocol_label || detail.alert_type} · ${detail.subject_name ?? ""}`.trim()}
            />
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <dt className="text-gray-500 dark:text-gray-400">Activada</dt>
              <dd>
                {new Date(detail.activated_at).toLocaleString("es-MX")} —
                {detail.activated_by_name}
              </dd>
              {detail.deactivated_at && (
                <>
                  <dt className="text-gray-500 dark:text-gray-400">Desactivada</dt>
                  <dd>
                    {new Date(detail.deactivated_at).toLocaleString("es-MX")} —
                    {detail.deactivated_by_name}
                  </dd>
                </>
              )}
              {detail.reported_at && (
                <>
                  <dt className="text-gray-500 dark:text-gray-400">Reportada</dt>
                  <dd>
                    {new Date(detail.reported_at).toLocaleString("es-MX")} —
                    {detail.reported_by_name}
                  </dd>
                </>
              )}
              {detail.zona_inclusion && (
                <>
                  <dt className="text-gray-500 dark:text-gray-400">Zona inclusión</dt>
                  <dd>{detail.zona_inclusion}</dd>
                </>
              )}
              {detail.zona_exclusion && (
                <>
                  <dt className="text-gray-500 dark:text-gray-400">Zona exclusión</dt>
                  <dd>{detail.zona_exclusion}</dd>
                </>
              )}
              {detail.correa && (
                <>
                  <dt className="text-gray-500 dark:text-gray-400">Correa</dt>
                  <dd>{detail.correa}</dd>
                </>
              )}
              {detail.info_operativa && (
                <>
                  <dt className="text-gray-500 dark:text-gray-400">Info operativa</dt>
                  <dd className="whitespace-pre-wrap">{detail.info_operativa}</dd>
                </>
              )}
            </dl>
            {detail.audit_log && detail.audit_log.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-2 mb-1">
                  Bitácora
                </h3>
                <ul className="text-xs space-y-1 max-h-[200px] overflow-auto border-t border-gray-100 dark:border-gray-700 pt-1">
                  {detail.audit_log.map((entry) => (
                    <li key={entry.audit_id} className="border-b border-gray-100 dark:border-gray-800 py-1">
                      <span className="font-semibold">{entry.action_type}</span>
                      {entry.field_name && (
                        <>
                          {" · "}
                          <span className="text-gray-500 dark:text-gray-400">{entry.field_name}:</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {" "}
                            {entry.old_value || "—"} → {entry.new_value || "—"}
                          </span>
                        </>
                      )}
                      <div className="text-gray-400 dark:text-gray-500">
                        {new Date(entry.created_at).toLocaleString("es-MX")} —
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

      {/* Modal Reportar a autoridad */}
      <Modal
        isOpen={isOpenReport}
        toggleModal={setIsOpenReport}
        title={
          reporting
            ? `Reportar ${formatId(reporting.alert_id)} a la autoridad`
            : "Reportar"
        }
        size="lg"
        backdrop
      >
        {reporting && (
          <ReportAlertForm
            alert={reporting}
            toggleModal={setIsOpenReport}
            onReported={(updated) => {
              setReporting(null);
              load();
              // Si el detalle estaba abierto con la misma alerta, refrescamos.
              if (detail?.alert_id === updated.alert_id) {
                setDetail(updated);
              }
            }}
          />
        )}
      </Modal>
    </>
  );
};
