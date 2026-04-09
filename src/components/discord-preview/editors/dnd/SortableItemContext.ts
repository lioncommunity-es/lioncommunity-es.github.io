import { createContext, useContext } from "react";

export const SortableItemContext = createContext<any>(null);

export function useSortableItem() {
  return useContext(SortableItemContext);
}
