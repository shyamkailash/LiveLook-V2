import { cn } from "@/utils/helpers";
import type { ConnectionState } from "@/types/monitoring";

const tones: Record<ConnectionState, string> = {
  online: "bg-muted",
  unstable: "bg-muted",
  offline: "bg-muted",
};

export function StatusIndicator({ state, className }: { state: ConnectionState; className?: string }) {
  return <span className={cn("inline-block h-2.5 w-2.5 rounded-full", tones[state], className)} />;
}
