import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "warning",
}: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const colors = {
    danger: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
    warning: "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
  };

  const btnColors = {
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20",
    warning: "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20",
    info: "bg-blue-500 text-white hover:bg-blue-600 shadow-blue-500/20",
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      
      <div 
        className="relative w-full max-w-md scale-100 transform overflow-hidden rounded-[28px] border border-white/10 bg-[#1e1f22] p-8 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className={`absolute -top-24 -left-24 h-48 w-48 rounded-full opacity-20 blur-[80px] ${variant === 'danger' ? 'bg-red-500' : 'bg-orange-500'}`} />

        <div className="relative">
          <div className="mb-6 flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${colors[variant]}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
          </div>

          <p className="mb-8 text-sm leading-relaxed text-white/50">
            {message}
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              className="rounded-xl px-6 py-3 text-sm font-bold text-white/40 transition-all hover:bg-white/5 hover:text-white"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`rounded-xl px-8 py-3 text-sm font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 ${btnColors[variant]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
