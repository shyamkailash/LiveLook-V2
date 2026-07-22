import { cn } from "@/utils/helpers";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <progress
      value={Math.min(value, 100)}
      max={100}
      className={cn("progress-meter h-2 w-full overflow-hidden rounded-full", className)}
    />
  );
}
