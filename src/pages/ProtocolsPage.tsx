import { useEffect, useMemo, useState } from "react";
import {
  RiAddLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiInformationLine,
  RiToggleLine,
  RiToggleFill,
} from "react-icons/ri";
import { IAlertProtocol } from "../interfaces/alerts.interface";
import {
  createAlertProtocolAPI,
  deleteAlertProtocolAPI,
  listAlertProtocolsAPI,
  updateAlertProtocolAPI,
} from "../services/alerts.service";
import { Modal } from "../components/generic/Modal";
import { alertTimer, confirmChange } from "../utils/alerts";
import { ApiResponse } from "../interfaces/interfaces";

const sampleVars: Record<string, string> = {
  portador: "Juan Pérez",
  cliente: "Juan Pérez",
  tipo: "zona_exclusion",
  protocolo: "Violación de zona de exclusión",
  zona: "Centro de la ciudad",
  zona_inclusion: "Domicilio",
  zona_exclusion: "Centro de la ciudad",
  correa: "OK",
  hora: "14:32",
  fecha: "12/05/2026",
  info: "Operador detectó la incidencia en patrullaje",
};

const renderPreview = (template: string): string =>
  template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, k) =>
    sampleVars[k] !== undefined ? sampleVars[k] : `{{${k}}}`,
  );

interface FormState {
  alert_type: string;
  label: string;
  message_template: string;
  is_active: boolean;
}

const emptyForm: FormState = {
  alert_type: "",
  label: "",
  message_template: "",
  is_active: true,
};

export const ProtocolsPage = () => {
  const [rows, setRows] = useState<IAlertProtocol[]>([]);
  const [availableVars, setAvailableVars] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<IAlertProtocol | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await listAlertProtocolsAPI();
      setRows(r.data || []);
      setAvailableVars(r.available_variables || []);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const preview = useMemo(
    () => renderPreview(form.message_template || ""),
    [form.message_template],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (row: IAlertProtocol) => {
    setEditing(row);
    setForm({
      alert_type: row.alert_type,
      label: row.label,
      message_template: row.message_template,
      is_active: row.is_active,
    });
    setIsOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateAlertProtocolAPI(editing.protocol_id, form);
        alertTimer("Plantilla actualizada", "success");
      } else {
        await createAlertProtocolAPI(form);
        alertTimer("Plantilla creada", "success");
      }
      setIsOpen(false);
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row: IAlertProtocol) => {
    try {
      await updateAlertProtocolAPI(row.protocol_id, { is_active: !row.is_active });
      alertTimer(
        row.is_active ? "Plantilla desactivada" : "Plantilla activada",
        "success",
      );
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al cambiar estado", "error");
    }
  };

  const remove = async (row: IAlertProtocol) => {
    const c = await confirmChange({
      title: "Eliminar plantilla",
      text: `Si hay alertas históricas con "${row.label}", se desactivará en lugar de borrarse.`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    if (!c.success) return;
    try {
      const res = await deleteAlertProtocolAPI(row.protocol_id);
      alertTimer(res.message || "Plantilla eliminada", "success");
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al eliminar", "error");
    }
  };

  const insertVar = (v: string) => {
    setForm((prev) => ({
      ...prev,
      message_template: prev.message_template + `{{${v}}}`,
    }));
  };

  return (
    <>
      <div className="space-y-4">
        <header className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold app-text">Protocolos de Alerta</h1>
            <p className="text-sm text-gray-500">
              Plantillas Handlebars que el sistema usa para generar el mensaje de
              cada alerta. Las variables disponibles se inyectan automáticamente
              en el servidor.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 bg-[#1A3B8F] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#0F2660]"
          >
            <RiAddLine /> Nueva plantilla
          </button>
        </header>

        <div className="flex gap-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-md p-3 text-xs">
          <RiInformationLine className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <span>
              Variables disponibles en plantillas:
            </span>{" "}
            {availableVars.map((v) => (
              <code key={v} className="bg-white border border-blue-200 rounded px-1 mx-0.5">
                {`{{${v}}}`}
              </code>
            ))}
          </div>
        </div>

        <div className="app-bg app-text rounded-lg border app-border3 overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Cargando…</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No hay plantillas registradas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs">
                  <tr>
                    <th className="text-left px-3 py-2">Tipo (alert_type)</th>
                    <th className="text-left px-3 py-2">Etiqueta</th>
                    <th className="text-left px-3 py-2">Plantilla</th>
                    <th className="text-left px-3 py-2">Estado</th>
                    <th className="text-right px-3 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.protocol_id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs">{r.alert_type}</td>
                      <td className="px-3 py-2 font-medium">{r.label}</td>
                      <td className="px-3 py-2 text-xs text-gray-600 max-w-[420px] truncate font-mono">
                        {r.message_template}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => toggleActive(r)}
                          className={[
                            "inline-flex items-center gap-1 text-xs",
                            r.is_active ? "text-green-700" : "text-gray-400",
                          ].join(" ")}
                          title="Cambiar estado"
                        >
                          {r.is_active ? <RiToggleFill className="text-lg" /> : <RiToggleLine className="text-lg" />}
                          {r.is_active ? "Activa" : "Inactiva"}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEdit(r)}
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
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        toggleModal={setIsOpen}
        title={editing ? `Editar protocolo ${editing.alert_type}` : "Nueva plantilla"}
        size="lg"
        backdrop
      >
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">
                alert_type <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.alert_type}
                onChange={(e) => setForm({ ...form, alert_type: e.target.value })}
                placeholder="zona_exclusion"
                disabled={!!editing}
                className="w-full border border-gray-300 rounded px-3 h-[40px] text-sm focus:outline-none focus:border-[#1A3B8F] disabled:bg-gray-100"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Identificador único en snake_case. Lo usan los servicios para
                disparar alertas.
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">
                Etiqueta visible <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Violación de zona de exclusión"
                className="w-full border border-gray-300 rounded px-3 h-[40px] text-sm focus:outline-none focus:border-[#1A3B8F]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600">
                Plantilla Handlebars <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-1">
                {availableVars.map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => insertVar(v)}
                    className="text-[10px] font-mono bg-gray-100 hover:bg-[#1A3B8F] hover:text-white border border-gray-200 rounded px-1.5 py-0.5"
                  >
                    {`{{${v}}}`}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              required
              rows={4}
              value={form.message_template}
              onChange={(e) => setForm({ ...form, message_template: e.target.value })}
              placeholder='ALERTA — {{portador}} entró a "{{zona}}" a las {{hora}}.'
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#1A3B8F]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600">
              Vista previa (con valores de ejemplo)
            </label>
            <div className="mt-1 bg-gray-50 border border-gray-200 rounded p-3 text-sm">
              {preview || (
                <span className="text-gray-400 italic">
                  Escribe la plantilla para ver el preview.
                </span>
              )}
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Plantilla activa (se puede usar al crear alertas)
          </label>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center bg-[#1A3B8F] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#0F2660] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando…" : editing ? "Guardar cambios" : "Crear plantilla"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
