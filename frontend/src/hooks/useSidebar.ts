import { useState } from "react";

export function useSidebar() {
  const [expanded, setExpanded] = useState(false);
  return { expanded, setExpanded };
}
