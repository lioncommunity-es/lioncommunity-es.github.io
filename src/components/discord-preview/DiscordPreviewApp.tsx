import { useState } from "react";
import Preview from "./Preview";
import Editor from "./Editor";
import { DEFAULT_DATA } from "./defaults";
import type { DiscordPreviewData } from "./types";
import { toDiscordJSON } from "./utils/transform";

export default function DiscordPreviewApp() {
  const [data, setData] = useState<DiscordPreviewData>(DEFAULT_DATA);
  const [tab, setTab] = useState<"editor" | "json">("editor");
  const [copied, setCopied] = useState(false);

  const handleJsonImport = (raw: string) => {
    try {
      const parsed = JSON.parse(raw);
      setData(parsed);
    } catch {
      // noop – user is still typing
    }
  };

  const handleCopy = () => {
    const json = JSON.stringify(toDiscordJSON(data), null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left: Editor */}
        <div className="order-2 lg:order-1">
          {/* Tab bar */}
          <div className="mb-4 flex items-center gap-1 rounded-xl border border-white/6 bg-white/3 p-1">
            <button
              onClick={() => setTab("editor")}
              className={`flex-1 rounded-lg py-2.5 text-xs font-medium transition-all ${
                tab === "editor"
                  ? "border border-orange-500/20 bg-orange-500/15 text-orange-400 shadow-sm shadow-orange-500/10"
                  : "border border-transparent text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              Editor visual
            </button>
            <button
              onClick={() => setTab("json")}
              className={`flex-1 rounded-lg py-2.5 text-xs font-medium transition-all ${
                tab === "json"
                  ? "border border-orange-500/20 bg-orange-500/15 text-orange-400 shadow-sm shadow-orange-500/10"
                  : "border border-transparent text-white/40 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              JSON
            </button>
          </div>

          <div className="custom-scrollbar max-h-[85vh] overflow-y-auto pr-2">
            {tab === "editor" ? (
              <Editor data={data} onChange={setData} />
            ) : (
              <div className="relative rounded-xl border border-white/6 bg-white/3 p-4">
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                      copied
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/70"
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
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copiar JSON de Discord
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  value={JSON.stringify(toDiscordJSON(data), null, 2)}
                  readOnly
                  className="custom-scrollbar h-[70vh] w-full resize-none rounded-lg border border-white/10 bg-[#1e1f22] p-4 pt-12 font-mono text-xs leading-relaxed text-white/70 outline-none focus:border-orange-500/40"
                  spellCheck={false}
                />
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
