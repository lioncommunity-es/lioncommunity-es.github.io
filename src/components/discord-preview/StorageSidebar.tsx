import { useState } from "react";
import type { DiscordPreviewData } from "@/types";
import { Input, Label, DeleteBtn } from "./editors/primitives";

interface SavedMessage {
  id: string;
  name: string;
  timestamp: number;
  data: DiscordPreviewData;
}

interface Props {
  savedMessages: SavedMessage[];
  onSave: (name: string) => void;
  onLoad: (msg: SavedMessage) => void;
  onDelete: (id: string) => void;
  onHover: (data: DiscordPreviewData | null) => void;
}

export default function StorageSidebar({
  savedMessages,
  onSave,
  onLoad,
  onDelete,
  onHover,
}: Props) {
  const [saveName, setSaveName] = useState("");
  const [filter, setFilter] = useState("");

  const filteredMessages = savedMessages.filter((msg) =>
    msg.name.toLowerCase().includes(filter.toLowerCase())
  );

  const exists = savedMessages.some(
    (m) => m.name.toLowerCase() === saveName.toLowerCase()
  );

  return (
    <div className="flex h-full flex-col gap-6 rounded-[28px] border border-white/6 bg-white/3 p-6 backdrop-blur-md">
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-2">
          <svg className="h-4 w-4 text-orange-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
          <h2 className="text-sm font-bold tracking-widest text-white/80 uppercase">Gestionar Mensajes</h2>
        </div>
        <p className="text-[10px] text-white/30">Guarda tus plantillas localmente</p>
      </div>

      {/* Save Section */}
      <div className="space-y-3 rounded-2xl bg-white/3 p-4">
        <Label>Nombre del mensaje</Label>
        <div className="flex gap-2">
          <Input
            value={saveName}
            onChange={setSaveName}
            placeholder="ej: Bienvenida, Reglas..."
          />
          <button
            onClick={() => {
              if (saveName.trim()) {
                onSave(saveName.trim());
                setSaveName("");
              }
            }}
            disabled={!saveName.trim()}
            className={`shrink-0 rounded-lg px-4 py-2 text-[10px] font-bold transition-all ${
              saveName.trim()
                ? exists
                  ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                  : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                : "bg-white/5 text-white/20"
            }`}
          >
            {exists ? "Sobrescribir" : "Guardar"}
          </button>
        </div>
      </div>

      {/* List Section */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="mb-4 flex items-center justify-between px-1">
          <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
            Guardados ({savedMessages.length})
          </span>
          <div className="relative w-24">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtro..."
              className="w-full bg-transparent text-[10px] text-white/60 outline-none placeholder:text-white/20"
            />
          </div>
        </div>

        <div 
          className="custom-scrollbar space-y-2 overflow-y-auto pr-2"
          onMouseLeave={() => onHover(null)}
        >
          {filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className="group relative flex items-center justify-between rounded-xl border border-white/5 bg-white/2 p-3 transition-all hover:border-orange-500/30 hover:bg-white/5"
              onMouseEnter={() => onHover(msg.data)}
              onClick={() => onLoad(msg)}
            >
              <div className="flex cursor-pointer flex-col overflow-hidden">
                <span className="truncate text-xs font-semibold text-white/80">
                  {msg.name}
                </span>
                <span className="text-[9px] text-white/20">
                  {new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                <DeleteBtn
                  onClick={(e) => {
                    e.stopPropagation();
                    onHover(null); // Clear hover preview before deleting
                    onDelete(msg.id);
                  }}
                />
              </div>
            </div>
          ))}

          {filteredMessages.length === 0 && (
            <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/5 p-4 text-center">
              <svg className="h-6 w-6 text-white/10" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <p className="text-[10px] text-white/20 italic">
                {filter ? "No hay coincidencias" : "No tienes mensajes guardados"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
