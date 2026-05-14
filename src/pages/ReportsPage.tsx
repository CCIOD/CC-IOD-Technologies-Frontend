import { useEffect, useMemo, useState } from "react";
import {
  RiAddLine,
  RiAlarmWarningLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiDownload2Line,
  RiFileChartLine,
  RiImageAddLine,
  RiMapPinLine,
  RiRefreshLine,
  RiSendPlaneLine,
  RiUserLocationLine,
} from "react-icons/ri";
import {
  IGenerateWeeklyReportForm,
  IWeeklyReport,
  IWeeklyReportAttachment,
  deleteAttachmentAPI,
  deleteWeeklyReportAPI,
  generateWeeklyReportAPI,
  getWeeklyReportAPI,
  listWeeklyReportsAPI,
  regenerateWeeklyReportAPI,
  uploadAttachmentsAPI,
} from "../services/weeklyReports.service";
import { getAllData } from "../services/api.service";
import { DataRowCarriers } from "../interfaces/carriers.interface";
import { Modal } from "../components/generic/Modal";
import { alertTimer, confirmChange } from "../utils/alerts";
import { ApiResponse } from "../interfaces/interfaces";
import { inferStateCode } from "../utils/stateCode";

const ACTIVE_STATUS = "colocado";

/** Hoy en formato YYYY-MM-DD. */
const today = (): string => new Date().toISOString().slice(0, 10);
/** Hoy menos 6 días → rango de 7 días inclusivo (period_from a period_to). */
const oneWeekAgo = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
};
const fmt = (s: string) => new Date(s.slice(0, 10) + "T00:00:00").toLocaleDateString("es-MX");

const SECTIONS = [
  { id: "mensajes", label: "Mensajes (§2)" },
  { id: "recorrido", label: "Recorrido (§3)" },
  { id: "evidencia", label: "Evidencia adicional" },
] as const;
type AttSection = (typeof SECTIONS)[number]["id"];

