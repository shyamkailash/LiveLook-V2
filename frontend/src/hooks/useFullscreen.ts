import { useState } from "react";

export function useFullscreen<T>() {
  const [item, setItem] = useState<T | null>(null);
  return {
    item,
    open: setItem,
    close: () => setItem(null),
    isOpen: Boolean(item),
  };
}
