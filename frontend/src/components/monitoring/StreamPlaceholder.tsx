import { Activity } from "lucide-react";
import { cn } from "@/utils/helpers";

export function StreamPlaceholder({
  label,
  inactive,
  large,
  fill,
}: {
  label: string;
  inactive?: boolean;
  large?: boolean;
  fill?: boolean;
}) {
  return (
    <div
      className={cn(
        "stream-grid relative grid overflow-hidden rounded-lg border border-white/5 bg-secondary",
        fill ? "h-full min-h-0" : large ? "aspect-video min-h-[260px]" : "aspect-video",
        inactive && "opacity-45 grayscale",
      )}
    >
      <div className="absolute inset-0 bg-surface/70" />
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted backdrop-blur">
        <Activity className="h-3.5 w-3.5 text-accent" />
        {inactive ? "Signal lost" : "Live desktop stream"}
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-border bg-background/76 px-3 py-2 backdrop-blur">
        <span className="text-sm font-medium text-text">{label}</span>
        <span className="text-xs text-muted">{inactive ? "offline" : "30 fps"}</span>
      </div>
    </div>
  );
}