export const ReportsPage = () => {
  const [rows, setRows] = useState<IWeeklyReport[]>([]);
  const [carriers, setCarriers] = useState<DataRowCarriers[]>([]);
  const [stateCode, setStateCode] = useState<string>("");
  const [reportType, setReportType] = useState<"full" | "reported-only">("full");
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [form, setForm] = useState<IGenerateWeeklyReportForm>({
    carrier_id: 0,
    period_from: oneWeekAgo(),
    period_to: today(),
    title: "",
    summary: "",
  });

  // Modal attachments
  const [attachOpen, setAttachOpen] = useState<boolean>(false);
  const [currentReport, setCurrentReport] = useState<IWeeklyReport | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await listWeeklyReportsAPI({ limit: 50 });
      setRows(r.data || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    (async () => {
      try {
        const r = await getAllData("carriers");
        const all: DataRowCarriers[] = r.data || [];
        // Solo portadores activos (clientes Colocados)
        const activos = all.filter(
          (c) => (c.client_status ?? "").toString().toLowerCase() === ACTIVE_STATUS,
        );
        setCarriers(activos);
      } catch {
        setCarriers([]);
      }
    })();
  }, []);

  // Agrupa los portadores por código de estado (basado en residence_area)
  const carriersByState = useMemo(() => {
    const map = new Map<string, { label: string; items: DataRowCarriers[] }>();
    for (const c of carriers) {
      const { code, label } = inferStateCode(c.residence_area);
      if (!map.has(code)) map.set(code, { label, items: [] });
      map.get(code)!.items.push(c);
    }
    return map;
  }, [carriers]);

  const stateOptions = useMemo(
    () =>
      Array.from(carriersByState.entries())
        .map(([code, { label, items }]) => ({ code, label, count: items.length }))
        .sort((a, b) => a.label.localeCompare(b.label, "es")),
    [carriersByState],
  );

  const carriersInState = useMemo(() => {
    if (!stateCode) return [];
    return carriersByState.get(stateCode)?.items ?? [];
  }, [carriersByState, stateCode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateCode) {
      alertTimer("Selecciona el estado donde se encuentra el portador.", "error");
      return;
    }
    if (!form.carrier_id) {
      alertTimer("Selecciona un portador.", "error");
      return;
    }
    setGenerating(true);
    try {
      const payload: IGenerateWeeklyReportForm = {
        carrier_id: form.carrier_id,
        period_from: form.period_from,
        period_to: form.period_to,
        state_code: stateCode,
        report_type: reportType,
      };
      if (form.title) payload.title = form.title;
      if (form.summary) payload.summary = form.summary;
      const r = await generateWeeklyReportAPI(payload);
      alertTimer(`Reporte generado: ${r.data?.folio ?? ""}`, "success");
      setForm({ ...form, carrier_id: 0, title: "", summary: "" });
      load();
      if (r.data) {
        setCurrentReport(r.data);
        setAttachOpen(true);
      }
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al generar el reporte", "error");
    } finally {
      setGenerating(false);
    }
  };

  const remove = async (row: IWeeklyReport) => {
    const c = await confirmChange({
      title: "Eliminar reporte",
      text: `Se eliminará el reporte ${row.folio || ""}. El PDF en Azure se conserva.`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    if (!c.success) return;
    try {
      await deleteWeeklyReportAPI(row.weekly_report_id);
      alertTimer("Reporte eliminado", "success");
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al eliminar", "error");
    }
  };

  const openAttachments = async (row: IWeeklyReport) => {
    try {
      const r = await getWeeklyReportAPI(row.weekly_report_id);
      setCurrentReport(r.data!);
      setAttachOpen(true);
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al abrir adjuntos", "error");
    }
  };

  const totalReports = rows.length;
  const totalAlerts = rows.reduce((a, r) => a + r.total_alerts, 0);
  const totalReported = rows.reduce((a, r) => a + r.reported_alerts, 0);
  const totalUnreported = rows.reduce((a, r) => a + r.unreported_alerts, 0);

  return (
    <>
      <div className="space-y-5">
        <header>
          <h1 className="text-2xl font-bold app-text">Reportes Semanales</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Genera oficios semanales por portador. El PDF sigue el formato oficial CC-IOD.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi icon={<RiFileChartLine className="text-[#1A3B8F] dark:text-blue-400" />} label="Reportes (lista)" value={totalReports} color="bg-blue-50 dark:bg-blue-900/20" />
          <Kpi icon={<RiAlarmWarningLine className="text-red-600 dark:text-red-400" />} label="Alertas totales" value={totalAlerts} color="bg-red-50 dark:bg-red-900/20" />
          <Kpi icon={<RiSendPlaneLine className="text-orange-600 dark:text-orange-400" />} label="Reportadas" value={totalReported} color="bg-orange-50 dark:bg-orange-900/20" />
          <Kpi icon={<RiCheckLine className="text-green-600 dark:text-green-400" />} label="Sin reportar" value={totalUnreported} color="bg-green-50 dark:bg-green-900/20" />
        </div>

        {/* Form generar */}
        <form
          onSubmit={submit}
          className="app-bg app-text rounded-lg border app-border3 p-4 space-y-3"
        >
          <h2 className="font-semibold app-text">Nuevo reporte oficial</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
            Solo se listan portadores activos (status Colocado).
            Selecciona primero el estado para filtrar.
          </p>

          {/* Tipo de reporte */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 block mb-1">
              Tipo de reporte
            </label>
            <div className="inline-flex rounded border border-gray-300 dark:border-gray-600 overflow-hidden text-sm">
              <button
                type="button"
                onClick={() => setReportType("full")}
                className={[
                  "px-3 py-1.5 transition",
                  reportType === "full"
                    ? "bg-[#1A3B8F] text-white dark:bg-blue-700"
                    : "bg-white dark:bg-cciod-black-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-cciod-black-100",
                ].join(" ")}
              >
                Completo (todas las alertas)
              </button>
              <button
                type="button"
                onClick={() => setReportType("reported-only")}
                className={[
                  "px-3 py-1.5 border-l border-gray-300 dark:border-gray-600 transition",
                  reportType === "reported-only"
                    ? "bg-[#1A3B8F] text-white dark:bg-blue-700"
                    : "bg-white dark:bg-cciod-black-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-cciod-black-100",
                ].join(" ")}
              >
                Solo alertas reportadas a la autoridad
              </button>
            </div>
          </div>

          {/* Paso 1: Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                <RiMapPinLine className="inline mr-1 -mt-0.5" /> Estado{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={stateCode}
                onChange={(e) => {
                  setStateCode(e.target.value);
                  setForm((p) => ({ ...p, carrier_id: 0 }));
                }}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 h-[40px] text-sm bg-white dark:bg-cciod-black-200 dark:text-gray-100 focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400"
              >
                <option value="">
                  {stateOptions.length === 0
                    ? "No hay portadores activos"
                    : `Selecciona un estado (${stateOptions.length} con portadores)…`}
                </option>
                {stateOptions.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.label} — {s.count} portador{s.count !== 1 ? "es" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Paso 2: Portador (filtrado por estado) */}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Portador <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={!stateCode}
                value={form.carrier_id || ""}
                onChange={(e) =>
                  setForm({ ...form, carrier_id: Number(e.target.value) })
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 h-[40px] text-sm bg-white dark:bg-cciod-black-200 dark:text-gray-100 focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400 disabled:bg-gray-100 disabled:dark:bg-cciod-black-100 disabled:dark:text-gray-500"
              >
                <option value="">
                  {!stateCode
                    ? "Primero elige un estado…"
                    : carriersInState.length === 0
                      ? "No hay portadores en este estado"
                      : `Selecciona un portador (${carriersInState.length})…`}
                </option>
                {carriersInState.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.electronic_bracelet}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Desde</label>
              <input
                type="date"
                required
                value={form.period_from}
                onChange={(e) => setForm({ ...form, period_from: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 h-[40px] text-sm focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400 app-bg app-text dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Hasta</label>
              <input
                type="date"
                required
                min={form.period_from}
                value={form.period_to}
                onChange={(e) => setForm({ ...form, period_to: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 h-[40px] text-sm focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400 app-bg app-text dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Observaciones del operador (opcional)
            </label>
            <textarea
              rows={2}
              maxLength={2000}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Texto adicional para incluir antes del cierre del oficio."
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400 app-bg app-text dark:placeholder:text-gray-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={generating || !stateCode || !form.carrier_id}
              className="inline-flex items-center gap-1.5 bg-[#1A3B8F] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#0F2660] dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60"
            >
              <RiAddLine />
              {generating ? "Generando…" : "Generar reporte"}
            </button>
          </div>
        </form>

        {/* Lista */}
        <div className="app-bg app-text rounded-lg border app-border3 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold app-text">Reportes generados</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">{rows.length}</span>
          </div>
          {loading ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Cargando…</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
              Aún no has generado reportes. Crea el primero arriba.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-cciod-black-100 text-gray-600 dark:text-gray-300 text-xs">
                  <tr>
                    <th className="text-left px-3 py-2">Folio</th>
                    <th className="text-left px-3 py-2">Tipo</th>
                    <th className="text-left px-3 py-2">Portador</th>
                    <th className="text-left px-3 py-2">Periodo</th>
                    <th className="text-left px-3 py-2">Generado</th>
                    <th className="text-center px-3 py-2">Alertas</th>
                    <th className="text-right px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.weekly_report_id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-cciod-black-100/60">
                      <td className="px-3 py-2 font-mono text-[11px]">
                        {r.folio || <span className="text-gray-400 dark:text-gray-500">sin folio</span>}
                      </td>
                      <td className="px-3 py-2">
                        {r.report_type === "reported-only" ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                            Solo reportadas
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            Completo
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{r.subject_name || "—"}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">{r.bracelet_serial}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {fmt(r.period_from)} → {fmt(r.period_to)}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div>{new Date(r.generated_at).toLocaleString("es-MX")}</div>
                        <div className="text-gray-500 dark:text-gray-400">{r.generated_by_name}</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-orange-700 dark:text-orange-400">{r.reported_alerts}</span>
                        <span className="text-gray-400 dark:text-gray-500"> / </span>
                        <span className="text-gray-700 dark:text-gray-300">{r.total_alerts}</span>
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => openAttachments(r)}
                          className="text-gray-500 dark:text-gray-400 hover:text-[#1A3B8F] dark:hover:text-blue-400 p-1"
                          title="Adjuntar evidencia / regenerar"
                        >
                          <RiImageAddLine />
                        </button>
                        <a
                          href={r.report_document}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-500 dark:text-gray-400 hover:text-[#1A3B8F] dark:hover:text-blue-400 p-1 inline-block"
                          title="Descargar PDF"
                        >
                          <RiDownload2Line />
                        </a>
                        <button
                          onClick={() => remove(r)}
                          className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                          title="Eliminar registro"
                        >
                          <RiDeleteBin6Line />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de attachments */}
      <Modal
        isOpen={attachOpen}
        toggleModal={setAttachOpen}
        title={
          currentReport
            ? `Adjuntar evidencia · ${currentReport.folio || ""}`
            : "Adjuntar evidencia"
        }
        size="lg"
        backdrop
      >
        {currentReport && (
          <AttachmentManager
            report={currentReport}
            onChanged={(r) => setCurrentReport(r)}
            onClose={() => setAttachOpen(false)}
            refreshList={load}
          />
        )}
      </Modal>
    </>
  );
};

// =============================================================================

interface AttachmentManagerProps {
  report: IWeeklyReport;
  onChanged: (r: IWeeklyReport) => void;
  onClose: () => void;
  refreshList: () => void;
}

const AttachmentManager = ({
  report,
  onChanged,
  refreshList,
}: AttachmentManagerProps) => {
  const [section, setSection] = useState<AttSection>("recorrido");
  const [caption, setCaption] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [regenerating, setRegenerating] = useState<boolean>(false);

  const refresh = async () => {
    const r = await getWeeklyReportAPI(report.weekly_report_id);
    onChanged(r.data!);
  };

  const upload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      await uploadAttachmentsAPI(report.weekly_report_id, files, section, caption);
      alertTimer("Imágenes subidas", "success");
      setFiles([]);
      setCaption("");
      await refresh();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al subir", "error");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (att: IWeeklyReportAttachment) => {
    const c = await confirmChange({
      title: "Eliminar imagen",
      text: `Se quitará ${att.filename} del reporte.`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    if (!c.success) return;
    try {
      await deleteAttachmentAPI(report.weekly_report_id, att.attachment_id);
      alertTimer("Imagen eliminada", "success");
      await refresh();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al eliminar", "error");
    }
  };

  const regenerate = async () => {
    setRegenerating(true);
    try {
      const r = await regenerateWeeklyReportAPI(report.weekly_report_id);
      alertTimer("PDF regenerado con las imágenes", "success");
      onChanged(r.data!);
      refreshList();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al regenerar", "error");
    } finally {
      setRegenerating(false);
    }
  };

  const attachments = report.attachments ?? [];
  const grouped = useMemo(() => {
    const g: Record<AttSection, IWeeklyReportAttachment[]> = {
      mensajes: [],
      recorrido: [],
      evidencia: [],
    };
    attachments.forEach((a) => g[a.section].push(a));
    return g;
  }, [attachments]);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 rounded p-3 text-xs">
        Sube screenshots de WhatsApp, capturas del mapa, fotos del dispositivo, etc.
        Después haz clic en <b>Regenerar PDF</b> para que se incluyan en el oficio.
      </div>

      {/* Form upload */}
      <div className="border border-gray-200 dark:border-gray-700 rounded p-3 space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Sección</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as AttSection)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 h-[36px] text-sm focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400 app-bg app-text"
            >
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Caption (opcional, aplica a todas las imágenes del lote)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Captura del recorrido del día martes"
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 h-[36px] text-sm focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400 app-bg app-text dark:placeholder:text-gray-500"
            />
          </div>
        </div>
        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#1A3B8F] file:text-white hover:file:bg-[#0F2660] dark:file:bg-blue-700 dark:hover:file:bg-blue-600"
        />
        {files.length > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {files.length} archivo(s) listo(s): {files.map((f) => f.name).join(", ")}
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={upload}
            disabled={files.length === 0 || uploading}
            className="inline-flex items-center gap-1 bg-[#1A3B8F] text-white text-sm font-semibold px-3 py-1.5 rounded hover:bg-[#0F2660] dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60"
          >
            <RiImageAddLine /> {uploading ? "Subiendo…" : "Subir"}
          </button>
          <button
            type="button"
            onClick={regenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-1 bg-orange-600 text-white text-sm font-semibold px-3 py-1.5 rounded hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 disabled:opacity-60"
          >
            <RiRefreshLine /> {regenerating ? "Regenerando…" : "Regenerar PDF"}
          </button>
          <a
            href={report.report_document}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold px-3 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-cciod-black-100"
          >
            <RiDownload2Line /> Ver PDF actual
          </a>
        </div>
      </div>

      {/* Lista por sección */}
      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <div key={s.id}>
            <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-1">
              {s.label}{" "}
              <span className="text-gray-400 dark:text-gray-500 font-normal">
                ({grouped[s.id].length})
              </span>
            </h3>
            {grouped[s.id].length === 0 ? (
              <div className="text-xs text-gray-400 dark:text-gray-500 italic">Sin imágenes</div>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {grouped[s.id].map((att) => (
                  <li
                    key={att.attachment_id}
                    className="border border-gray-200 dark:border-gray-700 rounded p-1 relative group"
                  >
                    <img
                      src={att.file_url}
                      alt={att.filename}
                      className="w-full h-24 object-cover rounded"
                    />
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-1">
                      <RiUserLocationLine className="inline" /> {att.filename}
                    </div>
                    {att.caption && (
                      <div className="text-[10px] text-gray-700 dark:text-gray-300 truncate italic">
                        {att.caption}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(att)}
                      className="absolute top-1 right-1 bg-white/90 dark:bg-cciod-black-100/90 rounded-full p-0.5 opacity-0 group-hover:opacity-100 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      title="Eliminar"
                    >
                      <RiCloseLine />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
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
  <div className={`${color} rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3`}>
    <div className="text-2xl">{icon}</div>
    <div>
      <div className="text-2xl font-bold app-text leading-none">{value}</div>
      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{label}</div>
    </div>
  </div>
);
