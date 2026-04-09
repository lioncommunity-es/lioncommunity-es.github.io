import { useState, useEffect, useRef } from "react";
import Preview from "./Preview";
import Editor from "./Editor";
import { DEFAULT_DATA } from "./defaults";
import type { DiscordPreviewData } from "@/types";
import "@skyra/discord-components-core";

export default function DiscordPreviewApp() {
  const [data, setData] = useState<DiscordPreviewData>(DEFAULT_DATA);
  const [tab, setTab] = useState<"editor" | "json">("editor");
  const [internalJson, setInternalJson] = useState(JSON.stringify(DEFAULT_DATA, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize internalJson state when data changes (from Editor)
  // But only if the textarea is not focused to avoid cursor jumping
  useEffect(() => {
    if (document.activeElement !== textareaRef.current) {
      setInternalJson(JSON.stringify(data, null, 2));
      setJsonError(null);
    }
  }, [data]);

  const validateDiscordData = (parsed: any): string | null => {
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return "El JSON debe ser un objeto { ... }";
    }
    
    // Check for essential properties if necessary, 
    // or just let it pass if it matches the general structure.
    if (!parsed.author || typeof parsed.author.name !== "string") {
      return "Falta el campo 'author.name' o es inválido.";
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
      const error = validateDiscordData(parsed);
      
      if (error) {
        setJsonError(error);
      } else {
        setJsonError(null);
        setData(parsed);
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

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left: Editor/JSON */}
        <div className="order-2 lg:order-1">
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
              JSON (Configuración de App)
            </button>
          </div>

          <div className="custom-scrollbar max-h-[85vh] overflow-y-auto pr-2">
            {tab === "editor" ? (
              <Editor data={data} onChange={setData} />
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl border border-white/6 bg-white/3 p-4">
                  <div className="mb-4 flex items-center justify-between px-1">
                    <div>
                      <h4 className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
                        Editor de Configuración JSON
                      </h4>
                      <p className="mt-1 text-[10px] text-white/20">
                        Edita el estado de la aplicación directamente. Los cambios son instantáneos.
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider">Configuración Inválida</p>
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
        <div className="order-1 lg:order-2">
          <div className="sticky top-24">
            <div className="mb-4 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500/50" />
                <span className="text-[11px] font-semibold tracking-widest text-white/40 uppercase">
                  Vista previa en vivo
                </span>
              </div>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/20">
                Discord Dark Theme
              </span>
            </div>
            <div className="overflow-hidden rounded-[24px] border border-white/6 bg-[#313338] shadow-2xl shadow-black/50">
              <Preview data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
