import { useEffect, useState } from "react";
import { StreamPlaceholder } from "@/components/monitoring/StreamPlaceholder";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { MonitoringStudent } from "@/types/monitoring";
import { cn } from "@/utils/helpers";

export function DevicePreview({
  student,
  large,
  fill,
}: {
  student: MonitoringStudent;
  large?: boolean;
  fill?: boolean;
}) {
  const { status } = useWebSocket();
  const [decodeFailed, setDecodeFailed] = useState(false);

  useEffect(() => setDecodeFailed(false), [student.frame]);

  const unavailable = student.connection === "offline" || !student.frame || decodeFailed;
  if (unavailable) {
    const label = student.connection === "offline"
      ? `${student.pcName} is offline`
      : decodeFailed
        ? "Stream unavailable"
        : status === "connected"
          ? "Online, waiting for frame"
          : status === "reconnecting"
            ? "Reconnecting to live monitor"
            : "Connecting to live monitor";
    return (
      <StreamPlaceholder
        label={label}
        inactive={student.connection === "offline" || decodeFailed}
        large={large}
        fill={fill}
      />
    );
  }

  return (
    <div className={cn(
      "relative grid overflow-hidden rounded-lg border border-white/5 bg-black",
      fill ? "h-full min-h-0" : large ? "aspect-video min-h-[260px]" : "aspect-video",
    )}>
      <img
        alt={`Live screen for ${student.name}`}
        className="h-full w-full object-contain"
        decoding="async"
        onError={() => setDecodeFailed(true)}
        src={student.frame ?? undefined}
      />
      <div className="absolute left-3 top-3 rounded-full border border-emerald-400/25 bg-black/70 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur">
        {status === "connected" ? "Live" : "Reconnecting"}
      </div>
    </div>
  );
}
