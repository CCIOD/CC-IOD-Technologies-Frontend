import { useEffect, useState } from "react";
import {
  RiArrowGoBackLine,
  RiDeleteBin6Line,
  RiDownload2Line,
  RiFile3Line,
  RiFolder2Line,
  RiFolderAddLine,
  RiFolderOpenLine,
  RiHome3Line,
  RiUploadCloud2Line,
} from "react-icons/ri";
import {
  IDocEntry,
  createDocFolderAPI,
  deleteDocFileAPI,
  deleteDocFolderAPI,
  listDocsAPI,
  uploadDocsAPI,
} from "../services/operationsDocs.service";
import { alertTimer, confirmChange } from "../utils/alerts";
import { ApiResponse } from "../interfaces/interfaces";

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * Convierte un prefix tipo "Contratos/2026/" en breadcrumbs navegables.
 */
const buildBreadcrumbs = (
  prefix: string,
): { label: string; prefix: string }[] => {
  const items: { label: string; prefix: string }[] = [];
  if (!prefix) return items;
  const parts = prefix.replace(/\/$/, "").split("/");
  let acc = "";
  for (const p of parts) {
    acc += p + "/";
    items.push({ label: p, prefix: acc });
  }
  return items;
};

export const DocumentsPage = () => {
  const [prefix, setPrefix] = useState<string>("");
  const [entries, setEntries] = useState<IDocEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [showNewFolder, setShowNewFolder] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await listDocsAPI(prefix);
      setEntries(r.data || []);
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al cargar documentos", "error");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefix]);

  const enterFolder = (p: string) => {
    setPrefix(p);
    setShowNewFolder(false);
    setNewFolderName("");
  };

  const goRoot = () => enterFolder("");

  const goUp = () => {
    if (!prefix) return;
    const parts = prefix.replace(/\/$/, "").split("/");
    parts.pop();
    enterFolder(parts.length > 0 ? parts.join("/") + "/" : "");
  };

  const createFolder = async () => {
    const name = newFolderName.trim();
    if (!name) {
      alertTimer("Escribe un nombre de carpeta.", "warning");
      return;
    }
    try {
      await createDocFolderAPI(prefix, name);
      alertTimer(`Carpeta "${name}" creada.`, "success");
      setNewFolderName("");
      setShowNewFolder(false);
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al crear la carpeta", "error");
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const arr = Array.from(files);
      const r = await uploadDocsAPI(prefix, arr);
      alertTimer(
        `${r.data?.length ?? 0} archivo(s) subido(s).`,
        "success",
      );
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al subir archivos", "error");
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (entry: IDocEntry) => {
    if (entry.type !== "file") return;
    const c = await confirmChange({
      title: "Eliminar archivo",
      text: `¿Eliminar "${entry.name}"? Esta acción no se puede deshacer.`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    if (!c.success) return;
    try {
      await deleteDocFileAPI(entry.fullName);
      alertTimer("Archivo eliminado.", "success");
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al eliminar", "error");
    }
  };

  const deleteFolder = async (entry: IDocEntry) => {
    if (entry.type !== "folder") return;
    const c = await confirmChange({
      title: "Eliminar carpeta",
      text: `Se eliminará la carpeta "${entry.name}" y TODO su contenido. ¿Continuar?`,
      confirmButtonText: "Eliminar",
      confirmButtonColor: "red",
    });
    if (!c.success) return;
    try {
      await deleteDocFolderAPI(entry.prefix);
      alertTimer("Carpeta eliminada.", "success");
      load();
    } catch (error) {
      const err = error as ApiResponse;
      alertTimer(err.message || "Error al eliminar", "error");
    }
  };

  const breadcrumbs = buildBreadcrumbs(prefix);
  const folders = entries.filter((e) => e.type === "folder");
  const files = entries.filter((e) => e.type === "file");

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold app-text flex items-center gap-2">
          <RiFolderOpenLine /> Documentos de operación
        </h1>
        <p className="text-sm text-gray-500">
          Crea carpetas y sube archivos al almacenamiento. Todo se guarda en
          Azure Blob Storage.
        </p>
      </header>

      {/* Toolbar: breadcrumb + acciones */}
      <div className="app-bg app-text rounded-lg border app-border3 p-3 flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1 text-sm flex-1 min-w-[200px] flex-wrap">
          <button
            onClick={goRoot}
            className="inline-flex items-center gap-1 text-[#1A3B8F] hover:underline"
            title="Raíz"
          >
            <RiHome3Line /> Raíz
          </button>
          {breadcrumbs.map((b, i) => (
            <span key={b.prefix} className="flex items-center gap-1">
              <span className="text-gray-400">/</span>
              <button
                onClick={() => enterFolder(b.prefix)}
                className={
                  i === breadcrumbs.length - 1
                    ? "font-semibold text-gray-800"
                    : "text-[#1A3B8F] hover:underline"
                }
              >
                {b.label}
              </button>
            </span>
          ))}
        </div>

        {prefix && (
          <button
            onClick={goUp}
            className="inline-flex items-center gap-1 text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
          >
            <RiArrowGoBackLine /> Subir
          </button>
        )}
        <button
          onClick={() => setShowNewFolder((v) => !v)}
          className="inline-flex items-center gap-1 text-xs border border-[#1A3B8F] text-[#1A3B8F] rounded px-2 py-1 hover:bg-[#1A3B8F] hover:text-white"
        >
          <RiFolderAddLine /> Nueva carpeta
        </button>
        <label className="inline-flex items-center gap-1 text-xs bg-[#1A3B8F] text-white font-semibold rounded px-3 py-1.5 hover:bg-[#0F2660] cursor-pointer">
          <RiUploadCloud2Line />
          {uploading ? "Subiendo…" : "Subir archivos"}
          <input
            type="file"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* Crear carpeta inline */}
      {showNewFolder && (
        <div className="app-bg app-text rounded-lg border app-border3 p-3 flex flex-wrap gap-2 items-center">
          <input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") createFolder();
              if (e.key === "Escape") {
                setShowNewFolder(false);
                setNewFolderName("");
              }
            }}
            placeholder="Nombre de la carpeta"
            className="flex-1 h-[36px] border border-gray-300 rounded px-3 text-sm focus:outline-none focus:border-[#1A3B8F]"
          />
          <button
            onClick={createFolder}
            className="bg-[#1A3B8F] text-white text-sm font-semibold px-3 py-1.5 rounded hover:bg-[#0F2660]"
          >
            Crear
          </button>
          <button
            onClick={() => {
              setShowNewFolder(false);
              setNewFolderName("");
            }}
            className="text-sm text-gray-600 hover:text-gray-900 px-2"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Listado */}
      <div className="app-bg app-text rounded-lg border app-border3 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Cargando…</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Esta carpeta está vacía. Crea una subcarpeta o sube archivos.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {folders.map((e) =>
              e.type === "folder" ? (
                <li
                  key={e.prefix}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50/40 transition"
                >
                  <button
                    onClick={() => enterFolder(e.prefix)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    <RiFolder2Line className="text-xl text-[#1A3B8F]" />
                    <span className="font-medium">{e.name}</span>
                    <span className="text-xs text-gray-400">Carpeta</span>
                  </button>
                  <button
                    onClick={() => deleteFolder(e)}
                    className="text-gray-400 hover:text-red-600 p-1"
                    title="Eliminar carpeta"
                  >
                    <RiDeleteBin6Line />
                  </button>
                </li>
              ) : null,
            )}
            {files.map((e) =>
              e.type === "file" ? (
                <li
                  key={e.fullName}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition"
                >
                  <RiFile3Line className="text-xl text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{e.name}</div>
                    <div className="text-[10px] text-gray-500">
                      {formatSize(e.size)}
                      {e.lastModified &&
                        ` · Modificado ${new Date(e.lastModified).toLocaleString(
                          "es-MX",
                        )}`}
                    </div>
                  </div>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    download={e.name}
                    className="text-gray-500 hover:text-[#1A3B8F] p-1"
                    title="Descargar"
                  >
                    <RiDownload2Line />
                  </a>
                  <button
                    onClick={() => deleteFile(e)}
                    className="text-gray-500 hover:text-red-600 p-1"
                    title="Eliminar"
                  >
                    <RiDeleteBin6Line />
                  </button>
                </li>
              ) : null,
            )}
          </ul>
        )}
      </div>
    </div>
  );
};
