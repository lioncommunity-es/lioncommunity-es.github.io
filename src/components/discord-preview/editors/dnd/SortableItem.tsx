import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";
import { SortableItemContext } from "./SortableItemContext";

interface Props {
  id: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SortableItem({ id, children, className = "", disabled = false }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    position: "relative" as const,
  };

  return (
    <SortableItemContext.Provider value={{ attributes, listeners }}>
      <div
        ref={setNodeRef}
        style={style}
        className={`${className} ${
          isDragging ? "opacity-40 ring-2 ring-orange-500/50 shadow-xl" : ""
        }`}
      >
        {children}
      </div>
    </SortableItemContext.Provider>
  );
}
