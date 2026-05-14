import { useEffect, useMemo, useState } from "react";
import {
  RiAlarmWarningLine,
  RiInformationLine,
  RiSearchLine,
} from "react-icons/ri";
import {
  IAlertCreateForm,
  IAlertEditForm,
  IAlertProtocol,
  IAlert,
} from "../../interfaces/alerts.interface";
import { listAlertProtocolsAPI } from "../../services/alerts.service";
import { getAllData } from "../../services/api.service";
import { DataRowCarriers } from "../../interfaces/carriers.interface";
import { ErrMessage } from "../generic/ErrMessage";

interface Props {
  toggleModal: (value: boolean) => void;
  initialAlert?: IAlert | null;
  isLoading: boolean;
  errorMessage?: string;
  handleCreate: (form: IAlertCreateForm) => Promise<void>;
  handleUpdate: (form: IAlertEditForm) => Promise<void>;
}

const ACTIVE_STATUS = "colocado";

const previewMessage = (
  template: string | undefined,
  vars: Record<string, string | undefined>,
): string => {
  if (!template) return "Selecciona un tipo de alerta para ver el mensaje generado.";
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, k) => {
    return (vars[k as string] || "").toString() || `{{${k}}}`;
  });
};

export const AlertForm = ({
  toggleModal,
  initialAlert,
  isLoading,
  errorMessage,
  handleCreate,
  handleUpdate,
}: Props) => {
  const isEdit = !!initialAlert;
  const locked = initialAlert?.locked === true || initialAlert?.is_locked === true;

  const [protocols, setProtocols] = useState<IAlertProtocol[]>([]);
  const [protocolsLoading, setProtocolsLoading] = useState<boolean>(false);

  const [carriers, setCarriers] = useState<DataRowCarriers[]>([]);
  const [carriersLoading, setCarriersLoading] = useState<boolean>(false);
  const [carrierSearch, setCarrierSearch] = useState<string>("");
  const [carrierOpen, setCarrierOpen] = useState<boolean>(false);

  const [alertType, setAlertType] = useState<string>(initialAlert?.alert_type || "");
  const [selectedCarrier, setSelectedCarrier] = useState<DataRowCarriers | null>(null);
  const [zonaInclusion, setZonaInclusion] = useState<string>(
    initialAlert?.zona_inclusion || "",
  );
  const [houseArrest, setHouseArrest] = useState<string>(
    initialAlert?.house_arrest || "",
  );
  const [correa, setCorrea] = useState<string>(initialAlert?.correa || "");
  const [infoOperativa, setInfoOperativa] = useState<string>(
    initialAlert?.info_operativa || "",
  );

  // Cargar plantillas
  useEffect(() => {
    (async () => {
      setProtocolsLoading(true);
      try {
        const r = await listAlertProtocolsAPI();
        setProtocols(r.data?.filter((p) => p.is_active) ?? []);
      } catch {
        setProtocols([]);
      } finally {
        setProtocolsLoading(false);
      }
    })();
  }, []);

  // Cargar portadores activos
  useEffect(() => {
    (async () => {
      setCarriersLoading(true);
      try {
        const r = await getAllData("carriers");
        const all: DataRowCarriers[] = r.data || [];
        const activos = all.filter(
          (c) => (c.client_status ?? "").toString().toLowerCase() === ACTIVE_STATUS,
        );
        setCarriers(activos);

        // Si estamos editando una alerta existente, intenta preseleccionar el portador
        if (initialAlert?.carrier_id) {
          const match = activos.find((c) => c.id === initialAlert.carrier_id);
          if (match) {
            setSelectedCarrier(match);
            setCarrierSearch(match.name);
          } else if (initialAlert.subject_name) {
            // El portador puede ya no estar activo. Mostramos el nombre snapshot.
            setCarrierSearch(initialAlert.subject_name);
          }
        }
      } catch {
        setCarriers([]);
      } finally {
        setCarriersLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAlert?.carrier_id]);

  const filteredCarriers = useMemo(() => {
    const term = carrierSearch.trim().toLowerCase();
    if (!term) return carriers.slice(0, 30);
    return carriers
      .filter(
        (c) =>
          c.name?.toLowerCase().includes(term) ||
          c.electronic_bracelet?.toLowerCase().includes(term),
      )
      .slice(0, 30);
  }, [carriers, carrierSearch]);

  const pickCarrier = (c: DataRowCarriers) => {
    setSelectedCarrier(c);
    setCarrierSearch(c.name);
    setCarrierOpen(false);
    // Autollenar con datos del portador, solo si el campo está vacío.
    setZonaInclusion((prev) => prev || c.residence_area || "");
    setHouseArrest((prev) => prev || c.house_arrest || "");
  };

  const clearCarrier = () => {
    setSelectedCarrier(null);
    setCarrierSearch("");
    setZonaInclusion("");
    setHouseArrest("");
  };

  const selectedProtocol = useMemo(
    () => protocols.find((p) => p.alert_type === alertType),
    [protocols, alertType],
  );

  const preview = useMemo(
    () =>
      previewMessage(selectedProtocol?.message_template, {
        portador: selectedCarrier?.name || initialAlert?.subject_name || "(sin portador)",
        cliente: selectedCarrier?.name || initialAlert?.subject_name || "(sin cliente)",
        zona: zonaInclusion || "(sin zona)",
        zona_inclusion: zonaInclusion,
        house_arrest: houseArrest,
        correa: correa || "(sin info)",
        tipo: alertType,
        protocolo: selectedProtocol?.label || "",
        hora: new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        info: infoOperativa,
      }),
    [
      selectedProtocol,
      alertType,
      selectedCarrier,
      initialAlert,
      zonaInclusion,
      houseArrest,
      correa,
      infoOperativa,
    ],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await handleUpdate({
        zona_inclusion: zonaInclusion || undefined,
        house_arrest: houseArrest || undefined,
        correa: correa || undefined,
        info_operativa: infoOperativa || undefined,
      });
    } else {
      if (!alertType || !selectedCarrier) return;
      await handleCreate({
        alert_type: alertType,
        carrier_id: selectedCarrier.id,
        client_id: selectedCarrier.client_id ?? null,
        zona_inclusion: zonaInclusion || undefined,
        house_arrest: houseArrest || undefined,
        correa: correa || undefined,
        info_operativa: infoOperativa || undefined,
      });
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Banner info */}
      <div className="flex gap-2 bg-[#E3F2FD] text-[#1A3B8F] rounded-md p-3 text-xs">
        <RiInformationLine className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>
          El mensaje de la alerta lo genera automáticamente el sistema usando
          la plantilla del protocolo. Solo puedes editar los datos operativos.
        </span>
      </div>

      {locked && (
        <div className="flex gap-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-md p-3 text-xs">
          <RiAlarmWarningLine className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            Esta alerta fue reportada a la autoridad y está bloqueada para
            edición. Solo se muestra en modo lectura.
          </span>
        </div>
      )}

      {/* Datos principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-600">
            Tipo de alerta <span className="text-red-500">*</span>
          </label>
          <select
            required
            disabled={isEdit || locked}
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 h-[40px] text-sm bg-white focus:outline-none focus:border-[#1A3B8F] disabled:bg-gray-100"
          >
            <option value="">
              {protocolsLoading ? "Cargando plantillas…" : "Selecciona…"}
            </option>
            {protocols.map((p) => (
              <option key={p.protocol_id} value={p.alert_type}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Combobox de portador (solo activos) */}
        <div className="relative">
          <label className="text-xs font-semibold text-gray-600">
            Portador <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              required={!isEdit}
              disabled={isEdit || locked}
              value={carrierSearch}
              onChange={(e) => {
                setCarrierSearch(e.target.value);
                setSelectedCarrier(null);
                setCarrierOpen(true);
              }}
              onFocus={() => !isEdit && setCarrierOpen(true)}
              onBlur={() => setTimeout(() => setCarrierOpen(false), 150)}
              placeholder={
                carriersLoading
                  ? "Cargando portadores…"
                  : carriers.length === 0
                    ? "No hay portadores activos"
                    : "Busca por nombre o brazalete…"
              }
              className="w-full border border-gray-300 rounded pl-9 pr-8 h-[40px] text-sm focus:outline-none focus:border-[#1A3B8F] disabled:bg-gray-100"
            />
            {selectedCarrier && !isEdit && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={clearCarrier}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 text-xs"
                title="Limpiar selección"
              >
                ✕
              </button>
            )}
          </div>
          {carrierOpen && !isEdit && filteredCarriers.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full max-h-[220px] overflow-auto bg-white border border-gray-200 rounded shadow-lg text-sm">
              {filteredCarriers.map((c) => (
                <li
                  key={c.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickCarrier(c);
                  }}
                  className="px-3 py-2 hover:bg-[#1A3B8F]/10 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <div className="font-medium">{c.name}</div>
                  <div className="text-[10px] text-gray-500">
                    Brazalete {c.electronic_bracelet || "—"} ·{" "}
                    {c.residence_area || "sin zona"}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {carrierOpen && !isEdit && filteredCarriers.length === 0 && !carriersLoading && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg text-xs text-gray-500 p-3">
              {carriers.length === 0
                ? "No hay portadores activos. Verifica en /panel/portadores."
                : "Sin coincidencias."}
            </div>
          )}
          {selectedCarrier && (
            <div className="text-[10px] text-green-700 mt-1">
              ✓ {selectedCarrier.name} · Brazalete{" "}
              {selectedCarrier.electronic_bracelet}
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600">Estado de correa</label>
          <select
            disabled={locked}
            value={correa}
            onChange={(e) => setCorrea(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 h-[40px] text-sm bg-white focus:outline-none focus:border-[#1A3B8F] disabled:bg-gray-100"
          >
            <option value="">Sin especificar</option>
            <option value="Conectada">Conectada</option>
            <option value="Desconectada">Desconectada</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">
            Zona de residencia
            {selectedCarrier && (
              <span className="ml-1 text-[10px] font-normal text-gray-400">
                (autollenado desde el portador)
              </span>
            )}
          </label>
          <input
            type="text"
            maxLength={255}
            disabled={locked}
            value={zonaInclusion}
            onChange={(e) => setZonaInclusion(e.target.value)}
            placeholder="Selecciona un portador para autollenar"
            className="w-full border border-gray-300 rounded px-3 h-[40px] text-sm focus:outline-none focus:border-[#1A3B8F] disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600">
            Arraigo domiciliario
            {selectedCarrier && (
              <span className="ml-1 text-[10px] font-normal text-gray-400">
                (autollenado desde el portador)
              </span>
            )}
          </label>
          <input
            type="text"
            maxLength={255}
            disabled={locked}
            value={houseArrest}
            onChange={(e) => setHouseArrest(e.target.value)}
            placeholder="Selecciona un portador para autollenar"
            className="w-full border border-gray-300 rounded px-3 h-[40px] text-sm focus:outline-none focus:border-[#1A3B8F] disabled:bg-gray-100"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600">
          Información operativa adicional
        </label>
        <textarea
          rows={3}
          maxLength={2000}
          disabled={locked}
          value={infoOperativa}
          onChange={(e) => setInfoOperativa(e.target.value)}
          placeholder="Notas internas (no aparecen en el mensaje generado a menos que la plantilla las use)."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1A3B8F] disabled:bg-gray-100"
        />
      </div>

      {/* Preview */}
      <div>
        <label className="text-xs font-semibold text-gray-600">
          Mensaje que se generará
        </label>
        <div className="mt-1 bg-gray-50 border border-gray-200 rounded p-3 text-sm font-mono text-gray-800 whitespace-pre-wrap">
          {preview}
        </div>
        {isEdit && initialAlert?.generated_message && (
          <p className="text-[10px] text-gray-500 mt-1">
            Mensaje actual: {initialAlert.generated_message}
          </p>
        )}
      </div>

      {errorMessage && <ErrMessage message={errorMessage} center={false} />}

      <div className="flex justify-end gap-2 pt-2 border-t">
        <button
          type="button"
          onClick={() => toggleModal(false)}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={
            isLoading ||
            locked ||
            (!isEdit && (!alertType || !selectedCarrier))
          }
          className="inline-flex items-center bg-[#1A3B8F] text-white text-sm font-semibold px-4 py-2 rounded hover:bg-[#0F2660] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear alerta"}
        </button>
      </div>
    </form>
  );
};
