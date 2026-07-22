import { StreamPlaceholder } from "@/components/monitoring/StreamPlaceholder";
import type { MonitoringStudent } from "@/types/monitoring";

export function DevicePreview({
  student,
  large,
  fill,
}: {
  student: MonitoringStudent;
  large?: boolean;
  fill?: boolean;
}) {
  return (
    <StreamPlaceholder
      label={`${student.pcName} - ${student.currentApp}`}
      inactive={student.connection === "offline"}
      large={large}
      fill={fill}
    />
  );
}
