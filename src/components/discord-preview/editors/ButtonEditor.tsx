import { type ButtonData, type ButtonType, ComponentType } from "../types";
import { Input, Toggle, DeleteBtn } from "./primitives";

const BUTTON_TYPES: { value: ButtonType; label: string }[] = [
  { value: "primary", label: "Primary (Blurple)" },
  { value: "secondary", label: "Secondary (Grey)" },
  { value: "success", label: "Success (Green)" },
  { value: "danger", label: "Danger (Red)" },
  { value: "link", label: "Link (Grey + Link Icon)" },
];

interface Props {
  btn: ButtonData;
  onUpdate: (b: ButtonData) => void;
  onDelete: () => void;
}

export default function ButtonEditor({ btn, onUpdate, onDelete }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3 shadow-inner">
      <div className="w-14">
        <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-white/30">
          Emoji
        </label>
        <Input
          value={btn.emoji}
          onChange={(v) => onUpdate({ ...btn, emoji: v })}
          placeholder="😀"
        />
      </div>
      <div className="min-w-[150px] flex-1">
        <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-white/30">
          Etiqueta
        </label>
        <Input
          value={btn.label}
          onChange={(v) => onUpdate({ ...btn, label: v })}
          placeholder="Texto del botón"
        />
      </div>
      <div className="w-40">
        <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-white/30">
          Estilo
        </label>
        <select
          value={btn.style}
          onChange={(e) =>
            onUpdate({ ...btn, style: e.target.value as ButtonType })
          }
          className="w-full rounded-lg border border-white/10 bg-[#1e1f22] px-3 py-2 text-[11px] text-white/80 outline-none hover:border-orange-500/30 transition-colors"
        >
          {BUTTON_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {btn.style === "link" && (
        <div className="min-w-[200px] flex-[1.5]">
          <label className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-white/30">
            URL del enlace
          </label>
          <Input
            value={btn.url || ""}
            onChange={(v) => onUpdate({ ...btn, url: v })}
            placeholder="https://..."
          />
        </div>
      )}

      <div className="flex flex-col items-center justify-end pt-5">
        <Toggle
          label="Desactivado"
          checked={btn.disabled ?? false}
          onChange={(v) => onUpdate({ ...btn, disabled: v })}
        />
      </div>
      <div className="pt-5">
        <DeleteBtn onClick={onDelete} />
      </div>
    </div>
  );
}
