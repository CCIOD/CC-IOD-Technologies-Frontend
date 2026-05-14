import { useContext, useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiEraserLine,
  RiFingerprintLine,
  RiKey2Line,
  RiLockPasswordLine,
  RiPenNibLine,
  RiQuestionLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import {
  deletePinAPI,
  deleteSignatureAPI,
  deleteWebauthnCredentialAPI,
  getMySignatureAPI,
  listWebauthnCredentialsAPI,
  setPinAPI,
  setSignatureAPI,
  webauthnRegisterAPI,
} from "../services/auth.service";
import { AppContext } from "../context/AppContext";
import { AuthContext } from "../context/AuthContext";
import { alertTimer, confirmChange } from "../utils/alerts";
import { ApiResponse } from "../interfaces/interfaces";

interface IWebauthnCredential {
  credential_id: string;
  device_label: string | null;
  created_at: string;
  last_used_at: string | null;
}

export const SecurityProfilePage = () => {
  const { user } = useContext(AuthContext);
  const { modalEdit } = useContext(AppContext);
  const { toggleModalEdit: _toggle } = modalEdit;

  return (
    <div className="space-y-5 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold app-text flex items-center gap-2">
          <RiShieldCheckLine /> Mi cuenta y seguridad
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configura los métodos con los que vas a iniciar sesión:
          contraseña, PIN rápido y huella / llave de seguridad.
        </p>
        {user && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Sesión como <b>{user.name}</b> — {user.email} · {user.role}
          </p>
        )}
      </header>

      <PasswordCard />
      <PinCard />
      <SignatureCard />
      <WebauthnCard />
    </div>
  );
};

// =============================================================================
// Contraseña — solo recordatorio, el cambio real vive en el modal del header
// =============================================================================

const PasswordCard = () => {
  const { user } = useContext(AuthContext);
  const { modalPass } = useContext(AppContext);
  const { toggleModalPass } = modalPass;

  return (
    <section className="app-bg app-text rounded-lg border app-border3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <RiLockPasswordLine /> Contraseña
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tu método principal de acceso. Debe contener mayúscula, minúscula,
            dígito y carácter especial, mínimo 8 caracteres.
          </p>
        </div>
        <button
          type="button"
          onClick={() => user && toggleModalPass(true, user.userId)}
          disabled={!user}
          className="text-sm font-semibold text-[#1A3B8F] dark:text-blue-400 border border-[#1A3B8F] dark:border-blue-400 rounded px-3 py-1.5 hover:bg-[#1A3B8F] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white disabled:opacity-50"
        >
          Cambiar
        </button>
      </div>
    </section>
  );
};

// =============================================================================
// PIN
// =============================================================================

const PinCard = () => {
  const [pin, setPin] = useState<string>("");
  const [pin2, setPin2] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(pin)) {
      alertTimer("El PIN debe contener entre 4 y 8 dígitos.", "error");
      return;
    }
    if (pin !== pin2) {
      alertTimer("Los PINs no coinciden.", "error");
      return;
    }
    setSaving(true);
    try {
      await setPinAPI(pin);
      alertTimer("PIN configurado", "success");
      setPin("");
      setPin2("");
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al guardar el PIN", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const c = await confirmChange({
      title: "Eliminar PIN",
      text: "Después de eliminarlo ya no podrás iniciar sesión por PIN. ¿Continuar?",
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    if (!c.success) return;
    try {
      await deletePinAPI();
      alertTimer("PIN eliminado", "success");
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al eliminar", "error");
    }
  };

  return (
    <section className="app-bg app-text rounded-lg border app-border3 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <RiKey2Line /> PIN de acceso rápido
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Para iniciar sesión desde la pantalla "Login Rápido" del centro de
            monitoreo. Sesión de duración corta (2h). 4 a 8 dígitos.
          </p>
        </div>
        <button
          type="button"
          onClick={remove}
          className="text-sm font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/30"
          title="Si tienes PIN configurado, esto lo elimina."
        >
          <RiDeleteBin6Line className="inline" /> Quitar PIN
        </button>
      </div>
      <form
        onSubmit={submit}
        className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end"
      >
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Nuevo PIN</label>
          <input
            type="password"
            inputMode="numeric"
            pattern="\d{4,8}"
            maxLength={8}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 h-[38px] text-center tracking-[0.4em] text-lg focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400 app-bg app-text dark:placeholder:text-gray-600"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 dark:text-gray-300">Confirmar PIN</label>
          <input
            type="password"
            inputMode="numeric"
            pattern="\d{4,8}"
            maxLength={8}
            value={pin2}
            onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))}
            placeholder="••••••"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 h-[38px] text-center tracking-[0.4em] text-lg focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400 app-bg app-text dark:placeholder:text-gray-600"
          />
        </div>
        <button
          type="submit"
          disabled={saving || pin.length < 4}
          className="inline-flex items-center justify-center gap-1 bg-[#1A3B8F] text-white text-sm font-semibold px-4 h-[38px] rounded hover:bg-[#0F2660] dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Configurar PIN"}
        </button>
      </form>
    </section>
  );
};

