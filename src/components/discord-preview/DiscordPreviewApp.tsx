import { useState, useEffect, useRef } from "react";
import Preview from "./Preview";
import Editor from "./Editor";
import StorageSidebar from "./StorageSidebar";
import ConfirmModal from "./ConfirmModal";
import { DEFAULT_DATA } from "./defaults";
import type { DiscordPreviewData } from "@/types";
import { toDiscordJSON, fromDiscordJSON } from "./utils/transform";
import "@skyra/discord-components-core";

const LOCAL_STORAGE_KEY = "discord_preview_session";
const SAVED_MESSAGES_KEY = "discord_preview_saved";

interface SavedMessage {
  id: string;
  name: string;
  timestamp: number;
  data: DiscordPreviewData;
}

export default function DiscordPreviewApp() {
  const [data, setData] = useState<DiscordPreviewData>(DEFAULT_DATA);
  const [tab, setTab] = useState<"editor" | "json" | "saved">("editor");
  const [jsonFormat, setJsonFormat] = useState<"discord" | "internal">(
    "discord",
  );

  // Use a function to initialize the string depending on format
  const getJsonString = (d: DiscordPreviewData, f: "discord" | "internal") => {
    if (f === "internal") return JSON.stringify(d, null, 2);
    return JSON.stringify(toDiscordJSON(d), null, 2);
  };

  const [internalJson, setInternalJson] = useState(
    getJsonString(DEFAULT_DATA, "discord"),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Storage state
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [hoverPreviewData, setHoverPreviewData] =
    useState<DiscordPreviewData | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    pendingMsg: SavedMessage | null;
  }>({ isOpen: false, pendingMsg: null });
  const [lastAutoSave, setLastAutoSave] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync internal JSON
  useEffect(() => {
    if (document.activeElement !== textareaRef.current) {
      setInternalJson(getJsonString(data, jsonFormat));
      setJsonError(null);
    }
  }, [data, jsonFormat]);

  // Load from LocalStorage
  useEffect(() => {
    const session = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setData(parsed);
      } catch (e) {
        console.error("Failed to load session", e);
      }
    }

    const saved = localStorage.getItem(SAVED_MESSAGES_KEY);
    if (saved) {
      try {
        setSavedMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved messages", e);
      }
    }
  }, []);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      setLastAutoSave(Date.now());
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [data]);

  // Sync saved messages to localStorage
  useEffect(() => {
    localStorage.setItem(SAVED_MESSAGES_KEY, JSON.stringify(savedMessages));
  }, [savedMessages]);

  const validateDiscordData = (parsed: any): string | null => {
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return "El JSON debe ser un objeto { ... }";
    }

    // Check for essential properties types if present
    if (parsed.author && typeof parsed.author !== "object") {
      return "El campo 'author' debe ser un objeto.";
    }

    if (parsed.embeds && !Array.isArray(parsed.embeds)) {
      return "El campo 'embeds' debe ser un array.";
    }

    if (parsed.components && !Array.isArray(parsed.components)) {
      return "El campo 'components' debe ser un array.";
    }

    return null;
  };

  const handleJsonChange = (raw: string) => {
    setInternalJson(raw);
    try {
      const parsed = JSON.parse(raw);

      if (jsonFormat === "internal") {
        const error = validateDiscordData(parsed);
        if (error) {
          setJsonError(error);
        } else {
          setJsonError(null);
          setData(parsed);
        }
      } else {
        // Validation for Discord Payload
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          setJsonError(
            "El payload de Discord debe ser un JSON Objeto en la raíz.",
          );
          return;
        }
        setJsonError(null);
        setData(fromDiscordJSON(parsed));
      }
    } catch (e: any) {
      setJsonError(`Error de sintaxis JSON: ${e.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(internalJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (name: string) => {
    const newMessage: SavedMessage = {
      id: crypto.randomUUID(),
      name,
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(data)), // Deep clone
    };

    setSavedMessages((prev) => {
      // Overwrite if name exists
      const filtered = prev.filter(
        (m) => m.name.toLowerCase() !== name.toLowerCase(),
      );
      return [newMessage, ...filtered];
    });
  };

  const handleDelete = (id: string) => {
    setSavedMessages((prev) => prev.filter((m) => m.id !== id));
    setHoverPreviewData(null); // Force reset hover preview on any delete to avoid stale data crashes
  };

  const confirmLoad = () => {
    if (modalState.pendingMsg) {
      setData(modalState.pendingMsg.data);
      setModalState({ isOpen: false, pendingMsg: null });
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1.26fr_0.74fr]">
        {/* Left: Editor/JSON/Saved */}
        <div className="order-2 lg:order-0">
          {/* Tab bar */}
          <div className="mb-4 flex items-center gap-1 rounded-xl border border-white/6 bg-white/3 p-1">
            <button
              onClick={() => setTab("editor")}
              className={`flex-1 rounded-lg py-2.5 text-xs font-medium transition-all ${
                tab === "editor"
                  ? "border border-orange-500/20 bg-orange-500/15 text-orange-400 shadow-sm shadow-orange-500/10"
                  : "border border-transparent text-white/40 hover:bg-white/5 hover:text-white/60"
              }`}
            >
              Editor visual
            </button>
            <button
              onClick={() => setTab("json")}
              className={`flex-1 rounded-lg py-2.5 text-xs font-medium transition-all ${
                tab === "json"
                  ? "border border-orange-500/20 bg-orange-500/15 text-orange-400 shadow-sm shadow-orange-500/10"
                  : "border border-transparent text-white/40 hover:bg-white/5 hover:text-white/60"
              }`}
            >
              JSON
            </button>
            <button
              onClick={() => setTab("saved")}
              className={`flex-1 rounded-lg py-2.5 text-xs font-medium transition-all ${
                tab === "saved"
                  ? "border border-orange-500/20 bg-orange-500/15 text-orange-400 shadow-sm shadow-orange-500/10"
                  : "border border-transparent text-white/40 hover:bg-white/5 hover:text-white/60"
              }`}
            >
              Mensajes guardados
            </button>
          </div>

          <div className="custom-scrollbar max-h-[85vh] overflow-y-auto pr-2">
            {tab === "editor" && <Editor data={data} onChange={setData} />}

            {tab === "saved" && (
              <StorageSidebar
                savedMessages={savedMessages}
                onSave={handleSave}
                onDelete={handleDelete}
                onLoad={(msg) =>
                  setModalState({ isOpen: true, pendingMsg: msg })
                }
                onHover={setHoverPreviewData}
              />
            )}

            {tab === "json" && (
              <div className="space-y-4">
                <div className="relative rounded-xl border border-white/6 bg-white/3 p-4">
                  <div className="mb-4 flex items-center justify-between px-1">
                    <div>
                      <h4 className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-white/40 uppercase">
                        Configuración JSON
                        <div className="flex h-6 items-center rounded-md border border-white/10 bg-black/40 p-0.5 text-[9px]">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setJsonFormat("discord");
                            }}
                            className={`rounded px-2 py-0.5 transition-colors ${jsonFormat === "discord" ? "bg-orange-500/20 text-orange-400" : "text-white/40 hover:text-white/80"}`}
                          >
                            Payload Discord
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setJsonFormat("internal");
                            }}
                            className={`rounded px-2 py-0.5 transition-colors ${jsonFormat === "internal" ? "bg-orange-500/20 text-orange-400" : "text-white/40 hover:text-white/80"}`}
                          >
                            Estado Interno
                          </button>
                        </div>
                      </h4>
                      <p className="mt-2 text-[10px] text-white/20">
                        {jsonFormat === "discord"
                          ? "Edita o copia el payload compatible con Discord API para Webhooks y Bots."
                          : "Edita el estado interno de la aplicación directamente."}
                      </p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                        copied
                          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border border-orange-500/20 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                      }`}
                    >
                      {copied ? (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="9"
                              y="9"
                              width="13"
                              height="13"
                              rx="2"
                              ry="2"
                            />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          Copiar Configuración
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={internalJson}
                      onChange={(e) => handleJsonChange(e.target.value)}
                      className={`custom-scrollbar h-[65vh] w-full resize-none rounded-lg border bg-[#1e1f22] p-4 font-mono text-xs leading-relaxed transition-all outline-none ${
                        jsonError
                          ? "border-red-500/50 text-red-200/80 focus:border-red-500"
                          : "border-white/10 text-white/70 focus:border-orange-500/40"
                      }`}
                      spellCheck={false}
                    />

                    {jsonError && (
                      <div className="mt-3 flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 shrink-0"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div>
                          <p className="text-xs font-bold tracking-wider uppercase">
                            Configuración Inválida
                          </p>
                          <p className="mt-1 text-xs opacity-80">{jsonError}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="order-1 lg:order-0">
          <div className="sticky top-24">
            <div className="mb-4 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full transition-all duration-500 ${lastAutoSave ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "animate-pulse bg-orange-500/50"}`}
                />
                <span className="text-[11px] font-semibold tracking-widest text-white/40 uppercase">
                  {hoverPreviewData
                    ? "Vista previa (Guardado)"
                    : "Vista previa en vivo"}
                </span>
                {lastAutoSave && (
                  <span className="text-[9px] text-white/10 italic">
                    Auto-guardado{" "}
                    {new Date(lastAutoSave).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/20">
                Discord Dark Theme
              </span>
            </div>
            <div
              className={`overflow-hidden rounded-[24px] border transition-all duration-300 ${hoverPreviewData ? "border-orange-500/30 ring-1 ring-orange-500/20" : "border-white/6"} bg-[#313338] shadow-2xl shadow-black/50`}
            >
              <Preview data={hoverPreviewData || data} />
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, pendingMsg: null })}
        onConfirm={confirmLoad}
        title="Sobrescribir mensaje actual"
        message={`¿Estás seguro de que quieres cargar "${modalState.pendingMsg?.name}"? Se perderán los cambios que no hayas guardado en el editor actual.`}
        confirmLabel="Cargar mensaje"
      />
    </div>
  );
}
