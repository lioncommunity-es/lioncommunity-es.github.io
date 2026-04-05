/** Shared UI primitives for the Discord preview editor */

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-white/40">
      {children}
    </label>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/10 bg-[#1e1f22] px-3 py-2 text-xs text-white/80 outline-none transition-colors placeholder:text-white/20 focus:border-orange-500/40"
      spellCheck={false}
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full resize-none rounded-lg border border-white/10 bg-[#1e1f22] px-3 py-2 text-xs leading-relaxed text-white/80 outline-none transition-colors placeholder:text-white/20 focus:border-orange-500/40"
      spellCheck={false}
    />
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 rounded accent-orange-500"
      />
      <span className="text-xs text-white/60">{label}</span>
    </label>
  );
}

export function SectionHeader({
  title,
  onAdd,
  addLabel,
  count,
  max,
}: {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  count?: number;
  max?: number;
}) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-2.5">
      <div className="flex items-center gap-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">
          {title}
        </h3>
        {count !== undefined && max !== undefined && (
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-bold text-white/20 whitespace-nowrap">
            {count} / {max}
          </span>
        )}
      </div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="group flex items-center gap-1.5 rounded-lg bg-orange-500/5 px-3 py-1.5 text-[10px] font-bold text-orange-400/80 transition-all hover:bg-orange-500/15 hover:text-orange-400"
        >
          <span className="text-[12px] leading-none transition-transform group-hover:scale-125">
            +
          </span>{" "}
          {addLabel || "Añadir"}
        </button>
      )}
    </div>
  );
}

export function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 rounded-md p-1 text-white/20 transition-colors hover:bg-red-500/10 hover:text-red-400"
      title="Eliminar"
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}

export function EditorCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border border-white/6 bg-white/3 p-4">
      {children}
    </div>
  );
}