// =============================================================================
// WebAuthn (huella / Windows Hello / Touch ID / llave de seguridad)
// =============================================================================

const WebauthnCard = () => {
  const [creds, setCreds] = useState<IWebauthnCredential[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [registering, setRegistering] = useState<boolean>(false);
  const [label, setLabel] = useState<string>("");
  const [diag, setDiag] = useState<{
    supported: boolean;
    platformAvailable: boolean | null;
    origin: string;
    isSecure: boolean;
  }>({
    supported: false,
    platformAvailable: null,
    origin: "",
    isSecure: false,
  });

  const load = async () => {
    setLoading(true);
    try {
      const r = await listWebauthnCredentialsAPI();
      setCreds((r.data as IWebauthnCredential[]) || []);
    } catch {
      setCreds([]);
    } finally {
      setLoading(false);
    }
  };

  // Detecta capacidades del navegador al montar
  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      window.PublicKeyCredential !== undefined;
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const isSecure =
      typeof window !== "undefined" ? window.isSecureContext : false;
    setDiag({ supported, origin, isSecure, platformAvailable: null });

    if (supported && window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) =>
          setDiag((p) => ({ ...p, platformAvailable: available })),
        )
        .catch(() => setDiag((p) => ({ ...p, platformAvailable: false })));
    }
    load();
  }, []);

  const register = async () => {
    if (!diag.supported) {
      alertTimer(
        "Tu navegador no soporta WebAuthn. Usa Chrome, Edge, Firefox o Safari recientes.",
        "error",
      );
      return;
    }
    if (!diag.isSecure) {
      alertTimer(
        "WebAuthn requiere HTTPS (o localhost). Entra al sitio por http://localhost en lugar de 127.0.0.1.",
        "error",
      );
      return;
    }
    if (diag.platformAvailable === false) {
      const proceed = window.confirm(
        "No detecté un autenticador platform (Touch ID, Windows Hello, etc.) en este equipo.\n\n" +
          "Si tienes una llave de seguridad USB conectada, puedes continuar; de lo contrario configura primero la biometría del SO.\n\n¿Continuar de todas formas?",
      );
      if (!proceed) return;
    }
    setRegistering(true);
    try {
      await webauthnRegisterAPI(label || undefined);
      alertTimer("Dispositivo registrado correctamente", "success");
      setLabel("");
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(
        err?.message ||
          "No se pudo completar el registro. Cancela y vuelve a intentar.",
        "error",
      );
    } finally {
      setRegistering(false);
    }
  };

  const remove = async (credentialId: string) => {
    const c = await confirmChange({
      title: "Eliminar dispositivo",
      text: "Ya no podrás iniciar sesión con este autenticador. ¿Continuar?",
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    if (!c.success) return;
    try {
      await deleteWebauthnCredentialAPI(credentialId);
      alertTimer("Credencial eliminada", "success");
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al eliminar", "error");
    }
  };

  return (
    <section className="app-bg app-text rounded-lg border app-border3 p-4">
      <div className="mb-3">
        <h2 className="font-semibold flex items-center gap-2">
          <RiFingerprintLine /> Huella digital / Llave de seguridad
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Registra los dispositivos que vas a usar para autenticarte: lector de
          huella, Windows Hello, Touch ID, llave física tipo YubiKey, etc.
          Puedes registrar varios.
        </p>
      </div>

      {/* Panel de diagnóstico */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-[10px]">
        <DiagItem label="WebAuthn soportado" ok={diag.supported} />
        <DiagItem label="Contexto seguro" ok={diag.isSecure} />
        <DiagItem
          label="Touch ID / Hello"
          ok={diag.platformAvailable}
          hint={
            diag.platformAvailable === false
              ? "Configura biometría en tu SO o conecta una llave USB"
              : undefined
          }
        />
        <DiagItem label="Origen" ok hint={diag.origin} muted />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end mb-4">
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Etiqueta (opcional)
          </label>
          <input
            type="text"
            maxLength={120}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Laptop personal / Huella oficina"
            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 h-[38px] text-sm focus:outline-none focus:border-[#1A3B8F] dark:focus:border-blue-400 app-bg app-text dark:placeholder:text-gray-500"
          />
        </div>
        <button
          type="button"
          onClick={register}
          disabled={registering}
          className="inline-flex items-center justify-center gap-1 bg-[#1A3B8F] text-white text-sm font-semibold px-4 h-[38px] rounded hover:bg-[#0F2660] dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60"
        >
          <RiAddLine />
          {registering ? "Esperando autenticador…" : "Registrar este dispositivo"}
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-gray-500 dark:text-gray-400">Cargando credenciales…</div>
      ) : creds.length === 0 ? (
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          No tienes dispositivos registrados todavía.
        </div>
      ) : (
        <ul className="space-y-1.5">
          {creds.map((c) => (
            <li
              key={c.credential_id}
              className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded p-2 text-xs"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">
                  {c.device_label || "(sin etiqueta)"}
                </div>
                <div className="text-gray-500 dark:text-gray-400 truncate font-mono">
                  {c.credential_id.slice(0, 24)}…
                </div>
                <div className="text-gray-400 dark:text-gray-500">
                  Registrado{" "}
                  {new Date(c.created_at).toLocaleDateString("es-MX")}
                  {c.last_used_at &&
                    ` · Último uso ${new Date(
                      c.last_used_at,
                    ).toLocaleDateString("es-MX")}`}
                </div>
              </div>
              <button
                onClick={() => remove(c.credential_id)}
                className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1"
                title="Eliminar"
              >
                <RiDeleteBin6Line />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

/**
 * Recorta un canvas a la bounding box del contenido no transparente.
 * Reemplaza el `getTrimmedCanvas` de react-signature-canvas, que requiere
 * la dependencia opcional `trim-canvas` que no siempre resuelve correctamente
 * en bundlers tipo Vite.
 */
const trimCanvas = (source: HTMLCanvasElement): HTMLCanvasElement => {
  const ctx = source.getContext("2d");
  if (!ctx) return source;
  const { width, height } = source;
  const { data } = ctx.getImageData(0, 0, width, height);

  let top = height,
    left = width,
    right = 0,
    bottom = 0;
  let hasPixel = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        hasPixel = true;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (!hasPixel) return source;

  const pad = 4;
  const trimmedW = Math.min(width, right - left + 1 + pad * 2);
  const trimmedH = Math.min(height, bottom - top + 1 + pad * 2);
  const out = document.createElement("canvas");
  out.width = trimmedW;
  out.height = trimmedH;
  out
    .getContext("2d")!
    .drawImage(
      source,
      Math.max(0, left - pad),
      Math.max(0, top - pad),
      trimmedW,
      trimmedH,
      0,
      0,
      trimmedW,
      trimmedH,
    );
  return out;
};

// =============================================================================
// Firma (canvas táctil / mouse)
// =============================================================================

const SignatureCard = () => {
  const padRef = useRef<SignatureCanvas | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await getMySignatureAPI();
      setCurrentUrl(r.data?.signature_url ?? null);
    } catch {
      setCurrentUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const clear = () => padRef.current?.clear();

  const save = async () => {
    if (!padRef.current || padRef.current.isEmpty()) {
      alertTimer("Dibuja tu firma antes de guardar.", "warning");
      return;
    }
    setSaving(true);
    try {
      // toDataURL exporta el canvas completo. Lo recortamos en cliente para
      // que el PDF muestre solo el trazo de la firma (sin espacio en blanco).
      const fullCanvas = padRef.current.getCanvas();
      const trimmed = trimCanvas(fullCanvas);
      const dataUrl = trimmed.toDataURL("image/png");
      const r = await setSignatureAPI(dataUrl);
      setCurrentUrl(r.data?.signature_url ?? null);
      setEditing(false);
      alertTimer("Firma guardada", "success");
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al guardar la firma", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const c = await confirmChange({
      title: "Eliminar firma",
      text: "Los oficios futuros se generarán sin firma hasta que registres una nueva. ¿Continuar?",
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    if (!c.success) return;
    try {
      await deleteSignatureAPI();
      setCurrentUrl(null);
      alertTimer("Firma eliminada", "success");
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al eliminar", "error");
    }
  };

  return (
    <section className="app-bg app-text rounded-lg border app-border3 p-4">
      <div className="mb-3">
        <h2 className="font-semibold flex items-center gap-2">
          <RiPenNibLine /> Firma personal
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Se inyecta en los oficios que generes (reporte a autoridad, etc.). Puedes
          firmar con el dedo en una tablet o con el ratón.
        </p>
      </div>

      {loading ? (
        <div className="text-xs text-gray-500 dark:text-gray-400">Cargando…</div>
      ) : currentUrl && !editing ? (
        <div className="space-y-2">
          <div className="bg-white border border-gray-200 dark:border-gray-700 rounded p-3 inline-block">
            <img
              src={currentUrl}
              alt="Firma actual"
              className="h-24 object-contain"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-sm font-semibold text-[#1A3B8F] dark:text-blue-400 border border-[#1A3B8F] dark:border-blue-400 rounded px-3 py-1.5 hover:bg-[#1A3B8F] hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"
            >
              Cambiar firma
            </button>
            <button
              type="button"
              onClick={remove}
              className="text-sm font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <RiDeleteBin6Line className="inline" /> Eliminar firma
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="bg-white border-2 border-dashed border-gray-300 dark:border-gray-600 rounded inline-block">
            <SignatureCanvas
              ref={(r) => {
                padRef.current = r;
              }}
              penColor="#1A2340"
              canvasProps={{
                width: 500,
                height: 160,
                className: "rounded",
              }}
            />
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Firma dentro del recuadro. Tip: en tablet/móvil firma con el dedo;
            en desktop arrastra el ratón.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-cciod-black-100"
            >
              <RiEraserLine /> Borrar
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1 bg-[#1A3B8F] text-white text-sm font-semibold px-4 py-1.5 rounded hover:bg-[#0F2660] dark:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar firma"}
            </button>
            {currentUrl && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-3"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

interface DiagItemProps {
  label: string;
  ok: boolean | null;
  hint?: string;
  muted?: boolean;
}

const DiagItem = ({ label, ok, hint, muted }: DiagItemProps) => {
  const icon =
    ok === true ? (
      <RiCheckLine className="text-green-600 dark:text-green-400" />
    ) : ok === false ? (
      <RiCloseLine className="text-red-600 dark:text-red-400" />
    ) : (
      <RiQuestionLine className="text-gray-400 dark:text-gray-500" />
    );
  return (
    <div
      className={[
        "border rounded p-2 flex items-start gap-1.5",
        muted
          ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-cciod-black-100"
          : "border-gray-200 dark:border-gray-700",
      ].join(" ")}
    >
      <span className="text-base mt-0.5">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{label}</div>
        {hint && (
          <div className="text-gray-500 dark:text-gray-400 break-all leading-tight">{hint}</div>
        )}
      </div>
    </div>
  );
};
