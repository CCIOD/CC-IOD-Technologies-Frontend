import { useState } from "react";
import {
  RiAlertLine,
  RiCheckLine,
  RiClipboardLine,
  RiMailSendLine,
  RiWhatsappLine,
} from "react-icons/ri";
import { alertTimer } from "../../utils/alerts";

interface Props {
  /** Mensaje a copiar / compartir (generated_message del alert). */
  message: string;
  /** Teléfono de la autoridad. Cualquier formato; se limpia a dígitos. */
  whatsappNumber?: string | null;
  /** Email de la autoridad. */
  email?: string | null;
  /** Texto opcional para el asunto del correo. */
  emailSubject?: string;
}

/**
 * Normaliza un número telefónico a solo dígitos. Si no incluye prefijo país,
 * antepone 52 (México) por default — coincide con cómo wa.me lo espera.
 */
const cleanWhatsappNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `52${digits}`;
  return digits;
};

export const AlertActions = ({
  message,
  whatsappNumber,
  email,
  emailSubject = "Alerta del centro de monitoreo",
}: Props) => {
  const [copied, setCopied] = useState<boolean>(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      alertTimer("Mensaje copiado al portapapeles", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alertTimer("No se pudo copiar al portapapeles.", "error");
    }
  };

  const openWhatsapp = () => {
    if (!whatsappNumber || !whatsappNumber.trim()) {
      alertTimer(
        "El portador no tiene WhatsApp de la autoridad guardado. Solicita que se agregue.",
        "warning",
      );
      return;
    }
    const phone = cleanWhatsappNumber(whatsappNumber);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openEmail = () => {
    if (!email || !email.trim()) {
      alertTimer(
        "El portador no tiene correo de la autoridad guardado. Solicita que se agregue.",
        "warning",
      );
      return;
    }
    const url = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
      emailSubject,
    )}&body=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  const missing: string[] = [];
  if (!whatsappNumber || !whatsappNumber.trim()) missing.push("WhatsApp");
  if (!email || !email.trim()) missing.push("correo");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded hover:bg-gray-50"
          title="Copiar mensaje generado"
        >
          {copied ? (
            <>
              <RiCheckLine className="text-green-600" /> Copiado
            </>
          ) : (
            <>
              <RiClipboardLine /> Copiar mensaje
            </>
          )}
        </button>
        <button
          type="button"
          onClick={openWhatsapp}
          className={[
            "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded",
            whatsappNumber
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200",
          ].join(" ")}
          title={
            whatsappNumber
              ? `Abrir chat con ${whatsappNumber}`
              : "El portador no tiene WhatsApp guardado"
          }
        >
          <RiWhatsappLine /> WhatsApp
        </button>
        <button
          type="button"
          onClick={openEmail}
          className={[
            "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded",
            email
              ? "bg-[#1A3B8F] text-white hover:bg-[#0F2660]"
              : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200",
          ].join(" ")}
          title={email ? `Enviar a ${email}` : "El portador no tiene correo guardado"}
        >
          <RiMailSendLine /> Correo
        </button>
      </div>

      {missing.length > 0 && (
        <div className="flex items-start gap-1.5 text-[10px] text-orange-700 bg-orange-50 border border-orange-200 rounded px-2 py-1.5">
          <RiAlertLine className="mt-0.5 flex-shrink-0" />
          <span>
            Este portador no tiene <b>{missing.join(" ni ")}</b> de la autoridad guardado.
            Solicita que se agregue.
          </span>
        </div>
      )}
    </div>
  );
};
