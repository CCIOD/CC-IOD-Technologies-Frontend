import { useState } from "react";
import {
  RiAlertLine,
  RiArrowGoBackLine,
  RiCheckLine,
  RiCloseCircleLine,
  RiExternalLinkLine,
  RiEyeLine,
  RiImageAddLine,
  RiSendPlaneFill,
} from "react-icons/ri";
import { IAlert } from "../../interfaces/alerts.interface";
import {
  confirmAlertReportAPI,
  previewAlertReportAPI,
} from "../../services/alerts.service";
import { ApiResponse } from "../../interfaces/interfaces";
import { alertTimer } from "../../utils/alerts";

interface Props {
  alert: IAlert;
  toggleModal: (v: boolean) => void;
  onReported: (alert: IAlert) => void;
}

type Step = "compose" | "preview";

export const ReportAlertForm = ({ alert, toggleModal, onReported }: Props) => {
  const [step, setStep] = useState<Step>("compose");
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<{
    url: string;
    attachmentUrls: string[];
    count: number;
  } | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles).filter((f) =>
      ["image/png", "image/jpeg", "image/webp"].includes(f.type),
    );
    setFiles((prev) => [...prev, ...arr].slice(0, 10));
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const generatePreview = async () => {
    setGenerating(true);
    try {
      const r = await previewAlertReportAPI(alert.alert_id, files);
      if (r.data) {
        setPreview({
          url: r.data.preview_url,
          attachmentUrls: r.data.attachment_urls ?? [],
          count: r.data.attachments_count,
        });
        setStep("preview");
        // Abre el PDF en una pestaña nueva inmediatamente para revisión.
        window.open(r.data.preview_url, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al generar la vista previa", "error");
    } finally {
      setGenerating(false);
    }
  };

  const backToCompose = () => {
    setPreview(null);
    setStep("compose");
  };

  const confirmReport = async () => {
    if (!preview) return;
    setSubmitting(true);
    try {
      const r = await confirmAlertReportAPI(alert.alert_id, preview.attachmentUrls);
      const folio = r.data?.folio ?? "(folio asignado)";
      alertTimer(`Reporte confirmado · ${folio}`, "success");
      if (r.data) onReported(r.data);
      toggleModal(false);
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al confirmar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // -------- Render --------

  if (step === "preview" && preview) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-md p-3 text-xs">
          <RiEyeLine className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            Vista previa del oficio (en estado <b>BORRADOR — sin folio</b>) con{" "}
            {preview.count} {preview.count === 1 ? "imagen" : "imágenes"}. Revisa el
            documento antes de confirmar.<br />
            <span className="text-blue-900">
              Al confirmar se asignará el folio oficial, se generará el documento
              definitivo y la alerta quedará <b>bloqueada permanentemente</b>.
            </span>
          </div>
        </div>

        <a
          href={preview.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 bg-[#1A3B8F] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#0F2660]"
        >
          <RiExternalLinkLine /> Abrir vista previa del PDF
        </a>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 border-t">
          <button
            type="button"
            onClick={backToCompose}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
          >
            <RiArrowGoBackLine /> Volver a editar (regenerar vista previa)
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => toggleModal(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmReport}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-60"
            >
              <RiSendPlaneFill />
              {submitting ? "Confirmando…" : "Confirmar reporte y bloquear"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-md p-3 text-xs">
        <RiAlertLine className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          Primero generaremos una <b>vista previa</b> del oficio para que la revises.
          La alerta solo se bloqueará cuando confirmes el reporte en el siguiente
          paso.
        </span>
      </div>

      <div>
        <div className="text-xs font-semibold text-gray-600 mb-1">
          Mensaje que se enviará en el oficio
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm whitespace-pre-wrap">
          {alert.generated_message}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-gray-600 mb-1">
          Anexos del oficio ({files.length}/10)
        </div>
        <p className="text-[10px] text-gray-500 mb-2">
          Sube screenshots de WhatsApp, capturas de pantalla, fotos o cualquier
          evidencia que se incluirá en el oficio como "Anexo 1".
        </p>
        <label className="block">
          <div className="cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded p-6 hover:border-[#1A3B8F] hover:bg-blue-50/40 text-gray-500 hover:text-[#1A3B8F]">
            <RiImageAddLine className="text-xl" />
            <span className="text-sm">
              Click para seleccionar imágenes (PNG / JPEG / WEBP)
            </span>
          </div>
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => addFiles(e.target.files)}
            className="hidden"
          />
        </label>

        {files.length > 0 && (
          <ul className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
            {files.map((f, idx) => {
              const url = URL.createObjectURL(f);
              return (
                <li
                  key={`${f.name}-${idx}`}
                  className="relative border border-gray-200 rounded p-1 group"
                >
                  <img
                    src={url}
                    alt={f.name}
                    className="w-full h-20 object-cover rounded"
                    onLoad={() => URL.revokeObjectURL(url)}
                  />
                  <div className="text-[10px] text-gray-500 truncate mt-1">
                    {f.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-white rounded-full text-red-600 hover:text-red-800"
                  >
                    <RiCloseCircleLine className="text-lg" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t">
        <button
          type="button"
          onClick={() => toggleModal(false)}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={generatePreview}
          disabled={generating}
          className="inline-flex items-center gap-1.5 bg-[#1A3B8F] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#0F2660] disabled:opacity-60"
        >
          {generating ? (
            "Generando vista previa…"
          ) : (
            <>
              <RiEyeLine /> Generar vista previa
              <RiCheckLine className="opacity-0" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
