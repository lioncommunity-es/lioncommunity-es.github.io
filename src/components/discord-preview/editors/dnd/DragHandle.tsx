import { useSortableItem } from "./SortableItemContext";

interface Props {
  className?: string;
  disabled?: boolean;
}

export function DragHandle({ className = "", disabled = false }: Props) {
  const ctx = useSortableItem();

  if (!ctx || disabled) {
    return (
      <div className={`cursor-not-allowed opacity-30 ${className}`}>
        <GripIcon />
      </div>
    );
  }

  const { attributes, listeners } = ctx;

  return (
    <div
      {...attributes}
      {...listeners}
      className={`cursor-grab hover:text-orange-400 active:cursor-grabbing text-white/30 transition-colors ${className}`}
      title="Arrastrar para reordenar"
    >
      <GripIcon />
    </div>
  );
}

function GripIcon() {
  return (
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
    >
      <circle cx="9" cy="12" r="1" />
      <circle cx="9" cy="5" r="1" />
      <circle cx="9" cy="19" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="15" cy="5" r="1" />
      <circle cx="15" cy="19" r="1" />
    </svg>
  );
}
